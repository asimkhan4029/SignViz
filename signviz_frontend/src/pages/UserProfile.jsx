import { Upload, Library, Settings, User, LogOut, Sparkles, ChevronRight, Camera, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ProfileCard = ({ title, icon: Icon, description, onClick, color }) => (
  <button 
    onClick={onClick}
    className="relative w-full text-left bg-white p-7 rounded-2xl shadow-lg border border-slate-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group overflow-hidden"
  >
    {/* Subtle background accent */}
    <div className={`absolute top-0 right-0 w-32 h-32 ${color?.bg || 'bg-primary'} rounded-full -translate-y-16 translate-x-16 opacity-5 group-hover:opacity-10 transition-opacity duration-500`}></div>
    
    <div className="flex items-start justify-between mb-6 relative z-10">
      <div className={`p-4 ${color?.iconBg || 'bg-highlight'} ${color?.iconColor || 'text-primary'} rounded-xl group-hover:scale-110 transition-transform duration-300 group-hover:${color?.hover || 'bg-primary group-hover:text-white'}`}>
        <Icon size={28} />
      </div>
      <ChevronRight size={20} className="text-muted group-hover:text-primary transition-colors mt-2" />
    </div>
    <h3 className="text-2xl font-bold text-primary mb-3">{title}</h3>
    <p className="text-slate-600 text-sm leading-relaxed">{description}</p>
    
    {/* Bottom accent line */}
    <div className={`absolute bottom-0 left-0 w-0 h-1 ${color?.line || 'bg-primary'} group-hover:w-full transition-all duration-500 rounded-b-2xl`}></div>
  </button>
);

const UserProfile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Helper to get initials
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const cardColors = [
    { bg: 'bg-gradient-to-br from-primary to-secondary', iconBg: 'bg-highlight', iconColor: 'text-primary', hover: 'bg-primary', line: 'bg-primary' },
    { bg: 'bg-gradient-to-br from-secondary to-accent', iconBg: 'bg-muted/30', iconColor: 'text-secondary', hover: 'bg-secondary', line: 'bg-secondary' },
    { bg: 'bg-gradient-to-br from-accent to-muted', iconBg: 'bg-highlight', iconColor: 'text-accent', hover: 'bg-accent', line: 'bg-accent' }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <nav className="bg-white/95 backdrop-blur-xl border-b border-muted/20 px-6 py-5 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center text-white font-bold shadow-md">SV</div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
              SignViz
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-xl transition-all duration-300 hover:shadow-md group"
            >
              <Home size={18} className="group-hover:scale-110 transition-transform duration-300" />
              Back to Home
            </button>
            <button 
              onClick={logout}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 hover:shadow-md group"
            >
              <LogOut size={18} className="group-hover:rotate-180 transition-transform duration-300" />
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Profile Header */}
        <div className="relative bg-white/50 rounded-3xl p-8 shadow-xl border border-white/50 mb-10 backdrop-blur-sm">
          {/* Decorative elements */}
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/10 rounded-full blur-xl"></div>
          <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-secondary/10 rounded-full blur-xl"></div>
          
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
            {/* Avatar with gradient border */}
            <div className="relative group">
              {user?.photoUrl ? (
                <div className="relative">
                  <img 
                    src={user.photoUrl} 
                    alt={user.name} 
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-2xl"
                  />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 -z-10 animate-pulse"></div>
                </div>
              ) : (
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-highlight flex items-center justify-center border-4 border-white shadow-2xl">
                    <span className="text-4xl font-bold bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent">
                      {getInitials(user?.name)}
                    </span>
                  </div>
                  <div className="absolute inset-0 rounded-full bg-primary/20 -z-10 animate-pulse"></div>
                </div>
              )}
              
              {/* Edit button */}
              <button className="absolute bottom-2 right-2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-110 border border-slate-200">
                <Camera size={18} className="text-slate-600" />
              </button>
            </div>

            {/* User Info */}
            <div className="text-center md:text-left flex-1">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-teal-500 to-secondary">
                  {user?.name || 'Deaf User'}
                </h1>
                <Sparkles size={24} className="text-amber-400 fill-amber-400 animate-pulse" />
              </div>
              
              <p className="text-lg text-slate-600 font-medium flex items-center justify-center md:justify-start gap-2">
                <span>✉️</span>
                {user?.email || 'user@example.com'}
              </p>
              

            </div>
          </div>
        </div>

        {/* Dashboard Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-teal-500 to-secondary mb-2">Dashboard</h2>
          <p className="text-slate-600 mb-8">Manage your sign language translation experience</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 premium-grid">
            <ProfileCard 
              title="Upload Video" 
              icon={Upload} 
              description="Upload your content for instant sign language translation with our advanced AI." 
              onClick={() => navigate('/upload')}
              color={cardColors[0]}
            />
            <ProfileCard 
              title="My Library" 
              icon={Library} 
              description="Access all your translated videos, history, and saved content in one place." 
              onClick={() => navigate('/library')}
              color={cardColors[1]}
            />
            <ProfileCard 
              title="Profile Settings" 
              icon={Settings} 
              description="Update personal information, preferences, and account settings." 
              onClick={() => navigate('/settings')}
              color={cardColors[2]}
            />
          </div>
        </div>


      </main>
    </div>
  );
};

export default UserProfile;