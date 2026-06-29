import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, LogIn, Info, Layers, GitMerge, Mail, LogOut, User, Settings, Library, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const isLandingPage = location.pathname === '/';
  const dropdownRef = useRef(null);

  // Shadow on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const scrollToSection = (sectionId) => {
    if (!isLandingPage) {
      navigate('/', { state: { scrollTo: sectionId } });
      return;
    }
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (location.state?.scrollTo && isLandingPage) {
      const id = location.state.scrollTo;
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        navigate(location.pathname, { replace: true });
      }, 100);
    }
  }, [location, isLandingPage, navigate]);

  useEffect(() => {
    if (!isLandingPage) return;
    const sections = ['home', 'upload', 'features', 'process', 'about', 'contact'];
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActiveSection(e.target.id)),
      { rootMargin: '-50% 0px -50% 0px', threshold: 0 }
    );
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.unobserve(el);
    });
  }, [isLandingPage]);

  useEffect(() => { if (!isLandingPage) setActiveSection(''); }, [isLandingPage]);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <nav
      className={`sticky top-0 z-50 w-full transition-all duration-300
        glass border-b border-border ${scrolled ? 'shadow-md shadow-slate-200/50' : ''}`}
    >
      <div className="container mx-auto flex h-20 items-center justify-between px-6 lg:px-10">

        {/* Logo */}
        <div
          onClick={() => scrollToSection('home')}
          className="group flex items-center gap-3 cursor-pointer"
        >
          <div className="relative">
            <div className="absolute -inset-1 rounded-full bg-primary/10 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <img src="/logo.png" alt="SignViz" className="relative h-14 w-auto group-hover:scale-105 transition-transform duration-300" />
          </div>
          <span className="text-2xl font-black text-slate-900 tracking-tight">SignViz</span>
        </div>

        {/* Centre nav pills */}
        <div className="hidden md:flex items-center gap-1 rounded-2xl bg-slate-100/50 p-1 border border-slate-200/50">
          <NavItem active={activeSection === 'home'}     onClick={() => scrollToSection('home')}     label="Home" />
          <NavItem active={activeSection === 'features'} onClick={() => scrollToSection('features')} icon={<Layers className="w-3.5 h-3.5" />}   label="Features" />
          <NavItem active={activeSection === 'process'}  onClick={() => scrollToSection('process')}  icon={<GitMerge className="w-3.5 h-3.5" />}  label="Process" />
          <NavItem active={activeSection === 'about'}    onClick={() => scrollToSection('about')}    icon={<Info className="w-3.5 h-3.5" />}      label="About" />
          <NavItem active={activeSection === 'contact'}  onClick={() => scrollToSection('contact')}  icon={<Mail className="w-3.5 h-3.5" />}      label="Contact" />
          {isAuthenticated && (
            <NavItem active={location.pathname === '/upload'} onClick={() => navigate('/upload')} icon={<Upload className="w-3.5 h-3.5" />} label="Upload" />
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="relative" ref={dropdownRef}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setDropdownOpen((p) => !p)}
                className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-primary/30 transition-all text-slate-900 shadow-sm"
              >
                {user?.photoUrl ? (
                  <img src={user.photoUrl} alt={user.name} className="w-8 h-8 rounded-full object-cover border-2 border-primary/20" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-black">
                    {getInitials(user?.name)}
                  </div>
                )}
                <span className="hidden sm:block text-sm font-bold max-w-[110px] truncate">
                  {user?.name || user?.username || 'Profile'}
                </span>
                <ChevronDown className={`w-4 h-4 text-text-muted transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </motion.button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden"
                  >
                    <div className="px-5 py-4 bg-slate-50 border-b border-slate-100">
                      <p className="text-sm font-black text-slate-900 truncate">{user?.name || user?.username}</p>
                      <p className="text-xs text-text-muted font-medium truncate mt-0.5">{user?.email}</p>
                    </div>
                    <div className="p-2">
                      <DropdownItem icon={<User size={16} />}     label="My Profile"    onClick={() => { setDropdownOpen(false); navigate('/profile'); }} />
                      <DropdownItem icon={<Upload size={16} />}   label="Upload Video"  onClick={() => { setDropdownOpen(false); navigate('/upload'); }} />
                      <DropdownItem icon={<Library size={16} />}  label="My Library"    onClick={() => { setDropdownOpen(false); navigate('/library'); }} />
                      <DropdownItem icon={<Settings size={16} />} label="Settings"      onClick={() => { setDropdownOpen(false); navigate('/settings'); }} />
                    </div>
                    <div className="border-t border-slate-100 p-2">
                      <DropdownItem icon={<LogOut size={16} />} label="Sign Out" onClick={() => { setDropdownOpen(false); logout(); }} danger />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="hidden sm:inline-flex text-foreground hover:text-primary hover:bg-primary/10 border border-transparent hover:border-primary/30"
                >
                  <Link to="/login" className="flex items-center gap-2">
                    <LogIn className="h-4 w-4" />
                    Sign In
                  </Link>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="sm"
                  className="font-semibold shadow-lg shadow-primary/30"
                  onClick={() => scrollToSection('upload')}
                >
                  Get Started
                </Button>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

const NavItem = ({ onClick, icon, label, active }) => (
  <motion.div
    onClick={onClick}
    whileHover={{ y: -1 }}
    whileTap={{ y: 0 }}
    className={`group cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 relative
      ${active ? 'text-primary bg-indigo-50/50 shadow-sm' : 'text-text-secondary hover:text-slate-900 hover:bg-slate-50'}`}
  >
    {icon}
    {label}
  </motion.div>
);

const DropdownItem = ({ icon, label, onClick, danger }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-bold transition-all
      ${danger ? 'text-error hover:bg-error/5' : 'text-text-secondary hover:bg-indigo-50 hover:text-primary'}`}
  >
    <span className={danger ? 'text-error' : 'text-primary'}>{icon}</span>
    {label}
  </button>
);

export default Navbar;