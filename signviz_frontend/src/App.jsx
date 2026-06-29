import { Routes, Route, Navigate } from 'react-router-dom';
import RootLayout from './layouts/RootLayout';
import LandingPage from './pages/LandingPage';
import Library from './pages/Library';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Unauthorized from './pages/Unauthorized';
import UserProfile from './pages/UserProfile';
import UploadPage from './pages/Upload';
import Settings from './pages/Settings';
import Learning from './pages/Learning';
import { AuthProvider } from './context/AuthContext';
import { LibraryProvider } from './context/LibraryContext';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <LibraryProvider>
      <Routes>
        {/* All routes share the RootLayout (Navbar + Footer) */}
        <Route element={<RootLayout />}>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/library" element={<Library />} />
          <Route path="/watch/:id" element={<Learning />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Auth routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected routes */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/upload"
            element={
              <ProtectedRoute>
                <UploadPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />

          {/* Legacy redirect */}
          <Route path="/student/dashboard" element={<Navigate to="/profile" replace />} />
        </Route>
      </Routes>
      </LibraryProvider>
    </AuthProvider>
  );
}

export default App;
