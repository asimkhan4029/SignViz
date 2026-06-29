import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Brain, Users, Eye, Heart, GraduationCap } from 'lucide-react';

const About = () => {
    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="flex flex-col min-h-screen bg-background">
            {/* Hero Section */}
            <section className="relative py-32 px-4 text-center overflow-hidden bg-white border-b border-slate-100">
                <div className="absolute inset-0 bg-slate-50/50 -z-10" />
                <motion.div 
                    initial="hidden"
                    animate="visible"
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    variants={fadeIn}
                    className="max-w-4xl mx-auto space-y-8"
                >
                    <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-50 text-primary text-xs font-black tracking-widest uppercase border border-indigo-100">
                        Final Year Project
                    </span>
                    <h1 className="text-6xl md:text-8xl font-black tracking-tight text-slate-900 leading-[1.1]">
                        About <span className="gradient-text">SignViz</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-text-secondary font-medium max-w-2xl mx-auto leading-relaxed">
                        Bridging communication gaps through intelligent sign language visualization.
                    </p>
                </motion.div>
            </section>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-4 py-24 space-y-32">
                
                {/* Problem Statement */}
                <motion.section 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    variants={fadeIn}
                    className="grid md:grid-cols-2 gap-16 items-center"
                >
                    <div className="space-y-8">
                        <div className="inline-flex items-center gap-2 text-primary font-bold text-lg uppercase tracking-wider">
                            <Eye className="w-6 h-6" />
                            <span>The Challenge</span>
                        </div>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">Accessibility Information Gap</h2>
                        <p className="text-xl text-text-secondary leading-relaxed font-medium">
                            Deaf and hard-of-hearing learners often face significant barriers in accessing digital educational content. Traditional platforms rely heavily on audio and text, lacking adequate sign language support which is the primary language for many in the deaf community. This creates an inequitable learning environment and hinders academic progress.
                        </p>
                    </div>
                    <div className="bg-slate-50 rounded-3xl p-10 border border-slate-200 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-8 -mt-8"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/5 rounded-tr-full -ml-6 -mb-6"></div>
                        <ul className="space-y-6 relative z-10">
                            <li className="flex items-start gap-4">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-xs font-black">✕</span>
                                <span className="text-slate-700 font-bold">Lack of real-time interpretation</span>
                            </li>
                            <li className="flex items-start gap-4">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-xs font-black">✕</span>
                                <span className="text-slate-700 font-bold">Limited localized sign language resources</span>
                            </li>
                            <li className="flex items-start gap-4">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-xs font-black">✕</span>
                                <span className="text-slate-700 font-bold">Static text often insufficient for conveying tone</span>
                            </li>
                        </ul>
                    </div>
                </motion.section>

                {/* Our Solution */}
                <motion.section 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    variants={fadeIn}
                >
                    <div className="bg-white rounded-[40px] p-12 md:p-20 shadow-2xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
                         <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-primary via-indigo-400 to-accent"></div>
                         <div className="max-w-4xl mx-auto text-center space-y-10">
                            <div className="inline-flex items-center gap-3 text-emerald-600 font-bold text-xl uppercase tracking-widest">
                                <Brain className="w-8 h-8" />
                                <span>Our Solution</span>
                            </div>
                            <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">AI-Powered Visualization</h2>
                            <p className="text-xl text-text-secondary leading-relaxed font-medium">
                                SignViz leverages advanced Artificial Intelligence to convert educational text and spoken content into accurate sign language visualizations. By utilizing high-fidelity animated avatars, we provide a scalable, consistent, and visual-first communication method that seamlessly integrates into the learning experience.
                            </p>
                         </div>
                    </div>
                </motion.section>

                {/* Project Objectives */}
                <motion.section 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    variants={fadeIn}
                    className="space-y-16"
                >
                    <div className="text-center space-y-4">
                         <h2 className="text-4xl font-black text-slate-900 tracking-tight">Project Objectives</h2>
                         <p className="text-text-secondary text-lg font-medium max-w-2xl mx-auto">Core goals driving the development of the SignViz platform.</p>
                    </div>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <ObjectiveCard 
                            icon={<Users className="w-7 h-7" />}
                            title="Inclusive Learning"
                            description="Promote environments where deaf students participate equally."
                        />
                        <ObjectiveCard 
                            icon={<Heart className="w-7 h-7" />}
                            title="Support Users"
                            description="Empower deaf and hard-of-hearing individuals with better tools."
                        />
                         <ObjectiveCard 
                            icon={<Eye className="w-7 h-7" />}
                            title="Visual Representation"
                            description="Provide clear, accurate sign language visualization via avatars."
                        />
                        <ObjectiveCard 
                            icon={<GraduationCap className="w-7 h-7" />}
                            title="Education Access"
                            description="Improve accessibility standards in digital education platforms."
                        />
                    </div>
                </motion.section>

                {/* Academic Context */}
                <motion.section 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    variants={fadeIn}
                    className="bg-slate-900 rounded-3xl p-16 text-center text-slate-300 relative overflow-hidden"
                >
                    <div className="relative z-10 max-w-3xl mx-auto space-y-8">
                        <div className="bg-white/10 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20">
                            <GraduationCap className="w-10 h-10 text-white" />
                        </div>
                        <h2 className="text-4xl font-black text-white tracking-tight">Academic & Research Context</h2>
                        <p className="leading-relaxed text-xl font-medium">
                            SignViz is developed as a <span className="text-white font-black underline decoration-primary underline-offset-4">Final Year Project (FYP)</span>. 
                            It represents a culmination of research into Assistive Technologies, Natural Language Processing (NLP), and Computer Graphics. 
                            The project aims to contribute to the growing body of work in inclusive educational technologies.
                        </p>
                    </div>
                    {/* Background decorations */}
                    <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/20 blur-[120px] rounded-full"></div>
                    <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-accent/20 blur-[120px] rounded-full"></div>
                </motion.section>

            </div>
        </div>
    );
};

const ObjectiveCard = ({ icon, title, description }) => {
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
            className="premium-card group relative border border-slate-200 bg-white rounded-3xl px-8 py-10 overflow-hidden shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500"
            onMouseMove={handleMouseMove}
        >
            <motion.div
                className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-300 group-hover:opacity-100"
                style={{
                    background: useMotionTemplate`
                        radial-gradient(
                        650px circle at ${mouseX}px ${mouseY}px,
                        rgba(79, 70, 229, 0.08),
                        transparent 80%
                        )
                    `,
                }}
            />
            
            <div className="relative flex flex-col gap-6">
                <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-sm border border-slate-100">
                    {icon}
                </div>
                
                <h3 className="text-xl font-black text-slate-900 tracking-tight group-hover:text-primary transition-colors duration-300">
                    {title}
                </h3>
                
                <p className="text-lg text-text-secondary leading-relaxed font-medium">
                    {description}
                </p>
            </div>
        </motion.div>
    );
};

export default About;
