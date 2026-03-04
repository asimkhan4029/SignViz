import { Users, Shield, CreditCard, Bell, FileCheck, Activity } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const DashboardCard = ({ title, icon: Icon, description, alert, action }) => (
  <div className="premium-card bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/20 hover:shadow-xl transition-all hover:-translate-y-1 relative overflow-hidden">
    {alert && (
      <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-bl-lg">
        {alert}
      </div>
    )}
    <div className="flex items-start justify-between mb-4">
      <div className="p-3 bg-primary rounded-lg text-white">
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

const AdminDashboard = () => {
   const { user, logout } = useAuth();
   
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Bar */}
       <nav className="bg-primary text-white px-6 py-4 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
             <Shield className="text-secondary" />
            <span className="text-xl font-bold">SignViz Admin</span>
          </div>
          <div className="flex items-center gap-4">
             <span className="text-sm text-slate-300">Admin: {user?.name}</span>
            <button 
              onClick={logout}
              className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <header className="mb-8">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-teal-500 to-secondary">System Administration</h1>
            <p className="text-slate-600 mt-2">Manage users, content, and platform settings.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 premium-grid">
            <DashboardCard 
                title="User Management" 
                icon={Users} 
                description="Manage student and instructor accounts." 
                action="Manage Users" 
            />
            <DashboardCard 
                title="Content Approval" 
                icon={FileCheck} 
                description="Review and approve uploaded lectures." 
                alert="5 Pending"
                action="Review Requests" 
            />
            <DashboardCard 
                title="Conversion Monitor" 
                icon={Activity} 
                description="Monitor system-wide video conversion processes." 
                action="View Logs" 
            />
            <DashboardCard 
                title="Subscriptions & Revenue" 
                icon={CreditCard} 
                description="Manage revenue sharing and payment settings." 
                action="View Financials" 
            />
             <DashboardCard 
                title="Notifications" 
                icon={Bell} 
                description="Send platform-wide announcements." 
                action="Compose" 
            />
             <DashboardCard 
                title="System Health" 
                icon={Shield} 
                description="Monitor server status and system performance." 
                action="Run Diagnostics" 
            />
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
