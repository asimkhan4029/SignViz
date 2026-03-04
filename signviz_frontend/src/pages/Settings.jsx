import { useState, useRef } from 'react';
import { Camera, Save, Lock, User, AlertCircle, CheckCircle2, Shield, Key, Upload, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import InputWithIcon from '../components/ui/InputWithIcon';

const Settings = () => {
    const { user, updateProfile } = useAuth();
    
    // Name State
    const [name, setName] = useState(user?.name || '');
    const [nameLoading, setNameLoading] = useState(false);

    // Password State
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
    const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
    const [passMessage, setPassMessage] = useState(null);

    // Avatar State
    const fileInputRef = useRef(null);

    // --- Handlers ---

    const handleNameUpdate = async (e) => {
        e.preventDefault();
        setNameLoading(true);
        setTimeout(() => {
            updateProfile({ name });
            setNameLoading(false);
        }, 800);
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                updateProfile({ photoUrl: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePasswordChange = (e) => {
        e.preventDefault();
        setPassMessage(null);

        if (passwords.new !== passwords.confirm) {
            setPassMessage({ type: 'error', text: 'New passwords do not match.' });
            return;
        }

        if (passwords.new.length < 6) {
             setPassMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
             return;
        }

        setPassMessage({ type: 'success', text: 'Password updated successfully!' });
        setPasswords({ current: '', new: '', confirm: '' });
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const getInitials = (name) => name ? name.charAt(0).toUpperCase() : 'U';

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
                </div>
            </nav>

            <div className="max-w-6xl mx-auto py-8 px-4 md:px-6">
                {/* Header */}
                <header className="mb-10">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-3 bg-gradient-to-br from-primary to-secondary rounded-2xl shadow-md">
                            <User className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-teal-500 to-secondary">Profile Settings</h1>
                            <p className="text-slate-600 mt-2">Manage your account preferences and security</p>
                        </div>
                    </div>
                    <div className="h-1 w-20 bg-gradient-to-r from-primary to-secondary rounded-full mt-4"></div>
                </header>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 premium-grid">
                    {/* Left Column - Profile Picture */}
                    <div className="lg:col-span-1">
                        <Card className="p-8 bg-white/50 backdrop-blur-sm border border-white/50 shadow-xl rounded-3xl h-full premium-card">
                            <div className="text-center">
                                <div className="relative mb-6">
                                    <div className="relative group cursor-pointer mx-auto w-40 h-40" onClick={() => fileInputRef.current?.click()}>
                                        {user?.photoUrl ? (
                                            <img 
                                                src={user.photoUrl} 
                                                alt={user.name} 
                                                className="w-full h-full rounded-full object-cover border-4 border-white shadow-2xl"
                                            />
                                        ) : (
                                            <div className="w-full h-full rounded-full bg-highlight flex items-center justify-center border-4 border-white shadow-2xl">
                                                <span className="text-5xl font-bold bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent">
                                                    {getInitials(user?.name)}
                                                </span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 rounded-full bg-primary/20 -z-10 animate-pulse"></div>
                                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-black/60 to-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300">
                                            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-full">
                                                <Camera className="text-white w-8 h-8" />
                                            </div>
                                        </div>
                                    </div>
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        className="hidden" 
                                        accept="image/png, image/jpeg, image/jpg" 
                                        onChange={handleFileChange}
                                    />
                                </div>

                                <h2 className="text-2xl font-bold text-slate-900 mb-2">{user?.name || 'User'}</h2>
                                <p className="text-slate-600 mb-6">{user?.email || 'user@example.com'}</p>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                                        <Shield className="w-4 h-4 text-emerald-500" />
                                        <span>Account Verified</span>
                                    </div>
                                    <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                                        <Key className="w-4 h-4 text-amber-500" />
                                        <span>Premium Member</span>
                                    </div>
                                </div>

                                <Button 
                                    variant="outline"
                                    className="mt-8 w-full border-muted/50 hover:border-primary/50 hover:bg-highlight transition-all duration-300"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <Upload className="w-4 h-4 mr-2" />
                                    Upload New Avatar
                                </Button>
                            </div>
                        </Card>
                    </div>

                    {/* Right Column - Forms */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Personal Information Card */}
                        <Card className="p-8 bg-white/50 backdrop-blur-sm border border-white/50 shadow-xl rounded-3xl premium-card">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-3 bg-highlight rounded-xl">
                                    <User className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900">Personal Information</h2>
                                    <p className="text-slate-600 text-sm">Update your name and personal details</p>
                                </div>
                            </div>
                            
                            <form onSubmit={handleNameUpdate}>
                                <div className="max-w-md">
                                    <div className="space-y-6">
                                        <div>
                                            <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-2">
                                                Full Name
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <User className="h-5 w-5 text-slate-400" />
                                                </div>
                                                <input
                                                    id="fullName"
                                                    type="text"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    className="block w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl bg-white/50 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
                                                    placeholder="Enter your full name"
                                                />
                                            </div>
                                        </div>
                                        
                                        <Button 
                                            type="submit" 
                                            disabled={nameLoading}
                                            className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
                                        >
                                            {nameLoading ? (
                                                <span className="flex items-center">
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                                    Saving...
                                                </span>
                                            ) : (
                                                <span className="flex items-center">
                                                    <Save className="w-4 h-4 mr-2" />
                                                    Save Changes
                                                </span>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        </Card>

                        {/* Change Password Card */}
                        <Card className="p-8 bg-white/50 backdrop-blur-sm border border-white/50 shadow-xl rounded-3xl premium-card">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-3 bg-highlight rounded-xl">
                                    <Lock className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900">Change Password</h2>
                                    <p className="text-slate-600 text-sm">Update your password for enhanced security</p>
                                </div>
                            </div>

                            {passMessage && (
                                <div className={`p-4 rounded-xl mb-6 flex items-center gap-3 ${
                                    passMessage.type === 'error' 
                                        ? 'bg-gradient-to-r from-red-50 to-red-100 border border-red-200 text-red-700' 
                                        : 'bg-gradient-to-r from-emerald-50 to-green-100 border border-emerald-200 text-emerald-700'
                                }`}>
                                    {passMessage.type === 'error' ? (
                                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                    ) : (
                                        <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                                    )}
                                    <span className="font-medium">{passMessage.text}</span>
                                </div>
                            )}
                            
                            <form onSubmit={handlePasswordChange} className="max-w-md">
                                <div className="space-y-6">
                                    <div>
                                        <label htmlFor="currentPass" className="block text-sm font-medium text-slate-700 mb-2">
                                            Current Password
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Lock className="h-5 w-5 text-slate-400" />
                                            </div>
                                            <input
                                                id="currentPass"
                                                type={showPasswords.current ? "text" : "password"}
                                                value={passwords.current}
                                                onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                                                className="block w-full pl-10 pr-12 py-3 border border-slate-200 rounded-xl bg-white/50 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                                                placeholder="Enter current password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => togglePasswordVisibility('current')}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                            >
                                                {showPasswords.current ? (
                                                    <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                                                ) : (
                                                    <Eye className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="newPass" className="block text-sm font-medium text-slate-700 mb-2">
                                            New Password
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Lock className="h-5 w-5 text-slate-400" />
                                            </div>
                                            <input
                                                id="newPass"
                                                type={showPasswords.new ? "text" : "password"}
                                                value={passwords.new}
                                                onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                                                className="block w-full pl-10 pr-12 py-3 border border-slate-200 rounded-xl bg-white/50 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                                                placeholder="Enter new password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => togglePasswordVisibility('new')}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                            >
                                                {showPasswords.new ? (
                                                    <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                                                ) : (
                                                    <Eye className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="confirmPass" className="block text-sm font-medium text-slate-700 mb-2">
                                            Confirm New Password
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Lock className="h-5 w-5 text-slate-400" />
                                            </div>
                                            <input
                                                id="confirmPass"
                                                type={showPasswords.confirm ? "text" : "password"}
                                                value={passwords.confirm}
                                                onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                                                className="block w-full pl-10 pr-12 py-3 border border-slate-200 rounded-xl bg-white/50 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                                                placeholder="Confirm new password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => togglePasswordVisibility('confirm')}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                            >
                                                {showPasswords.confirm ? (
                                                    <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                                                ) : (
                                                    <Eye className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <Button 
                                        type="submit"
                                        className="w-full bg-secondary hover:bg-secondary/90 text-white shadow-lg shadow-secondary/20 hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
                                    >
                                        <Lock className="w-4 h-4 mr-2" />
                                        Update Password
                                    </Button>
                                </div>
                            </form>
                        </Card>
                    </div>
                </div>

                {/* Security Tips */}
                <div className="mt-12 p-6 bg-highlight/50 border border-white rounded-2xl">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-white rounded-xl shadow-sm">
                            <Shield className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">Security Tips</h3>
                            <ul className="text-slate-600 space-y-2 text-sm">
                                <li className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                                    Use a strong password with at least 8 characters
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                                    Include numbers, uppercase and lowercase letters
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                                    Avoid using personal information in your password
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;