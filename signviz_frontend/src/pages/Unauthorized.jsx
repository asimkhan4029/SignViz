import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h1 className="text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-primary via-teal-500 to-secondary">Access Denied</h1>
        <p className="text-slate-600 mb-8">
          You do not have permission to access this page. Please contact your administrator if you believe this is a mistake.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium transition-colors"
          >
            Go Back
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
