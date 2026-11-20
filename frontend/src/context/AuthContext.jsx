import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, setAuthToken, getAuthToken } from '../services/api';

const AuthContext = createContext();

export const DEMO_CREDENTIALS = {
  buyer: {
    email: 'brian.buyer@ucu.ac.ug',
    name: 'Brian Okello',
    role: 'buyer',
    residence: 'Sabiti Hall'
  },
  seller: {
    email: 'grace.seller@ucu.ac.ug',
    name: 'Grace Akello',
    role: 'seller',
    residence: 'Agape Hall'
  },
  admin: {
    email: 'admin@unitrade.ucu.ac.ug',
    password: 'Admin@123',
    name: 'Dennis Kibirige (Admin)',
    role: 'admin',
    residence: 'Administration Building'
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const token = getAuthToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.getMe();
        if (res.success && res.user) {
          setUser(res.user);
        } else {
          setAuthToken(null);
          setUser(null);
        }
      } catch (err) {
        console.warn('Session verification failed:', err.message);
        setAuthToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  // Passwordless Email OTP Login for Buyers & Sellers
  const requestOTP = async (email) => {
    return await api.requestOTP(email);
  };

  const verifyOTP = async (email, otp) => {
    const res = await api.verifyOTP(email, otp);
    if (res.success && res.token) {
      setAuthToken(res.token);
      setUser(res.user);
      return res.user;
    }
    throw new Error(res.message || 'OTP verification failed');
  };

  // Dedicated Password-Based Login for System Administrators
  const adminLogin = async (email, password) => {
    const res = await api.adminLogin({ email, password });
    if (res.success && res.token) {
      setAuthToken(res.token);
      setUser(res.user);
      return res.user;
    }
    throw new Error(res.message || 'Administrator authentication failed');
  };

  // Backward compatible login method
  const login = async (email, password) => {
    const res = await api.login({ email, password });
    if (res.success && res.token) {
      setAuthToken(res.token);
      setUser(res.user);
      return res.user;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await api.register(userData);
    return res;
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
  };

  const updateUser = (updatedFields) => {
    setUser(prev => (prev ? { ...prev, ...updatedFields } : null));
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated: !!user,
      isBuyer: user?.role === 'buyer',
      isSeller: user?.role === 'seller',
      isAdmin: user?.role === 'admin',
      requestOTP,
      verifyOTP,
      adminLogin,
      login,
      register,
      logout,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
