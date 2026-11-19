import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([]);
      setTotalAmount(0);
      return;
    }

    try {
      setLoading(true);
      const res = await api.getCart();
      if (res.success) {
        setItems(res.items || []);
        setTotalAmount(res.total_amount || 0);
      }
    } catch (err) {
      console.warn('Failed to fetch cart:', err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (itemId, quantity = 1) => {
    if (!isAuthenticated) {
      throw new Error('Please sign in to add items to your shopping cart.');
    }
    const res = await api.addToCart(itemId, quantity);
    await fetchCart();
    return res;
  };

  const updateQuantity = async (cartItemId, quantity) => {
    if (!isAuthenticated) return;
    await api.updateCartQuantity(cartItemId, quantity);
    await fetchCart();
  };

  const removeFromCart = async (cartItemId) => {
    if (!isAuthenticated) return;
    await api.removeFromCart(cartItemId);
    await fetchCart();
  };

  const clearCart = async () => {
    if (!isAuthenticated) return;
    await api.clearCart();
    setItems([]);
    setTotalAmount(0);
  };

  const itemCount = items.reduce((sum, item) => sum + (item.quantity || 1), 0);

  return (
    <CartContext.Provider value={{
      items,
      itemCount,
      totalAmount,
      loading,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      refreshCart: fetchCart
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
