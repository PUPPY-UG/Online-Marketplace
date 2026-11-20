import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminLogin({ onToast }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { adminLogin } = useAuth();
  const navigate = useNavigate();

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please provide administrator email and password.');
      return;
    }

    try {
      setLoading(true);
      const user = await adminLogin(email.trim().toLowerCase(), password);
      if (onToast) onToast(`Welcome back, Administrator ${user.full_name}!`, 'success');
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message || 'Administrator authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-900 text-white">
      <div className="max-w-md w-full space-y-8 bg-slate-800/90 p-8 sm:p-10 rounded-3xl shadow-2xl border border-slate-700 backdrop-blur">
        
        {/* Administrator Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-500/20 text-purple-400 mb-4 ring-8 ring-purple-500/10">
            <Shield className="w-8 h-8" />
          </div>
          <div className="inline-block px-3 py-1 rounded-full bg-purple-900/50 border border-purple-500/30 text-purple-300 text-[11px] font-bold uppercase tracking-wider mb-2">
            System Administration
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Administrator Portal
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
            Restricted access for UniTrade marketplace administrators. Password-based authentication required.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-start space-x-2.5 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleAdminSubmit} className="space-y-5">
          <div>
            <label htmlFor="admin-email" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Administrator Email
            </label>
            <div className="relative">
              <input
                id="admin-email"
                type="email"
                required
                placeholder="admin@unitrade.ucu.ac.ug"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label htmlFor="admin-password" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Administrator Password
            </label>
            <div className="relative">
              <input
                id="admin-password"
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-sm shadow-xl hover:shadow-purple-500/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-70"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to Admin Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Helper */}
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700/80 text-[11px] text-slate-400">
          <p className="font-semibold text-slate-300 mb-1">Academic Demonstration Notice:</p>
          <p>Initial Administrator account preloaded: <span className="font-mono text-purple-300">admin@unitrade.ucu.ac.ug</span> / Password: <span className="font-mono text-purple-300">Admin@123</span></p>
        </div>

        {/* Back to student login */}
        <div className="pt-4 border-t border-slate-700 text-center">
          <Link to="/login" className="text-xs text-slate-400 hover:text-white transition-colors">
            ← Return to Student Marketplace Login
          </Link>
        </div>

      </div>
    </div>
  );
}
