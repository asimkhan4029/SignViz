import { motion } from 'framer-motion';
import { Keyboard, Cpu, Network, UserCheck, MonitorPlay, Sparkles } from 'lucide-react';

const HowItWorks = () => {
    return (
        <div className="flex flex-col min-h-screen bg-gray-50/50">
            {/* Hero Section */}
            <section className="relative py-20 px-4 text-center overflow-hidden bg-white border-b border-gray-100">
                <div className="absolute inset-0 bg-grid-slate-50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="max-w-4xl mx-auto space-y-4"
                >
                    <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-sm font-semibold tracking-wider uppercase border border-secondary/20">
                        System Workflow
                    </span>
                    <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary via-teal-500 to-secondary">
                        How SignViz Works
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-600 font-light max-w-2xl mx-auto leading-relaxed">
                        A step-by-step overview of the sign language visualization process.
                    </p>
                </motion.div>
            </section>

            {/* Workflow Section */}
            <div className="max-w-4xl mx-auto px-4 py-16">
                    <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-primary/20 before:to-transparent">
                    
                    <WorkflowStep 
                        number="1"
                        title="User Input"
                        description="The user enters text or selects predefined educational content through our simple, accessible interface."
                        icon={<Keyboard className="w-8 h-8 text-white" />}
                        color="bg-primary"
                        delay={0.1}
                    />

                    <WorkflowStep 
                        number="2"
                        title="Text Processing"
                        description="Our intelligent system analyzes the input, normalizing text and breaking it down into processable linguistic units."
                        icon={<Cpu className="w-8 h-8 text-white" />}
                        color="bg-secondary"
                        delay={0.2}
                    />

                    <WorkflowStep 
                        number="3"
                        title="Sign Mapping"
                        description="Each processed word is matched against our comprehensive database to identify its corresponding sign representation."
                        icon={<Network className="w-8 h-8 text-white" />}
                        color="bg-teal-500"
                        delay={0.3}
                    />

                    <WorkflowStep 
                        number="4"
                        title="Avatar Animation"
                        description="The mapping data is sent to the 3D engine, triggering fluid, lifelike gestures on the digital avatar."
                        icon={<UserCheck className="w-8 h-8 text-white" />}
                        color="bg-accent"
                        delay={0.4}
                    />

                    <WorkflowStep 
                        number="5"
                        title="Visualization Output"
                        description="The final sign language sequence is displayed to the user with full playback controls for self-paced learning."
                        icon={<MonitorPlay className="w-8 h-8 text-white" />}
                        color="bg-indigo-400"
                        delay={0.5}
                    />

                </div>
            </div>

            {/* Educational Emphasis */}
            <section className="py-20 bg-white border-t border-gray-100">
                <div className="max-w-4xl mx-auto px-4 text-center space-y-10">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="space-y-6"
                    >
                        <div className="inline-flex items-center gap-2 text-primary font-semibold text-lg">
                            <Sparkles className="w-5 h-5" />
                            <span>Why This Matters</span>
                        </div>
                        <h2 className="text-3xl font-bold text-primary">Supporting Inclusive Education</h2>
                        <p className="text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto">
                            This systematic approach ensures that every step—from input to output—prioritizes clarity and accuracy. 
                            By automating the translation process, we empower educators to create accessible materials instantly 
                            and enable deaf students to access information independently.
                        </p>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

const WorkflowStep = ({ number, title, description, icon, color, delay }) => (
    <motion.div 
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5, delay: delay }}
        className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
    >
        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-100 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
             <span className="font-bold text-sm text-slate-500">{number}</span>
        </div>
        
        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-6 rounded-2xl border border-gray-300 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300">
             <div className="flex items-center gap-4 mb-3">
                 <div className={`p-3 rounded-lg shadow-sm ${color} shadow-lg shadow-${color.replace('bg-', '')}/30`}>
                     {icon}
                 </div>
                 <h3 className="font-bold text-xl text-primary">{title}</h3>
             </div>
             <p className="text-gray-600 leading-relaxed">{description}</p>
        </div>
    </motion.div>
);

export default HowItWorks;
