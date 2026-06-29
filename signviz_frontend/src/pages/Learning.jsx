import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Play, Pause, ChevronLeft, BookOpen, Loader2, User,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useLibrary } from '../context/LibraryContext';
import { getVideoUrl, hasVideo } from '../lib/videoStore';

// ─── Avatar player ───────────────────────────────────────────────────────────
// wordPairs: [{original, animation}] — original shown in subtitle, animation for .webm
// words: plain string fallback
const AvatarPlayer = ({ wordPairs, words, isPlaying, onEnded, onTogglePlay }) => {
  const videoRef  = useRef(null);
  const queueRef  = useRef([]);
  const busyRef   = useRef(false);
  const loadedRef = useRef('');
  const [displayOriginal, setDisplayOriginal] = useState(null);

  const playNext = useCallback(() => {
    if (queueRef.current.length === 0) {
      busyRef.current = false;
      setDisplayOriginal(null);
      onEnded?.();
      return;
    }
    const { original, animation } = queueRef.current.shift();
    busyRef.current = true;
    setDisplayOriginal(original);
    const vid = videoRef.current;
    if (!vid) { busyRef.current = false; return; }
    vid.src = `/static/${animation}.webm`;
    vid.load();
    if (isPlaying) vid.play().catch(() => { busyRef.current = false; playNext(); });
  }, [isPlaying, onEnded]);

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    const onEnd = () => { busyRef.current = false; playNext(); };
    const onErr = () => { busyRef.current = false; playNext(); };
    vid.addEventListener('ended', onEnd);
    vid.addEventListener('error', onErr);
    return () => { vid.removeEventListener('ended', onEnd); vid.removeEventListener('error', onErr); };
  }, [playNext]);

  useEffect(() => {
    // Build queue from wordPairs if available, else plain words
    let items = [];
    if (wordPairs && wordPairs.length > 0) {
      const key = wordPairs.map(p => p.animation).join(',');
      if (key === loadedRef.current) return;
      loadedRef.current = key;
      items = wordPairs.filter(p => p.animation && /[a-zA-Z0-9]/.test(p.animation));
    } else if (words && words.length > 0) {
      const key = words.join(',');
      if (key === loadedRef.current) return;
      loadedRef.current = key;
      items = words
        .filter(w => w && /[a-zA-Z0-9]/.test(w))
        .map(w => ({ original: w, animation: w }));
    } else {
      return;
    }
    queueRef.current = items;
    busyRef.current  = false;
    setDisplayOriginal(null);
    if (videoRef.current) { videoRef.current.pause(); videoRef.current.src = ''; }
    playNext();
  }, [wordPairs, words, playNext]);

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid || !displayOriginal) return;
    if (isPlaying) vid.play().catch(() => {});
    else           vid.pause();
  }, [isPlaying, displayOriginal]);

  const hasContent = (wordPairs?.length || words?.length);

  return (
    <div
      className="relative w-full h-full bg-black rounded-2xl overflow-hidden shadow-xl group cursor-pointer"
      onClick={onTogglePlay}
    >      <video ref={videoRef} className="w-full h-full object-contain" playsInline />

      <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 z-40 bg-black/20 ${isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
        {isPlaying ? (
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30">
            <Pause className="w-8 h-8 fill-current" />
          </div>
        ) : (
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30 hover:scale-110 transition-transform shadow-xl">
            <Play className="w-8 h-8 ml-1 fill-current" />
          </div>
        )}
      </div>

      {!displayOriginal && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-20">
          <User className="w-12 h-12 text-white/20" />
        </div>
      )}

      {/* Subtitle — shows ORIGINAL spoken word */}
      {displayOriginal && (
        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
          <p className="text-white text-xs font-bold uppercase tracking-wider">
            Sign: <span className="text-primary">{displayOriginal}</span>
          </p>
        </div>
      )}
      <div className="absolute top-3 right-3 bg-primary/20 backdrop-blur-sm px-2 py-1 rounded-md border border-primary/30">
        <p className="text-primary text-[10px] font-black uppercase">Avatar</p>
      </div>
    </div>
  );
};

// ─── Main ────────────────────────────────────────────────────────────────────
const Learning = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getVideoById } = useLibrary();

  const [item, setItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  // Load video from library context
  useEffect(() => {
    const load = () => {
      setIsLoading(true);
      try {
        const found = getVideoById(id);
        setItem(found || null);
      } catch (err) {
        console.error('Failed to load video', err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id, getVideoById]);

  // Resolve video URL — for local files, get blob URL from videoStore
  const resolvedVideoUrl = (() => {
    if (!item) return '';
    if (item.source_type === 'youtube') return item.videoUrl || '';
    const fromStore = getVideoUrl(item.videoUrl);
    if (fromStore) return fromStore;
    if (item.videoUrl?.startsWith('blob:') || item.videoUrl?.startsWith('data:')) {
      return item.videoUrl;
    }
    return '';
  })();

  const videoContainerRef = useRef(null);
  const avatarContainerRef = useRef(null);

  // Sync avatar height to video height
  useEffect(() => {
    const syncHeight = () => {
      if (videoContainerRef.current && avatarContainerRef.current) {
        const h = videoContainerRef.current.offsetHeight;
        if (h > 0) avatarContainerRef.current.style.height = h + 'px';
      }
    };
    syncHeight();
    const ro = new ResizeObserver(syncHeight);
    if (videoContainerRef.current) ro.observe(videoContainerRef.current);
    return () => ro.disconnect();
  }, [item]);

  const togglePlay = () => setIsPlaying(p => !p);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Back button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/library')}
          className="text-text-muted hover:text-primary hover:bg-primary/5 pl-0"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back to Library
        </Button>

        {/* Meta */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-1">{item?.title || 'Untitled Video'}</h2>
          <p className="text-text-muted text-sm">
            {item?.source_type || 'Translation'} • Saved {item?.saved_at || 'recently'}
          </p>
        </div>

        {/* ── Side-by-side players — equal height via ResizeObserver ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Original video — 2/3 */}
          <div className="lg:col-span-2">
            <div ref={videoContainerRef} className="w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl">
              {item?.source_type === 'youtube' && item?.youtube_id ? (
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${item.youtube_id}?controls=1`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={item?.title}
                />
              ) : (
                <video
                  className="w-full h-full object-contain"
                  controls
                  src={resolvedVideoUrl}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
              )}
            </div>
          </div>

          {/* Avatar — 1/3, height synced to video via ref */}
          <div className="lg:col-span-1">
            <div ref={avatarContainerRef} className="w-full bg-black rounded-2xl overflow-hidden">
              <AvatarPlayer                wordPairs={item?.wordPairs || []}
                words={item?.animationData || []}
                isPlaying={isPlaying}
                onEnded={() => setIsPlaying(false)}
                onTogglePlay={togglePlay}
              />
            </div>
          </div>
        </div>

        {/* Signs list */}
        {item?.animationData?.length > 0 && (
          <Card className="p-5 border border-white/40 shadow-lg rounded-2xl">
            <h3 className="font-bold text-foreground mb-3 flex items-center gap-2 text-sm">
              <BookOpen className="w-4 h-4 text-primary" />
              All Signs ({item.animationData.length})
            </h3>
            <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
              {item.animationData.map((w, i) => (
                <span key={i} className="px-2 py-0.5 bg-surface/50 border border-white/30 text-foreground text-xs font-medium rounded-lg">
                  {w}
                </span>
              ))}
            </div>
          </Card>
        )}

        {/* Play/Pause button */}
        {item?.animationData?.length > 0 && (
          <div className="flex justify-center">
            <Button
              onClick={togglePlay}
              className={`px-12 py-4 rounded-xl transition-all ${
                isPlaying ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-primary hover:bg-primary-light text-white'
              }`}
            >
              {isPlaying
                ? <><Pause className="w-5 h-5 mr-2 fill-current" /> Pause Avatar</>
                : <><Play  className="w-5 h-5 mr-2 fill-current" /> Play Avatar</>}
            </Button>
          </div>
        )}

      </main>
    </div>
  );
};

export default Learning;
