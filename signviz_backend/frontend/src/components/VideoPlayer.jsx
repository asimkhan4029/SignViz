import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, Scissors } from 'lucide-react';

const VideoPlayer = ({ words, rawText, originalVideoSrc, originalVideoType }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isBgRemoved, setIsBgRemoved] = useState(false);
  const [bgRemovedUrls, setBgRemovedUrls] = useState({});
  const [bgLoading, setBgLoading] = useState(false);
  const aslVideoRef = useRef(null);

  useEffect(() => {
    setCurrentIndex(0);
    setIsPlaying(false);
    setIsFinished(false);
    setIsBgRemoved(false);
    setBgRemovedUrls({});
  }, [words]);

  useEffect(() => {
    if (isPlaying && aslVideoRef.current) {
      aslVideoRef.current.play().catch(e => {
        console.error('Autoplay prevented or video load error:', e);
        setIsPlaying(false);
      });
    }
  }, [currentIndex, isPlaying]);

  const handleVideoEnded = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsPlaying(false);
      setIsFinished(true);
    }
  };

  const handleVideoError = () => {
    console.warn(`Failed to load video for word: ${words[currentIndex]}, skipping...`);
    handleVideoEnded();
  };

  const togglePlay = () => {
    if (isFinished) {
      setCurrentIndex(0);
      setIsFinished(false);
      setIsPlaying(true);
      return;
    }
    if (isPlaying) {
      aslVideoRef.current.pause();
    } else {
      aslVideoRef.current.play().catch(console.error);
    }
    setIsPlaying(!isPlaying);
  };

  const restart = () => {
    setCurrentIndex(0);
    setIsFinished(false);
    setIsPlaying(true);
  };

  // Toggle background removal — fetches processed video from backend
  const toggleBgRemoval = async () => {
    if (isBgRemoved) {
      setIsBgRemoved(false);
      return;
    }

    setBgLoading(true);
    try {
      // Pre-fetch bg-removed version for current word if not cached
      const word = words[currentIndex];
      if (!bgRemovedUrls[word]) {
        const resp = await fetch(`/api/remove_bg?word=${encodeURIComponent(word)}`);
        if (resp.ok) {
          const blob = await resp.blob();
          const url = URL.createObjectURL(blob);
          setBgRemovedUrls(prev => ({ ...prev, [word]: url }));
        }
      }
      setIsBgRemoved(true);
    } catch (e) {
      console.error('BG removal failed:', e);
    } finally {
      setBgLoading(false);
    }
  };

  // Prefetch bg-removed video for next word when index changes
  useEffect(() => {
    if (!isBgRemoved || !words.length) return;
    const word = words[currentIndex];
    if (!bgRemovedUrls[word]) {
      fetch(`/api/remove_bg?word=${encodeURIComponent(word)}`)
        .then(r => r.ok ? r.blob() : null)
        .then(blob => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            setBgRemovedUrls(prev => ({ ...prev, [word]: url }));
          }
        })
        .catch(() => {});
    }
  }, [currentIndex, isBgRemoved]);

  const hasOriginalVideo = originalVideoSrc && originalVideoType === 'file';
  const hasYoutubeVideo = originalVideoSrc && originalVideoType === 'youtube';

  const getYoutubeEmbedUrl = (url) => {
    try {
      const match = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
      return match ? `https://www.youtube.com/embed/${match[1]}` : null;
    } catch {
      return null;
    }
  };

  if (!words || words.length === 0) {
    return (
      <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          <Play size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
          <h3>No Animation Data</h3>
          <p>Please upload a video to generate animations.</p>
        </div>
      </div>
    );
  }

  const currentWord = words[currentIndex];
  const rawVideoUrl = `/static/${currentWord}.mp4`;
  const videoUrl = (isBgRemoved && bgRemovedUrls[currentWord]) ? bgRemovedUrls[currentWord] : rawVideoUrl;
  const progressPercent = (currentIndex / words.length) * 100;
  const youtubeEmbedUrl = hasYoutubeVideo ? getYoutubeEmbedUrl(originalVideoSrc) : null;

  const renderAslVideo = () => (
    <div className={`video-container${isBgRemoved ? ' asl-transparent' : ''}`}>
      <video
        key={videoUrl}
        ref={aslVideoRef}
        className="video-element"
        onEnded={handleVideoEnded}
        onError={handleVideoError}
        muted
        playsInline
      >
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support HTML5 video.
      </video>

      {!isPlaying && (
        <div className="video-overlay" onClick={togglePlay}>
          {isFinished ? (
            <>
              <RotateCcw size={48} color="white" />
              <h3 style={{ marginTop: '0.75rem', color: 'white', fontSize: '1rem' }}>Sequence Complete</h3>
            </>
          ) : (
            <Play size={48} color="white" />
          )}
        </div>
      )}
    </div>
  );

  const renderDualLayout = () => {
    if (hasYoutubeVideo && youtubeEmbedUrl) {
      // YouTube: full-width on top, ASL full-width below
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="video-panel">
            <div className="video-panel-label">Original Video</div>
            <div className="video-container youtube-large">
              <iframe
                className="video-element"
                src={youtubeEmbedUrl}
                title="Original YouTube Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ border: 'none' }}
              />
            </div>
          </div>
          <div className="video-panel">
            <div className="video-panel-label">ASL Animation</div>
            {renderAslVideo()}
          </div>
        </div>
      );
    }

    if (hasOriginalVideo) {
      // File upload: side by side
      return (
        <div className="dual-video-grid">
          <div className="video-panel">
            <div className="video-panel-label">Original Video</div>
            <div className="video-container">
              <video className="video-element" src={originalVideoSrc} controls playsInline>
                Your browser does not support HTML5 video.
              </video>
            </div>
          </div>
          <div className="video-panel">
            <div className="video-panel-label">ASL Animation</div>
            {renderAslVideo()}
          </div>
        </div>
      );
    }

    // No original video — ASL only
    return (
      <div className="video-panel">
        <div className="video-panel-label">ASL Animation</div>
        {renderAslVideo()}
      </div>
    );
  };

  return (
    <div className="glass-panel">

      {renderDualLayout()}

      {/* Progress bar */}
      <div className="progress-bar" style={{ marginTop: '1.25rem' }}>
        <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
      </div>

      {/* Current word */}
      <div className="current-word">{currentWord}</div>

      {/* Controls */}
      <div className="video-controls">
        <button onClick={togglePlay}>
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          {isPlaying ? 'Pause' : isFinished ? 'Replay' : 'Play'}
        </button>
        <button onClick={restart} style={{ background: 'rgba(255,255,255,0.1)' }}>
          <RotateCcw size={20} />
          Restart
        </button>
        <button
          onClick={toggleBgRemoval}
          disabled={bgLoading}
          style={{
            background: isBgRemoved
              ? 'linear-gradient(135deg, #10b981, #059669)'
              : 'rgba(255,255,255,0.1)',
            opacity: bgLoading ? 0.6 : 1,
          }}
          title="Remove background from ASL videos"
        >
          {bgLoading
            ? <span className="loader" style={{ width: 16, height: 16, borderWidth: 2 }} />
            : <Scissors size={20} />}
          {isBgRemoved ? 'BG Removed' : 'Remove BG'}
        </button>
      </div>

      {/* Word sequence */}
      {rawText && (
        <div style={{ marginTop: '2rem' }}>
          <hr style={{ borderColor: 'var(--border-color)', marginBottom: '1rem' }} />
          <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Extracted Keywords Sequence:</h4>
          <div className="text-preview">
            {words.map((w, i) => (
              <span key={i} className="word-badge" style={{
                background: currentIndex === i ? 'var(--primary)' : '',
                borderColor: currentIndex === i ? 'var(--primary-hover)' : ''
              }}>
                {w}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
