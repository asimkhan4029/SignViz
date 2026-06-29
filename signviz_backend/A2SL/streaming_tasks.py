"""
streaming_tasks.py
==================
Celery tasks for the chunk-based ASL streaming pipeline.

Flow
----
1. start_stream_job()   — called by the API view; creates StreamJob + kicks off
                          download/chunking in the background.
2. chunk_audio()        — downloads the source, splits into 15-20 s WAV chunks,
                          creates StreamChunk rows, dispatches process_chunk().
3. process_chunk()      — transcribes one WAV chunk → NLP → sign words,
                          marks chunk 'ready', updates job progress.

All tasks are idempotent and include retry logic.
"""

from __future__ import annotations

import json
import logging
import os
import subprocess
import tempfile
import threading
from typing import List
from concurrent.futures import ThreadPoolExecutor

from celery import shared_task
from django.db import transaction

logger = logging.getLogger(__name__)

CHUNK_DURATION = 20          # seconds per chunk (user requested 20s)
MAX_RETRIES    = 3
RETRY_BACKOFF  = 10          # seconds


# ─── Task 1: Kick off a streaming job ────────────────────────────────────────

@shared_task(bind=True, max_retries=1)
def start_stream_job(self, job_id: int):
    """
    Entry point. Transitions job to 'chunking' and dispatches chunk_audio.
    """
    from core.models import StreamJob
    try:
        job = StreamJob.objects.get(id=job_id)
        job.status = 'chunking'
        job.save(update_fields=['status'])
        chunk_audio.delay(job_id)
    except StreamJob.DoesNotExist:
        logger.error("StreamJob %s not found", job_id)
    except Exception as exc:
        logger.exception("start_stream_job failed for job %s", job_id)
        raise self.retry(exc=exc, countdown=5)


# ─── Task 2: Download + split into chunks ────────────────────────────────────

def _chunk_audio_impl(job_id: int):
    """
    Core implementation — callable directly (no Celery required).
    Downloads the source video/audio and splits it into CHUNK_DURATION-second
    WAV files using FFmpeg. Creates StreamChunk rows and dispatches
    process_chunk() for each.
    """
    from core.models import StreamJob, StreamChunk

    try:
        job = StreamJob.objects.get(id=job_id)
    except StreamJob.DoesNotExist:
        logger.error("StreamJob %s not found in chunk_audio", job_id)
        return

    tmp_dir = tempfile.mkdtemp(prefix=f'signviz_job{job_id}_')
    source_audio = os.path.join(tmp_dir, 'source.wav')

    try:
        # ── Step 1: Determine total duration ──────────────────────────────
        total_duration = 0.0
        if job.source_type == 'youtube':
            total_duration = _get_youtube_duration(job.source_url)
        else:
            # For local, we can't easily get duration without probing the file.
            # We'll extract audio first as before.
            pass

        # ── Step 2: Create all StreamChunk rows immediately ───────────────
        # This allows the frontend to see the total progress bar immediately.
        if total_duration > 0:
            n_chunks = int((total_duration + CHUNK_DURATION - 0.1) // CHUNK_DURATION)
            with transaction.atomic():
                job.total_chunks = n_chunks
                job.status       = 'processing'
                job.save(update_fields=['total_chunks', 'status'])

                for idx in range(n_chunks):
                    start = idx * CHUNK_DURATION
                    end   = min(start + CHUNK_DURATION, total_duration)
                    StreamChunk.objects.get_or_create(
                        job=job,
                        chunk_index=idx,
                        defaults={
                            'start_time': start,
                            'end_time':   end,
                            'status':     'pending',
                        }
                    )
            logger.info("Job %s: created %d pending chunks for %s sec video", job_id, n_chunks, total_duration)

        # ── Step 3: Handle First Chunk (Chunk 0) ASAP ─────────────────────
        # We download and process the first 20 seconds immediately.
        chunk0 = StreamChunk.objects.filter(job=job, chunk_index=0).first()
        if chunk0:
            chunk0_path = os.path.join(tmp_dir, 'chunk_0000.wav')
            try:
                if job.source_type == 'youtube':
                    _download_youtube_section(job.source_url, chunk0_path, 0, CHUNK_DURATION)
                else:
                    # For local, extract full audio then split (fast enough)
                    _extract_local_audio(job.source_url, source_audio)
                    _split_audio_section(source_audio, chunk0_path, 0, CHUNK_DURATION)

                if os.path.exists(chunk0_path):
                    # Process Chunk 0 synchronously so frontend gets it ASAP
                    _process_chunk_impl(chunk0.id, chunk0_path)
            except Exception as e:
                logger.error("Failed to process first chunk for job %s: %s", job_id, e)

        # ── Step 4: Process remaining chunks in background ────────────────
        # Now we download the full audio and split it.
        try:
            if job.source_type == 'youtube':
                _download_youtube_audio(job.source_url, source_audio)
            elif not os.path.exists(source_audio):
                _extract_local_audio(job.source_url, source_audio)

            if total_duration <= 0:
                total_duration = _get_audio_duration(source_audio)
                n_chunks = int((total_duration + CHUNK_DURATION - 0.1) // CHUNK_DURATION)
                job.total_chunks = n_chunks
                job.save(update_fields=['total_chunks'])

            # Split and dispatch (skipping index 0 if already processed)
            chunk_paths = _split_audio(source_audio, tmp_dir, CHUNK_DURATION)

            # Sequential background processing to avoid resource exhaustion
            with ThreadPoolExecutor(max_workers=1) as executor:
                for idx, (chunk_path, start, end) in enumerate(chunk_paths):
                    if idx == 0: continue # already done

                    chunk, _ = StreamChunk.objects.get_or_create(
                        job=job,
                        chunk_index=idx,
                        defaults={'start_time': start, 'end_time': end, 'status': 'pending'}
                    )

                    if chunk.status == 'ready': continue

                    # Check for cancellation (every 5 chunks)
                    if idx % 5 == 0:
                        job.refresh_from_db(fields=['status'])
                        if job.status == 'failed':
                            logger.info("Job %s cancelled/failed, stopping background processing", job_id)
                            break

                    # Dispatch remaining chunks to sequential executor
                    executor.submit(_process_chunk_impl, chunk.id, chunk_path)

            logger.info("Job %s: finished dispatching all chunks", job_id)

        except Exception as exc:
            logger.exception("Background chunking failed for job %s", job_id)
            # Don't fail the whole job if chunk 0 succeeded; just log it.
            if job.completed_chunks == 0:
                _mark_job_failed(job_id, str(exc))

    except Exception as exc:
        logger.exception("chunk_audio failed for job %s", job_id)
        _mark_job_failed(job_id, str(exc))
    finally:
        # Clean up source audio (chunks cleaned up per-task)
        if os.path.exists(source_audio):
            try:
                os.remove(source_audio)
            except OSError:
                pass


@shared_task(bind=True, max_retries=MAX_RETRIES)
def chunk_audio(self, job_id: int):
    """Celery task wrapper around _chunk_audio_impl."""
    try:
        _chunk_audio_impl(job_id)
    except Exception as exc:
        logger.exception("chunk_audio task failed for job %s", job_id)
        raise self.retry(exc=exc, countdown=RETRY_BACKOFF)


# ─── Task 3: Transcribe + NLP one chunk ──────────────────────────────────────

def _process_chunk_impl(chunk_id: int, audio_path: str):
    """Core implementation — callable directly without Celery."""
    from core.models import StreamChunk

    try:
        chunk = StreamChunk.objects.get(id=chunk_id)
    except StreamChunk.DoesNotExist:
        logger.error("StreamChunk %s not found", chunk_id)
        return

    chunk.status = 'processing'
    chunk.save(update_fields=['status'])

    try:
        transcript, word_segments = _transcribe_chunk(audio_path)
        animation_data = []

        if word_segments:
            try:
                from A2SL.sync_pipeline import process_words_to_signs, build_sync_sequence
                # Offset segments to be absolute to the video
                offset_segments = []
                for s in word_segments:
                    offset_segments.append(s.__class__(
                        word=s.word,
                        start=s.start + chunk.start_time,
                        end=s.end + chunk.start_time
                    ))
                
                # NLP processing
                sign_segments = process_words_to_signs(offset_segments)
                words = [s.word for s in sign_segments]
                
                # Build sync sequence with absolute timestamps
                sync_seq = build_sync_sequence(sign_segments, initial_time=chunk.start_time)
                animation_data = [
                    {
                        "type": e.type,
                        "word": e.word,
                        "start": round(e.start, 3),
                        "end": round(e.end, 3),
                        "duration": round(e.duration, 3),
                        "speed": round(e.speed, 3),
                    }
                    for e in sync_seq
                ]
            except Exception as e:
                logger.warning("sync_pipeline failed for chunk %s: %s", chunk_id, e)
                words = _nlp_fallback(transcript)
        elif transcript:
            words = _nlp_fallback(transcript)
        else:
            words = []

        chunk.transcript = transcript or ''
        chunk.set_words(words)
        chunk.set_animation_data(animation_data)
        chunk.status = 'ready'
        chunk.save(update_fields=['transcript', 'words', 'animation_data', 'status', 'updated_at'])

        _increment_job_progress(chunk.job_id)
        logger.info("Chunk %s (job %s, idx %s): %d signs ready",
                    chunk_id, chunk.job_id, chunk.chunk_index, len(words))

    except Exception as exc:
        logger.exception("process_chunk failed for chunk %s", chunk_id)
        chunk.retry_count += 1
        chunk.error_message = str(exc)
        chunk.status = 'failed'
        chunk.save(update_fields=['retry_count', 'error_message', 'status', 'updated_at'])
        _increment_job_progress(chunk.job_id, failed=True)
    finally:
        if audio_path and os.path.exists(audio_path):
            try:
                os.remove(audio_path)
            except OSError:
                pass


@shared_task(bind=True, max_retries=MAX_RETRIES)
def process_chunk(self, chunk_id: int, audio_path: str):
    """Celery task wrapper around _process_chunk_impl."""
    try:
        _process_chunk_impl(chunk_id, audio_path)
    except Exception as exc:
        logger.exception("process_chunk task failed for chunk %s", chunk_id)
        raise self.retry(exc=exc, countdown=RETRY_BACKOFF)


# ─── Private helpers ──────────────────────────────────────────────────────────

def _download_youtube_audio(url: str, output_wav: str):
    """Download YouTube audio as WAV using yt-dlp (preferred) or pytubefix."""
    # Try yt-dlp first (more reliable)
    try:
        _run_command(
            [
                'yt-dlp',
                '--extract-audio',
                '--audio-format', 'wav',
                '--audio-quality', '0',
                '--output', output_wav.replace('.wav', '.%(ext)s'),
                url,
            ],
            timeout=600,
        )
        # yt-dlp may produce .wav directly or need conversion
        base = output_wav.replace('.wav', '')
        for ext in ['.wav', '.webm', '.m4a', '.mp3', '.opus']:
            candidate = base + ext
            if os.path.exists(candidate) and candidate != output_wav:
                _convert_to_wav(candidate, output_wav)
                os.remove(candidate)
                break
        return
    except (subprocess.CalledProcessError, FileNotFoundError):
        pass

    # Fallback: pytubefix
    from pytubefix import YouTube
    tmp_mp4 = output_wav.replace('.wav', '_yt.mp4')
    yt = YouTube(url)
    stream = yt.streams.filter(only_audio=True).first() or yt.streams.get_lowest_resolution()
    stream.download(output_path=os.path.dirname(tmp_mp4),
                    filename=os.path.basename(tmp_mp4))
    _convert_to_wav(tmp_mp4, output_wav)
    if os.path.exists(tmp_mp4):
        os.remove(tmp_mp4)


def _run_command(args: List[str], timeout: int = 300) -> subprocess.CompletedProcess:
    """
    Robustly run a command. If the first attempt fails with FileNotFoundError,
    it tries to prefix with 'python -m ' for common tools like 'yt-dlp'.
    """
    try:
        return subprocess.run(args, capture_output=True, text=True, check=True, timeout=timeout)
    except FileNotFoundError:
        if args[0] == 'yt-dlp':
            import sys
            # Try running as a python module
            new_args = [sys.executable, '-m', 'yt_dlp'] + args[1:]
            try:
                return subprocess.run(new_args, capture_output=True, text=True, check=True, timeout=timeout)
            except Exception:
                pass
        raise
    except subprocess.CalledProcessError as e:
        logger.error("Command failed: %s\nStdout: %s\nStderr: %s",
                     ' '.join(args), e.stdout, e.stderr)
        raise


def _get_youtube_duration(url: str) -> float:
    """Fetch video duration without downloading the full file."""
    try:
        # Use yt-dlp to get duration in seconds
        result = _run_command(['yt-dlp', '--get-duration', url], timeout=60)
        duration_str = result.stdout.strip()
        # Handle formats: HH:MM:SS, MM:SS, or SS
        parts = duration_str.split(':')
        if len(parts) == 3:
            return float(parts[0]) * 3600 + float(parts[1]) * 60 + float(parts[2])
        elif len(parts) == 2:
            return float(parts[0]) * 60 + float(parts[1])
        else:
            return float(parts[0])
    except Exception as e:
        logger.warning("Failed to get duration for %s: %s", url, e)
    return 0.0


def _download_youtube_section(url: str, output_wav: str, start: float, end: float):
    """Download a specific time segment of a YouTube video as WAV."""
    try:
        _run_command(
            [
                'yt-dlp',
                '--download-sections', f'*{start}-{end}',
                '--extract-audio',
                '--audio-format', 'wav',
                '--audio-quality', '0',
                '--output', output_wav,
                url,
            ],
            timeout=180,
        )
    except Exception as e:
        logger.error("Failed to download section %s-%s: %s", start, end, e)
        raise


def _split_audio_section(source_wav: str, output_wav: str, start: float, duration: float):
    """Extract a section from a local WAV file."""
    subprocess.run(
        [
            'ffmpeg', '-y',
            '-i', source_wav,
            '-ss', str(start),
            '-t',  str(duration),
            '-acodec', 'pcm_s16le',
            '-ar', '16000',
            '-ac', '1',
            output_wav,
        ],
        check=True,
        capture_output=True,
        timeout=60,
    )


def _extract_local_audio(video_path: str, output_wav: str):
    """Extract audio track from a local video file."""
    _convert_to_wav(video_path, output_wav)


def _convert_to_wav(input_path: str, output_wav: str):
    """Use FFmpeg to convert any media file to 16 kHz mono WAV."""
    subprocess.run(
        [
            'ffmpeg', '-y',
            '-i', input_path,
            '-vn',
            '-acodec', 'pcm_s16le',
            '-ar', '16000',
            '-ac', '1',
            output_wav,
        ],
        check=True,
        capture_output=True,
        timeout=600,
    )


def _get_audio_duration(wav_path: str) -> float:
    """Return duration in seconds using ffprobe."""
    result = subprocess.run(
        [
            'ffprobe', '-v', 'error',
            '-show_entries', 'format=duration',
            '-of', 'default=noprint_wrappers=1:nokey=1',
            wav_path,
        ],
        capture_output=True,
        text=True,
        timeout=30,
    )
    try:
        return float(result.stdout.strip())
    except ValueError:
        return 0.0


def _split_audio(
    source_wav: str,
    output_dir: str,
    chunk_duration: int,
) -> List[tuple]:
    """
    Split source_wav into chunk_duration-second segments.
    Returns list of (chunk_path, start_sec, end_sec).
    """
    total = _get_audio_duration(source_wav)
    chunks = []
    start  = 0.0
    idx    = 0

    while start < total:
        end        = min(start + chunk_duration, total)
        chunk_path = os.path.join(output_dir, f'chunk_{idx:04d}.wav')

        subprocess.run(
            [
                'ffmpeg', '-y',
                '-i', source_wav,
                '-ss', str(start),
                '-t',  str(end - start),
                '-acodec', 'pcm_s16le',
                '-ar', '16000',
                '-ac', '1',
                chunk_path,
            ],
            check=True,
            capture_output=True,
            timeout=120,
        )

        chunks.append((chunk_path, start, end))
        start += chunk_duration
        idx   += 1

    return chunks


def _transcribe_chunk(audio_path: str):
    """
    Transcribe a single WAV chunk.
    Returns (transcript_text, word_segments_or_None).
    Tries WhisperX → Whisper → SpeechRecognition.
    """
    try:
        from A2SL.sync_pipeline import _transcribe_whisperx, WordSegment
        segs = _transcribe_whisperx(audio_path)
        text = ' '.join(s.word for s in segs)
        return text, segs
    except Exception:
        pass

    try:
        from A2SL.sync_pipeline import _transcribe_whisper
        segs = _transcribe_whisper(audio_path)
        text = ' '.join(s.word for s in segs)
        return text, segs
    except Exception:
        pass

    try:
        import speech_recognition as sr
        recognizer = sr.Recognizer()
        with sr.AudioFile(audio_path) as source:
            audio_data = recognizer.record(source)
            text = recognizer.recognize_google(audio_data)
        return text, None
    except Exception as exc:
        logger.warning("All transcription methods failed for %s: %s", audio_path, exc)
        return '', None


def _increment_job_progress(job_id: int, failed: bool = False):
    """Atomically increment completed_chunks; mark job completed if all done."""
    from core.models import StreamJob
    from django.db.models import F

    StreamJob.objects.filter(id=job_id).update(
        completed_chunks=F('completed_chunks') + 1
    )
    job = StreamJob.objects.get(id=job_id)
    if job.completed_chunks >= job.total_chunks:
        # All chunks done — check if any failed
        from core.models import StreamChunk
        has_failed = StreamChunk.objects.filter(job=job, status='failed').exists()
        job.status = 'failed' if (failed and has_failed and job.completed_chunks == 0) else 'completed'
        job.save(update_fields=['status'])


def _mark_job_failed(job_id: int, message: str):
    from core.models import StreamJob
    StreamJob.objects.filter(id=job_id).update(
        status='failed',
        error_message=message,
    )


def _nlp_fallback(transcript: str) -> list:
    """Use the existing views.process_text_into_words as NLP fallback."""
    if not transcript:
        return []
    try:
        from A2SL.views import process_text_into_words
        return process_text_into_words(transcript)
    except Exception as e:
        logger.warning("NLP fallback failed: %s", e)
        return transcript.split()
