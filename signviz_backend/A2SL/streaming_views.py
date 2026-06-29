"""
streaming_views.py
==================
REST API endpoints for the chunk-based ASL streaming pipeline.

Graceful degradation: if Redis/Celery is unavailable, processing runs
synchronously in a background thread so the API never returns 500.
"""

from __future__ import annotations

import json
import logging
import threading

from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse

logger = logging.getLogger(__name__)


def _try_celery(job_id: int) -> bool:
    """
    Attempt to dispatch via Celery. Returns True on success, False if
    Celery/Redis is unavailable.
    """
    import os
    if os.environ.get('USE_CELERY') != '1':
        return False

    try:
        from A2SL.streaming_tasks import start_stream_job
        start_stream_job.delay(job_id)
        return True
    except Exception as exc:
        logger.warning("Celery dispatch failed (%s) — falling back to thread", exc)
        return False


def _run_in_thread(job_id: int):
    """Run the full pipeline synchronously in a daemon thread."""
    from A2SL.streaming_tasks import _chunk_audio_impl
    from core.models import StreamJob
    try:
        job = StreamJob.objects.get(id=job_id)
        job.status = 'chunking'
        job.save(update_fields=['status'])
        _chunk_audio_impl(job_id)
    except Exception as exc:
        logger.exception("Thread pipeline failed for job %s: %s", job_id, exc)
        from core.models import StreamJob as SJ
        SJ.objects.filter(id=job_id).update(
            status='failed', error_message=str(exc)
        )


# ─── POST /api/stream/start/ ─────────────────────────────────────────────────

@csrf_exempt
def api_stream_start(request):
    """
    Create a StreamJob and kick off background processing.

    Body (JSON):
        {
            "source_type": "youtube" | "local",
            "source_url":  "https://...",
            "youtube_id":  "dQw4w9WgXcQ",
            "title":       "My Lecture"
        }

    Response:
        { "job_id": 42, "status": "pending" }
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

    source_type = data.get('source_type', 'youtube')
    source_url  = data.get('source_url', '').strip()
    youtube_id  = data.get('youtube_id') or None
    title       = data.get('title', 'Untitled')

    if not source_url:
        return JsonResponse({'error': 'source_url is required'}, status=400)

    try:
        from core.models import StreamJob
        owner = request.user if request.user.is_authenticated else None

        job = StreamJob.objects.create(
            owner=owner,
            source_type=source_type,
            source_url=source_url,
            youtube_id=youtube_id,
            title=title,
            status='pending',
        )

        # Try Celery first; fall back to a daemon thread
        if not _try_celery(job.id):
            t = threading.Thread(target=_run_in_thread, args=(job.id,), daemon=True)
            t.start()

        logger.info("StreamJob %s created for %s", job.id, source_url)
        return JsonResponse({'job_id': job.id, 'status': job.status}, status=201)

    except Exception as exc:
        logger.exception("api_stream_start failed")
        return JsonResponse({'error': str(exc)}, status=500)


# ─── GET /api/stream/<job_id>/status/ ────────────────────────────────────────

@csrf_exempt
def api_stream_status(request, job_id: int):
    if request.method != 'GET':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    try:
        from core.models import StreamJob, StreamChunk
        job = StreamJob.objects.get(id=job_id)
    except Exception:
        return JsonResponse({'error': 'Job not found'}, status=404)

    chunks = StreamChunk.objects.filter(job=job).order_by('chunk_index')
    chunk_data = [
        {
            'index':      c.chunk_index,
            'status':     c.status,
            'start_time': c.start_time,
            'end_time':   c.end_time,
            'words':      c.get_words() if c.status == 'ready' else [],
        }
        for c in chunks
    ]

    return JsonResponse({
        'job_id':           job.id,
        'status':           job.status,
        'progress_pct':     job.progress_pct,
        'total_chunks':     job.total_chunks,
        'completed_chunks': job.completed_chunks,
        'error_message':    job.error_message,
        'chunks':           chunk_data,
    })


# ─── GET /api/stream/<job_id>/chunk/<chunk_index>/ ───────────────────────────

@csrf_exempt
def api_stream_chunk(request, job_id: int, chunk_index: int):
    if request.method != 'GET':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    try:
        from core.models import StreamChunk
        chunk = StreamChunk.objects.get(job_id=job_id, chunk_index=chunk_index)
    except Exception:
        return JsonResponse({'error': 'Chunk not found'}, status=404)

    if chunk.status == 'ready':
        return JsonResponse({
            'index':      chunk.chunk_index,
            'status':     chunk.status,
            'start_time': chunk.start_time,
            'end_time':   chunk.end_time,
            'words':      chunk.get_words(),
        })
    elif chunk.status == 'failed':
        return JsonResponse({'index': chunk.chunk_index, 'status': 'failed',
                             'error': chunk.error_message, 'words': []})
    else:
        return JsonResponse({'index': chunk.chunk_index, 'status': chunk.status,
                             'words': []}, status=202)


# ─── GET /api/stream/<job_id>/ready-chunks/ ──────────────────────────────────

@csrf_exempt
def api_stream_ready_chunks(request, job_id: int):
    if request.method != 'GET':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    try:
        from core.models import StreamChunk, StreamJob
        job = StreamJob.objects.get(id=job_id)
    except Exception:
        return JsonResponse({'error': 'Job not found'}, status=404)

    after = request.GET.get('after', None)
    qs = StreamChunk.objects.filter(job=job, status='ready').order_by('chunk_index')
    if after is not None:
        try:
            qs = qs.filter(chunk_index__gt=int(after))
        except ValueError:
            pass

    chunks = [
        {
            'index':      c.chunk_index,
            'start_time': c.start_time,
            'end_time':   c.end_time,
            'words':      c.get_words(),
            'animation_data': c.get_animation_data(),
        }
        for c in qs
    ]

    return JsonResponse({
        'job_id':       job_id,
        'job_status':   job.status,
        'progress_pct': job.progress_pct,
        'error_message': job.error_message,
        'chunks':       chunks,
    })


# ─── DELETE /api/stream/<job_id>/cancel/ ─────────────────────────────────────

@csrf_exempt
def api_stream_cancel(request, job_id: int):
    if request.method != 'DELETE':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    try:
        from core.models import StreamJob
        updated = StreamJob.objects.filter(id=job_id).update(
            status='failed', error_message='Cancelled by user'
        )
        if updated:
            return JsonResponse({'status': 'cancelled'})
        return JsonResponse({'error': 'Job not found'}, status=404)
    except Exception as exc:
        return JsonResponse({'error': str(exc)}, status=500)
