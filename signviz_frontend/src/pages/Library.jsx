import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { PlayCircle, Clock, Calendar, Plus, Trash2, LogOut, Disc, Folder, ChevronLeft, MoreVertical, ListVideo, Home } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/ui/Modal';
import InputWithIcon from '../components/ui/InputWithIcon'; // Assuming I can use this or standard input

const Library = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    
    // -- State --
    const [view, setView] = useState('library'); // 'library' | 'playlist'
    const [activePlaylist, setActivePlaylist] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Mock Data
    const [videos, setVideos] = useState([
        { id: 1, title: 'Introduction to Biology', duration: '12:45', date: '2 days ago', thumbnail: 'bg-primary/20 text-primary' },
        { id: 2, title: 'History of Art', duration: '45:10', date: '5 days ago', thumbnail: 'bg-secondary/20 text-secondary' },
        { id: 3, title: 'Physics 101: Motion', duration: '30:00', date: '1 week ago', thumbnail: 'bg-accent/20 text-accent' },
    ]);

    const [playlists, setPlaylists] = useState([
        { id: 101, name: 'Science Fundamentals', description: 'Basic concepts of biology and physics.', videos: [1, 3] },
        { id: 102, name: 'Art & History', description: 'Exploring human creativity through ages.', videos: [2] }
    ]);

    // Form State
    const [formData, setFormData] = useState({ name: '', description: '' });

    // -- Handlers --

    const handleCreateClick = () => {
        setFormData({ name: '', description: '' });
        setIsModalOpen(true);
    };
    
    const handleSubmitPlaylist = (e) => {
        e.preventDefault();
        if(!formData.name.trim()) return;

        const newPlaylist = {
            id: Date.now(),
            name: formData.name,
            description: formData.description,
            videos: []
        };
        setPlaylists([...playlists, newPlaylist]);
        setIsModalOpen(false);
    };

    const handleDeleteVideo = (id) => {
        if (window.confirm("Are you sure you want to delete this video?")) {
            setVideos(videos.filter(item => item.id !== id));
        }
    };

    const handleOpenPlaylist = (playlist) => {
        setActivePlaylist(playlist);
        setView('playlist');
    };

    const handleBackToLibrary = () => {
        setView('library');
        setActivePlaylist(null);
    };

    const handleAddVideoToPlaylist = () => {
        alert("This feature would open a video selector modal in a production environment.");
    };

    const handleDeletePlaylist = (e, id) => {
        e.stopPropagation();
        if (window.confirm("Are you sure you want to delete this playlist?")) {
            setPlaylists(playlists.filter(p => p.id !== id));
        }
    };

    const handleRemoveVideoFromPlaylist = (playlistId, videoId) => {
        if (window.confirm("Remove this video from the playlist?")) {
            const updatedPlaylists = playlists.map(p => {
                if (p.id === playlistId) {
                    return { ...p, videos: p.videos.filter(vId => vId !== videoId) };
                }
                return p;
            });
            setPlaylists(updatedPlaylists);
            
            // Update active playlist view immediately
            if (activePlaylist && activePlaylist.id === playlistId) {
                 setActivePlaylist(prev => ({ ...prev, videos: prev.videos.filter(vId => vId !== videoId) }));
            }
        }
    };

    // Helper to get videos for active playlist
    const getPlaylistVideos = () => {
        if (!activePlaylist) return [];
        return videos.filter(v => activePlaylist.videos.includes(v.id));
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Navigation Bar */}
            <nav className="bg-white/95 backdrop-blur-xl border-b border-muted/20 px-6 py-5 sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center text-white font-bold shadow-md">SV</div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                            SignViz
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => navigate('/')}
                            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-xl transition-all duration-300 hover:shadow-md group"
                        >
                            <Home size={18} className="group-hover:scale-110 transition-transform duration-300" />
                            Back to Home
                        </button>
                        <button 
                            onClick={logout}
                            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 hover:shadow-md group"
                        >
                            <LogOut size={18} className="group-hover:rotate-180 transition-transform duration-300" />
                            Sign Out
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 py-10">
                {view === 'library' ? (
                    // --- LIBRARY VIEW ---
                    <>
                        <header className="flex items-center justify-between pb-6 border-b border-gray-200 mb-8">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary via-teal-500 to-secondary">My Library</h1>
                                <p className="text-gray-500 mt-1">Manage your translated videos and playlists.</p>
                            </div>
                            
                            <div className="flex items-center gap-4">
                                <Button 
                                    onClick={handleCreateClick}
                                    className="bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/20"
                                >
                                    <Plus className="w-5 h-5 mr-2" />
                                    New Playlist
                                </Button>
                            </div>
                        </header>

                        {/* Playlists Section */}
                        <section className="mb-12">
                            <div className="flex items-center gap-2 mb-6">
                                <ListVideo className="text-secondary w-6 h-6" />
                                <h2 className="text-xl font-bold text-primary">My Playlists</h2>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 premium-grid">
                                {playlists.map(playlist => (
                                    <button 
                                        key={playlist.id}
                                        onClick={() => handleOpenPlaylist(playlist)}
                                        className="premium-card text-left group relative bg-white border border-gray-100 p-6 rounded-2xl hover:shadow-xl transition-all duration-300 overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
                                            <Folder className="w-12 h-12 text-primary/10 group-hover:text-primary/20 transition-colors" />
                                        </div>

                                        <button 
                                            onClick={(e) => handleDeletePlaylist(e, playlist.id)}
                                            className="absolute top-3 right-3 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors z-20 opacity-0 group-hover:opacity-100"
                                            title="Delete Playlist"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                        
                                        <div className="w-12 h-12 bg-highlight rounded-xl flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                                            <Folder className="w-6 h-6" />
                                        </div>
                                        
                                        <h3 className="text-lg font-bold text-primary mb-1 group-hover:text-primary/80 transition-colors">{playlist.name}</h3>
                                        <p className="text-sm text-gray-500 line-clamp-2 mb-4">{playlist.description || 'No description'}</p>
                                        
                                        <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
                                            <Disc className="w-3 h-3" />
                                            {playlist.videos.length} Videos
                                        </div>

                                        {/* Bottom line */}
                                        <div className="absolute bottom-0 left-0 w-0 h-1 bg-secondary group-hover:w-full transition-all duration-500"></div>
                                    </button>
                                ))}
                                
                                {/* Quick Create Button Card */}
                                <button 
                                    onClick={handleCreateClick}
                                    className="border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center p-6 text-gray-400 hover:border-primary hover:text-primary hover:bg-white/50 transition-all duration-300 group h-full min-h-[180px]"
                                >
                                    <div className="w-12 h-12 rounded-full bg-gray-50 group-hover:bg-primary/10 flex items-center justify-center mb-3 transition-colors">
                                        <Plus className="w-6 h-6" />
                                    </div>
                                    <span className="font-medium">Create New Playlist</span>
                                </button>
                            </div>
                        </section>

                        {/* Recent Videos Section */}
                        <section>
                            <div className="flex items-center gap-2 mb-6">
                                <Clock className="text-secondary w-6 h-6" />
                                <h2 className="text-xl font-bold text-primary">Recent Videos</h2>
                            </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 premium-grid">
                                {videos.map((item) => (
                                    <div key={item.id} onClick={() => navigate(`/watch/${item.id}`)} className="cursor-pointer">
                                    <Card className="premium-card group overflow-hidden hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-gray-100 bg-white relative">
                                        {/* Decorative Corner Blob */}
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary rounded-full -translate-y-16 translate-x-16 opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none z-0"></div>

                                        <div className={`aspect-video ${item.thumbnail} relative flex items-center justify-center overflow-hidden z-10`}>
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                                            <PlayCircle className="w-12 h-12 text-primary/50 opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300" />
                                            <span className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded font-mono">
                                                {item.duration}
                                            </span>
                                        </div>
                                        <div className="p-5 relative z-10">
                                            <h3 className="font-bold text-lg text-primary group-hover:text-primary transition-colors line-clamp-1">{item.title}</h3>
                                            <div className="flex items-center justify-between mt-3">
                                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {item.duration}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {item.date}
                                                    </span>
                                                </div>
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation(); 
                                                        handleDeleteVideo(item.id);
                                                    }}
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                                    title="Delete Video"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        
                                        {/* Bottom Growing Line */}
                                        <div className="absolute bottom-0 left-0 w-0 h-1 bg-primary group-hover:w-full transition-all duration-500 rounded-b-2xl"></div>
                                    </Card>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </>
                ) : (
                    // --- PLAYLIST DETAIL VIEW ---
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <header className="mb-8">
                             <Button 
                                variant="ghost" 
                                className="mb-4 pl-0 hover:bg-transparent text-slate-500 hover:text-primary"
                                onClick={handleBackToLibrary}
                            >
                                <ChevronLeft className="w-5 h-5 mr-1" />
                                Back to Library
                            </Button>
                            
                            <div className="flex items-end justify-between">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="px-3 py-1 bg-secondary/10 text-secondary text-xs font-bold uppercase tracking-wider rounded-full">Playlist</span>
                                        <span className="text-gray-400 text-sm">• {getPlaylistVideos().length} items</span>
                                    </div>
                                    <h1 className="text-4xl font-bold text-primary mb-3">{activePlaylist?.name}</h1>
                                    <p className="text-xl text-gray-600 font-light max-w-2xl">{activePlaylist?.description}</p>
                                </div>
                                <Button onClick={handleAddVideoToPlaylist} className="bg-secondary text-white shadow-lg shadow-secondary/20">
                                    <Plus className="w-5 h-5 mr-2" />
                                    Add Video
                                </Button>
                            </div>
                        </header>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 premium-grid">
                                {getPlaylistVideos().length > 0 ? (
                                    getPlaylistVideos().map((item) => (
                                     <div key={item.id} onClick={() => navigate(`/watch/${item.id}`)} className="cursor-pointer">
                                     <Card className="premium-card group overflow-hidden hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-gray-100 bg-white relative">
                                        {/* Decorative Corner Blob */}
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary rounded-full -translate-y-16 translate-x-16 opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none z-0"></div>

                                        <div className={`aspect-video ${item.thumbnail} relative flex items-center justify-center overflow-hidden z-10`}>
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                                            <PlayCircle className="w-12 h-12 text-primary/50 opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300" />
                                            <span className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded font-mono">
                                                {item.duration}
                                            </span>
                                        </div>
                                        <div className="p-5 relative z-10">
                                            <h3 className="font-bold text-lg text-primary group-hover:text-primary transition-colors line-clamp-1">{item.title}</h3>
                                            <div className="flex items-center justify-between mt-3">
                                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {item.duration}
                                                    </span>
                                                </div>
                                                <button 
                                                    onClick={() => handleRemoveVideoFromPlaylist(activePlaylist.id, item.id)}
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                                    title="Remove from playlist"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        
                                        {/* Bottom Growing Line */}
                                        <div className="absolute bottom-0 left-0 w-0 h-1 bg-primary group-hover:w-full transition-all duration-500 rounded-b-2xl"></div>
                                    </Card>
                                    </div>
                                    ))
                                ) : (
                                    <div className="col-span-full py-20 text-center bg-white/50 rounded-3xl border border-dashed border-gray-300">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <ListVideo className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900">This playlist is empty</h3>
                                        <p className="text-gray-500 mt-1 mb-6">Start building your collection by adding videos.</p>
                                        <Button variant="outline" onClick={handleAddVideoToPlaylist}>Add Your First Video</Button>
                                    </div>
                                )}
                        </div>
                    </div>
                )}
            </main>

            {/* Create Playlist Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Create New Playlist"
            >
                <form onSubmit={handleSubmitPlaylist} className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Playlist Name</label>
                            <input
                                autoFocus
                                type="text"
                                placeholder="e.g., Biology 101"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-gray-400 bg-gray-50/50"
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Description <span className="text-gray-400 font-normal">(Optional)</span></label>
                            <textarea
                                rows="3"
                                placeholder="What's this playlist about?"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-gray-400 bg-gray-50/50 resize-none"
                                value={formData.description}
                                onChange={e => setFormData({...formData, description: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button 
                            type="button" 
                            variant="ghost" 
                            className="flex-1"
                            onClick={() => setIsModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            className="flex-1 bg-primary text-white shadow-lg shadow-primary/20"
                        >
                            Create Playlist
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Library;
