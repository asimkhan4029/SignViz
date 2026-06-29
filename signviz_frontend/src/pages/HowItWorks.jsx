import { motion } from 'framer-motion';
import { Keyboard, Cpu, Network, UserCheck, MonitorPlay, Sparkles } from 'lucide-react';

const HowItWorks = () => {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            {/* Hero Section */}
            <section className="relative py-32 px-4 text-center overflow-hidden bg-white border-b border-slate-100">
                <div className="absolute inset-0 bg-slate-50/50 -z-10" />
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="max-w-4xl mx-auto space-y-6"
                >
                    <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-50 text-primary text-xs font-black tracking-widest uppercase border border-indigo-100">
                        System Workflow
                    </span>
                    <h1 className="text-6xl md:text-8xl font-black tracking-tight text-slate-900 leading-[1.1]">
                        How <span className="gradient-text">SignViz</span> Works
                    </h1>
                    <p className="text-xl md:text-2xl text-text-secondary font-medium max-w-2xl mx-auto leading-relaxed">
                        A sophisticated, step-by-step overview of our sign language visualization engine.
                    </p>
                </motion.div>
            </section>

            {/* Workflow Section */}
            <div className="max-w-5xl mx-auto px-4 py-24">
                <div className="space-y-12 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-slate-200">
                    
                    <WorkflowStep 
                        number="1"
                        title="User Input"
                        description="Enter text or select predefined educational content through our simple, accessible interface."
                        icon={<Keyboard className="w-8 h-8" />}
                        delay={0.1}
                    />

                    <WorkflowStep 
                        number="2"
                        title="Text Analysis"
                        description="Our AI engine analyzes the input, normalizing text and breaking it down into processable linguistic units."
                        icon={<Cpu className="w-8 h-8" />}
                        delay={0.2}
                    />

                    <WorkflowStep 
                        number="3"
                        title="Sign Mapping"
                        description="Each processed word is matched against our comprehensive database to identify its corresponding sign representation."
                        icon={<Network className="w-8 h-8" />}
                        delay={0.3}
                    />

                    <WorkflowStep 
                        number="4"
                        title="Avatar Animation"
                        description="The mapping data triggers fluid, lifelike gestures on our high-fidelity 3D digital avatars."
                        icon={<UserCheck className="w-8 h-8" />}
                        delay={0.4}
                    />

                    <WorkflowStep 
                        number="5"
                        title="Visualization Output"
                        description="The final sign language sequence is displayed with full playback controls for self-paced learning."
                        icon={<MonitorPlay className="w-8 h-8" />}
                        delay={0.5}
                    />

                </div>
            </div>

            {/* Educational Emphasis */}
            <section className="py-32 bg-slate-900 text-white relative overflow-hidden">
                <div className="max-w-4xl mx-auto px-4 text-center space-y-10 relative z-10">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="space-y-8"
                    >
                        <div className="inline-flex items-center gap-2 text-indigo-400 font-bold text-xl uppercase tracking-widest">
                            <Sparkles className="w-6 h-6" />
                            <span>Why It Matters</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">Supporting Inclusive Education</h2>
                        <p className="text-xl text-slate-300 leading-relaxed max-w-3xl mx-auto font-medium">
                            This systematic approach ensures that every step—from input to output—prioritizes clarity and accuracy. 
                            We empower educators to create accessible materials instantly and enable deaf students to learn independently.
                        </p>
                    </motion.div>
                </div>
                {/* Background decorations */}
                <div className="absolute top-0 right-0 translate-x-1/3 -translate-y-1/3 w-96 h-96 bg-primary/20 blur-[100px] rounded-full pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 -translate-x-1/3 translate-y-1/3 w-96 h-96 bg-accent/20 blur-[100px] rounded-full pointer-events-none"></div>
            </section>
        </div>
    );
};

const WorkflowStep = ({ number, title, description, icon, delay }) => (
    <motion.div 
        initial={{ opacity: 0, x: -30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, delay: delay }}
        className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group"
    >
        <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-background bg-slate-900 shadow-xl z-10 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
             <span className="font-black text-lg text-white">{number}</span>
        </div>
        
        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-white p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300">
             <div className="flex items-center gap-5 mb-4">
                 <div className="p-4 rounded-2xl bg-indigo-50 text-primary shadow-sm group-hover:bg-primary group-hover:text-white transition-all duration-300">
                     {icon}
                 </div>
                 <h3 className="font-black text-2xl text-slate-900 tracking-tight">{title}</h3>
             </div>
             <p className="text-text-secondary text-lg leading-relaxed font-medium">{description}</p>
        </div>
    </motion.div>
);

export default HowItWorks;
