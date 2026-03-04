import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, BookOpen, User, Zap, MessageSquare, MonitorPlay } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

const Home = () => {
    return (
        <div className="flex flex-col gap-20 py-12 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-3xl animate-[float_8s_ease-in-out_infinite]"></div>
                <div className="absolute top-[10%] right-[-5%] w-[40%] h-[60%] rounded-full bg-secondary/5 blur-3xl animate-[float_10s_ease-in-out_infinite_1s]"></div>
            </div>

            {/* Hero Section */}
            <section className="relative flex flex-col items-center text-center gap-8 w-full max-w-[1400px] mx-auto mt-10 px-4">
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="relative z-10 max-w-4xl mx-auto"
                >
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-gray-200 shadow-sm text-primary text-sm font-semibold tracking-wide uppercase mb-6 hover:shadow-md transition-shadow cursor-default">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        Future of Accessibility
                    </span>
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary via-teal-500 to-secondary leading-[1.1]">
                        Visual Learning for <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent">Everyone</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-600 mt-6 max-w-3xl mx-auto leading-relaxed font-light">
                        Convert educational videos into sign language instantly using our advanced AI avatars. 
                        A visual-first platform designed for accessibility.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-5 mt-8 justify-center">
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button size="lg" className="gap-2 text-lg px-8 py-6 h-auto" asChild>
                                <Link to="/upload">
                                    <Upload className="w-5 h-5" />
                                    Start Converting
                                </Link>
                            </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button 
                                size="lg" 
                                variant="secondary" 
                                className="gap-2 text-lg px-8 py-6 h-auto bg-white/80 text-primary hover:bg-white border-2 border-white/50 backdrop-blur-sm shadow-sm" 
                                asChild
                            >
                                <Link to="/library">
                                    <BookOpen className="w-5 h-5" />
                                    Browse Library
                                </Link>
                            </Button>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Hero Image (Absolute Positioned) */}
                <motion.div 
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    className="hidden 2xl:block absolute right-10 top-1/2 -translate-y-1/2 w-[400px]"
                >
                     <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-secondary/20 rounded-[2rem] blur-3xl -z-10 transform rotate-6 scale-110"></div>
                     <img 
                        src="/sign_avatar.png" 
                        alt="AI Sign Language Avatar" 
                        className="w-full h-auto rounded-[2rem] shadow-2xl shadow-gray-200/50 border-4 border-white/50 backdrop-blur-sm transform hover:scale-[1.02] transition-transform duration-500"
                     />
                     {/* Floating Badge */}
                     <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-xl border border-gray-100 flex items-center gap-3 animate-[float_6s_ease-in-out_infinite_1s]">
                        <div className="bg-primary/10 p-2.5 rounded-lg text-primary">
                            <Zap className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-primary">AI Powered</p>
                            <p className="text-xs text-gray-500">Real-time Translation</p>
                        </div>
                     </div>
                </motion.div>
            </section>

            {/* Preview Mockup */}
            <motion.section 
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4 }}
                className="w-full max-w-6xl mx-auto"
            >
                <Card className="overflow-hidden border-2 border-gray-100 shadow-2xl bg-white/50 backdrop-blur-sm">
                    <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
                        {/* Fake Video Player */}
                        <div className="lg:col-span-2 aspect-video bg-gray-900 relative flex items-center justify-center group overflow-hidden">
                            <img 
                                src="/lecture_preview.png" 
                                alt="Lecture Video" 
                                className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 opacity-80"></div>
                            
                            <div className="absolute inset-0 flex items-center justify-center z-10">
                                <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-all border border-white/30 group-hover:scale-110 shadow-xl group-hover:shadow-primary/20">
                                    <MonitorPlay className="w-10 h-10 text-white fill-current translate-x-1" />
                                </div>
                            </div>

                            <div className="absolute bottom-6 left-6 right-6 flex items-center gap-4 text-white z-10">
                                <div className="h-1.5 bg-white/20 rounded-full flex-1 overflow-hidden backdrop-blur-sm">
                                     <div className="h-full w-1/3 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]"></div>
                                </div>
                                <span className="text-xs font-mono font-medium drop-shadow-md bg-black/40 px-2 py-1 rounded">04:20 / 12:45</span>
                            </div>
                        </div>
                        
                        {/* Fake Avatar Window */}
                        <div className="aspect-video lg:aspect-auto bg-gray-100 flex flex-col items-center justify-center relative overflow-hidden group">
                             <img 
                                src="/sign_avatar.png" 
                                alt="Sign Language Avatar" 
                                className="absolute inset-0 w-full h-full object-contain object-bottom scale-110 translate-y-4"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-40"></div>
                            
                            <div className="absolute bottom-6 left-6 right-6 bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/20 flex items-center justify-between z-10">
                                 <div className="flex items-center gap-3">
                                     <div className="flex gap-1 h-3 items-center">
                                        <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-bounce"></span>
                                        <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-bounce delay-75"></span>
                                        <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-bounce delay-150"></span>
                                    </div>
                                    <span className="text-xs font-medium text-white tracking-wide">AI Interpreter Active</span>
                                 </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.section>

             {/* Features Grid */}
             <section className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto py-12 px-4 premium-grid">
                <FeatureCard 
                    icon={<MonitorPlay className="w-8 h-8 text-primary" />}
                    title="Visual Content"
                    description="Designed primarily for visual learners with high-contrast interfaces and distraction-free layouts."
                />
                <FeatureCard 
                    icon={<Zap className="w-8 h-8 text-accent" />}
                    title="Instant Conversion"
                    description="Upload any educational video and get a sign language interpretation within minutes."
                />
                <FeatureCard 
                    icon={<MessageSquare className="w-8 h-8 text-secondary" />}
                    title="Future Ready"
                    description="Built to support the next generation of AI sign language avatars and real-time translation."
                />
            </section>
        </div>
    );
};

const FeatureCard = ({ icon, title, description }) => (
    <Card className="premium-card p-6 hover:shadow-lg transition-shadow border-none bg-white/50">
        <div className="h-12 w-12 rounded-xl bg-white shadow-sm flex items-center justify-center mb-4 border border-gray-100">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-primary mb-2">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
    </Card>
);

export default Home;
