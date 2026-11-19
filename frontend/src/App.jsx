import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Toast from './components/Toast';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import OrderTracking from './pages/OrderTracking';
import Login from './pages/Login';
import Register from './pages/Register';

// Role Dashboards
import BuyerDashboard from './pages/buyer/BuyerDashboard';
import BuyerOrders from './pages/buyer/BuyerOrders';
import SellerDashboard from './pages/seller/SellerDashboard';
import SellerProducts from './pages/seller/SellerProducts';
import SellerOrders from './pages/seller/SellerOrders';
import AdminDashboard from './pages/admin/AdminDashboard';

export default function App() {
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans selection:bg-brand-orange selection:text-white">
            
            <Navbar />

            <main className="flex-1">
              <Routes>
                {/* Public Marketplace Routes */}
                <Route path="/" element={<Home onToast={showToast} />} />
                <Route path="/products" element={<Products onToast={showToast} />} />
                <Route path="/products/:id" element={<ProductDetails onToast={showToast} />} />
                <Route path="/cart" element={<Cart onToast={showToast} />} />
                <Route path="/login" element={<Login onToast={showToast} />} />
                <Route path="/register" element={<Register onToast={showToast} />} />

                {/* Checkout & Orders */}
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute>
                      <Checkout onToast={showToast} />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/order-confirmation/:id"
                  element={
                    <ProtectedRoute>
                      <OrderConfirmation onToast={showToast} />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/order-tracking/:id"
                  element={
                    <ProtectedRoute>
                      <OrderTracking onToast={showToast} />
                    </ProtectedRoute>
                  }
                />

                {/* Buyer Portal */}
                <Route
                  path="/buyer/dashboard"
                  element={
                    <ProtectedRoute roles={['buyer']}>
                      <BuyerDashboard onToast={showToast} />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/buyer/orders"
                  element={
                    <ProtectedRoute roles={['buyer']}>
                      <BuyerOrders onToast={showToast} />
                    </ProtectedRoute>
                  }
                />

                {/* Seller Portal */}
                <Route
                  path="/seller/dashboard"
                  element={
                    <ProtectedRoute roles={['seller']}>
                      <SellerDashboard onToast={showToast} />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/seller/products"
                  element={
                    <ProtectedRoute roles={['seller']}>
                      <SellerProducts onToast={showToast} />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/seller/orders"
                  element={
                    <ProtectedRoute roles={['seller']}>
                      <SellerOrders onToast={showToast} />
                    </ProtectedRoute>
                  }
                />

                {/* Administrator Console */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute roles={['admin']}>
                      <AdminDashboard onToast={showToast} />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            <Footer />

            {/* Global Notification Toast */}
            <Toast toast={toast} onClose={() => setToast(null)} />

          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}
