import { useState } from 'react';
import { Upload as UploadIcon, FileVideo, ArrowRight, CheckCircle2, User } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { cn } from '../lib/utils';

const UploadPage = () => {
    const [file, setFile] = useState(null);
    const [isConverting, setIsConverting] = useState(false);
    const [isDone, setIsDone] = useState(false);

    const handleUpload = (e) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
           setFile(selectedFile);
           setIsDone(false);
        }
    };

    const handleConvert = () => {
        setIsConverting(true);
        // Simulate conversion
        setTimeout(() => {
            setIsConverting(false);
            setIsDone(true);
        }, 2000);
    };

    return (
        <div className="space-y-8 py-8 animate-in fade-in duration-500">
            <header className="mb-8 text-center max-w-2xl mx-auto">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary via-teal-500 to-secondary">
                    Convert Video to Sign Language
                </h1>
                <p className="text-lg text-gray-600">
                    Upload your educational content and let our AI avatars translate it instantly.
                </p>
            </header>

            <div className="grid lg:grid-cols-2 gap-8 h-[600px] max-w-7xl mx-auto items-center relative">
                 {/* Connection Arrow (Desktop only) */}
                 <div className="hidden lg:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 text-gray-300">
                    <ArrowRight className={cn("w-12 h-12 transition-all duration-500", (isConverting || isDone) ? "text-primary scale-110" : "")} />
                </div>

                {/* Left: Upload / Video Player */}
                <Card className="flex flex-col h-full overflow-hidden bg-white/50 backdrop-blur-sm border-2 border-dashed border-muted/50 hover:border-primary/50 transition-all duration-300 shadow-xl shadow-muted/20 hover:shadow-2xl hover:scale-[1.01]">
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                        {file ? (
                            <div className="w-full h-full bg-gray-900 rounded-2xl flex items-center justify-center relative group overflow-hidden shadow-inner">
                                <FileVideo className="w-20 h-20 text-white/20 group-hover:scale-110 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm">
                                    <p className="text-white font-medium text-lg mb-2">{file.name}</p>
                                    <Button variant="outline" size="sm" className="text-white border-white/20 hover:bg-white/10" onClick={() => setFile(null)}>
                                        Change Video
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <label className="cursor-pointer group flex flex-col items-center w-full h-full justify-center rounded-2xl border-2 border-transparent hover:bg-primary/5 transition-colors duration-300 dashed-area">
                                <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center shadow-inner mb-6 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                                    <UploadIcon className="w-10 h-10 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold text-primary">Upload Video</h3>
                                <p className="text-gray-500 mt-2 max-w-xs text-center">
                                    Drag and drop your video file here, or <span className="text-primary font-medium hover:underline">browse</span>
                                </p>
                                <p className="text-xs text-gray-400 mt-4 uppercase tracking-wider font-semibold">MP4, MOV supported</p>
                                <input type="file" className="hidden" accept="video/*" onChange={handleUpload} />
                            </label>
                        )}
                    </div>
                    {file && (
                        <div className="p-6 bg-white border-t border-gray-100 flex justify-between items-center relative z-20">
                             <div className="flex items-center gap-4">
                                <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                                    <FileVideo className="w-6 h-6" />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-bold text-primary truncate max-w-[200px]">{file.name}</p>
                                    <p className="text-xs text-gray-500 font-medium">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                                </div>
                             </div>
                             <Button onClick={handleConvert} disabled={isConverting || isDone} size="lg" className="shadow-lg shadow-primary/20">
                                {isConverting ? (
                                    <>
                                        <ArrowRight className="w-5 h-5 animate-pulse" />
                                        Processing...
                                    </>
                                ) : isDone ? (
                                    <>
                                        <CheckCircle2 className="w-5 h-5" />
                                        Converted
                                    </>
                                ) : (
                                    <>
                                        Convert Now
                                        <ArrowRight className="w-5 h-5 ml-2" />
                                    </>
                                )}
                             </Button>
                        </div>
                    )}
                </Card>

                {/* Right: Avatar Output */}
                <Card className={cn("flex flex-col h-full bg-white border-2 border-white/50 relative overflow-hidden transition-all duration-500 shadow-xl shadow-muted/20 hover:shadow-2xl", 
                    isDone ? "ring-2 ring-primary ring-offset-4 hover:scale-[1.01]" : "opacity-90 grayscale-[0.5]"
                )}>
                    {isDone && (
                        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary to-secondary animate-pulse"></div>
                    )}
                    
                    <div className="absolute top-6 right-6 z-10">
                        <span className={cn("px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm transition-colors", 
                            isDone ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                        )}>
                            {isDone ? 'Ready to Play' : 'Waiting for Input'}
                        </span>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-highlight via-white to-muted/20">
                        <div className="relative">
                           {/* Avatar Placeholder */}
                           <div className={cn("relative transition-all duration-1000", isConverting && "scale-110")}>
                               <div className={cn("h-40 w-40 rounded-full flex items-center justify-center transition-all duration-500", 
                                   isDone ? "bg-primary/10" : "bg-gray-100"
                               )}>
                                   <User className={cn("w-20 h-20 transition-all duration-500", isDone ? "text-primary" : "text-gray-400")} />
                               </div>
                               
                               {/* Loading Ring */}
                               {isConverting && (
                                   <div className="absolute -inset-4">
                                       <div className="w-full h-full border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                                   </div>
                               )}
                               
                               {/* Success Ripple */}
                               {isDone && (
                                   <>
                                     <div className="absolute inset-0 rounded-full border-2 border-primary animate-[ping_2s_ease-in-out_infinite] opacity-20"></div>
                                     <div className="absolute -inset-2 rounded-full border border-primary animate-[ping_3s_ease-in-out_infinite_0.5s] opacity-10"></div>
                                   </>
                               )}
                           </div>
                        </div>

                        <div className="mt-8 text-center space-y-2">
                            <h3 className="text-2xl font-bold text-primary">
                                {isConverting ? 'Generating Interpretation...' : isDone ? 'Avatar Ready' : 'Avatar Preview'}
                            </h3>
                            <p className="text-gray-500 text-sm max-w-xs mx-auto">
                                 {isDone 
                                    ? "Interpretation generated successfully. Play the video to see the synced avatar." 
                                    : isConverting ? "Our AI is analyzing the audio and video visual cues." : "The AI avatar will appear here once you convert your video."}
                            </p>
                        </div>

                        {isDone && (
                            <div className="mt-8 animate-in slide-in-from-bottom-4 duration-500 fade-in">
                                <Button variant="secondary" size="lg" className="gap-2 shadow-md">
                                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                                    Save to Library
                                </Button>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default UploadPage;
