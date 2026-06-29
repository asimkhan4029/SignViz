import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, LogIn } from 'lucide-react';
import { Button } from '../components/ui/Button';
import AuthLayout from '../components/auth/AuthLayout';
import InputWithIcon from '../components/ui/InputWithIcon';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const { login } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.id]: e.target.value });
        setError('');
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        
        const result = await login(credentials.username, credentials.password);
        if (!result.success) {
            setError(result.message);
        }
        setIsLoading(false);
    };

    return (
        <AuthLayout 
            title="Welcome Back"
            subtitle="Sign in to continue your learning journey"
        >
            <form className="space-y-5" onSubmit={handleLogin}>
                {error && (
                    <div className="p-3 bg-red-50 text-red-600 rounded-lg text-xs font-medium">
                        {error}
                    </div>
                )}

                <InputWithIcon 
                    id="username"
                    type="text"
                    label="Username"
                    placeholder="johndoe123"
                    icon={Mail}
                    value={credentials.username}
                    onChange={handleChange}
                />
                
                <div className="space-y-1">
                    <InputWithIcon 
                        id="password"
                        type="password"
                        label="Password"
                        placeholder="••••••••"
                        icon={Lock}
                        value={credentials.password}
                        onChange={handleChange}
                    />
                    <div className="flex justify-between items-center pt-1">
                        <label className="flex items-center text-sm text-gray-500 cursor-pointer">
                            <input type="checkbox" className="mr-2 rounded border-gray-300 text-primary focus:ring-primary/20" />
                            Remember me
                        </label>
                        <Link to="/forgot-password" className="text-xs font-medium text-primary hover:text-primary/80 hover:underline transition-colors">
                            Forgot password?
                        </Link>
                    </div>
                </div>

                <Button 
                    disabled={isLoading}
                    className="w-full text-white font-semibold py-2.5 h-auto text-base shadow-lg transition-all duration-300 transform active:scale-[0.98] bg-primary hover:bg-primary/90 shadow-primary/20"
                >
                    {isLoading ? 'Signing In...' : 'Sign In'}
                    {!isLoading && <LogIn className="w-4 h-4 ml-2" />}
                </Button>
            </form>
            
            <div className="mt-8 text-center text-sm text-gray-500">
                New to SignViz?{' '}
                <Link to="/signup" className="font-semibold text-primary hover:text-primary/80 hover:underline transition-colors">
                    Create an account
                </Link>
            </div>
        </AuthLayout>
    );
};

export default Login;
