// API Client for UniTrade Campus Online Marketplace
// Uganda Christian University (UCU)
// Automatically switches to mockStorage when running statically on GitHub Pages

import { mockStorage } from './mockStorage';

const BASE_URL = '/api';

export function getAuthToken() {
  return localStorage.getItem('unitrade_token');
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem('unitrade_token', token);
  } else {
    localStorage.removeItem('unitrade_token');
  }
}

async function request(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    ...options.headers
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

const isStatic = mockStorage.isStaticMode();

export const api = {
  // Authentication & OTP (Passwordless for Buyers/Sellers, Password for Admin)
  register: (payload) => isStatic ? mockStorage.register(payload) : request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  requestOTP: (email) => isStatic ? mockStorage.requestOTP(email) : request('/auth/request-otp', { method: 'POST', body: JSON.stringify({ email }) }),
  verifyOTP: (email, otp) => isStatic ? mockStorage.verifyOTP(email, otp) : request('/auth/verify-otp', { method: 'POST', body: JSON.stringify({ email, otp }) }),
  adminLogin: (credentials) => isStatic ? mockStorage.adminLogin(credentials.email, credentials.password) : request('/auth/admin-login', { method: 'POST', body: JSON.stringify(credentials) }),
  login: (credentials) => isStatic ? mockStorage.login(credentials.email, credentials.password) : request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  getMe: () => isStatic ? mockStorage.getMe() : request('/auth/me'),
  updateProfile: (profile) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(profile) }),

  // Items / Products
  getItems: (params = {}) => {
    if (isStatic) return mockStorage.getItems(params);
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        searchParams.append(key, val);
      }
    });
    const qs = searchParams.toString();
    return request(`/items${qs ? `?${qs}` : ''}`);
  },
  getFeaturedItems: async () => {
    if (isStatic) {
      const res = await mockStorage.getItems();
      return { success: true, items: res.items.slice(0, 6) };
    }
    return request('/items/featured');
  },
  getRecentItems: async () => {
    if (isStatic) {
      const res = await mockStorage.getItems();
      return { success: true, items: res.items.slice(0, 8) };
    }
    return request('/items/recent');
  },
  getItem: (id) => isStatic ? mockStorage.getItem(id) : request(`/items/${id}`),
  getSellerItems: () => isStatic ? mockStorage.getSellerItems() : request('/items/seller/my-items'),
  createItem: (itemData) => isStatic ? mockStorage.createItem(itemData) : request('/items', { method: 'POST', body: JSON.stringify(itemData) }),
  updateItem: (id, itemData) => isStatic ? mockStorage.updateItem(id, itemData) : request(`/items/${id}`, { method: 'PUT', body: JSON.stringify(itemData) }),
  toggleItemStatus: (id) => isStatic ? mockStorage.toggleItemStatus(id) : request(`/items/${id}/toggle-status`, { method: 'PATCH' }),
  deleteItem: (id) => isStatic ? mockStorage.deleteItem(id) : request(`/items/${id}`, { method: 'DELETE' }),

  // Cart
  getCart: () => isStatic ? mockStorage.getCart() : request('/cart'),
  addToCart: (itemId, quantity = 1) => isStatic ? mockStorage.addToCart(itemId, quantity) : request('/cart/items', { method: 'POST', body: JSON.stringify({ item_id: itemId, quantity }) }),
  updateCartQuantity: (cartItemId, quantity) => isStatic ? mockStorage.updateCartQuantity(cartItemId, quantity) : request(`/cart/items/${cartItemId}`, { method: 'PUT', body: JSON.stringify({ quantity }) }),
  removeFromCart: (cartItemId) => isStatic ? mockStorage.removeFromCart(cartItemId) : request(`/cart/items/${cartItemId}`, { method: 'DELETE' }),
  clearCart: () => isStatic ? mockStorage.clearCart() : request('/cart/clear', { method: 'DELETE' }),

  // Orders & Payment Processing
  checkout: (checkoutData) => isStatic ? mockStorage.checkout(checkoutData) : request('/orders/checkout', { method: 'POST', body: JSON.stringify(checkoutData) }),
  getBuyerOrders: () => isStatic ? mockStorage.getBuyerOrders() : request('/orders/buyer/my-orders'),
  getSellerOrders: () => isStatic ? mockStorage.getSellerOrders() : request('/orders/seller/my-orders'),
  getOrder: (id) => isStatic ? mockStorage.getOrder(id) : request(`/orders/${id}`),
  updateOrderStatus: (id, status) => isStatic ? mockStorage.updateOrderStatus(id, status) : request(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  // Payments (MTN, Airtel, PayPal)
  momoRequestToPay: (payload) => isStatic ? mockStorage.momoRequestToPay(payload) : request('/payments/momo/request-to-pay', { method: 'POST', body: JSON.stringify(payload) }),
  paypalCreateOrder: (payload) => isStatic ? mockStorage.paypalCreateOrder(payload) : request('/payments/paypal/create-order', { method: 'POST', body: JSON.stringify(payload) }),
  paypalCaptureOrder: (payload) => isStatic ? mockStorage.paypalCaptureOrder(payload) : request('/payments/paypal/capture-order', { method: 'POST', body: JSON.stringify(payload) }),

  // Reviews & Ratings
  submitReview: (reviewData) => isStatic ? mockStorage.submitReview(reviewData) : request('/reviews', { method: 'POST', body: JSON.stringify(reviewData) }),
  getSellerReviews: (sellerId) => isStatic ? mockStorage.getSellerReviews(sellerId) : request(`/reviews/seller/${sellerId}`),

  // Administrator
  getAdminStats: () => isStatic ? mockStorage.getAdminStats() : request('/admin/stats'),
  getAdminUsers: () => isStatic ? mockStorage.getAdminUsers() : request('/admin/users'),
  toggleUserStatus: (userId, status) => isStatic ? mockStorage.toggleUserStatus(userId, status) : request(`/admin/users/${userId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  getAdminProducts: () => isStatic ? mockStorage.getAdminProducts() : request('/admin/products'),
  moderateProduct: (id, data) => isStatic ? mockStorage.moderateProduct(id, data) : request(`/admin/products/${id}/moderate`, { method: 'PATCH', body: JSON.stringify(data) }),
  getAdminOrders: () => isStatic ? mockStorage.getAdminOrders() : request('/admin/orders'),
  getAdminPayments: () => isStatic ? mockStorage.getAdminPayments() : request('/admin/payments'),
  getAdminEmails: () => isStatic ? mockStorage.getAdminEmails() : request('/admin/emails'),
  getAdminReviews: () => isStatic ? mockStorage.getAdminReviews() : request('/admin/reviews'),
  getAdminReports: () => isStatic ? mockStorage.getAdminReports() : request('/admin/reports'),

  // Photo Upload
  uploadPhoto: (formData) => {
    if (isStatic) {
      return Promise.resolve({
        success: true,
        imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600'
      });
    }
    return request('/upload', { method: 'POST', body: formData });
  }
};

// UGX Currency Formatter helper
export function formatUGX(amount) {
  if (amount === undefined || amount === null || isNaN(Number(amount))) return 'UGX 0';
  return 'UGX ' + Number(amount).toLocaleString('en-UG', {
    maximumFractionDigits: 0
  });
}
