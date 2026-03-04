import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Pause, SkipBack, SkipForward, Volume2, Maximize, User, ChevronLeft, Download, FileText, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';

const Learning = () => {
    const { id } = useParams(); 
    const navigate = useNavigate();
    const { logout } = useAuth(); // If we need auth info
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(30);

    return (
        <div className="min-h-screen bg-background flex flex-col">
             {/* Navigation Bar (Custom for consistency with Library) */}
             <nav className="bg-white/95 backdrop-blur-xl border-b border-muted/20 px-6 py-4 sticky top-0 z-50 shadow-sm flex-none">
                <div className="max-w-7xl mx-auto flex items-center justify-between w-full">
                    <div className="flex items-center gap-4">
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => navigate('/library')}
                            className="text-gray-500 hover:text-primary hover:bg-primary/5"
                        >
                            <ChevronLeft className="w-5 h-5 mr-1" />
                            Back to Library
                        </Button>
                        <div className="h-6 w-px bg-gray-200 mx-2 hidden sm:block"></div>
                        <h1 className="text-lg font-bold text-gray-900 truncate max-w-xs sm:max-w-md">
                            Introduction to Biology
                        </h1>
                    </div>
                </div>
            </nav>

            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full flex flex-col lg:flex-row gap-8">
                {/* Left Column: Video & Controls */}
                <div className="flex-1 space-y-6">
                    {/* Video Player Section */}
                    <div className="relative group rounded-3xl overflow-hidden shadow-2xl shadow-indigo-900/20 ring-1 ring-black/5 bg-black aspect-video">
                         <div className="absolute inset-0 flex items-center justify-center">
                             {/* Placeholder for actual video */}
                             <div className="animate-pulse opacity-20 bg-gradient-to-tr from-primary to-purple-600 absolute inset-0"></div>
                             {!isPlaying && (
                                <button 
                                    onClick={() => setIsPlaying(true)}
                                    className="relative z-10 w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform duration-300 border border-white/20 shadow-lg group-hover:bg-primary"
                                >
                                    <Play className="w-8 h-8 ml-1 fill-current" />
                                </button>
                             )}
                         </div>

                        {/* Custom Controls Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-20 pb-6 px-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                             {/* Progress Bar */}
                             <div className="h-1.5 bg-white/20 rounded-full cursor-pointer hover:h-2 transition-all mb-4 group/progress">
                                <div className="h-full bg-primary rounded-full relative" style={{ width: `${progress}%` }}>
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full opacity-0 group-hover/progress:opacity-100 shadow-[0_0_10px_rgba(112,145,230,0.5)] scale-125 transition-all"></div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-white">
                                <div className="flex items-center gap-6">
                                    <button onClick={() => setIsPlaying(!isPlaying)} className="hover:text-primary transition-colors">
                                        {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
                                    </button>
                                    
                                    <div className="flex items-center gap-4 text-white/70">
                                        <button className="hover:text-white transition-colors"><SkipBack className="w-5 h-5" /></button>
                                        <button className="hover:text-white transition-colors"><SkipForward className="w-5 h-5" /></button>
                                    </div>
                                    
                                    <div className="flex items-center gap-3 text-sm font-medium tabular-nums ml-2">
                                        <span className="text-white">04:20</span>
                                        <span className="text-white/30">/</span>
                                        <span className="text-white/50">12:45</span>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-4">
                                     <div className="flex items-center gap-2 group/vol">
                                        <Volume2 className="w-5 h-5" />
                                        <div className="w-0 overflow-hidden group-hover/vol:w-20 transition-all duration-300">
                                            <div className="w-16 h-1 bg-white/30 rounded-full ml-2">
                                                <div className="w-2/3 h-full bg-white rounded-full"></div>
                                            </div>
                                        </div>
                                     </div>
                                    <button className="hover:text-primary transition-colors">
                                        <Maximize className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Meta Info */}
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Introduction to Biology</h2>
                            <p className="text-gray-500">Dr. Sarah Mitchell • Uploaded 2 days ago</p>
                        </div>
                        <div className="flex gap-2">
                             <Button variant="outline" className="gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                                Mark Complete
                             </Button>
                        </div>
                    </div>
                </div>

                {/* Right Column: Avatar & Notes */}
                <div className="lg:w-96 space-y-6 flex-none">
                     {/* Avatar Section */}
                    <div className="premium-card bg-white rounded-3xl p-6 border border-gray-100 shadow-xl shadow-indigo-900/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full -translate-y-16 translate-x-16 blur-2xl"></div>
                        
                        <div className="flex items-center justify-between mb-6 relative z-10">
                            <h3 className="font-bold text-primary flex items-center gap-2">
                                <User className="w-5 h-5" />
                                Sign Interpretation
                            </h3>
                            <span className="text-xs font-bold px-2 py-1 bg-green-100 text-green-700 rounded-full uppercase tracking-wide">Live</span>
                        </div>
                        
                        <div className="aspect-[3/4] bg-gradient-to-b from-gray-50 to-white rounded-2xl border border-gray-100 flex items-center justify-center relative overflow-hidden group">
                             <User className="w-32 h-32 text-gray-300 group-hover:text-primary transition-colors duration-500" />
                             <p className="absolute bottom-4 inset-x-4 text-center text-xs text-gray-400 bg-white/80 backdrop-blur px-2 py-1 rounded-lg">
                                Syncing with audio...
                             </p>
                        </div>
                    </div>

                    {/* Resources */}
                    <div className="premium-card bg-white rounded-3xl p-6 border border-gray-100 shadow-lg relative overflow-hidden">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-secondary" />
                            Lesson Resources
                        </h3>
                        <div className="space-y-3">
                            <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all group">
                                <span className="text-sm font-medium text-gray-600 group-hover:text-primary">Transcript (PDF)</span>
                                <Download className="w-4 h-4 text-gray-400 group-hover:text-primary" />
                            </button>
                             <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all group">
                                <span className="text-sm font-medium text-gray-600 group-hover:text-primary">Lecture Slides</span>
                                <Download className="w-4 h-4 text-gray-400 group-hover:text-primary" />
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Learning;
