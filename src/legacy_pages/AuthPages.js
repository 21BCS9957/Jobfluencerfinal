'use client';

import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { ArrowLeft, Building2, UserCircle, Eye, EyeOff } from 'lucide-react';

const CITIES = [
    "Mumbai", "Delhi", "Bangalore", "Chennai", "Hyderabad", 
    "Kolkata", "Pune", "Jaipur", "Ahmedabad", "Lucknow",
    "Chandigarh", "Goa", "Kochi", "Indore", "Surat"
];

export const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const user = await login(email, password);
            toast.success('Welcome back!');
            navigate(user.role === 'brand' ? '/dashboard/brand' : '/dashboard/influencer');
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-6 text-sm font-medium tracking-wide hover:opacity-70 transition-opacity" data-testid="back-btn">
                    <ArrowLeft className="w-4 h-4" />
                    BACK
                </button>

                <Link to="/" className="flex items-center gap-2 mb-8 justify-center">
                    <span className="text-sm font-bold tracking-tight">JOBFLUENCER</span>
                </Link>

                <h2 className="text-2xl font-bold text-center mb-8">Log in</h2>

                {/* Social Login */}
                <div className="space-y-3 mb-6">
                    <button
                        type="button"
                        className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg py-3 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        data-testid="google-login-btn"
                        onClick={() => toast.info('Google login coming soon')}
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        Continue with Google
                    </button>
                    <button
                        type="button"
                        className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg py-3 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        data-testid="facebook-login-btn"
                        onClick={() => toast.info('Facebook login coming soon')}
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                        Continue with Facebook
                    </button>
                </div>

                <div className="flex items-center gap-4 mb-6">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-sm font-bold text-gray-500">OR</span>
                    <div className="flex-1 h-px bg-gray-200" />
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        className="border-gray-300 rounded-lg"
                        required
                        data-testid="login-email-input"
                    />
                    <div className="relative">
                        <Input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            className="border-gray-300 rounded-lg pr-10"
                            required
                            data-testid="login-password-input"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                    </div>
                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-black text-white hover:bg-gray-800 text-sm font-semibold py-5 rounded-lg disabled:opacity-50"
                        data-testid="login-submit-btn"
                    >
                        {loading ? <span className="loader" /> : 'Log in'}
                    </Button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-500">
                    Don&apos;t have an account?{' '}
                    <Link to="/register" className="text-black font-semibold hover:underline">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
};

export const RegisterPage = () => {
    const [searchParams] = useSearchParams();
    const roleFromUrl = searchParams.get('role');
    const navigate = useNavigate();

    // If no role selected yet, show role selection screen
    if (!roleFromUrl) {
        return (
            <div className="min-h-screen bg-white flex flex-col px-4 py-8 sm:px-6">
                <div className="w-full max-w-md mx-auto">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-10 text-sm font-medium tracking-wide hover:opacity-70 transition-opacity" data-testid="back-btn">
                        <ArrowLeft className="w-4 h-4" />
                        BACK
                    </button>

                    <h1 className="text-3xl sm:text-4xl font-bold mb-2">Create Account</h1>
                    <p className="text-gray-400 text-base mb-10">Choose how you want to use Jobfluencer</p>

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => navigate('/register?role=brand')}
                            className="border border-gray-200 rounded-xl p-6 text-left hover:border-black transition-colors group"
                            data-testid="role-brand-btn"
                        >
                            <Building2 className="w-7 h-7 mb-4 text-gray-700" />
                            <p className="font-bold text-lg mb-1">Hire</p>
                            <p className="text-sm text-gray-400">Post jobs & hire influencers</p>
                        </button>
                        <button
                            onClick={() => navigate('/register?role=creator')}
                            className="border border-gray-200 rounded-xl p-6 text-left hover:border-black transition-colors group"
                            data-testid="role-creator-btn"
                        >
                            <UserCircle className="w-7 h-7 mb-4 text-gray-700" />
                            <p className="font-bold text-lg mb-1">Get Hired & Earn Money</p>
                            <p className="text-sm text-gray-400">Find work & grow your career</p>
                        </button>
                    </div>

                    <p className="mt-10 text-center text-sm text-gray-500">
                        Already have an account?{' '}
                        <Link to="/login" className="text-black font-semibold hover:underline">Log in</Link>
                    </p>
                </div>
            </div>
        );
    }

    // Role is selected — show signup form
    return <RegisterForm defaultRole={roleFromUrl} />;
};

const RegisterForm = ({ defaultRole }) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: defaultRole,
        city: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!agreedToTerms) {
            toast.error('Please agree to the terms and privacy policy');
            return;
        }
        if (!formData.city) {
            toast.error('Please select your city');
            return;
        }
        
        setLoading(true);
        try {
            const user = await register({
                name: `${formData.firstName} ${formData.lastName}`.trim(),
                email: formData.email,
                password: formData.password,
                role: formData.role,
                city: formData.city
            });
            toast.success('Account created successfully!');
            navigate(user.role === 'brand' ? '/onboarding/brand' : '/onboarding/creator');
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const roleLabel = formData.role === 'brand' ? 'a Brand' : 'a Creator';

    return (
        <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                <button onClick={() => navigate('/register')} className="flex items-center gap-2 mb-6 text-sm font-medium tracking-wide hover:opacity-70 transition-opacity" data-testid="back-to-role-btn">
                    <ArrowLeft className="w-4 h-4" />
                    BACK
                </button>
                <Link to="/" className="flex items-center gap-2 mb-8 justify-center">
                    <span className="text-sm font-bold tracking-tight">JOBFLUENCER</span>
                </Link>
                
                <h2 className="text-2xl font-bold text-center mb-8">Sign up</h2>

                {/* Social Login Buttons */}
                <div className="space-y-3 mb-6">
                    <button
                        type="button"
                        className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg py-3 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        data-testid="google-signup-btn"
                        onClick={() => toast.info('Google sign-up coming soon')}
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        Continue with Google
                    </button>
                    <button
                        type="button"
                        className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg py-3 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        data-testid="facebook-signup-btn"
                        onClick={() => toast.info('Facebook sign-up coming soon')}
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                        Continue with Facebook
                    </button>
                </div>

                {/* OR Divider */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-sm font-bold text-gray-500">OR</span>
                    <div className="flex-1 h-px bg-gray-200" />
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <Input
                            type="text"
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            placeholder="First Name"
                            className="border-gray-300 rounded-lg"
                            required
                            data-testid="register-firstname-input"
                        />
                        <Input
                            type="text"
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            placeholder="Last Name"
                            className="border-gray-300 rounded-lg"
                            required
                            data-testid="register-lastname-input"
                        />
                    </div>
                    <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="Email"
                        className="border-gray-300 rounded-lg"
                        required
                        data-testid="register-email-input"
                    />
                    <div className="relative">
                        <Input
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder="Password"
                            className="border-gray-300 rounded-lg pr-10"
                            minLength={6}
                            required
                            data-testid="register-password-input"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            data-testid="toggle-password-btn"
                        >
                            {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                    </div>
                    <Select 
                        value={formData.city} 
                        onValueChange={(value) => setFormData({ ...formData, city: value })}
                    >
                        <SelectTrigger className="border-gray-300 rounded-lg" data-testid="register-city-select">
                            <SelectValue placeholder="Select your city" />
                        </SelectTrigger>
                        <SelectContent>
                            {CITIES.map(city => (
                                <SelectItem key={city} value={city}>{city}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Terms Checkbox */}
                    <div className="flex items-start gap-3 pt-2">
                        <input
                            type="checkbox"
                            checked={agreedToTerms}
                            onChange={(e) => setAgreedToTerms(e.target.checked)}
                            className="mt-1 w-4 h-4 rounded border-gray-300 accent-black"
                            data-testid="terms-checkbox"
                        />
                        <p className="text-sm text-gray-600">
                            I agree to the Jobfluencer{' '}
                            <a href="#" className="text-blue-600 underline">User Agreement</a>{' '}
                            and{' '}
                            <a href="#" className="text-blue-600 underline">Privacy Policy</a>.
                        </p>
                    </div>

                    <Button
                        type="submit"
                        disabled={loading || !agreedToTerms}
                        className="w-full bg-black text-white hover:bg-gray-800 text-sm font-semibold py-5 rounded-lg disabled:opacity-50"
                        data-testid="register-submit-btn"
                    >
                        {loading ? <span className="loader" /> : 'Join Jobfluencer'}
                    </Button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-500">
                    Already have an account?{' '}
                    <Link to="/login" className="text-black font-semibold hover:underline">
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    );
};
