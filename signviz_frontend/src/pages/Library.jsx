import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import {
  PlayCircle, Clock, Calendar, Plus, Trash2, Disc, Folder,
  ChevronLeft, ListVideo, FileVideo, GripVertical, X, Check,
  BookOpen, Loader2,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { useLibrary } from '../context/LibraryContext';

// ─── helpers ────────────────────────────────────────────────────────────────

const Thumbnail = ({ item, className = '' }) => {
  if (item.source_type === 'youtube' && item.youtube_id) {
    return (
      <img
        src={`https://img.youtube.com/vi/${item.youtube_id}/mqdefault.jpg`}
        alt={item.title}
        className={`w-full h-full object-cover ${className}`}
      />
    );
  }
  return (
    <div className={`w-full h-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center ${className}`}>
      <FileVideo className="w-10 h-10 text-primary/30" />
    </div>
  );
};

// ─── Video Card ──────────────────────────────────────────────────────────────

const VideoCard = ({ item, onDelete, onDragStart, draggable = true }) => {
  const navigate = useNavigate();
  return (
    <div
      draggable={draggable}
      onDragStart={draggable ? (e) => onDragStart(e, item) : undefined}
      className="cursor-grab active:cursor-grabbing"
    >
      <Card
        className="group overflow-hidden border border-white/40 hover:border-primary/40 transition-all duration-300"
        onClick={() => navigate(`/watch/${item.id}`)}
      >
        <div className="aspect-video bg-gray-900 relative flex items-center justify-center overflow-hidden">
          <Thumbnail item={item} />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300" />
          <div className="absolute top-2 left-2 px-2 py-1 bg-primary/80 rounded text-[10px] font-bold text-white uppercase">
            {item.source_type}
          </div>
          {draggable && (
            <div className="absolute top-2 right-2 p-1 bg-black/50 rounded opacity-0 group-hover:opacity-100 transition-opacity">
              <GripVertical className="w-4 h-4 text-white" />
            </div>
          )}
          <PlayCircle className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 absolute" />
        </div>

        <div className="p-5">
          <h3 className="font-bold text-foreground text-base line-clamp-1 mb-2">{item.title || 'Untitled'}</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-text-muted">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {item.saved_at || 'Recently'}
              </span>
              {item.animationData?.length > 0 && (
                <span className="flex items-center gap-1 text-primary font-semibold">
                  <BookOpen className="w-3 h-3" />
                  {item.animationData.length} signs
                </span>
              )}
            </div>
            {onDelete && (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                className="p-1.5 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
                title="Remove from library"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-500" />
      </Card>
    </div>
  );
};

// ─── Playlist Card ───────────────────────────────────────────────────────────

const PlaylistCard = ({ playlist, onOpen, onDelete, onDrop }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  const handleDragLeave = () => setIsDragOver(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    onDrop(e, playlist);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => onOpen(playlist)}
      className={`relative text-left group bg-white border border-slate-200 rounded-[32px] p-8 cursor-pointer
        hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-500 overflow-hidden
        ${isDragOver ? 'border-primary bg-indigo-50/50 scale-[1.02] shadow-xl' : ''}`}
    >
      {isDragOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-primary/20 rounded-2xl z-10 pointer-events-none">
          <div className="flex flex-col items-center gap-2">
            <Plus className="w-8 h-8 text-primary" />
            <span className="text-sm font-bold text-primary">Drop to add</span>
          </div>
        </div>
      )}

      <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity pointer-events-none">
        <Folder className="w-14 h-14 text-primary/30" />
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); onDelete(playlist.id); }}
        className="absolute top-3 right-3 p-1.5 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors z-20 opacity-0 group-hover:opacity-100"
        title="Delete playlist"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
        <Folder className="w-6 h-6" />
      </div>

      <h3 className="text-base font-bold text-foreground mb-1 line-clamp-1">{playlist.name}</h3>
      <p className="text-xs text-text-muted line-clamp-2 mb-4">{playlist.description || 'No description'}</p>

      <div className="flex items-center gap-2 text-xs font-medium text-text-muted">
        <Disc className="w-3 h-3" />
        {playlist.videoIds.length} video{playlist.videoIds.length !== 1 ? 's' : ''}
      </div>

      <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-500" />
    </div>
  );
};

// ─── Main Library Component ──────────────────────────────────────────────────

const Library = () => {
  const navigate = useNavigate();
  const { library, isLoading, saveVideo, createPlaylist, deletePlaylist, deleteVideo, addVideoToPlaylist, removeVideoFromPlaylist, getPlaylistVideos } = useLibrary();

  const [view, setView] = useState('library');
  const [activePlaylist, setActivePlaylist] = useState(null);
  const [playlistVideos, setPlaylistVideos] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [formLoading, setFormLoading] = useState(false);

  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const showToast = useCallback((msg, type = 'success') => {
    clearTimeout(toastTimer.current);
    setToast({ msg, type });
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }, []);

  // ── Open playlist detail ───────────────────────────────────────────────────
  const handleOpenPlaylist = (playlist) => {
    setActivePlaylist(playlist);
    setView('playlist');
    const videos = getPlaylistVideos(playlist.id);
    setPlaylistVideos(videos);
  };

  const handleBackToLibrary = () => {
    setView('library');
    setActivePlaylist(null);
    setPlaylistVideos([]);
  };

  // ── Delete from library ────────────────────────────────────────────────────
  const handleDeleteVideo = (itemId) => {
    if (!window.confirm('Remove this video from your library?')) return;
    deleteVideo(itemId);
    showToast('Video removed from library');
  };

  // ── Create playlist ────────────────────────────────────────────────────────
  const handleSubmitPlaylist = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    setFormLoading(true);
    try {
      const newPlaylist = createPlaylist(formData.name, formData.description);
      setIsModalOpen(false);
      setFormData({ name: '', description: '' });
      showToast(`Playlist "${newPlaylist.name}" created`);
    } catch (err) {
      showToast('Failed to create playlist', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  // ── Delete playlist ────────────────────────────────────────────────────────
  const handleDeletePlaylist = (playlistId) => {
    if (!window.confirm('Delete this playlist? Videos in your library are not affected.')) return;
    deletePlaylist(playlistId);
    showToast('Playlist deleted');
  };

  // ── Drag-and-drop ──────────────────────────────────────────────────────────
  const dragItem = useRef(null);

  const handleDragStart = (e, item) => {
    dragItem.current = item;
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDropOnPlaylist = (e, playlist) => {
    e.preventDefault();
    const item = dragItem.current;
    if (!item) return;
    dragItem.current = null;

    addVideoToPlaylist(playlist.id, item.id);
    showToast(`Added to "${playlist.name}"`);
  };

  // ── Remove from playlist ───────────────────────────────────────────────────
  const handleRemoveFromPlaylist = (itemId) => {
    if (!window.confirm('Remove this video from the playlist?')) return;
    removeVideoFromPlaylist(activePlaylist.id, itemId);
    setPlaylistVideos(prev => prev.filter(v => v.id !== itemId));
    showToast('Removed from playlist');
  };

  // ─────────────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg shadow-primary/20 text-sm font-semibold animate-in slide-in-from-bottom-4 duration-300
          ${toast.type === 'error' ? 'bg-red-500/90 text-white' : 'bg-primary text-white'}`}>
          {toast.type === 'error' ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      <main className="max-w-7xl mx-auto px-8 py-12">
        {view === 'library' ? (
          <>
            {/* Header */}
            <header className="flex items-center justify-between pb-10 border-b border-slate-200 mb-12">
              <div>
                <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-2">My Library</h1>
                <p className="text-text-secondary text-lg font-medium">Drag videos onto a playlist to organise them.</p>
              </div>
              <Button
                size="lg"
                onClick={() => { setFormData({ name: '', description: '' }); setIsModalOpen(true); }}
                className="shadow-xl shadow-primary/20 rounded-2xl font-black"
              >
                <Plus className="w-5 h-5 mr-2" />
                New Playlist
              </Button>
            </header>

            {/* Playlists */}
            <section className="mb-14">
              <div className="flex items-center gap-2 mb-6">
                <ListVideo className="text-primary w-5 h-5" />
                <h2 className="text-lg font-bold text-foreground">My Playlists</h2>
                {library.playlists.length > 0 && (
                  <span className="ml-1 text-xs text-text-muted font-medium">
                    — drag a video card onto a playlist to add it
                  </span>
                )}
              </div>

              {library.playlists.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                  {library.playlists.map(pl => (
                    <PlaylistCard
                      key={pl.id}
                      playlist={pl}
                      onOpen={handleOpenPlaylist}
                      onDelete={handleDeletePlaylist}
                      onDrop={handleDropOnPlaylist}
                    />
                  ))}

                  <button
                    onClick={() => { setFormData({ name: '', description: '' }); setIsModalOpen(true); }}
                    className="border-2 border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center p-6 text-text-muted hover:border-primary hover:text-primary hover:bg-primary/5 transition-all duration-300 group min-h-[180px]"
                  >
                    <div className="w-12 h-12 rounded-full bg-white/5 group-hover:bg-primary/20 flex items-center justify-center mb-3 transition-colors">
                      <Plus className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-medium">New Playlist</span>
                  </button>
                </div>
              ) : (
                <div className="text-center py-12 glass rounded-2xl border border-white/40">
                  <Folder className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-50" />
                  <p className="text-text-muted font-medium">No playlists yet</p>
                  <p className="text-text-muted text-sm mt-1">Create one to organize your videos</p>
                </div>
              )}
            </section>

            {/* Recents */}
            <section>
              <div className="flex items-center gap-2 mb-6">
                <Clock className="text-primary w-5 h-5" />
                <h2 className="text-lg font-bold text-foreground">Recently Saved</h2>
                {library.videos.length > 0 && (
                  <span className="ml-1 px-2 py-0.5 bg-primary/20 text-primary text-xs font-bold rounded-full">
                    {library.videos.length}
                  </span>
                )}
              </div>

              {library.videos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {library.videos.map(item => (
                    <VideoCard
                      key={item.id}
                      item={item}
                      onDelete={handleDeleteVideo}
                      onDragStart={handleDragStart}
                      draggable
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 glass rounded-2xl border border-white/40">
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="text-primary w-8 h-8" />
                  </div>
                  <p className="text-text-secondary font-medium mb-4">
                    Your library is empty. Translate a video and save it here.
                  </p>
                  <Button onClick={() => navigate('/upload')}>Go to Upload</Button>
                </div>
              )}
            </section>
          </>
        ) : (
          /* Playlist Detail View */
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <Button
              variant="ghost"
              className="mb-6 pl-0 hover:bg-transparent text-text-muted hover:text-primary"
              onClick={handleBackToLibrary}
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Back to Library
            </Button>

            <header className="flex items-end justify-between mb-10">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-primary/20 text-primary text-xs font-bold uppercase tracking-wider rounded-full">
                    Playlist
                  </span>
                  <span className="text-text-muted text-sm">
                    • {playlistVideos.length} video{playlistVideos.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <h1 className="text-3xl font-bold text-foreground">{activePlaylist?.name}</h1>
                {activePlaylist?.description && (
                  <p className="text-text-muted mt-2 max-w-xl">{activePlaylist.description}</p>
                )}
              </div>
            </header>

            {playlistVideos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {playlistVideos.map(item => (
                  <VideoCard
                    key={item.id}
                    item={item}
                    onDelete={handleRemoveFromPlaylist}
                    draggable={false}
                  />
                ))}
              </div>
            ) : (
              <div className="col-span-full py-20 text-center glass rounded-3xl border border-white/40">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ListVideo className="w-8 h-8 text-text-muted" />
                </div>
                <h3 className="text-lg font-medium text-foreground">This playlist is empty</h3>
                <p className="text-text-muted mt-1">
                  Go back to your library and drag videos onto this playlist.
                </p>
                <Button variant="outline" className="mt-6 border-white/20 hover:bg-primary/10" onClick={handleBackToLibrary}>
                  Back to Library
                </Button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Create Playlist Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Playlist">
        <form onSubmit={handleSubmitPlaylist} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Playlist Name</label>
            <input
              autoFocus
              type="text"
              placeholder="e.g., Biology 101"
              className="w-full px-4 py-3 rounded-xl border border-white/30 bg-surface/50 text-foreground placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Description <span className="text-text-muted font-normal">(optional)</span>
            </label>
            <textarea
              rows="3"
              placeholder="What's this playlist about?"
              className="w-full px-4 py-3 rounded-xl border border-white/30 bg-surface/50 text-foreground placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" className="flex-1 text-text-muted" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={formLoading} className="flex-1 shadow-lg shadow-primary/30">
              {formLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Create Playlist
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Library;
