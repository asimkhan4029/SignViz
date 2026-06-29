/**
 * useStreamingJob.js
 * ==================
 * React hook that manages the full lifecycle of a streaming ASL job.
 *
 * Usage
 * -----
 *   const {
 *     startJob,       // (sourceType, sourceUrl, youtubeId, title) => void
 *     cancelJob,      // () => void
 *     jobStatus,      // 'idle' | 'pending' | 'chunking' | 'processing' | 'completed' | 'failed'
 *     progressPct,    // 0-100
 *     allWords,       // flat array of all sign words collected so far
 *     readyChunks,    // array of { index, words, start_time, end_time }
 *     error,          // string | null
 *     isBuffering,    // true while waiting for first chunk
 *   } = useStreamingJob();
 *
 * The hook polls /api/stream/<job_id>/ready-chunks/ every POLL_INTERVAL ms
 * and accumulates words as chunks become available.
 */

import { useState, useRef, useCallback, useEffect } from 'react';

const POLL_INTERVAL = 1500;   // ms between status polls
const API_BASE      = '';     // same origin; set to 'http://localhost:8000' if needed

export function useStreamingJob() {
  const [jobId,       setJobId]       = useState(null);
  const [jobStatus,   setJobStatus]   = useState('idle');
  const [progressPct, setProgressPct] = useState(0);
  const [readyChunks, setReadyChunks] = useState([]);   // { index, words, start_time, end_time }[]
  const [allWords,    setAllWords]    = useState([]);    // flat word list in chunk order
  const [error,       setError]       = useState(null);
  const [isBuffering, setIsBuffering] = useState(false);

  const pollRef        = useRef(null);
  const lastChunkIdx   = useRef(-1);    // highest chunk index we've received
  const jobIdRef       = useRef(null);  // stable ref for cleanup

  // ── Stop polling ──────────────────────────────────────────────────────────
  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  // ── Poll for ready chunks ─────────────────────────────────────────────────
  const pollChunks = useCallback(async (id) => {
    try {
      const after = lastChunkIdx.current;
      const res   = await fetch(
        `${API_BASE}/api/stream/${id}/ready-chunks/?after=${after}`
      );
      if (!res.ok) return;

      const data = await res.json();

      setJobStatus(data.job_status);
      setProgressPct(data.progress_pct ?? 0);

      if (data.chunks && data.chunks.length > 0) {
        const sorted = [...data.chunks].sort((a, b) => a.index - b.index);

        setReadyChunks((prev) => {
          const chunkMap = new Map(prev.map((c) => [c.index, c]));
          sorted.forEach((c) => chunkMap.set(c.index, c));
          const updated = Array.from(chunkMap.values()).sort((a, b) => a.index - b.index);
          
          // Also update allWords here to ensure they stay in sync
          setAllWords(updated.flatMap((c) => c.words ?? []));
          
          return updated;
        });

        const maxIdx = Math.max(...sorted.map((c) => c.index));
        lastChunkIdx.current = maxIdx;
        setIsBuffering(false);
      }

      if (data.job_status === 'completed' || data.job_status === 'failed') {
        stopPolling();
        if (data.job_status === 'failed') {
          const msg = data.error_message || 'Processing failed. Please try again.';
          setError(msg);
        }
        setIsBuffering(false);
      }
    } catch (err) {
      console.warn('[useStreamingJob] poll error:', err);
    }
  }, [stopPolling]);

  // ── Start a new job ───────────────────────────────────────────────────────
  const startJob = useCallback(async (sourceType, sourceUrl, youtubeId, title) => {
    // Reset state
    stopPolling();
    setJobId(null);
    setJobStatus('pending');
    setProgressPct(0);
    setReadyChunks([]);
    setAllWords([]);
    setError(null);
    setIsBuffering(true);
    lastChunkIdx.current = -1;

    try {
      const res = await fetch(`${API_BASE}/api/stream/start/`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          source_type: sourceType,
          source_url:  sourceUrl,
          youtube_id:  youtubeId ?? null,
          title:       title ?? 'Untitled',
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const id   = data.job_id;

      setJobId(id);
      setJobStatus(data.status);
      jobIdRef.current = id;

      // Start polling
      pollRef.current = setInterval(() => pollChunks(id), POLL_INTERVAL);
      // Immediate first poll
      pollChunks(id);

    } catch (err) {
      setError(err.message);
      setJobStatus('failed');
      setIsBuffering(false);
    }
  }, [pollChunks, stopPolling]);

  // ── Cancel job ────────────────────────────────────────────────────────────
  const cancelJob = useCallback(async () => {
    stopPolling();
    const id = jobIdRef.current;
    if (id) {
      await fetch(`${API_BASE}/api/stream/${id}/cancel/`, { method: 'DELETE' })
        .catch(() => {});
    }
    setJobStatus('idle');
    setIsBuffering(false);
  }, [stopPolling]);

  // Cleanup on unmount
  useEffect(() => () => stopPolling(), [stopPolling]);

  return {
    startJob,
    cancelJob,
    jobId,
    jobStatus,
    progressPct,
    readyChunks,
    allWords,
    error,
    isBuffering,
  };
}
