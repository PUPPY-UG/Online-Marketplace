// API Client for UniTrade Campus Online Marketplace
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

export const api = {
  // Auth
  register: (payload) => request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  getMe: () => request('/auth/me'),
  updateProfile: (profile) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(profile) }),

  // Items / Products
  getItems: (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        searchParams.append(key, val);
      }
    });
    const qs = searchParams.toString();
    return request(`/items${qs ? `?${qs}` : ''}`);
  },
  getFeaturedItems: () => request('/items/featured'),
  getRecentItems: () => request('/items/recent'),
  getItem: (id) => request(`/items/${id}`),
  getSellerItems: () => request('/items/seller/my-items'),
  createItem: (itemData) => request('/items', { method: 'POST', body: JSON.stringify(itemData) }),
  updateItem: (id, itemData) => request(`/items/${id}`, { method: 'PUT', body: JSON.stringify(itemData) }),
  toggleItemStatus: (id) => request(`/items/${id}/toggle-status`, { method: 'PATCH' }),
  deleteItem: (id) => request(`/items/${id}`, { method: 'DELETE' }),

  // Cart
  getCart: () => request('/cart'),
  addToCart: (itemId, quantity = 1) => request('/cart/items', { method: 'POST', body: JSON.stringify({ item_id: itemId, quantity }) }),
  updateCartQuantity: (cartItemId, quantity) => request(`/cart/items/${cartItemId}`, { method: 'PUT', body: JSON.stringify({ quantity }) }),
  removeFromCart: (cartItemId) => request(`/cart/items/${cartItemId}`, { method: 'DELETE' }),
  clearCart: () => request('/cart/clear', { method: 'DELETE' }),

  // Orders & Mock Payments
  checkout: (checkoutData) => request('/orders/checkout', { method: 'POST', body: JSON.stringify(checkoutData) }),
  getBuyerOrders: () => request('/orders/buyer/my-orders'),
  getSellerOrders: () => request('/orders/seller/my-orders'),
  getOrder: (id) => request(`/orders/${id}`),
  updateOrderStatus: (id, status) => request(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  // Reviews & Ratings
  submitReview: (reviewData) => request('/reviews', { method: 'POST', body: JSON.stringify(reviewData) }),
  getSellerReviews: (sellerId) => request(`/reviews/seller/${sellerId}`),

  // Administrator
  getAdminStats: () => request('/admin/stats'),
  getAdminUsers: () => request('/admin/users'),
  toggleUserStatus: (userId, status) => request(`/admin/users/${userId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  getAdminProducts: () => request('/admin/products'),
  moderateProduct: (id, data) => request(`/admin/products/${id}/moderate`, { method: 'PATCH', body: JSON.stringify(data) }),
  getAdminOrders: () => request('/admin/orders'),
  getAdminReviews: () => request('/admin/reviews'),
  getAdminReports: () => request('/admin/reports'),

  // Photo Upload
  uploadPhoto: (formData) => request('/upload', { method: 'POST', body: formData })
};

// UGX Currency Formatter helper
export function formatUGX(amount) {
  if (amount === undefined || amount === null || isNaN(Number(amount))) return 'UGX 0';
  return 'UGX ' + Number(amount).toLocaleString('en-UG', {
    maximumFractionDigits: 0
  });
}
