import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { motion } from 'framer-motion';
import { Upload, BookOpen, LogIn, Info, Layers, GitMerge, Mail } from 'lucide-react';

const Navbar = () => {
  const [activeSection, setActiveSection] = useState('home');
  const location = useLocation();
  const navigate = useNavigate();
  const isLandingPage = location.pathname === '/';

  // Function to handle scroll navigation
  const scrollToSection = (sectionId) => {
    if (!isLandingPage) {
      navigate('/', { state: { scrollTo: sectionId } });
      return;
    }

    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handle initial scroll if navigating from another page
  useEffect(() => {
    if (location.state?.scrollTo && isLandingPage) {
      const sectionId = location.state.scrollTo;
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
        // Clear state to prevent scrolling on subsequent refreshes
        navigate(location.pathname, { replace: true });
      }, 100);
    }
  }, [location, isLandingPage, navigate]);

  // Intersection Observer for active state
  useEffect(() => {
    if (!isLandingPage) return;

    const sections = ['home', 'upload', 'features', 'process', 'about', 'contact'];
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        root: null,
        rootMargin: '-50% 0px -50% 0px', // Activate when section is in middle of viewport
        threshold: 0
      }
    );

    sections.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => {
      sections.forEach((id) => {
        const element = document.getElementById(id);
        if (element) observer.unobserve(element);
      });
    };
  }, [isLandingPage]);

  // If not on landing page, active section should be none or derived from path
  useEffect(() => {
    if (!isLandingPage) {
      setActiveSection('');
    }
  }, [isLandingPage]);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-secondary backdrop-blur-xl shadow-md">
      <div className="container mx-auto flex h-24 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div onClick={() => scrollToSection('home')} className="group flex items-center gap-4 relative z-10 cursor-pointer">
          <div className="relative">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary to-secondary opacity-20 blur-sm group-hover:opacity-40 transition-all duration-500"></div>
            <img 
              src="/logo.png" 
              alt="SignViz" 
              className="relative h-20 w-auto transform transition-transform duration-500 group-hover:scale-105" 
            />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
            SignViz
          </span>
        </div>
        
        <div className="hidden md:flex items-center gap-1 rounded-full bg-white/10 p-1 border border-white/20 shadow-inner backdrop-blur-md">
          <NavItem 
            active={activeSection === 'home'} 
            onClick={() => scrollToSection('home')} 
            label="Home" 
          />

          <NavItem 
            active={activeSection === 'features'} 
            onClick={() => scrollToSection('features')} 
            icon={<Layers className="w-4 h-4" />} 
            label="Features" 
          />
          <NavItem 
            active={activeSection === 'process'} 
            onClick={() => scrollToSection('process')} 
            icon={<GitMerge className="w-4 h-4" />} 
            label="Process" 
          />
          <NavItem 
            active={activeSection === 'about'} 
            onClick={() => scrollToSection('about')} 
            icon={<Info className="w-4 h-4" />} 
            label="About" 
          />
          <NavItem 
            active={activeSection === 'contact'} 
            onClick={() => scrollToSection('contact')} 
            icon={<Mail className="w-4 h-4" />} 
            label="Contact" 
          />
        </div>

        <div className="flex items-center gap-3">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              variant="ghost" 
              size="sm" 
              asChild 
              className="hidden sm:inline-flex font-medium text-white hover:text-white hover:bg-white/10 border border-transparent hover:border-white/20 transition-all duration-300"
            >
              <Link to="/login" className="flex items-center">
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </Link>
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              size="sm" 
              variant="primary"
              className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white shadow-lg shadow-primary/20 hover:shadow-xl transition-all duration-300"
              onClick={() => scrollToSection('upload')}
            >
              Get Started
            </Button>
          </motion.div>
        </div>
      </div>
    </nav>
  );
};

const NavItem = ({ onClick, icon, label, active }) => (
  <motion.div 
    onClick={onClick}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className={`
      cursor-pointer relative flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300
      ${active 
        ? 'bg-white text-primary shadow-md hover:shadow-lg' 
        : 'text-white/90 hover:text-white hover:bg-white/10'
      }
    `}
  >
    {icon}
    {label}
    {!active && (
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
    )}
  </motion.div>
);

export default Navbar;