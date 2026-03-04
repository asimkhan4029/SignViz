import { Routes, Route, Navigate } from 'react-router-dom';
import RootLayout from './layouts/RootLayout';
import LandingPage from './pages/LandingPage';
import Library from './pages/Library';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Unauthorized from './pages/Unauthorized';
// import dashboards removed
import UserProfile from './pages/UserProfile';
import UploadPage from './pages/Upload';
import Settings from './pages/Settings';
import Learning from './pages/Learning';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<RootLayout />}>
          <Route path="/" element={<LandingPage />} />
          {/* Public or Semi-Public Routes - Library might need protection in future but kept as is for now based on request */}

          <Route path="/unauthorized" element={<Unauthorized />} />
        </Route>
        
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Routes */}
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/student/dashboard" 
          element={<Navigate to="/profile" replace />} // Redirect old link to new profile
        />
        
        <Route 
          path="/upload" 
          element={
            <ProtectedRoute>
              <UploadPage /> {/* Assuming UploadPage is the component name, need to check import */}
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
        <Route path="/library" element={<Library />} />
        <Route path="/watch/:id" element={<Learning />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
