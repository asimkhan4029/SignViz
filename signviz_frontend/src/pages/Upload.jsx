import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Upload as UploadIcon, FileVideo, ArrowRight, CheckCircle2,
  User, Youtube, Link, Loader2, Play, Pause, RefreshCw,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { cn } from '../lib/utils';
import { useLibrary } from '../context/LibraryContext';
import { useStreamingJob } from '../hooks/useStreamingJob';
import { storeVideo, getVideoUrl } from '../lib/videoStore';

// ─── helpers ─────────────────────────────────────────────────────────────────

const getYoutubeId = (url) => {
  const m = url.match(/^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
  return m && m[2].length === 11 ? m[2] : null;
};

// ─── YouTube IFrame API loader (singleton) ────────────────────────────────────

let ytApiReady = false;
let ytApiCallbacks = [];

function loadYouTubeApi() {
  if (ytApiReady) return Promise.resolve();
  return new Promise((resolve) => {
    ytApiCallbacks.push(resolve);
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);
      window.onYouTubeIframeAPIReady = () => {
        ytApiReady = true;
        ytApiCallbacks.forEach((cb) => cb());
        ytApiCallbacks = [];
      };
    }
  });
}

// ─── AvatarPlayer ────────────────────────────────────────────────────────────
// wordPairs: [{ original, animation }] — original shown in subtitle, animation used for .webm
// words: plain string array (fallback when no wordPairs)
const AvatarPlayer = ({ syncSequence, wordPairs, words, isPlaying, currentTime, onTogglePlay, containerRef }) => {
  const videoRef       = useRef(null);
  const wrapperRef     = useRef(null);
  const [displayOriginal, setDisplayOriginal] = useState(null); // shown in subtitle
  const [displayAnimation, setDisplayAnimation] = useState(null); // used for .webm src

  // Timestamp mode refs
  const lastEntryRef   = useRef(null);

  // Queue mode refs — each item: { original, animation, speed }
  const queueRef       = useRef([]);
  const isBusyRef      = useRef(false);
  const loadedWordsRef = useRef('');

  const hasSync = syncSequence && syncSequence.length > 0;

  // ── Sync avatar height to original video container ────────────────────────
  useEffect(() => {
    if (!containerRef?.current || !wrapperRef.current) return;
    const sync = () => {
      const h = containerRef.current.offsetHeight;
      if (h > 0) wrapperRef.current.style.height = h + 'px';
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [containerRef]);

  // ── Queue mode: playNext ──────────────────────────────────────────────────
  const playNext = useCallback(() => {
    if (queueRef.current.length === 0) {
      isBusyRef.current = false;
      setDisplayOriginal(null);
      setDisplayAnimation(null);
      return;
    }
    const { original, animation, speed } = queueRef.current.shift();
    isBusyRef.current = true;
    setDisplayOriginal(original);
    setDisplayAnimation(animation);

    const vid = videoRef.current;
    if (!vid) { isBusyRef.current = false; return; }

    vid.src = `/static/${animation}.webm`;
    vid.playbackRate = Math.min(Math.max(speed ?? 1.0, 0.5), 2.0);
    vid.load();
    vid.play().catch(() => { isBusyRef.current = false; playNext(); });
  }, []);

  // ── Queue mode: attach ended/error once ──────────────────────────────────
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    const onEnd = () => { isBusyRef.current = false; if (!hasSync) playNext(); };
    const onErr = () => { isBusyRef.current = false; if (!hasSync) playNext(); };
    vid.addEventListener('ended', onEnd);
    vid.addEventListener('error', onErr);
    return () => {
      vid.removeEventListener('ended', onEnd);
      vid.removeEventListener('error', onErr);
    };
  }, [playNext, hasSync]);

  // ── Queue mode: load queue when words/wordPairs arrive ────────────────────
  useEffect(() => {
    if (hasSync) return;

    // Build items from wordPairs if available, else plain words
    let items = [];
    if (wordPairs && wordPairs.length > 0) {
      const key = wordPairs.map(p => p.animation).join(',');
      if (key === loadedWordsRef.current) return;
      loadedWordsRef.current = key;
      items = wordPairs.map(p => ({ original: p.original, animation: p.animation, speed: 1.0 }));
    } else if (words && words.length > 0) {
      const key = words.join(',');
      if (key === loadedWordsRef.current) return;
      loadedWordsRef.current = key;
      items = words.map(w => ({ original: w, animation: w, speed: 1.0 }));
    } else {
      return;
    }

    queueRef.current  = items;
    isBusyRef.current = false;
    setDisplayOriginal(null);
    setDisplayAnimation(null);
    if (videoRef.current) { videoRef.current.pause(); videoRef.current.src = ''; }
    playNext();
  }, [wordPairs, words, hasSync, playNext]);

  // ── Queue mode: pause/resume ──────────────────────────────────────────────
  useEffect(() => {
    if (hasSync) return;
    const vid = videoRef.current;
    if (!vid) return;
    if (!isPlaying) {
      vid.pause();
    } else if (isBusyRef.current && vid.src && vid.paused) {
      vid.play().catch(() => {});
    } else if (!isBusyRef.current && queueRef.current.length > 0) {
      playNext();
    }
  }, [isPlaying, hasSync, playNext]);

  // ── Timestamp mode ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!hasSync) return;
    const vid = videoRef.current;
    if (!vid) return;

    const entry = syncSequence.find(
      (e) => e.type === 'sign' && e.word &&
             (currentTime ?? 0) >= e.start && (currentTime ?? 0) < e.end
    );

    if (entry) {
      if (lastEntryRef.current?.word !== entry.word || lastEntryRef.current?.start !== entry.start) {
        lastEntryRef.current = entry;
        // original_word stored in entry if available, else use word
        setDisplayOriginal(entry.original_word || entry.word);
        setDisplayAnimation(entry.word);
        vid.src = `/static/${entry.word}.webm`;
        vid.playbackRate = Math.min(Math.max(entry.speed ?? 1.0, 0.5), 2.0);
        vid.load();
        if (isPlaying) vid.play().catch(() => {});
      }
    } else {
      if (lastEntryRef.current !== null) {
        lastEntryRef.current = null;
        setDisplayOriginal(null);
        setDisplayAnimation(null);
        vid.pause();
        vid.src = '';
      }
    }

    if (vid.src) {
      if (isPlaying && vid.paused)   vid.play().catch(() => {});
      if (!isPlaying && !vid.paused) vid.pause();
    }
  }, [currentTime, isPlaying, syncSequence, hasSync]);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div
      ref={wrapperRef}
      className={cn(
        "relative w-full bg-black rounded-2xl overflow-hidden shadow-2xl group",
        (hasSync || wordPairs?.length || words?.length) ? "cursor-pointer" : ""
      )}
      style={{ minHeight: '200px' }}
      onClick={() => { if (hasSync || wordPairs?.length || words?.length) onTogglePlay?.(); }}
    >
      <video ref={videoRef} className="w-full h-full object-contain" playsInline />

      {/* Play/pause overlay */}
      {!displayAnimation && (hasSync || wordPairs?.length || words?.length) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-black/80">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30 hover:scale-110 transition-transform shadow-xl mb-3">
            {isPlaying
              ? <Pause className="w-8 h-8 fill-current" />
              : <Play  className="w-8 h-8 ml-1 fill-current" />}
          </div>
          <p className="text-white/60 text-xs font-bold uppercase tracking-widest text-center px-4">
            {isPlaying ? 'Loading sign…' : 'Press play on video to start'}
          </p>
        </div>
      )}

      {/* Empty state */}
      {!displayAnimation && !hasSync && !wordPairs?.length && !words?.length && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-black">
          <User className="w-12 h-12 text-white/20 mb-4" />
          <p className="text-white/40 text-sm font-bold uppercase tracking-widest text-center px-4">
            Ready for Translation
          </p>
        </div>
      )}

      {/* Subtitle — shows ORIGINAL spoken word */}
      {displayOriginal && (
        <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 z-30">
          <p className="text-white text-xs font-bold uppercase tracking-wider">
            Sign: <span className="text-primary">{displayOriginal}</span>
          </p>
        </div>
      )}

      <div className="absolute top-4 right-4 bg-primary/20 backdrop-blur-sm px-3 py-1 rounded-xl border border-white/20 z-30">
        <p className="text-primary text-[10px] font-black uppercase tracking-tighter">AI Avatar</p>
      </div>
    </div>
  );
};

// ─── Main Upload Page ─────────────────────────────────────────────────────────

const UploadPage = () => {
  const [file, setFile]               = useState(null);
  const [fileUrl, setFileUrl]         = useState(null);   // stable object URL
  const [youtubeUrl, setYoutubeUrl]   = useState('');
  const [activeSource, setActiveSource] = useState(null);
  const [isPlaying, setIsPlaying]     = useState(false);
  const [isSaving, setIsSaving]       = useState(false);
  const [isSaved, setIsSaved]         = useState(false);
  const [avatarTime, setAvatarTime]   = useState(0);

  // Direct processing state (local file uploads)
  const [isDirectProcessing, setIsDirectProcessing] = useState(false);
  const [directWords, setDirectWords]               = useState([]);
  const [directWordPairs, setDirectWordPairs]       = useState([]); // {original, animation}[]
  const [directSyncSequence, setDirectSyncSequence] = useState([]);
  const [directError, setDirectError]               = useState(null);

  const originalVideoRef = useRef(null);
  const videoContainerRef = useRef(null); // for height sync
  const ytPlayerRef      = useRef(null);
  const ytPollRef        = useRef(null);
  const ytContainerRef   = useRef(null);

  const { saveVideo } = useLibrary();

  // ── Streaming hook ────────────────────────────────────────────────────────
  const {
    startJob,
    cancelJob,
    jobStatus,
    progressPct,
    allWords,
    readyChunks,
    error: streamError,
    isBuffering,
  } = useStreamingJob();

  const isDone      = jobStatus === 'completed' || (allWords.length > 0);
  const isConverting = jobStatus === 'pending' || jobStatus === 'chunking' || jobStatus === 'processing';
  const error       = streamError;

  // Combined words: streaming (YouTube) or direct (local file)
  const activeWords = activeSource === 'file' ? directWords : allWords;
  const activeConverting = activeSource === 'file' ? isDirectProcessing : isConverting;
  const activeError = activeSource === 'file' ? directError : streamError;
  const activeIsBuffering = activeSource === 'file' ? false : isBuffering;
  const activeProgressPct = activeSource === 'file' ? (isDirectProcessing ? 50 : 100) : progressPct;

  // Flatten animation data from all ready chunks
  const streamingSyncSequence = readyChunks
    .sort((a, b) => a.index - b.index)
    .flatMap((c) => c.animation_data || []);

  const masterSyncSequence = activeSource === 'file' ? directSyncSequence : streamingSyncSequence;

  // ── Avatar Time Tracking ──────────────────────────────────────────────────
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        const maxTime = masterSyncSequence.length > 0 ? masterSyncSequence[masterSyncSequence.length - 1].end : 0;

        if (activeSource === 'file') {
          const vid = originalVideoRef.current;
          if (vid) {
            if (vid.ended) {
              setAvatarTime(prev => {
                const nextTime = prev + 0.1;
                if (nextTime >= maxTime && maxTime > 0) {
                  setIsPlaying(false);
                  return maxTime;
                }
                return nextTime;
              });
            } else {
              setAvatarTime(vid.currentTime);
            }
          }
        } else if (activeSource === 'youtube') {
          const yt = ytPlayerRef.current;
          if (yt && yt.getPlayerState) {
            const YT = window.YT.PlayerState;
            const state = yt.getPlayerState();
            if (state === YT.ENDED) {
              setAvatarTime(prev => {
                const nextTime = prev + 0.1;
                if (nextTime >= maxTime && maxTime > 0) {
                  setIsPlaying(false);
                  return maxTime;
                }
                return nextTime;
              });
            } else if (state === YT.PLAYING) {
              setAvatarTime(yt.getCurrentTime());
            }
          }
        }
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, activeSource, masterSyncSequence]);

  // ── YouTube IFrame API setup ────────────────────────────────────────────────
  useEffect(() => {
    if (activeSource !== 'youtube' || !youtubeUrl) return;

    const ytId = getYoutubeId(youtubeUrl);
    if (!ytId) return;

    loadYouTubeApi().then(() => {
      // Destroy previous player if any
      if (ytPlayerRef.current) {
        try {
          ytPlayerRef.current.destroy();
        } catch (e) {}
        ytPlayerRef.current = null;
      }

      ytPlayerRef.current = new window.YT.Player('yt-player-container', {
        videoId: ytId,
        playerVars: {
          autoplay: 0,
          controls: 1,
          rel: 0,
          modestbranding: 1,
        },
        events: {
          onStateChange: (event) => {
            const YT = window.YT.PlayerState;
            if (event.data === YT.PLAYING) {
              setIsPlaying(true);
            } else if (event.data === YT.ENDED) {
              setIsPlaying(true); // Keep playing for avatar
            } else {
              setIsPlaying(false);
            }
          },
        },
      });
    });

    return () => {};
  }, [activeSource, youtubeUrl]);

  // Destroy YT player on unmount
  useEffect(() => {
    return () => {
      if (ytPlayerRef.current) {
        try {
          ytPlayerRef.current.destroy();
        } catch (e) {}
      }
    };
  }, []);

  // ── File upload handler ─────────────────────────────────────────────────────
  const handleFileUpload = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      if (fileUrl) URL.revokeObjectURL(fileUrl);
      const url = URL.createObjectURL(f);
      const storeId = storeVideo(f);   // persist in module-level store
      setFile(f);
      setFileUrl(url);
      setYoutubeUrl('');
      setActiveSource('file');
      setIsSaved(false);
      setDirectWords([]);
      setDirectSyncSequence([]);
      setDirectError(null);
      setAvatarTime(0);
      setDirectWordPairs([]);
      // Store the ID so we can retrieve the URL later from the library page
      window.__lastUploadedVideoStoreId = storeId;
    }
  };

  const handleYoutubeSubmit = (e) => {
    e.preventDefault();
    if (getYoutubeId(youtubeUrl)) {
      setFile(null);
      setActiveSource('youtube');
      setIsSaved(false);
    }
  };

  // ── Start conversion ─────────────────────────────────────────────────────
  // YouTube → streaming pipeline (chunked background processing)
  // Local file → direct fast endpoint (file is on client, not server)
  const handleConvert = async () => {
    setIsSaved(false);

    if (activeSource === 'youtube') {
      // Streaming pipeline for YouTube
      startJob('youtube', youtubeUrl, getYoutubeId(youtubeUrl), 'YouTube Translation');
    } else if (activeSource === 'file' && file) {
      // Direct upload for local files — streaming can't access client files
      setIsDirectProcessing(true);
      setDirectError(null);
      setDirectWords([]);
      setDirectWordPairs([]);
      setDirectSyncSequence([]);
      try {
        const formData = new FormData();
        formData.append('video', file);
        formData.append('title', file.name);
        const res = await fetch('/api/process_video', { method: 'POST', body: formData });
        if (!res.ok) throw new Error(`Server error ${res.status}`);
        const data = await res.json();
        setDirectWords(data.words || []);
        setDirectWordPairs(data.word_pairs || []);
        setDirectSyncSequence(data.sync_sequence || []);
      } catch (err) {
        setDirectError(err.message);
      } finally {
        setIsDirectProcessing(false);
      }
    }
  };

  // ── Save to library ───────────────────────────────────────────────────────
  const handleSaveToLibrary = async () => {
    if (!activeWords.length) return;
    setIsSaving(true);
    try {
      const activeWordPairs = activeSource === 'file' ? directWordPairs : [];
      const originalWords = activeWordPairs.length > 0
        ? activeWordPairs.map(p => p.original)
        : activeWords;

      // For local files: save the videoStore ID so Learning page can retrieve the blob URL
      let persistentVideoUrl = activeSource === 'youtube' ? youtubeUrl : '';
      if (activeSource === 'file' && file) {
        // Re-store to get the stable ID (idempotent)
        persistentVideoUrl = storeVideo(file);
      }

      saveVideo({
        title:         activeSource === 'file' ? (file?.name || 'Uploaded Video') : 'YouTube Translation',
        videoUrl:      persistentVideoUrl,
        source_type:   activeSource === 'youtube' ? 'youtube' : 'local',
        youtube_id:    activeSource === 'youtube' ? getYoutubeId(youtubeUrl) : null,
        animationData: originalWords,
        wordPairs:     activeWordPairs,
        thumbnail:     null,
        duration:      0,
      });
      setIsSaved(true);
    } catch (err) {
      console.error('Save failed', err);
    } finally {
      setIsSaving(false);
    }
  };

  // ── Play/Pause ────────────────────────────────────────────────────────────
  const togglePlay = () => {
    if (activeSource === 'file') {
      const vid = originalVideoRef.current;
      if (vid) {
        if (vid.ended) {
          setIsPlaying(prev => !prev);
        } else {
          if (isPlaying) vid.pause();
          else           vid.play();
        }
      }
    } else if (activeSource === 'youtube') {
      const yt = ytPlayerRef.current;
      if (yt && yt.getPlayerState) {
        const YT = window.YT.PlayerState;
        const state = yt.getPlayerState();
        if (state === YT.ENDED) {
          setIsPlaying(prev => !prev);
        } else {
          if (isPlaying) yt.pauseVideo();
          else           yt.playVideo();
        }
      }
    }
  };

  // ── Reset ─────────────────────────────────────────────────────────────────
  const reset = () => {
    cancelJob();
    clearInterval(ytPollRef.current);
    ytPlayerRef.current?.destroy?.();
    ytPlayerRef.current = null;
    if (fileUrl) URL.revokeObjectURL(fileUrl);
    setFile(null);
    setFileUrl(null);
    setYoutubeUrl('');
    setActiveSource(null);
    setIsPlaying(false);
    setAvatarTime(0);
    setIsSaved(false);
    setDirectWords([]);
    setDirectWordPairs([]);
    setDirectSyncSequence([]);
    setDirectError(null);
    setIsDirectProcessing(false);
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8 py-8 animate-in fade-in duration-700 min-h-screen p-6">
      <header className="mb-12 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-black mb-6 uppercase tracking-widest border border-primary/20">
          <RefreshCw className="w-4 h-4" />
          AI Translation Core
        </div>
        <h1 className="text-6xl md:text-8xl font-black tracking-tight text-foreground leading-none mb-8">
          Visual <span className="gradient-text">Sign Engine</span>
        </h1>
        <p className="text-xl md:text-2xl text-text-secondary font-medium leading-relaxed">
          Bridge the communication gap. Upload or link video content to generate
          high-fidelity sign language interpretations instantly.
        </p>
      </header>

      {!activeSource ? (
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 items-stretch pt-8">
          {/* File Upload */}
          <Card className="p-10 flex flex-col items-center justify-center border-2 border-dashed border-primary/30 hover:border-primary/60 transition-all duration-300 group cursor-pointer relative overflow-hidden h-[400px]">
            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="video/*" onChange={handleFileUpload} />
            <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 mb-6">
              <UploadIcon className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">Upload Video</h3>
            <p className="text-text-secondary text-center max-w-xs text-sm">Drop your educational video here or click to browse files</p>
            <div className="mt-8 flex gap-2">
              {['MP4', 'MOV', 'AVI'].map((ext) => (
                <span key={ext} className="px-2 py-1 bg-primary/10 border border-primary/20 rounded text-[10px] font-bold text-primary">{ext}</span>
              ))}
            </div>
          </Card>

          {/* YouTube URL */}
          <Card className="p-10 flex flex-col items-center justify-center border-2 border-primary/20 hover:border-primary/50 transition-all duration-300 h-[400px]">
            <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center mb-6">
              <Youtube className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">YouTube URL</h3>
            <p className="text-text-secondary text-center mb-8 max-w-xs">Paste a YouTube link to process online educational content</p>
            <form onSubmit={handleYoutubeSubmit} className="w-full space-y-4">
              <div className="relative">
                <Link className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  type="text"
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full pl-12 pr-4 py-4 bg-surface/50 border-2 border-white/30 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-sm font-medium text-foreground placeholder:text-text-muted"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full py-6 rounded-xl shadow-lg shadow-primary/20">
                Import Video <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </form>
          </Card>
        </div>
      ) : (
        <div className="space-y-6 max-w-[1400px] mx-auto">
          {/* Toolbar */}
          <div className="flex justify-between items-center bg-surface/60 backdrop-blur-md p-4 rounded-2xl border border-white/30 shadow-sm">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={reset} className="text-text-muted hover:text-red-500 hover:bg-red-50">
                <RefreshCw className="w-4 h-4 mr-2" /> Start Over
              </Button>
              <div className="h-4 w-px bg-white/20" />
              <div className="flex items-center gap-2">
                {activeSource === 'file' ? <FileVideo className="w-4 h-4 text-primary" /> : <Youtube className="w-4 h-4 text-primary" />}
                <span className="text-sm font-bold text-foreground truncate max-w-[300px]">
                  {activeSource === 'file' ? file?.name : youtubeUrl}
                </span>
              </div>
            </div>

            {!activeWords.length && !activeConverting ? (
              <Button onClick={handleConvert} className="px-8 py-6 rounded-xl shadow-xl shadow-primary/20">
                Extract Interpretation <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            ) : activeConverting ? (
              <div className="flex items-center gap-3">
                <div className="w-40 h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${activeProgressPct}%` }} />
                </div>
                <span className="text-sm text-text-muted font-medium">
                  {activeIsBuffering ? 'Preparing…' : activeSource === 'file' ? 'Processing…' : `${activeProgressPct}%`}
                </span>
                {activeSource === 'youtube' && (
                  <Button variant="ghost" size="sm" onClick={cancelJob} className="text-red-400 hover:text-red-600">Cancel</Button>
                )}
              </div>
            ) : (
              activeSource === 'file' && (
                <Button onClick={togglePlay} size="lg"
                  className={cn('px-8 py-6 rounded-xl', isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-green-600 hover:bg-green-700')}>
                  {isPlaying ? <><Pause className="w-5 h-5 mr-2 fill-current" />Pause</> : <><Play className="w-5 h-5 mr-2 fill-current" />Play</>}
                </Button>
              )
            )}
          </div>

          {/* Streaming status */}
          {activeConverting && (
            <div className="flex items-center gap-3 px-5 py-3 bg-primary/10 border border-primary/30 rounded-xl text-sm text-primary font-medium">
              <Loader2 className="w-4 h-4 animate-spin" />
              {activeSource === 'file'
                ? 'Processing video — generating sign language interpretation…'
                : activeIsBuffering
                  ? 'Preparing first chunk — avatar will start shortly…'
                  : `Processing chunks in background (${activeProgressPct}% complete)`}
            </div>
          )}

          {activeError && (
            <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-sm font-medium flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> {activeError}
            </div>
          )}

          {/* Dual players */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2 relative">
              <Card ref={videoContainerRef} className="w-full aspect-video border-none shadow-2xl overflow-hidden bg-black">
                {activeSource === 'file' ? (
                  <video
                    ref={originalVideoRef}
                    src={fileUrl || ''}
                    className="w-full h-full object-contain"
                    controls
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => {
                      if (!originalVideoRef.current?.ended) {
                        setIsPlaying(false);
                      }
                    }}
                  />
                ) : (
                  <div id="yt-player-container" ref={ytContainerRef} className="w-full h-full" />
                )}
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                  <p className="text-white text-xs font-bold uppercase tracking-wider">
                    Source: <span className="text-primary">{activeSource === 'file' ? 'Local' : 'YouTube'}</span>
                  </p>
                </div>
              </Card>
            </div>

            {/* Avatar — height synced to original video via containerRef */}
            <div className="lg:col-span-1 w-full">
              <AvatarPlayer
                syncSequence={masterSyncSequence}
                wordPairs={activeSource === 'file' ? directWordPairs : []}
                words={activeWords}
                isPlaying={isPlaying}
                currentTime={avatarTime}
                onTogglePlay={togglePlay}
                containerRef={videoContainerRef}
              />
            </div>
          </div>

          {activeWords.length > 0 && (
            <div className="flex justify-center pt-8">
              <Button
                onClick={handleSaveToLibrary}
                disabled={isSaved || isSaving}
                variant={isSaved ? 'secondary' : 'primary'}
                size="lg"
                className={cn('rounded-xl px-12 transition-all shadow-lg', isSaved ? 'bg-green-100 border-green-200 text-green-700' : '')}
              >
                {isSaving ? <><Loader2 className="w-6 h-6 mr-3 animate-spin" />Saving…</>
                  : isSaved ? <><CheckCircle2 className="w-6 h-6 mr-3 text-green-600" />Saved to Library</>
                  : <><CheckCircle2 className="w-6 h-6 mr-3 text-white" />Save to Library</>}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UploadPage;
