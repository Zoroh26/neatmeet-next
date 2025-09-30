import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

const VerifyOtpForm: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await fetch('http://localhost:4000/api/auth/v1/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to reset password');
      }
      setMessage('Password changed successfully. Redirecting to login...');
      setTimeout(() => {
        router.push('/login');
      }, 1500);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Error verifying OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="w-full max-w-sm bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] px-6 py-4 ml-8 transform hover:shadow-[12px_12px_0px_0px_#000] hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200"
    >
      {/* Email Field */}
      <label className="block mb-3 font-black text-black uppercase tracking-wide text-sm">
        Email
      </label>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="w-full p-4 border-4 border-black bg-white font-bold text-black placeholder-gray-500 focus:outline-none focus:border-red-500 focus:shadow-[4px_4px_0px_0px_#ef4444] mb-6 transition-all duration-200"
        placeholder="Enter your email"
        required
      />

      {/* OTP Field */}
      <label className="block mb-3 font-black text-black uppercase tracking-wide text-sm">
        OTP Code
      </label>
      <input
        type="text"
        value={otp}
        onChange={e => setOtp(e.target.value)}
        className="w-full p-4 border-4 border-black bg-white font-bold text-black placeholder-gray-500 focus:outline-none focus:border-red-500 focus:shadow-[4px_4px_0px_0px_#ef4444] mb-6 transition-all duration-200"
        placeholder="Enter OTP code"
        required
      />

      {/* New Password Field */}
      <label className="block mb-3 font-black text-black uppercase tracking-wide text-sm">
        New Password
      </label>
      <div className="relative mb-8">
        <input
          type={showPassword ? 'text' : 'password'}
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          className="w-full p-4 border-4 border-black bg-white font-bold text-black placeholder-gray-500 focus:outline-none focus:border-red-500 focus:shadow-[4px_4px_0px_0px_#ef4444] transition-all duration-200 pr-16"
          placeholder="Enter new password"
          required
        />
        <button
          type="button"
          className="absolute right-4 top-1/2 -translate-y-1/2   border-black rounded p-2 text-black hover:bg-gray-300 focus:outline-none flex items-center justify-center"
          onClick={() => setShowPassword((prev) => !prev)}
          tabIndex={-1}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? (
            <FaEyeSlash  />
          ) : (
            <FaEye />
          )}
        </button>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className={`w-full bg-red-500 hover:bg-red-600 text-white font-black py-4 px-6 border-4 border-black uppercase tracking-wide text-lg shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200 ${
          loading ? 'opacity-70 cursor-not-allowed' : 'active:bg-red-700'
        }`}
        disabled={loading}
      >
        {loading ? 'RESETTING...' : 'RESET PASSWORD'}
      </button>

      {/* Success Message */}
      {message && (
        <div className="mt-2 p-4 bg-green-100 border-4 border-green-500 text-green-800 font-black uppercase tracking-wide text-sm shadow-[4px_4px_0px_0px_#22c55e] transform">
          {message}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-2 p-4 bg-red-100 border-4 border-red-500 text-red-800 font-black uppercase tracking-wide text-sm shadow-[4px_4px_0px_0px_#ef4444] transform">
          {error}
        </div>
      )}
    </form>
  );
};

export default VerifyOtpForm;
