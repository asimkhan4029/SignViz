import { Link } from 'react-router-dom';
import { GraduationCap, Building2 } from 'lucide-react';

const Footer = () => (
  <footer className="relative z-10 bg-slate-900 text-slate-300 border-t border-slate-800 overflow-hidden">
    {/* Subtle Background Glow */}
    <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -mr-48 -mt-48 pointer-events-none" />
    <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl -ml-48 -mb-48 pointer-events-none" />

    <div className="max-w-7xl mx-auto px-6 py-24 relative z-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16">

        {/* Brand Section */}
        <div className="space-y-8">
          <Link to="/" className="inline-block text-4xl font-black text-white tracking-tighter hover:scale-105 transition-transform">
            Sign<span className="text-primary">Viz</span>
          </Link>
          <p className="text-lg leading-relaxed text-slate-400 font-medium">
            Empowering the deaf and hard-of-hearing community through AI-driven sign language visualization.
          </p>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all cursor-pointer border border-slate-700">
               <GraduationCap size={20} />
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all cursor-pointer border border-slate-700">
               <Building2 size={20} />
            </div>
          </div>
        </div>

        {/* Quick Navigation */}
        <div>
          <h3 className="font-black text-white mb-8 text-xs uppercase tracking-[0.2em] text-slate-500">Navigation</h3>
          <ul className="space-y-5">
            {[['/', 'Home'], ['/library', 'Library'], ['/upload', 'Upload'], ['/profile', 'Profile']].map(([to, label]) => (
              <li key={to}>
                <FooterLink to={to}>{label}</FooterLink>
              </li>
            ))}
          </ul>
        </div>

        {/* Support & Legal */}
        <div>
          <h3 className="font-black text-white mb-8 text-xs uppercase tracking-[0.2em] text-slate-500">Legal</h3>
          <ul className="space-y-5">
            {['Privacy Policy', 'Terms of Service', 'Accessibility'].map((item) => (
              <li key={item}>
                <button className="text-slate-400 hover:text-white font-bold transition-colors text-sm uppercase tracking-wider">
                  {item}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Academic Partners */}
        <div className="space-y-8">
          <h3 className="font-black text-white mb-8 text-xs uppercase tracking-[0.2em] text-slate-500">Partners</h3>
          <div className="space-y-6">
            <div className="group cursor-default">
              <p className="text-white font-black text-sm tracking-wide mb-1 group-hover:text-primary transition-colors">Namal University</p>
              <p className="text-slate-500 text-xs font-bold uppercase">Mianwali, Pakistan</p>
            </div>
            <div className="group cursor-default">
              <p className="text-white font-black text-sm tracking-wide mb-1 group-hover:text-primary transition-colors">VictoriumAI</p>
              <p className="text-slate-500 text-xs font-bold uppercase">Technical Partner</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Bottom Bar */}
    <div className="border-t border-slate-800/50 bg-black/40 relative z-10">
      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-xs font-black text-slate-500 uppercase tracking-[0.15em]">
          © 2026 SignViz Platform. All rights reserved.
        </p>
        <div className="flex items-center gap-8 text-[10px] font-black text-slate-600 uppercase tracking-widest">
           <span className="hover:text-primary transition-colors cursor-pointer">Security</span>
           <span className="hover:text-primary transition-colors cursor-pointer">Sitemap</span>
           <span className="hover:text-primary transition-colors cursor-pointer">Status</span>
        </div>
      </div>
    </div>
  </footer>
);

const FooterLink = ({ to, children }) => (
  <Link 
    to={to} 
    className="text-slate-400 hover:text-white font-bold transition-all duration-300 text-sm flex items-center group"
  >
    <div className="w-0 group-hover:w-4 h-[2px] bg-primary transition-all duration-300 mr-0 group-hover:mr-3" />
    {children}
  </Link>
);

export default Footer;