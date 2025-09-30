'use client';
import React, { useState } from 'react';
import ForgotPasswordForm from '../../components/ForgotPasswordForm';
import VerifyOtpForm from '../../components/VerifyOtpForm';
import { FaCog, FaChartBar, FaClock } from 'react-icons/fa';

const ResetPasswordPage: React.FC = () => {
  const [step, setStep] = useState<'forgot' | 'verify'>('forgot');
  const [success, setSuccess] = useState('');

  return (
    <div className="min-h-screen bg-white flex items-center justify-center relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-16 h-16 bg-red-500 border-4 border-black transform rotate-45 opacity-30"></div>
        <div className="absolute bottom-32 right-32 w-12 h-20 bg-red-500 border-4 border-black transform -rotate-12 opacity-25"></div>
      </div>

      <div className="flex items-center justify-center w-full relative z-10 px-4">
        <div className="w-full max-w-lg bg-white border-4 border-black rounded-none p-8 shadow-[12px_12px_0px_0px_#000] hover:shadow-[16px_16px_0px_0px_#000] transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-center">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-black uppercase tracking-wider mb-2 transform -skew-x-3">RESET PASSWORD</h1>
            <p className="text-lg font-bold text-white bg-red-500 border-3 border-black px-4 py-2 inline-block transform shadow-[3px_3px_0px_0px_#000]">OTP Verification</p>
          </div>
          {step === 'forgot' && (
            <>
              <ForgotPasswordForm onSuccess={() => setStep('verify')} />
              <button
                className="mt-4 text-blue-600 underline font-bold"
                onClick={() => setStep('verify')}
              >
                Already have OTP? Reset Password
              </button>
            </>
          )}
          {step === 'verify' && (
            <>
              <VerifyOtpForm onSuccess={() => setSuccess('Password changed successfully. Please log in.')} />
              <button
                className="mt-4 text-blue-600 underline font-bold"
                onClick={() => setStep('forgot')}
              >
                Didn't get OTP? Resend
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
