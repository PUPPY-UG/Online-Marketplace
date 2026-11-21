import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { User, Mail, Phone, MapPin, BadgeCheck, ArrowRight, CheckCircle, AlertCircle, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Register({ onToast }) {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'seller' ? 'seller' : 'buyer';

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    role: initialRole,
    campus_residence: '',
    student_id: ''
  });

  const [step, setStep] = useState(1); // 1 = Registration Form, 2 = Verify OTP
  const [otp, setOtp] = useState('');
  const [otpEmailSent, setOtpEmailSent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register, verifyOTP } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Step 1: Submit Registration & Request OTP
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.full_name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setError('Full name, email address, and phone number are required.');
      return;
    }

    try {
      setLoading(true);
      const res = await register({
        ...formData,
        email: formData.email.trim().toLowerCase(),
        full_name: formData.full_name.trim(),
        phone: formData.phone.trim()
      });

      if (res.success) {
        setStep(2);
        setOtpEmailSent(formData.email.trim().toLowerCase());
        if (onToast) onToast(res.message || 'Registration initiated! Please enter your verification code.', 'success');
      } else {
        setError(res.message || 'Registration failed.');
      }
    } catch (err) {
      setError(err.message || 'Failed to complete registration.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify Registration OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');

    if (!otp.trim() || otp.trim().length !== 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    try {
      setLoading(true);
      const user = await verifyOTP(formData.email.trim().toLowerCase(), otp.trim());
      if (onToast) onToast(`Account successfully verified! Welcome, ${user.full_name}.`, 'success');

      if (user.role === 'seller') {
        navigate('/seller/dashboard');
      } else {
        navigate('/buyer/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Verification code failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-xl w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-slate-200">
        
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-orange-50 text-brand-orange mb-4 ring-8 ring-orange-50/50">
            {step === 1 ? <User className="w-7 h-7" /> : <KeyRound className="w-7 h-7" />}
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {step === 1 ? 'Create Campus Account' : 'Verify Your Email'}
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
            {step === 1
              ? 'Join UniTrade at Uganda Christian University. No password required — authenticate safely using one-time email codes.'
              : `Enter the 6-digit verification code sent to ${formData.email}`}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start space-x-2.5 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* OTP Sent Confirmation Banner */}
        {step === 2 && otpEmailSent && (
          <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-800 text-xs flex items-center space-x-2.5">
            <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span>A 6-digit verification code has been sent to <strong>{otpEmailSent}</strong>. Please check your inbox.</span>
          </div>
        )}

        {/* Step 1: Registration Form */}
        {step === 1 && (
          <form onSubmit={handleRegisterSubmit} className="space-y-5">
            
            {/* Role Selection (Student Buyer vs Student Seller) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                I Want To:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'buyer' })}
                  className={`p-3.5 rounded-2xl border text-left flex items-center space-x-3 transition-all ${
                    formData.role === 'buyer'
                      ? 'border-brand-blue bg-blue-50/60 ring-2 ring-brand-blue/20 text-brand-blue'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                    formData.role === 'buyer' ? 'bg-brand-blue text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    🛍️
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Buy Items</p>
                    <p className="text-[10px] text-slate-500">Student Buyer</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'seller' })}
                  className={`p-3.5 rounded-2xl border text-left flex items-center space-x-3 transition-all ${
                    formData.role === 'seller'
                      ? 'border-brand-orange bg-orange-50/60 ring-2 ring-brand-orange/20 text-brand-orange'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                    formData.role === 'seller' ? 'bg-brand-orange text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    🏪
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Sell Items</p>
                    <p className="text-[10px] text-slate-500">Student Seller</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label htmlFor="full_name" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  required
                  placeholder="e.g. John Mukasa"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Campus Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="e.g. student@ucu.ac.ug"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            {/* Phone Number & Student ID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Mobile Number
                </label>
                <div className="relative">
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    placeholder="+256 700 000000"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <div>
                <label htmlFor="student_id" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Student Registration No.
                </label>
                <div className="relative">
                  <input
                    id="student_id"
                    name="student_id"
                    type="text"
                    placeholder="e.g. S23/BCS/041"
                    value={formData.student_id}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all"
                  />
                  <BadgeCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                </div>
              </div>
            </div>

            {/* Campus Residence */}
            <div>
              <label htmlFor="campus_residence" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Campus Residence / Hall
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="campus_residence"
                  name="campus_residence"
                  required
                  placeholder="Enter your hall, hostel, or room number..."
                  value={formData.campus_residence}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all"
                />
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-brand-orange hover:bg-orange-600 text-white font-extrabold text-sm shadow-lg hover:shadow-orange-500/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-70"
            >
              {loading ? (
                <span>Registering Account...</span>
              ) : (
                <>
                  <span>Register & Send Verification Code</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Step 2: OTP Verification Form */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div>
              <label htmlFor="reg-otp" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                6-Digit Verification Code (OTP)
              </label>
              <div className="relative">
                <input
                  id="reg-otp"
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
              className="w-full py-3.5 px-4 rounded-xl bg-brand-blue hover:bg-blue-600 text-white font-extrabold text-sm shadow-lg hover:shadow-blue-500/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-70"
            >
              {loading ? (
                <span>Verifying Account...</span>
              ) : (
                <>
                  <span>Confirm Code & Enter Marketplace</span>
                  <CheckCircle className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-slate-500 hover:text-slate-700 font-medium"
              >
                ← Back to Edit Registration Details
              </button>
            </div>
          </form>
        )}

        {/* Footer Navigation */}
        <div className="pt-6 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-600">
            Already have a campus account?{' '}
            <Link to="/login" className="font-bold text-brand-blue hover:text-blue-600">
              Log In with OTP
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
