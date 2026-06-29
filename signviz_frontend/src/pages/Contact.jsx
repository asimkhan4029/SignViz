import { motion } from 'framer-motion';
import { Mail, Building2, Handshake, Send, GraduationCap } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

const Contact = () => {
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
                    <h1 className="text-6xl md:text-8xl font-black tracking-tight text-slate-900 leading-[1.1]">
                        Contact <span className="gradient-text">Us</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-text-secondary font-medium max-w-2xl mx-auto leading-relaxed">
                        For inquiries, feedback, or academic collaboration, feel free to reach out.
                    </p>
                </motion.div>
            </section>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-24 w-full">
                <div className="grid lg:grid-cols-2 gap-20">
                    
                    {/* Contact Information */}
                    <div className="space-y-12">
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <h2 className="text-3xl font-black text-slate-900 mb-8 flex items-center gap-3">
                                <Building2 className="text-primary w-8 h-8" />
                                Project Information
                            </h2>
                            <div className="grid gap-6">
                                <ContactCard 
                                    icon={<Mail className="w-6 h-6" />}
                                    label="Email Address"
                                    value="signviz@gmail.com"
                                    subtext="General Inquiries"
                                />
                                <ContactCard 
                                    icon={<GraduationCap className="w-6 h-6" />}
                                    label="Organization"
                                    value="Namal University Mianwali"
                                    subtext="Department of Computer Science"
                                />
                                <ContactCard 
                                    icon={<Handshake className="w-6 h-6" />}
                                    label="Industry Coordination"
                                    value="VictoriumAI"
                                    subtext="Technical Partnership"
                                />
                            </div>
                        </motion.div>

                        <motion.div 
                             initial={{ opacity: 0, y: 20 }}
                             whileInView={{ opacity: 1, y: 0 }}
                             viewport={{ once: true }}
                             transition={{ duration: 0.6, delay: 0.4 }}
                             className="bg-indigo-50 border border-indigo-100 rounded-3xl p-8 relative overflow-hidden"
                        >
                            <div className="relative z-10">
                                <h3 className="text-xl font-black text-slate-900 mb-3 flex items-center gap-3">
                                    <GraduationCap className="w-6 h-6 text-primary" />
                                    Academic Context
                                </h3>
                                <p className="text-text-secondary leading-relaxed font-medium">
                                    SignViz is an academic project focused on exploring the intersection of accessibility and inclusive technology. 
                                    We welcome feedback from educators, students, and the deaf community to refine our research and implementation.
                                </p>
                            </div>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-16 -mt-16"></div>
                        </motion.div>
                    </div>

                    {/* Contact Form */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                    >
                         <div className="p-10 md:p-12 border border-slate-200 shadow-2xl shadow-slate-200/50 bg-white rounded-[40px]">
                            <h2 className="text-3xl font-black text-slate-900 mb-8 flex items-center gap-3">
                                <Send className="text-primary w-8 h-8" />
                                Send a Message
                            </h2>
                            <form className="space-y-8">
                                <div className="space-y-3">
                                    <label htmlFor="name" className="text-sm font-black text-slate-700 uppercase tracking-widest">Full Name</label>
                                    <input 
                                        type="text" 
                                        id="name" 
                                        placeholder="Dr. Ali Ahmed"
                                        className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-slate-400 font-medium"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label htmlFor="email" className="text-sm font-black text-slate-700 uppercase tracking-widest">Email Address</label>
                                    <input 
                                        type="email" 
                                        id="email" 
                                        placeholder="ali.ahmed@example.com"
                                        className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-slate-400 font-medium"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label htmlFor="message" className="text-sm font-black text-slate-700 uppercase tracking-widest">Message</label>
                                    <textarea 
                                        id="message" 
                                        rows="4" 
                                        placeholder="I would like to inquire about..."
                                        className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-slate-400 font-medium resize-none"
                                    ></textarea>
                                </div>
                                <Button size="xl" className="w-full text-xl py-6 rounded-2xl font-black shadow-xl shadow-primary/20">
                                    Submit Message
                                </Button>
                            </form>
                         </div>
                    </motion.div>

                </div>
            </div>
        </div>
    );
};

const ContactCard = ({ icon, label, value, subtext }) => (
    <div className="group flex items-center gap-6 p-6 rounded-3xl border border-slate-200 bg-white hover:border-primary/30 hover:shadow-xl hover:shadow-slate-200/40 hover:-translate-y-1 transition-all duration-300">
        <div className="h-16 w-16 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm border border-slate-100">
            {icon}
        </div>
        <div>
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
            <p className="text-xl font-black text-slate-900 tracking-tight">{value}</p>
            <p className="text-sm text-text-secondary font-medium">{subtext}</p>
        </div>
    </div>
);

export default Contact;
