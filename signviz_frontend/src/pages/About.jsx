import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Brain, Users, Eye, Heart, GraduationCap } from 'lucide-react';

const About = () => {
    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50/50">
            {/* Hero Section */}
            <section className="relative py-20 px-4 text-center overflow-hidden bg-white border-b border-gray-100">
                <div className="absolute inset-0 bg-grid-slate-50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />
                <motion.div 
                    initial="hidden"
                    animate="visible"
                    transition={{ duration: 0.6 }}
                    variants={fadeIn}
                    className="max-w-4xl mx-auto space-y-6"
                >
                    <span className="inline-block px-4 py-1.5 rounded-full bg-primary/5 text-primary text-sm font-semibold tracking-wider uppercase border border-primary/10">
                        Final Year Project
                    </span>
                    <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary via-teal-500 to-secondary">
                        About SignViz
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-600 font-light max-w-2xl mx-auto leading-relaxed">
                        Bridging communication gaps through intelligent sign language visualization.
                    </p>
                </motion.div>
            </section>

            {/* Main Content */}
            <div className="max-w-5xl mx-auto px-4 py-16 space-y-24">
                
                {/* Problem Statement */}
                <motion.section 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    variants={fadeIn}
                    className="grid md:grid-cols-2 gap-12 items-center"
                >
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 text-primary font-semibold text-lg">
                            <Eye className="w-5 h-5" />
                            <span>The Challenge</span>
                        </div>
                        <h2 className="text-3xl font-bold text-primary">Accessibility Information Gap</h2>
                        <p className="text-lg text-gray-600 leading-relaxed text-justify">
                            Deaf and hard-of-hearing learners often face significant barriers in accessing digital educational content. Traditional platforms rely heavily on audio and text, lacking adequate sign language support which is the primary language for many in the deaf community. This creates an inequitable learning environment and hinders academic progress.
                        </p>
                    </div>
                    <div className="bg-gray-100 rounded-2xl p-8 border border-gray-200 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-8 -mt-8"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-secondary/5 rounded-tr-full -ml-6 -mb-6"></div>
                        <ul className="space-y-4 relative z-10">
                            <li className="flex items-start gap-4">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold">✕</span>
                                <span className="text-gray-700">Lack of real-time interpretation</span>
                            </li>
                            <li className="flex items-start gap-4">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold">✕</span>
                                <span className="text-gray-700">Limited localized sign language resources</span>
                            </li>
                            <li className="flex items-start gap-4">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold">✕</span>
                                <span className="text-gray-700">Static text often insufficient for conveying tone</span>
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
                    <div className="bg-white rounded-3xl p-10 md:p-14 shadow-xl shadow-gray-200/50 border border-gray-100 relative overflow-hidden">
                         <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-teal-400 to-secondary"></div>
                         <div className="max-w-3xl mx-auto text-center space-y-8">
                            <div className="inline-flex items-center gap-2 text-teal-600 font-semibold text-lg">
                                <Brain className="w-6 h-6" />
                                <span>Our Solution</span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-primary">AI-Powered Visualization</h2>
                            <p className="text-lg text-gray-600 leading-relaxed">
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
                    className="space-y-10"
                >
                    <div className="text-center">
                         <h2 className="text-3xl font-bold text-primary mb-4">Project Objectives</h2>
                         <p className="text-gray-500 max-w-2xl mx-auto">Core goals driving the development of the SignViz platform.</p>
                    </div>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 premium-grid">
                        <ObjectiveCard 
                            icon={<Users className="w-6 h-6 text-primary" />}
                            title="Inclusive Learning"
                            description="Promote environments where deaf students participate equally."
                        />
                        <ObjectiveCard 
                            icon={<Heart className="w-6 h-6 text-pink-500" />}
                            title="Support Users"
                            description="Empower deaf and hard-of-hearing individuals with better tools."
                        />
                         <ObjectiveCard 
                            icon={<Eye className="w-6 h-6 text-teal-500" />}
                            title="Visual Representation"
                            description="Provide clear, accurate sign language visualization via avatars."
                        />
                        <ObjectiveCard 
                            icon={<GraduationCap className="w-6 h-6 text-indigo-500" />}
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
                    className="bg-primary rounded-2xl p-10 text-center text-white/80 relative overflow-hidden"
                >
                    <div className="relative z-10 max-w-3xl mx-auto space-y-6">
                        <GraduationCap className="w-12 h-12 mx-auto text-highlight" />
                        <h2 className="text-2xl font-semibold text-white">Academic & Research Context</h2>
                        <p className="leading-relaxed text-lg">
                            SignViz is developed as a <span className="text-white font-semibold">Final Year Project (FYP)</span>. 
                            It represents a culmination of research into Assistive Technologies, Natural Language Processing (NLP), and Computer Graphics. 
                            The project aims to contribute to the growing body of work in inclusive educational technologies and demonstrates the practical application of AI for social good.
                        </p>
                    </div>
                    {/* Background decorations */}
                    <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/20 blur-[100px] rounded-full"></div>
                    <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-64 h-64 bg-secondary/20 blur-[100px] rounded-full"></div>
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
            className="premium-card group relative border border-gray-300 bg-white rounded-2xl px-6 py-8 overflow-hidden shadow-md hover:shadow-[0_20px_50px_rgba(0,0,0,0.15)] transition-all duration-500"
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
            
            <div className="relative flex flex-col gap-4">
                <div className="h-12 w-12 rounded-xl bg-gray-50 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
                    {icon}
                </div>
                
                <h3 className="text-lg font-bold text-primary mb-2 group-hover:text-primary transition-colors duration-300">
                    {title}
                </h3>
                
                <p className="text-sm text-gray-600 leading-relaxed font-light">
                    {description}
                </p>
            </div>
        </motion.div>
    );
};

export default About;
