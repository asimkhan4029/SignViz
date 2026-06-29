import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Restore session on startup
  useEffect(() => {
    const checkUser = async () => {
      try {
        const response = await fetch('/api/user');
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } catch (err) {
        console.error('Session restoration failed', err);
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  const login = async (username, password) => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
        navigate('/profile');
        return { success: true };
      }
      return { success: false, message: data.message || 'Login failed' };
    } catch {
      return { success: false, message: 'Could not connect to the server. Is the backend running?' };
    }
  };

  const signup = async (formData) => {
    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
        navigate('/profile');
        return { success: true };
      }
      return { success: false, errors: data.errors, message: data.message || 'Signup failed' };
    } catch {
      return { success: false, message: 'Could not connect to the server. Is the backend running?' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout request failed', err);
    }
    setUser(null);
    navigate('/login');
  };

  /**
   * Update the user's display name.
   * Calls PATCH /api/update-profile/ and syncs the returned user into state.
   */
  const updateName = async (name) => {
    try {
      console.log('[updateName] Sending:', { name });
      const response = await fetch('/api/update-profile/', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const data = await response.json();
      console.log('[updateName] Response:', response.status, data);
      if (response.ok) {
        setUser(data.user);
        return { success: true };
      }
      return { success: false, message: data.error || 'Failed to update name' };
    } catch (err) {
      console.error('[updateName] Network error:', err);
      return { success: false, message: 'Network error. Is the backend running?' };
    }
  };

  /**
   * Change the user's password.
   * Calls POST /api/change-password/ with current + new password.
   */
  const changePassword = async (currentPassword, newPassword) => {
    try {
      console.log('[changePassword] Sending request...');
      const response = await fetch('/api/change-password/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
      });
      const data = await response.json();
      console.log('[changePassword] Response:', response.status, data);
      if (response.ok) {
        return { success: true, message: data.message };
      }
      return { success: false, message: data.error || 'Failed to change password' };
    } catch (err) {
      console.error('[changePassword] Network error:', err);
      return { success: false, message: 'Network error. Is the backend running?' };
    }
  };

  /**
   * Upload a new profile avatar.
   * Sends multipart FormData to POST /api/upload-avatar/ and syncs user state.
   */
  const uploadAvatar = async (file) => {
    try {
      console.log('[uploadAvatar] Uploading file:', file.name, file.type, file.size);
      const formData = new FormData();
      formData.append('avatar', file);
      const response = await fetch('/api/upload-avatar/', {
        method: 'POST',
        body: formData, // No Content-Type header — browser sets multipart boundary automatically
      });
      const data = await response.json();
      console.log('[uploadAvatar] Response:', response.status, data);
      if (response.ok) {
        setUser(data.user);
        return { success: true, photoUrl: data.photoUrl };
      }
      return { success: false, message: data.error || 'Failed to upload avatar' };
    } catch (err) {
      console.error('[uploadAvatar] Network error:', err);
      return { success: false, message: 'Network error. Is the backend running?' };
    }
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    updateName,
    changePassword,
    uploadAvatar,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
