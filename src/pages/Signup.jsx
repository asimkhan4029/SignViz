import { Link } from 'react-router-dom';
import { Mail, Lock, User, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import AuthLayout from '../components/auth/AuthLayout';
import InputWithIcon from '../components/ui/InputWithIcon';

const Signup = () => {
    return (
        <AuthLayout 
            title="Create Account" 
            subtitle="Join SignViz to start your learning journey"
        >
            <form className="space-y-4">
                <InputWithIcon 
                    id="fullname"
                    type="text"
                    label="Full Name"
                    placeholder="John Doe"
                    icon={User}
                />
                
                <InputWithIcon 
                    id="email"
                    type="email"
                    label="Email Address"
                    placeholder="name@example.com"
                    icon={Mail}
                />
                
                <InputWithIcon 
                    id="password"
                    type="password"
                    label="Password"
                    placeholder="Create a password"
                    icon={Lock}
                />
                
                <InputWithIcon 
                    id="confirm_password"
                    type="password"
                    label="Confirm Password"
                    placeholder="Confirm your password"
                    icon={Lock}
                />

                <Button className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-2.5 h-auto text-base shadow-lg shadow-primary/20 mt-2 transition-all duration-300 transform active:scale-[0.98]">
                    Create Account
                    <CheckCircle className="w-4 h-4 ml-2" />
                </Button>
            </form>

            <div className="mt-8 text-center text-sm text-gray-500">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-primary hover:text-primary/80 hover:underline transition-colors">
                    Sign in here
                </Link>
            </div>
        </AuthLayout>
    );
};

export default Signup;
