import { useState, useRef } from 'react';
import {
  Camera, Save, Lock, User, AlertCircle, CheckCircle2,
  Shield, Key, Upload, Eye, EyeOff, Loader2, X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

// ─── Toast ───────────────────────────────────────────────────────────────────
const Toast = ({ toast }) => {
  if (!toast) return null;
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-full shadow-2xl shadow-[#71A5DE]/30 text-sm font-semibold animate-in slide-in-from-bottom-4 duration-300
      ${toast.type === 'error' ? 'bg-red-500/90 text-white' : 'bg-[#71A5DE] text-white'}`}>
      {toast.type === 'error'
        ? <X className="w-4 h-4 flex-shrink-0" />
        : <CheckCircle2 className="w-4 h-4 flex-shrink-0" />}
      {toast.msg}
    </div>
  );
};

// ─── Settings Page ────────────────────────────────────────────────────────────
const Settings = () => {
  const { user, updateName, changePassword, uploadAvatar } = useAuth();

  // ── Name state ──
  const [name, setName] = useState(user?.name || '');
  const [nameLoading, setNameLoading] = useState(false);
  const [nameError, setNameError] = useState('');

  // ── Password state ──
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [passLoading, setPassLoading] = useState(false);
  const [passMessage, setPassMessage] = useState(null);

  // ── Avatar state ──
  const fileInputRef = useRef(null);
  const [avatarLoading, setAvatarLoading] = useState(false);

  // ── Toast ──
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const showToast = (msg, type = 'success') => {
    clearTimeout(toastTimer.current);
    setToast({ msg, type });
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  };

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleNameUpdate = async (e) => {
    e.preventDefault();
    setNameError('');
    if (!name.trim()) {
      setNameError('Name cannot be empty');
      return;
    }
    setNameLoading(true);
    try {
      const result = await updateName(name.trim());
      if (result.success) {
        showToast('Name updated successfully');
      } else {
        setNameError(result.message);
        showToast(result.message, 'error');
      }
    } finally {
      setNameLoading(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setAvatarLoading(true);
    try {
      const result = await uploadAvatar(file);
      if (result.success) {
        showToast('Profile picture updated');
      } else {
        showToast(result.message, 'error');
      }
    } finally {
      setAvatarLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPassMessage(null);
    if (!passwords.current) {
      setPassMessage({ type: 'error', text: 'Please enter your current password.' });
      return;
    }
    if (passwords.new.length < 6) {
      setPassMessage({ type: 'error', text: 'New password must be at least 6 characters.' });
      return;
    }
    if (passwords.new !== passwords.confirm) {
      setPassMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setPassLoading(true);
    try {
      const result = await changePassword(passwords.current, passwords.new);
      if (result.success) {
        setPassMessage({ type: 'success', text: result.message || 'Password updated successfully!' });
        setPasswords({ current: '', new: '', confirm: '' });
        showToast('Password changed successfully');
      } else {
        setPassMessage({ type: 'error', text: result.message });
      }
    } finally {
      setPassLoading(false);
    }
  };

  const togglePasswordVisibility = (field) =>
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));

  const getInitials = (n) =>
    n ? n.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : 'U';

  return (
    <div className="min-h-screen bg-background font-sans">
      <Toast toast={toast} />

      <div className="max-w-6xl mx-auto py-20 px-6">
        {/* Header */}
        <header className="mb-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 text-primary text-xs font-black uppercase tracking-widest border border-indigo-100">
                <Shield size={14} />
                <span>Account Control</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-none">
                Settings
              </h1>
              <p className="text-text-secondary text-xl font-medium max-w-xl">
                Manage your account preferences, profile visibility, and security settings.
              </p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* ── Left: Avatar ── */}
          <div className="lg:col-span-1">
            <div className="p-10 bg-white border border-slate-200 rounded-[40px] shadow-2xl shadow-slate-200/50 h-full relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-indigo-400" />
              <div className="text-center relative z-10">
                <div className="relative mb-10">
                  <div
                    className="relative group cursor-pointer mx-auto w-48 h-48"
                    onClick={() => !avatarLoading && fileInputRef.current?.click()}
                  >
                    {user?.photoUrl ? (
                      <img
                        src={user.photoUrl}
                        alt={user.name}
                        className="w-full h-full rounded-[40px] object-cover border-4 border-white shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full rounded-[40px] bg-slate-900 flex items-center justify-center border-4 border-white shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-500">
                        <span className="text-6xl font-black text-white">{getInitials(user?.name)}</span>
                      </div>
                    )}

                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60 rounded-[40px] opacity-0 group-hover:opacity-100 transition-all duration-300">
                      {avatarLoading
                        ? <Loader2 className="w-10 h-10 text-white animate-spin" />
                        : <Camera className="w-10 h-10 text-white" />}
                    </div>
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={handleFileChange}
                  />
                </div>

                <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">{user?.name || 'User'}</h2>
                <p className="text-text-secondary text-lg font-medium mb-10">{user?.email || ''}</p>

                <div className="space-y-6 mb-10">
                  <div className="inline-flex items-center gap-3 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-sm font-black uppercase tracking-widest border border-emerald-100">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Verified Account</span>
                  </div>
                </div>

                <Button
                  size="xl"
                  variant="outline"
                  disabled={avatarLoading}
                  className="w-full border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-primary transition-all duration-300 rounded-2xl font-black shadow-sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {avatarLoading
                    ? <><Loader2 className="w-5 h-5 mr-3 animate-spin" /> Uploading...</>
                    : <><Upload className="w-5 h-5 mr-3" /> Update Avatar</>}
                </Button>
              </div>
            </div>
          </div>

          {/* ── Right: Forms ── */}
          <div className="lg:col-span-2 space-y-10">
            {/* Personal Information */}
            <div className="p-10 md:p-12 bg-white border border-slate-200 rounded-[40px] shadow-2xl shadow-slate-200/50">
              <div className="flex items-center gap-5 mb-10">
                <div className="p-4 bg-indigo-50 rounded-2xl">
                  <User className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Personal Information</h2>
                  <p className="text-text-secondary text-base font-medium">Update your public profile display name</p>
                </div>
              </div>

              <form onSubmit={handleNameUpdate} className="space-y-8">
                <div className="space-y-3">
                  <label htmlFor="fullName" className="text-sm font-black text-slate-700 uppercase tracking-widest">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                      <User className="h-6 w-6 text-slate-400" />
                    </div>
                    <input
                      id="fullName"
                      type="text"
                      value={name}
                      onChange={(e) => { setName(e.target.value); setNameError(''); }}
                      className="w-full pl-14 pr-5 py-5 bg-slate-50 border border-slate-200 rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-slate-400 font-bold text-slate-900"
                      placeholder="Enter your full name"
                    />
                  </div>
                  {nameError && (
                    <p className="mt-2 text-sm text-rose-500 font-bold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" /> {nameError}
                    </p>
                  )}
                </div>

                <Button
                  size="xl"
                  type="submit"
                  disabled={nameLoading}
                  className="bg-primary hover:bg-indigo-700 text-white shadow-xl shadow-primary/20 rounded-2xl px-10 font-black"
                >
                  {nameLoading
                    ? <><Loader2 className="w-5 h-5 mr-3 animate-spin" /> Saving...</>
                    : <><Save className="w-5 h-5 mr-3" /> Save Changes</>}
                </Button>
              </form>
            </div>

            {/* Change Password */}
            <div className="p-10 md:p-12 bg-white border border-slate-200 rounded-[40px] shadow-2xl shadow-slate-200/50">
              <div className="flex items-center gap-5 mb-10">
                <div className="p-4 bg-indigo-50 rounded-2xl">
                  <Lock className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Security & Password</h2>
                  <p className="text-text-secondary text-base font-medium">Keep your account secure with a strong password</p>
                </div>
              </div>

              {passMessage && (
                <div className={`p-5 rounded-2xl mb-8 flex items-center gap-4 text-sm font-black uppercase tracking-wider
                  ${passMessage.type === 'error'
                    ? 'bg-rose-50 border border-rose-100 text-rose-600'
                    : 'bg-emerald-50 border border-emerald-100 text-emerald-600'}`}>
                  {passMessage.type === 'error'
                    ? <AlertCircle className="w-6 h-6 flex-shrink-0" />
                    : <CheckCircle2 className="w-6 h-6 flex-shrink-0" />}
                  {passMessage.text}
                </div>
              )}

              <form onSubmit={handlePasswordChange} className="space-y-8">
                {[
                  { id: 'current', label: 'Current Password', placeholder: 'Enter current password' },
                  { id: 'new',     label: 'New Password',     placeholder: 'Min. 8 characters' },
                  { id: 'confirm', label: 'Confirm Password', placeholder: 'Repeat new password' },
                ].map(({ id, label, placeholder }) => (
                  <div key={id} className="space-y-3">
                    <label htmlFor={`pass-${id}`} className="text-sm font-black text-slate-700 uppercase tracking-widest">
                      {label}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                        <Lock className="h-6 w-6 text-slate-400" />
                      </div>
                      <input
                        id={`pass-${id}`}
                        type={showPasswords[id] ? 'text' : 'password'}
                        value={passwords[id]}
                        onChange={(e) => {
                          setPasswords(p => ({ ...p, [id]: e.target.value }));
                          setPassMessage(null);
                        }}
                        className="w-full pl-14 pr-14 py-5 bg-slate-50 border border-slate-200 rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-slate-400 font-bold text-slate-900"
                        placeholder={placeholder}
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility(id)}
                        className="absolute inset-y-0 right-0 pr-5 flex items-center"
                        tabIndex={-1}
                      >
                        {showPasswords[id]
                          ? <EyeOff className="h-6 w-6 text-slate-400 hover:text-primary transition-colors" />
                          : <Eye className="h-6 w-6 text-slate-400 hover:text-primary transition-colors" />}
                      </button>
                    </div>
                  </div>
                ))}

                <Button
                  size="xl"
                  type="submit"
                  disabled={passLoading}
                  className="w-full bg-slate-900 hover:bg-black text-white shadow-xl shadow-slate-900/10 rounded-2xl font-black py-6"
                >
                  {passLoading
                    ? <><Loader2 className="w-5 h-5 mr-3 animate-spin" /> Processing...</>
                    : <><Key className="w-5 h-5 mr-3" /> Update Security Credentials</>}
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Security Tips */}
        <div className="mt-20 p-10 bg-indigo-50 border border-indigo-100 rounded-[40px] relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          <div className="flex flex-col md:flex-row items-start gap-8 relative z-10">
            <div className="p-5 bg-white rounded-2xl shadow-sm border border-indigo-100">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Security Recommendations</h3>
              <ul className="grid md:grid-cols-2 gap-4">
                {[
                  'Use a strong, unique password for SignViz',
                  'Ensure your password has 8+ characters',
                  'Include mixed case, numbers & symbols',
                  'Update your security details periodically',
                ].map((tip, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-700 font-bold text-base">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;