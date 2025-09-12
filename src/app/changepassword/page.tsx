'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaLock, FaEye, FaEyeSlash, FaSpinner } from 'react-icons/fa';
import { changePassword } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const classes = {
    // Page Container
    Container: 'min-h-screen bg-white flex items-center justify-center p-8',
    FormContainer: 'bg-white border-4 border-black max-w-md w-full shadow-[16px_16px_0px_0px_#000]',
    
    // Header
    Header: 'bg-red-500 border-b-4 border-black p-6 text-center',
    Title: 'text-2xl font-black text-white uppercase tracking-widest mb-2',
    Subtitle: 'text-sm font-bold text-white opacity-90',
    
    // Form
    Form: 'p-8 space-y-6',
    FormGroup: 'space-y-2',
    Label: 'text-black font-black text-sm uppercase tracking-widest',
    InputContainer: 'relative',
    Input: 'w-full bg-white border-4 border-black px-4 py-3 text-black font-bold placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:shadow-[4px_4px_0px_0px_#3b82f6] transition-all duration-200',
    PasswordToggle: 'absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-black cursor-pointer',
    
    // Messages
    ErrorMessage: 'bg-red-100 border-4 border-red-500 text-red-700 px-4 py-3 font-black uppercase tracking-wide text-sm',
    SuccessMessage: 'bg-green-100 border-4 border-green-500 text-green-700 px-4 py-3 font-black uppercase tracking-wide text-sm',
    
    // Button
    Button: 'w-full bg-blue-500 hover:bg-blue-600 border-4 border-black text-white font-black py-3 px-6 uppercase tracking-wide shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200 flex items-center justify-center gap-2',
    
    // Warning Box
    WarningBox: 'bg-yellow-100 border-4 border-yellow-500 p-4 mb-6',
    WarningText: 'text-yellow-800 font-bold text-sm',
    WarningTitle: 'text-yellow-900 font-black text-sm uppercase tracking-wide mb-2',
};

interface ChangePasswordFormData {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
}

const ChangePassword: React.FC = () => {
    const router = useRouter();
    const { user, updateUser, logout } = useAuth();
    const [formData, setFormData] = useState<ChangePasswordFormData>({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [showPassword, setShowPassword] = useState({
        old: false,
        new: false,
        confirm: false
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear message when user starts typing
        if (message) setMessage(null);
    };

    const togglePasswordVisibility = (field: 'old' | 'new' | 'confirm') => {
        setShowPassword(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const validateForm = (): boolean => {
        if (!formData.oldPassword.trim()) {
            setMessage({ type: 'error', text: 'Current password is required' });
            return false;
        }

        if (!formData.newPassword.trim()) {
            setMessage({ type: 'error', text: 'New password is required' });
            return false;
        }

        if (formData.newPassword.length < 6) {
            setMessage({ type: 'error', text: 'New password must be at least 6 characters long' });
            return false;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            return false;
        }

        if (formData.oldPassword === formData.newPassword) {
            setMessage({ type: 'error', text: 'New password must be different from current password' });
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        setLoading(true);
        setMessage(null);

        try {
            await changePassword({
                currentPassword: formData.oldPassword,
                newPassword: formData.newPassword
            });

            // Update user session to mark password as no longer initial
            const sessionData = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
            if (sessionData.user && user) {
                const updatedUser = { ...user, isInitialPassword: false };
                updateUser(updatedUser);
            }

            setMessage({ type: 'success', text: 'Password changed successfully! Logging you out...' });
            
            // Clear form
            setFormData({
                oldPassword: '',
                newPassword: '',
                confirmPassword: ''
            });

            // Logout user after a short delay to show success message
            setTimeout(() => {
                logout();
                router.push('/login');
            }, 2000);

        } catch (error: any) {
            let errorMessage = 'Failed to change password';
            
            if (error.response?.status === 400) {
                errorMessage = error.response.data?.message || 'Invalid current password';
            } else if (error.response?.status === 401) {
                errorMessage = 'Current password is incorrect';
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }
            
            setMessage({ type: 'error', text: errorMessage });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={classes.Container}>
            <div className={classes.FormContainer}>
                {/* Header */}
                <div className={classes.Header}>
                    <h1 className={classes.Title}>
                        <FaLock className="inline mr-3" />
                        Change Password
                    </h1>
                    <p className={classes.Subtitle}>
                        Set up your new password to continue
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className={classes.Form}>
                    {/* Warning Message */}
                    

                    {/* Message */}
                    {message && (
                        <div className={message.type === 'error' ? classes.ErrorMessage : classes.SuccessMessage}>
                            {message.text}
                        </div>
                    )}

                    {/* Current Password */}
                    <div className={classes.FormGroup}>
                        <label htmlFor="oldPassword" className={classes.Label}>
                            Current Password
                        </label>
                        <div className={classes.InputContainer}>
                            <input
                                type={showPassword.old ? "text" : "password"}
                                id="oldPassword"
                                name="oldPassword"
                                value={formData.oldPassword}
                                onChange={handleInputChange}
                                placeholder="Enter your current password"
                                className={classes.Input}
                                required
                                disabled={loading}
                            />
                            <button
                                type="button"
                                onClick={() => togglePasswordVisibility('old')}
                                className={classes.PasswordToggle}
                                disabled={loading}
                            >
                                {showPassword.old ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>

                    {/* New Password */}
                    <div className={classes.FormGroup}>
                        <label htmlFor="newPassword" className={classes.Label}>
                            New Password
                        </label>
                        <div className={classes.InputContainer}>
                            <input
                                type={showPassword.new ? "text" : "password"}
                                id="newPassword"
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleInputChange}
                                placeholder="Enter your new password"
                                className={classes.Input}
                                required
                                disabled={loading}
                                minLength={6}
                            />
                            <button
                                type="button"
                                onClick={() => togglePasswordVisibility('new')}
                                className={classes.PasswordToggle}
                                disabled={loading}
                            >
                                {showPassword.new ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm New Password */}
                    <div className={classes.FormGroup}>
                        <label htmlFor="confirmPassword" className={classes.Label}>
                            Confirm New Password
                        </label>
                        <div className={classes.InputContainer}>
                            <input
                                type={showPassword.confirm ? "text" : "password"}
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                placeholder="Confirm your new password"
                                className={classes.Input}
                                required
                                disabled={loading}
                                minLength={6}
                            />
                            <button
                                type="button"
                                onClick={() => togglePasswordVisibility('confirm')}
                                className={classes.PasswordToggle}
                                disabled={loading}
                            >
                                {showPassword.confirm ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={classes.Button}
                    >
                        {loading ? (
                            <>
                                <FaSpinner className="animate-spin" />
                                Changing Password...
                            </>
                        ) : (
                            <>
                                <FaLock />
                                Change Password
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

// Simple export - AuthRedirectHandler handles auth
export default ChangePassword;

