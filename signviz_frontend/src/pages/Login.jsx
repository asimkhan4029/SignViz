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

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate network delay
        setTimeout(async () => {
            await login();
            setIsLoading(false);
        }, 800);
    };

    return (
        <AuthLayout 
            title="Welcome Back"
            subtitle="Sign in to continue your learning journey"
        >
            <form className="space-y-5" onSubmit={handleLogin}>
                <InputWithIcon 
                    id="email"
                    type="email"
                    label="Email Address"
                    placeholder="name@example.com"
                    icon={Mail}
                />
                
                <div className="space-y-1">
                    <InputWithIcon 
                        id="password"
                        type="password"
                        label="Password"
                        placeholder="••••••••"
                        icon={Lock}
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
