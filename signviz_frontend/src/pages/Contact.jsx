import { motion } from 'framer-motion';
import { Mail, Building2, Handshake, Send, GraduationCap } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

const Contact = () => {
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
                    <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary via-teal-500 to-secondary">
                        Contact Us
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-600 font-light max-w-2xl mx-auto leading-relaxed">
                        For inquiries, feedback, or academic collaboration, feel free to reach out.
                    </p>
                </motion.div>
            </section>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-4 py-16 w-full">
                <div className="grid lg:grid-cols-2 gap-12">
                    
                    {/* Contact Information */}
                    <div className="space-y-8">
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <h2 className="text-2xl font-bold text-primary mb-6 flex items-center gap-2">
                                <Building2 className="text-primary w-6 h-6" />
                                Project Information
                            </h2>
                            <div className="grid gap-6 premium-grid">
                                <ContactCard 
                                    icon={<Mail className="w-5 h-5 text-blue-500" />}
                                    label="Email Address"
                                    value="signviz@gmail.com"
                                    subtext="General Inquiries"
                                />
                                <ContactCard 
                                    icon={<GraduationCap className="w-5 h-5 text-indigo-500" />}
                                    label="Organization"
                                    value="Namal University Mianwali"
                                    subtext="Department of Computer Science"
                                />
                                <ContactCard 
                                    icon={<Handshake className="w-5 h-5 text-teal-500" />}
                                    label="Industry Coordination"
                                    value="VictoriumAI"
                                    subtext="Technical Partnership"
                                />
                            </div>
                        </motion.div>

                        <motion.div 
                             initial={{ opacity: 0, y: 20 }}
                             animate={{ opacity: 1, y: 0 }}
                             transition={{ duration: 0.6, delay: 0.4 }}
                             className="bg-blue-50 border border-blue-100 rounded-2xl p-6"
                        >
                            <h3 className="text-lg font-semibold text-blue-900 mb-2 flex items-center gap-2">
                                <GraduationCap className="w-5 h-5" />
                                Academic Context
                            </h3>
                            <p className="text-blue-800/80 leading-relaxed text-sm">
                                SignViz is an academic project focused on exploring the intersection of accessibility and inclusive technology. 
                                We welcome feedback from educators, students, and the deaf community to refine our research and implementation.
                            </p>
                        </motion.div>
                    </div>

                    {/* Contact Form */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                    >
                         <Card className="p-8 border-gray-300 shadow-xl shadow-gray-200/50 bg-white">
                            <h2 className="text-2xl font-bold text-primary mb-6 flex items-center gap-2">
                                <Send className="text-primary w-6 h-6" />
                                Send a Message
                            </h2>
                            <form className="space-y-6">
                                <div className="space-y-2">
                                    <label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name</label>
                                    <input 
                                        type="text" 
                                        id="name" 
                                        placeholder="Dr. Ali Ahmed"
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-gray-400"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</label>
                                    <input 
                                        type="email" 
                                        id="email" 
                                        placeholder="ali.ahmed@example.com"
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-gray-400"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="message" className="text-sm font-medium text-gray-700">Message</label>
                                    <textarea 
                                        id="message" 
                                        rows="4" 
                                        placeholder="I would like to inquire about..."
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-gray-400 resize-none"
                                    ></textarea>
                                </div>
                                <Button size="lg" className="w-full text-lg">
                                    Submit Message
                                </Button>
                            </form>
                         </Card>
                    </motion.div>

                </div>
            </div>
        </div>
    );
};

const ContactCard = ({ icon, label, value, subtext }) => (
    <div className="premium-card flex items-center gap-4 p-4 rounded-xl border border-gray-200 bg-white hover:border-primary/30 hover:shadow-md transition-all duration-300">
        <div className="h-12 w-12 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <p className="text-lg font-bold text-primary">{value}</p>
            <p className="text-xs text-gray-400">{subtext}</p>
        </div>
    </div>
);

export default Contact;
