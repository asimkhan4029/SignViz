import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, User, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import AuthLayout from '../components/auth/AuthLayout';
import InputWithIcon from '../components/ui/InputWithIcon';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
    const { signup } = useAuth();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        name: '',
        password: '',
        confirm_password: ''
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
        if (errors[e.target.id]) setErrors({ ...errors, [e.target.id]: null });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});
        setServerError('');

        if (formData.password !== formData.confirm_password) {
            setErrors({ confirm_password: 'Passwords do not match' });
            setLoading(false);
            return;
        }

        const result = await signup(formData);
        if (!result.success) {
            if (result.errors) setErrors(result.errors);
            else setServerError(result.message || 'Something went wrong');
        }
        setLoading(false);
    };

    return (
        <AuthLayout 
            title="Create Account" 
            subtitle="Join SignViz to start your learning journey"
        >
            <form className="space-y-4" onSubmit={handleSubmit}>
                {serverError && (
                    <div className="p-3 bg-red-50 text-red-600 rounded-lg text-xs font-medium flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {serverError}
                    </div>
                )}

                <InputWithIcon 
                    id="username"
                    type="text"
                    label="Username"
                    placeholder="johndoe123"
                    icon={User}
                    value={formData.username}
                    onChange={handleChange}
                />
                
                <InputWithIcon 
                    id="name"
                    type="text"
                    label="Full Name"
                    placeholder="John Doe"
                    icon={User}
                    value={formData.name}
                    onChange={handleChange}
                />
                
                <InputWithIcon 
                    id="email"
                    type="email"
                    label="Email Address"
                    placeholder="name@example.com"
                    icon={Mail}
                    value={formData.email}
                    onChange={handleChange}
                />
                
                <InputWithIcon 
                    id="password"
                    type="password"
                    label="Password"
                    placeholder="Create a password"
                    icon={Lock}
                    value={formData.password}
                    onChange={handleChange}
                />
                
                <InputWithIcon 
                    id="confirm_password"
                    type="password"
                    label="Confirm Password"
                    placeholder="Confirm your password"
                    icon={Lock}
                    value={formData.confirm_password}
                    onChange={handleChange}
                />

                {Object.keys(errors).length > 0 && (
                    <div className="text-red-500 text-[10px] font-bold p-2 bg-red-50 rounded">
                        {Object.values(errors).map((err, i) => <div key={i}>• {err}</div>)}
                    </div>
                )}

                <Button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-2.5 h-auto text-base shadow-lg shadow-primary/20 mt-2 transition-all duration-300 transform active:scale-[0.98]"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                        <>
                            Create Account
                            <CheckCircle className="w-4 h-4 ml-2" />
                        </>
                    )}
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
