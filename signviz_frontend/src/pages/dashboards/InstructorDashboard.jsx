import { Upload, FileVideo, Users, MessageSquare, BarChart, User, Layers } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const DashboardCard = ({ title, icon: Icon, description, status, action }) => (
  <div className="premium-card bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/20 hover:shadow-xl transition-all hover:-translate-y-1">
    <div className="flex items-start justify-between mb-4">
      <div className="p-3 bg-highlight rounded-lg text-primary">
        <Icon size={24} />
      </div>
      {status && (
        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">{status}</span>
      )}
    </div>
    <h3 className="text-xl font-bold text-primary mb-2">{title}</h3>
    <p className="text-slate-600 mb-4 text-sm">{description}</p>
    <button className="w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors">
      {action}
    </button>
  </div>
);

const InstructorDashboard = () => {
    const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-muted/20 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center text-white font-bold">I</div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">SignViz Instructor</span>
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
        <header className="mb-8 flex justify-between items-end">
            <div>
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-teal-500 to-secondary">Instructor Portal</h1>
                <p className="text-slate-600 mt-2">Manage your lectures and track student progress.</p>
            </div>
            <button className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg font-medium shadow-md shadow-primary/20 transition-all">
                + New Upload
            </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 premium-grid">
            <DashboardCard 
                title="Upload Lecture" 
                icon={Upload} 
                description="Upload new video lectures for sign-language conversion." 
                action="Start Upload" 
            />
            <DashboardCard 
                title="Conversion Status" 
                icon={FileVideo} 
                description="Monitor the progress of video-to-sign conversions." 
                status="2 Processing"
                action="View Status" 
            />
            <DashboardCard 
                title="Manage Courses" 
                icon={Layers} 
                description="Organize your lectures into modules and courses." 
                action="Manage" 
            />
             <DashboardCard 
                title="Student Engagement" 
                icon={Users} 
                description="View analytics on student views and completion rates." 
                action="View Analytics" 
            />
             <DashboardCard 
                title="Feedback" 
                icon={MessageSquare} 
                description="Read reviews and feedback from students." 
                action="Read Feedback" 
            />
             <DashboardCard 
                title="My Profile" 
                icon={User} 
                description="Manage your instructor profile and credentials." 
                action="Edit Profile" 
            />
        </div>
      </main>
    </div>
  );
};


export default InstructorDashboard;
