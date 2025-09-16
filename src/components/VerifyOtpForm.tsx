import React, { useState } from 'react';

const VerifyOtpForm: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await fetch('/api/auth/v1/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to reset password');
      }
      setMessage('Password changed successfully. Please log in.');
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Error verifying OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white p-6 rounded shadow">
      <label className="block mb-2 font-bold">Email</label>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="w-full p-2 border rounded mb-4"
        required
      />
      <label className="block mb-2 font-bold">OTP</label>
      <input
        type="text"
        value={otp}
        onChange={e => setOtp(e.target.value)}
        className="w-full p-2 border rounded mb-4"
        required
      />
      <label className="block mb-2 font-bold">New Password</label>
      <input
        type="password"
        value={newPassword}
        onChange={e => setNewPassword(e.target.value)}
        className="w-full p-2 border rounded mb-4"
        required
      />
      <button
        type="submit"
        className="w-full bg-red-500 text-white font-bold py-2 rounded disabled:opacity-50"
        disabled={loading}
      >
        {loading ? 'Resetting...' : 'Reset Password'}
      </button>
      {message && <div className="mt-4 text-green-600 font-bold">{message}</div>}
      {error && <div className="mt-4 text-red-600 font-bold">{error}</div>}
    </form>
  );
};

export default VerifyOtpForm;
