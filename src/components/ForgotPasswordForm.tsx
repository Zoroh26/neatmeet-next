import React, { useState } from 'react';

const ForgotPasswordForm: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await fetch('http://localhost:4000/api/auth/v1/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error('Failed to send OTP');
      setMessage('OTP sent to your email.');
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Error sending OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-lg mx-auto bg-white border-4 border-black p-8 shadow-[6px_6px_0px_0px_#000] flex flex-col gap-4">
      <label className="text-black text-lg font-black uppercase tracking-widest mb-1">Email</label>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="w-full px-4 py-3 bg-gray-50 border-4 border-black rounded-none text-black font-bold placeholder-gray-500 focus:outline-none focus:bg-white focus:border-red-500 transition-all duration-200 mb-2"
        required
      />
      <button
        type="submit"
        className="w-full bg-red-500 hover:bg-red-600 border-4 border-black text-white font-black py-3 px-6 uppercase tracking-widest text-lg shadow-[2px_2px_0px_0px_#000] hover:shadow-[4px_4px_0px_0px_#000] transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-red-300 disabled:opacity-50"
        disabled={loading}
      >
        {loading ? 'Sending...' : 'Send OTP'}
      </button>
      {message && <div className="mt-2 text-green-600 font-bold text-center">{message}</div>}
      {error && <div className="mt-2 text-red-600 font-bold text-center">{error}</div>}
    </form>
  );
};

export default ForgotPasswordForm;
