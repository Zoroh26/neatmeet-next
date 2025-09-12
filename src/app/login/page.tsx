// Migrated from src/app/pages/LoginPage.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { FaEnvelope, FaLock, FaSignInAlt, FaRocket, FaUsers, FaCalendarAlt, FaClock, FaChartBar, FaCog, FaEye, FaEyeSlash } from 'react-icons/fa';
import { MdSecurity, MdMeetingRoom, MdSchedule } from 'react-icons/md';
// Removed legacy useAuth import
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';

interface LoginFormData {
    email: string;
    password: string;
}

const classes = {
    Container: 'min-h-screen bg-white flex items-center justify-center relative overflow-hidden',
    BackgroundElements: 'absolute inset-0 pointer-events-none',
    BgShape1: 'absolute top-20 left-20 w-16 h-16 bg-red-500 border-4 border-black transform rotate-45 opacity-30',
    BgShape2: 'absolute bottom-32 right-32 w-12 h-20 bg-red-500 border-4 border-black transform -rotate-12 opacity-25',
    
    // Main Content Container
    ContentContainer: 'flex items-stretch gap-8 relative z-10 w-full max-w-7xl px-8',
    
    // Left Box - Welcome Text with Icons (60% width)
    WelcomeBox: 'hidden lg:flex lg:w-3/5 bg-white border-4 border-black rounded-none p-12 shadow-[12px_12px_0px_0px_#000] hover:shadow-[16px_16px_0px_0px_#000] transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-300 flex-col justify-center items-center text-center',
    WelcomeHeader: 'mb-2',
    WelcomeTitle: 'text-5xl font-black text-black uppercase tracking-wider mb-4 transform -skew-x-3',
    WelcomeBrand: 'text-6xl font-black text-red-500 uppercase tracking-wider mb-2 transform skew-x-3 -mt-2',
    WelcomeSubtitle: 'text-lg font-bold text-white bg-red-500 border-3 border-black px-6 py-3 inline-block transform rotate-2 shadow-[3px_3px_0px_0px_#000] mb-8',
    WelcomeDescription: 'text-base font-bold text-gray-700 uppercase tracking-wide max-w-md',
    
    // Icon Decorations
    IconGrid: 'grid grid-cols-3 gap-6 mt-2 w-full max-w-md',
    IconCard: 'bg-red-500 border-4 border-black p-6 flex flex-col items-center justify-center shadow-[6px_6px_0px_0px_#000] hover:shadow-[8px_8px_0px_0px_#000] transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200 cursor-pointer',
    IconCardAlt: 'bg-black border-4 border-red-500 p-6 flex flex-col items-center justify-center shadow-[6px_6px_0px_0px_#ef4444] hover:shadow-[8px_8px_0px_0px_#ef4444] transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200 cursor-pointer',
    IconText: 'text-white text-xs font-black uppercase tracking-wide mt-2 text-center',
    
    // Floating Icons
    FloatingIcons: 'absolute inset-0 pointer-events-none',
    FloatingIcon1: 'absolute top-8 right-12 text-red-500 opacity-60 transform rotate-12',
    FloatingIcon2: 'absolute bottom-8 left-12 text-black opacity-40 transform -rotate-12',
    FloatingIcon3: 'absolute top-1/2 right-8 text-red-500 opacity-30 transform rotate-45',
    
    // Right Box - Login Form (40% width)
    FormContainer: 'w-full lg:w-2/5 bg-white border-4 border-black rounded-none p-8 shadow-[12px_12px_0px_0px_#000] hover:shadow-[16px_16px_0px_0px_#000] transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-center',
    
    // Mobile Header
    MobileHeader: 'lg:hidden text-center mb-8',
    MobileTitle: 'text-4xl font-black text-black uppercase tracking-wider mb-4 transform -skew-x-3',
    MobileBrand: 'text-5xl font-black text-red-500 uppercase tracking-wider mb-4 transform skew-x-3',
    MobileSubtitle: 'text-base font-bold text-gray-700 uppercase tracking-wide',
    
    Header: 'text-center mb-8',
    Title: 'text-4xl font-black text-black uppercase tracking-wider mb-4 transform -skew-x-3',
    Subtitle: 'text-lg font-bold text-white bg-red-500 border-3 border-black px-4 py-2 inline-block transform shadow-[3px_3px_0px_0px_#000]',
    Form: 'space-y-6 flex-1',
    InputGroup: 'space-y-2',
    Label: 'text-black text-sm font-black uppercase tracking-widest flex items-center',
    InputContainer: 'relative',
    Input: 'w-full px-12 py-4 bg-gray-50 border-4 border-black rounded-none text-black font-bold placeholder-gray-500 focus:outline-none focus:bg-white focus:border-red-500 transition-all duration-200',
    InputIcon: 'absolute left-4 top-1/2 transform -translate-y-1/2 text-black text-xl',
    PasswordToggle: 'absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-black cursor-pointer text-xl transition-colors duration-200',
    SubmitButton: 'w-full bg-red-500 hover:bg-red-600 border-4 border-black text-white font-black py-4 px-6 uppercase tracking-widest text-lg shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] transform hover:-translate-x-1 hover:-translate-y-1 active:translate-x-0 active:translate-y-0 active:shadow-[2px_2px_0px_0px_#000] transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-red-300',
    ErrorMessage: 'text-red-600 bg-red-100 border-2 border-red-500 px-3 py-2 text-sm font-bold uppercase tracking-wide transform mt-1',
};

const LoginForm: React.FC = () => {
    const [formData, setFormData] = useState<LoginFormData>({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();
    const { user, isLoggedIn, hasHydrated, login } = useAuthStore();
    const [errors, setErrors] = useState<Partial<LoginFormData>>({});
    const [loginError, setLoginError] = useState('');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Initialize store from session on mount
    // checkSession is now called globally in ClientLayout

    // Show redirect message for authenticated users, but don't auto-redirect
    

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name as keyof LoginFormData]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
        setLoginError('');
    };

    const validateForm = (): boolean => {
        const newErrors: Partial<LoginFormData> = {};
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required!';
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Invalid email format!';
        }
        if (!formData.password.trim()) {
            newErrors.password = 'Password is required!';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!validateForm()) {
            return;
        }
        try {
            await login(formData);
            // After successful login, redirect based on password status
            if (useAuthStore.getState().user?.isInitialPassword) {
                router.push('/changepassword');
            } else {
                router.push('/');
            }
        } catch (error: any) {
            let errorMessage = 'Login failed. Please try again.';
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.status === 401) {
                errorMessage = 'Invalid email or password';
            } else if (error.response?.status === 404) {
                errorMessage = 'User not found';
            } else if (error.response?.status === 500) {
                errorMessage = 'Server error. Please try again later.';
            } else if (error.message) {
                errorMessage = error.message;
            }
            setLoginError(errorMessage);
            console.error('Login failed:', error);
        }
    };

    return (
        <div className={classes.Container}>
            {/* Background decorative elements */}
            <div className={classes.BackgroundElements}>
                <div className={classes.BgShape1}></div>
                <div className={classes.BgShape2}></div>
            </div>

            <div className={classes.ContentContainer}>
                {/* Left Box - Welcome Text with Icon Decorations */}
                <div className={classes.WelcomeBox}>
                    {/* Floating Icons */}
                    <div className={classes.FloatingIcons}>
                        <FaCog className={classes.FloatingIcon1} size={24} />
                        <FaChartBar className={classes.FloatingIcon2} size={20} />
                        <FaClock className={classes.FloatingIcon3} size={16} />
                    </div>

                    <div className={classes.WelcomeHeader}>
                        <h1 className={classes.WelcomeTitle}>WELCOME TO</h1>
                        <h2 className={classes.WelcomeBrand}>NEATMEET</h2>
                        <p className={classes.WelcomeDescription}>
                            ORGANIZING MEETINGS MADE EASIER
                        </p>
                    </div>

                    {/* Icon Grid */}
                    <div className={classes.IconGrid}>
                        <div className={classes.IconCard}>
                            <FaRocket size={32} className="text-white" />
                            <span className={classes.IconText}>FAST</span>
                        </div>
                        <div className={classes.IconCardAlt}>
                            <FaUsers size={32} className="text-white" />
                            <span className={classes.IconText}>TEAMS</span>
                        </div>
                        <div className={classes.IconCard}>
                            <FaCalendarAlt size={32} className="text-white" />
                            <span className={classes.IconText}>SCHEDULE</span>
                        </div>
                        <div className={classes.IconCardAlt}>
                            <MdMeetingRoom size={32} className="text-white" />
                            <span className={classes.IconText}>ROOMS</span>
                        </div>
                        <div className={classes.IconCard}>
                            <MdSchedule size={32} className="text-white" />
                            <span className={classes.IconText}>ORGANIZE</span>
                        </div>
                        <div className={classes.IconCardAlt}>
                            <FaChartBar size={32} className="text-white" />
                            <span className={classes.IconText}>TRACK</span>
                        </div>
                    </div>
                </div>

                {/* Right Box - Login Form */}
                <div className={classes.FormContainer}>
                    {/* Mobile Header */}
                    <div className={classes.MobileHeader}>
                        <h1 className={classes.MobileTitle}>WELCOME TO</h1>
                        <h2 className={classes.MobileBrand}>NEATMEET</h2>
                        <p className={classes.MobileSubtitle}>
                            ORGANIZING MEETINGS MADE EASIER
                        </p>
                    </div>

                    {/* Header */}
                    <div className={classes.Header}>
                        <h1 className={classes.Title}>LOGIN</h1>
                        <p className={classes.Subtitle}>
                            <MdSecurity className="inline mr-2" />
                            SECURE ACCESS
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className={classes.Form}>
                        {/* Email Input */}
                        <div className={classes.InputGroup}>
                            <label htmlFor="email" className={classes.Label}>
                                <FaEnvelope className="mr-2" />
                                EMAIL
                            </label>
                            <div className={classes.InputContainer}>
                                <FaEnvelope className={classes.InputIcon} />
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="Enter the email"
                                    className={classes.Input}
                                    autoComplete="email"
                                />
                            </div>
                            {errors.email && <div className={classes.ErrorMessage}>{errors.email}</div>}
                        </div>

                        {/* Password Input */}
                        <div className={classes.InputGroup}>
                            <label htmlFor="password" className={classes.Label}>
                                <FaLock className="mr-2" />
                                PASSWORD
                            </label>
                            <div className={classes.InputContainer}>
                                <FaLock className={classes.InputIcon} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    placeholder="Enter password"
                                    className={classes.Input}
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={togglePasswordVisibility}
                                    className={classes.PasswordToggle}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                            {errors.password && <div className={classes.ErrorMessage}>{errors.password}</div>}
                        </div>

                        {/* Login Error */}
                        {loginError && <div className={classes.ErrorMessage}>{loginError}</div>}

                        {/* Submit Button */}
                        <button type="submit" className={classes.SubmitButton}>
                            <FaSignInAlt className="inline mr-2" />
                            LOG IN
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;

