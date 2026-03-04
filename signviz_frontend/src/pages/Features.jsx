import { useRef } from 'react';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import {  Type, User, ScanText, Accessibility, GraduationCap, Cpu } from 'lucide-react';

const Features = () => {
    return (
        <div className="min-h-screen bg-background text-gray-600 selection:bg-primary/20 selection:text-primary">
             {/* Hero Section */}
             <div className="relative py-24 px-4 text-center overflow-hidden bg-white border-b border-gray-100">
                <div className="absolute inset-0 bg-grid-slate-50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="max-w-4xl mx-auto space-y-4"
                >
                     <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-primary">
                         Key Features of <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-teal-500 to-secondary">SignViz</span>
                     </h1>
                     <p className="text-lg md:text-xl text-gray-600 font-light max-w-2xl mx-auto">
                        Core functionalities designed to support accessible and inclusive communication.
                     </p>
                </motion.div>
             </div>

             {/* Features Grid */}
            <div className="max-w-7xl mx-auto px-4 py-24">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 premium-grid">
                    <FeatureCard 
                        icon={<Type />}
                        title="Text to Sign Language"
                        description="Instantly converts written text into fluid sign language representations, ensuring content is accessible to everyone."
                    />
                    <FeatureCard 
                        icon={<User />}
                        title="Avatar-Based Visualization"
                        description="Utilizes high-fidelity 3D avatars to perform sign gestures with precision, providing a human-like visual connection."
                    />
                    <FeatureCard 
                        icon={<ScanText />}
                        title="Word-by-Word Rendering"
                        description="Processes input text granularly to render accurate signs for each specific word, aiding in clear comprehension."
                    />
                    <FeatureCard 
                        icon={<Accessibility />}
                        title="Accessibility-First Interface"
                        description="Engineered with inclusive design principles: high contrast, clear typography, and simplified navigation flows."
                    />
                    <FeatureCard 
                        icon={<GraduationCap />}
                        title="Educational Focus"
                        description="Tailored specifically for educational environments to support deaf and hard-of-hearing students in their academic journey."
                    />
                     <FeatureCard 
                        icon={<Cpu />}
                        title="Intelligent Processing"
                        description="Leverages advanced NLP algorithms to understand context and deliver the most appropriate sign translation."
                    />
                </div>
            </div>
            
            {/* Technical Emphasis (Dark Section like About Page) */}
            <section className="py-24 bg-primary relative overflow-hidden">
                <div className="max-w-4xl mx-auto px-4 text-center space-y-8 relative z-10">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1 }}
                    >
                        <h2 className="text-3xl font-semibold text-white mb-4">Powered by Innovation</h2>
                        <p className="text-white/80 leading-relaxed max-w-2xl mx-auto text-lg">
                            SignViz is built upon a foundation of research into computational linguistics and computer graphics. 
                            Our system interprets text semantics and maps them to a comprehensive database of skeletal animation data, 
                            rendering signs in real-time within the browser.
                        </p>
                    </motion.div>
                </div>
                {/* Background decorations */}
                <div className="absolute top-0 right-0 translate-x-1/3 -translate-y-1/3 w-96 h-96 bg-secondary/10 blur-[100px] rounded-full pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 -translate-x-1/3 translate-y-1/3 w-96 h-96 bg-primary/10 blur-[100px] rounded-full pointer-events-none"></div>
            </section>

        </div>
    );
};


const FeatureCard = ({ icon, title, description }) => {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function handleMouseMove({ currentTarget, clientX, clientY }) {
        const { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="premium-card group relative border border-gray-300 bg-white rounded-2xl px-8 py-10 overflow-hidden shadow-2xl shadow-gray-400/50 hover:shadow-[0_20px_50px_rgba(0,0,0,0.15)] transition-all duration-500"
            onMouseMove={handleMouseMove}
        >
            <motion.div
                className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition duration-300 group-hover:opacity-100"
                style={{
                    background: useMotionTemplate`
                        radial-gradient(
                        650px circle at ${mouseX}px ${mouseY}px,
                        rgba(14, 165, 233, 0.05),
                        transparent 80%
                        )
                    `,
                }}
            />
            
            <div className="relative flex flex-col gap-5">
                <div className="h-14 w-14 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
                    {icon}
                </div>
                
                <h3 className="text-2xl font-bold text-primary tracking-tight group-hover:text-primary transition-colors duration-300">
                    {title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed font-light text-lg">
                    {description}
                </p>
            </div>
        </motion.div>
    );
};

export default Features;
