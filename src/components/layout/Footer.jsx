import { Link } from 'react-router-dom';
import { GraduationCap, Building2 } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-primary text-white/90 border-t border-white/10">
            {/* Main Footer Content */}
            <div className="max-w-7xl mx-auto px-4 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    
                    {/* Brand & Stats */}
                    <div className="space-y-6">
                         <Link to="/" className="flex items-center gap-2">
                             <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-highlight to-white">
                                 SignViz
                             </span>
                         </Link>
                         <p className="text-sm leading-relaxed text-white/70">
                             SignViz is an AI-driven accessibility platform designed to support deaf and hard-of-hearing learners by visualizing text content through sign language representations.
                         </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-semibold text-white mb-6">Quick Links</h3>
                        <ul className="space-y-4 text-sm">
                            <li><FooterLink to="/">Home</FooterLink></li>
                            <li><FooterLink to="/about">About Us</FooterLink></li>
                            <li><FooterLink to="/features">Features</FooterLink></li>
                            <li><FooterLink to="/how-it-works">How It Works</FooterLink></li>
                            <li><FooterLink to="/library">Sign Visualizer</FooterLink></li>
                            <li><FooterLink to="/contact">Contact</FooterLink></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="font-semibold text-white mb-6">Legal & Accessibility</h3>
                        <ul className="space-y-4 text-sm">
                            <li><span className="hover:text-white transition-colors cursor-pointer">Privacy Policy</span></li>
                            <li><span className="hover:text-white transition-colors cursor-pointer">Terms & Conditions</span></li>
                            <li><span className="hover:text-white transition-colors cursor-pointer">Accessibility Statement</span></li>
                        </ul>
                    </div>

                    {/* Academic Info */}
                    <div>
                        <h3 className="font-semibold text-white mb-6">Academic Context</h3>
                        <div className="space-y-4 text-sm">
                            <div className="flex items-start gap-3">
                                <GraduationCap className="w-5 h-5 text-highlight shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-medium text-white">Namal University</p>
                                    <p className="text-white/60">Mianwali, Pakistan</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Building2 className="w-5 h-5 text-highlight shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-medium text-white">VictoriumAI</p>
                                    <p className="text-white/60">Industry Coordination</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-white/10 bg-black/20">
                <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/50">
                    <p>© 2026 SignViz. All rights reserved.</p>
                    <p>Designed for accessible and inclusive communication.</p>
                </div>
            </div>
        </footer>
    );
};

const FooterLink = ({ to, children }) => (
    <Link to={to} className="hover:text-white hover:translate-x-1 transition-all duration-300 inline-block">
        {children}
    </Link>
);

export default Footer;
