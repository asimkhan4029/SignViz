import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Load user from localStorage on startup (mock persistence)
  useEffect(() => {
    const storedUser = localStorage.getItem('signviz_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (credentials = {}) => {
    // Mock login logic
    // In a real app, this would make an API call
    console.log(`Logging in...`);
    
    let userData = {
      name: 'Test Users',
      email: 'user@example.com',
      role: 'user', // Simplified role
      id: '123'
    };

    setUser(userData);
    localStorage.setItem('signviz_user', JSON.stringify(userData));
    
    // Redirect to the main dashboard/profile
    navigate('/student/dashboard');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('signviz_user');
    navigate('/login');
  };

  const updateProfile = (updates) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('signviz_user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    login,
    logout,
    updateProfile,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
