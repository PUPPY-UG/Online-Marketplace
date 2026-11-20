import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, KeyRound, ArrowRight, Shield, CheckCircle, AlertCircle, Sparkles, RefreshCw } from 'lucide-react';
import { useAuth, DEMO_CREDENTIALS } from '../context/AuthContext';

export default function Login({ onToast }) {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1 = Enter Email, 2 = Enter OTP
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [demoOtpHint, setDemoOtpHint] = useState('');

  const { requestOTP, verifyOTP } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || null;

  // Step 1: Send OTP to Email
  const handleRequestOTP = async (e) => {
    e?.preventDefault();
    setError('');
    if (!email.trim()) {
      setError('Please enter your university email address.');
      return;
    }

    try {
      setLoading(true);
      const res = await requestOTP(email.trim().toLowerCase());
      if (res.success) {
        setStep(2);
        if (res.demo_otp) {
          setDemoOtpHint(res.demo_otp);
        }
        if (onToast) onToast(res.message || 'Verification code sent to your email!', 'success');
      } else {
        setError(res.message || 'Failed to send verification code.');
      }
    } catch (err) {
      setError(err.message || 'No campus account found with this email. Please register first.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e?.preventDefault();
    setError('');
    if (!otp.trim() || otp.trim().length !== 6) {
      setError('Please enter the full 6-digit verification code.');
      return;
    }

    try {
      setLoading(true);
      const user = await verifyOTP(email.trim().toLowerCase(), otp.trim());
      if (onToast) onToast(`Welcome back, ${user.full_name}!`, 'success');

      // Route to appropriate destination
      if (from) {
        navigate(from, { replace: true });
      } else if (user.role === 'seller') {
        navigate('/seller/dashboard');
      } else {
        navigate('/buyer/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Invalid or expired verification code.');
    } finally {
      setLoading(false);
    }
  };

  // Quick fill helper for demo accounts
  const handleQuickFill = (demoEmail) => {
    setEmail(demoEmail);
    setError('');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-slate-200">
        
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-50 text-brand-blue mb-4 ring-8 ring-blue-50/50">
            {step === 1 ? <Mail className="w-7 h-7" /> : <KeyRound className="w-7 h-7 text-brand-orange" />}
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {step === 1 ? 'Student Marketplace Login' : 'Enter Verification Code'}
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
            {step === 1 
              ? 'Passwordless login for UCU students. Enter your campus email to receive a secure one-time verification code (OTP).'
              : `Enter the 6-digit code sent to ${email}`}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start space-x-2.5 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Demo OTP Helper Banner (when available) */}
        {step === 2 && demoOtpHint && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Academic Demo Code: <strong className="font-mono text-sm tracking-wider font-bold">{demoOtpHint}</strong></span>
            </div>
            <button
              type="button"
              onClick={() => setOtp(demoOtpHint)}
              className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg font-bold text-[10px] hover:bg-emerald-700 transition-colors shadow-sm"
            >
              Autofill
            </button>
          </div>
        )}

        {/* Step 1: Email Form */}
        {step === 1 && (
          <form onSubmit={handleRequestOTP} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Campus Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="e.g. brian.buyer@ucu.ac.ug"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-brand-blue hover:bg-blue-600 text-white font-extrabold text-sm shadow-lg hover:shadow-blue-500/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-70"
            >
              {loading ? (
                <span>Sending Code...</span>
              ) : (
                <>
                  <span>Send Verification Code</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Academic Demo Shortcut Accounts */}
            <div className="pt-2 border-t border-slate-100">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 text-center">
                Quick Test Accounts (Click to Fill)
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickFill(DEMO_CREDENTIALS.buyer.email)}
                  className="p-2 rounded-xl border border-slate-200 hover:border-brand-blue bg-slate-50 hover:bg-blue-50/50 text-left transition-colors"
                >
                  <p className="text-xs font-bold text-slate-800">Student Buyer</p>
                  <p className="text-[10px] text-slate-500 truncate">{DEMO_CREDENTIALS.buyer.email}</p>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill(DEMO_CREDENTIALS.seller.email)}
                  className="p-2 rounded-xl border border-slate-200 hover:border-brand-orange bg-slate-50 hover:bg-orange-50/50 text-left transition-colors"
                >
                  <p className="text-xs font-bold text-slate-800">Student Seller</p>
                  <p className="text-[10px] text-slate-500 truncate">{DEMO_CREDENTIALS.seller.email}</p>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Step 2: OTP Verification Form */}
        {step === 2 && (
          <form onSubmit={handleVerifyOTP} className="space-y-5">
            <div>
              <label htmlFor="otp" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                6-Digit Verification Code (OTP)
              </label>
              <div className="relative">
                <input
                  id="otp"
                  type="text"
                  maxLength={6}
                  required
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full py-3.5 px-4 rounded-xl border border-slate-300 text-center font-mono font-black text-2xl tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full py-3.5 px-4 rounded-xl bg-brand-orange hover:bg-orange-600 text-white font-extrabold text-sm shadow-lg hover:shadow-orange-500/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-70"
            >
              {loading ? (
                <span>Verifying Code...</span>
              ) : (
                <>
                  <span>Verify & Access Marketplace</span>
                  <CheckCircle className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="flex items-center justify-between text-xs pt-2">
              <button
                type="button"
                onClick={() => { setStep(1); setOtp(''); setError(''); }}
                className="text-slate-500 hover:text-slate-700 font-medium"
              >
                ← Change Email Address
              </button>
              <button
                type="button"
                onClick={handleRequestOTP}
                disabled={loading}
                className="text-brand-blue hover:text-blue-700 font-semibold flex items-center space-x-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Resend Code</span>
              </button>
            </div>
          </form>
        )}

        {/* Footer Navigation */}
        <div className="pt-6 border-t border-slate-100 space-y-3 text-center">
          <p className="text-xs text-slate-600">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-brand-orange hover:text-orange-600">
              Register Without Password
            </Link>
          </p>

          {/* Dedicated Administrator Login Portal Link */}
          <div className="pt-2">
            <Link
              to="/admin/login"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              <Shield className="w-3.5 h-3.5 text-purple-600" />
              <span>Administrator Login Portal</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
