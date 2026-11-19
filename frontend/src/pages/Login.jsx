import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  ShoppingBag, 
  Lock, 
  Mail, 
  ArrowRight, 
  UserCheck, 
  Shield, 
  Store, 
  AlertCircle 
} from 'lucide-react';
import { useAuth, DEMO_CREDENTIALS } from '../context/AuthContext';

export default function Login({ onToast }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { login, quickLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectAfterLogin = (user) => {
    const from = location.state?.from?.pathname;
    if (from) {
      navigate(from, { replace: true });
      return;
    }

    if (user.role === 'admin') {
      navigate('/admin/dashboard', { replace: true });
    } else if (user.role === 'seller') {
      navigate('/seller/dashboard', { replace: true });
    } else {
      navigate('/buyer/dashboard', { replace: true });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      setSubmitting(true);
      const user = await login(email.trim(), password);
      if (onToast) onToast(`Welcome back, ${user.full_name}!`, 'success');
      redirectAfterLogin(user);
    } catch (err) {
      setErrorMsg(err.message || 'Invalid email or password.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickDemo = async (roleKey) => {
    setErrorMsg('');
    try {
      setSubmitting(true);
      const user = await quickLogin(roleKey);
      if (onToast) onToast(`Signed in as Demo ${roleKey.toUpperCase()}: ${user.full_name}`, 'success');
      redirectAfterLogin(user);
    } catch (err) {
      setErrorMsg(err.message || 'Demo login failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-blue to-brand-orange flex items-center justify-center text-white mx-auto shadow-md">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Sign In to UniTrade
          </h2>
          <p className="text-xs text-slate-500">
            Uganda Christian University (UCU) Campus Marketplace
          </p>
        </div>

        {/* 1-Click Quick Demo Login Shortcuts */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <span>Demonstration Quick Sign-In</span>
            <span className="text-brand-orange">1-Click</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('buyer')}
              disabled={submitting}
              className="p-2.5 rounded-xl bg-white hover:bg-blue-50 border border-slate-200 text-slate-800 text-xs font-bold transition-all flex flex-col items-center shadow-sm hover:border-brand-blue group"
            >
              <UserCheck className="w-4 h-4 text-brand-blue mb-1 group-hover:scale-110 transition-transform" />
              <span>Buyer</span>
              <span className="text-[10px] text-slate-400 font-normal">Brian</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('seller')}
              disabled={submitting}
              className="p-2.5 rounded-xl bg-white hover:bg-orange-50 border border-slate-200 text-slate-800 text-xs font-bold transition-all flex flex-col items-center shadow-sm hover:border-brand-orange group"
            >
              <Store className="w-4 h-4 text-brand-orange mb-1 group-hover:scale-110 transition-transform" />
              <span>Seller</span>
              <span className="text-[10px] text-slate-400 font-normal">Grace</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              disabled={submitting}
              className="p-2.5 rounded-xl bg-white hover:bg-purple-50 border border-slate-200 text-slate-800 text-xs font-bold transition-all flex flex-col items-center shadow-sm hover:border-purple-600 group"
            >
              <Shield className="w-4 h-4 text-purple-600 mb-1 group-hover:scale-110 transition-transform" />
              <span>Admin</span>
              <span className="text-[10px] text-slate-400 font-normal">Dennis</span>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-2 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Standard Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              UCU Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. brian.buyer@ucu.ac.ug"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-blue focus:outline-none"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-blue focus:outline-none"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-xl bg-brand-blue hover:bg-blue-600 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-blue-500/25 flex items-center justify-center space-x-2"
          >
            {submitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center text-xs text-slate-500">
          New student on campus?{' '}
          <Link to="/register" className="font-bold text-brand-orange hover:underline">
            Register an Account
          </Link>
        </div>

      </div>
    </div>
  );
}
