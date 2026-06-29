import { Upload, Library, Settings, Sparkles, ChevronRight, Camera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ProfileCard = ({ title, icon: Icon, description, onClick }) => (
  <button
    onClick={onClick}
    className="relative w-full text-left p-10 rounded-[32px] bg-white border border-slate-200
               hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-2 transition-all duration-500 ease-out group overflow-hidden"
  >
    <div className="flex items-start justify-between mb-8 relative z-10">
      <div className="p-5 bg-indigo-50 rounded-2xl text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-sm border border-indigo-100">
        <Icon size={32} strokeWidth={2.5} />
      </div>
      <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-primary group-hover:bg-indigo-50 transition-all duration-500">
        <ChevronRight size={24} />
      </div>
    </div>

    <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight group-hover:text-primary transition-colors">{title}</h3>
    <p className="text-text-secondary text-base leading-relaxed font-medium">{description}</p>
    
    {/* Background Glow */}
    <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
  </button>
);

const UserProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background font-sans">
      <main className="max-w-7xl mx-auto px-6 py-20">
        
        {/* Profile Header */}
        <div className="relative bg-white rounded-[40px] p-10 md:p-14 shadow-2xl shadow-slate-200/50 border border-slate-100 mb-20 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-primary via-indigo-400 to-accent" />
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row items-center md:items-start gap-12 relative z-10">
            {/* Avatar */}
            <div className="relative group">
              {user?.photoUrl ? (
                <img
                  src={user.photoUrl}
                  alt={user.name}
                  className="w-44 h-44 rounded-[40px] object-cover border-4 border-white shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-500"
                />
              ) : (
                <div className="w-44 h-44 rounded-[40px] bg-slate-900 flex items-center justify-center border-4 border-white shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-500">
                  <span className="text-6xl font-black text-white">{getInitials(user?.name)}</span>
                </div>
              )}
              <button
                onClick={() => navigate('/settings')}
                className="absolute -bottom-4 -right-4 w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-xl hover:shadow-2xl hover:scale-110 transition-all border border-slate-100 text-primary"
              >
                <Camera size={24} strokeWidth={2.5} />
              </button>
            </div>

            {/* Info */}
            <div className="text-center md:text-left flex-1 md:py-6">
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
                <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">{user?.name || 'User Profile'}</h1>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-primary rounded-full w-fit mx-auto md:mx-0">
                  <Sparkles size={18} className="fill-current" />
                  <span className="text-sm font-black uppercase tracking-widest">Premium Learner</span>
                </div>
              </div>
              <p className="text-text-secondary text-xl font-bold flex items-center justify-center md:justify-start gap-3">
                <span className="w-5 h-5 rounded-lg bg-primary/10 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                </span>
                {user?.email || 'user@example.com'}
              </p>
            </div>
          </div>
        </div>

        {/* Dashboard Section */}
        <div className="space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">Personal Dashboard</h2>
              <p className="text-text-secondary text-lg font-medium">Manage your sign language translation experience</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <ProfileCard
              title="Upload Video"
              icon={Upload}
              description="Upload content for instant sign language translation with our advanced AI."
              onClick={() => navigate('/upload')}
            />
            <ProfileCard
              title="My Library"
              icon={Library}
              description="Access all your translated videos, history, and saved content in one place."
              onClick={() => navigate('/library')}
            />
            <ProfileCard
              title="Profile Settings"
              icon={Settings}
              description="Update personal information, preferences, and account settings."
              onClick={() => navigate('/settings')}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserProfile;