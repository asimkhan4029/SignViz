import { BookOpen, Video, Library, Activity, Star, User, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const DashboardCard = ({ title, icon: Icon, description, action }) => (
  <div className="premium-card bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/20 hover:shadow-xl transition-all hover:-translate-y-1">
    <div className="flex items-start justify-between mb-4">
      <div className="p-3 bg-highlight rounded-lg text-primary">
        <Icon size={24} />
      </div>
    </div>
    <h3 className="text-xl font-bold text-primary mb-2">{title}</h3>
    <p className="text-slate-600 mb-4 text-sm">{description}</p>
    <button className="w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors">
      {action}
    </button>
  </div>
);

const StudentDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-muted/20 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center text-white font-bold">S</div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">SignViz Student</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">Welcome, {user?.name}</span>
            <button 
              onClick={logout}
              className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <header className="mb-8">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-teal-500 to-secondary">My Learning Dashboard</h1>
            <p className="text-slate-600 mt-2">Track your progress and access your sign language resources.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 premium-grid">
            <DashboardCard 
                title="My Courses" 
                icon={BookOpen} 
                description="Access your enrolled courses and continue learning." 
                action="View Courses" 
            />
            <DashboardCard 
                title="Lecture Videos" 
                icon={Video} 
                description="Watch sign-language interpreted lecture videos." 
                action="Browse Videos" 
            />
            <DashboardCard 
                title="My Library" 
                icon={Library} 
                description="Manage your personal collection of saved lectures." 
                action="Go to Library" 
            />
            <DashboardCard 
                title="Progress Tracking" 
                icon={Activity} 
                description="Track your completed lectures and quiz scores." 
                action="View Progress" 
            />
            <DashboardCard 
                title="Feedback & Ratings" 
                icon={Star} 
                description="Provide feedback on lecture quality and accessibility." 
                action="Give Feedback" 
            />
             <DashboardCard 
                title="Profile & Settings" 
                icon={User} 
                description="Update your personal info and accessibility preferences." 
                action="Edit Profile" 
            />
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
