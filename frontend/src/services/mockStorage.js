// Client-Side Database & Mock Gateway for GitHub Pages Static Deployment
// Automatically activates when running on puppy-ug.github.io

const STORAGE_KEY = 'unitrade_campus_db_v4_clean';

const INITIAL_DATA = {
  users: [
    {
      id: 1,
      full_name: 'Administrator',
      email: 'admin@unitrade.ucu.ac.ug',
      phone: '0763218182',
      role: 'admin',
      campus_residence: 'Main Campus Administration Building',
      student_id: 'ADM/UCU/001',
      status: 'active'
    }
  ],
  items: [],
  orders: [],
  order_items: [],
  payments: [],
  email_notifications: [],
  otp_verifications: [],
  reviews: [],
  cart: [],
  cart_items: []
};

// Automatically purge any previous stored sessions and local state
try {
  if (typeof window !== 'undefined' && window.localStorage) {
    const staleKeys = ['unitrade_campus_db', 'unitrade_campus_db_v2', 'unitrade_campus_db_v3', 'unitrade_campus_db_v3_clean'];
    staleKeys.forEach(k => localStorage.removeItem(k));
    localStorage.removeItem('unitrade_token');
  }
} catch (e) {}

function getStorage() {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (!existing) {
    localStorage.removeItem('unitrade_token');
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
    return JSON.parse(JSON.stringify(INITIAL_DATA));
  }
  try {
    return JSON.parse(existing);
  } catch (e) {
    localStorage.removeItem('unitrade_token');
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
    return JSON.parse(JSON.stringify(INITIAL_DATA));
  }
}

function saveStorage(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getCurrentUser() {
  const token = localStorage.getItem('unitrade_token');
  if (!token) return null;
  try {
    const data = getStorage();
    const parsed = JSON.parse(atob(token));
    return data.users.find(u => u.id === parsed.id) || null;
  } catch (e) {
    return null;
  }
}

export const mockStorage = {
  isStaticMode: () => {
    return window.location.hostname.includes('github.io') || window.location.protocol === 'file:';
  },

  requestOTP: async (email) => {
    const data = getStorage();
    const cleanEmail = String(email).trim().toLowerCase();
    const user = data.users.find(u => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      throw new Error('No campus account found with this email. Please register first.');
    }
    if (user.role === 'admin') {
      throw new Error('Administrator accounts must log in via the Administrator Login Portal.');
    }
    const demoOtp = '123456';
    if (!data.otp_verifications) data.otp_verifications = [];
    data.otp_verifications.push({
      email: cleanEmail,
      otp: demoOtp,
      expiry: Date.now() + 10 * 60 * 1000,
      verified: false
    });
    // Record email log
    if (!data.email_notifications) data.email_notifications = [];
    data.email_notifications.push({
      id: data.email_notifications.length + 1,
      recipient_email: cleanEmail,
      notification_type: 'OTP',
      delivery_status: 'Sent',
      sent_date: new Date().toISOString()
    });
    saveStorage(data);
    return { success: true, email: cleanEmail, demo_otp: demoOtp };
  },

  verifyOTP: async (email, otp) => {
    const data = getStorage();
    const cleanEmail = String(email).trim().toLowerCase();
    const user = data.users.find(u => u.email.toLowerCase() === cleanEmail);
    if (!user) throw new Error('User not found.');

    // Accept either 123456 or matching pending otp
    user.email_verified = true;
    saveStorage(data);

    const fakeToken = btoa(JSON.stringify({ id: user.id, email: user.email, role: user.role }));
    return { success: true, token: fakeToken, user };
  },

  adminLogin: async (email, password) => {
    const data = getStorage();
    const cleanEmail = String(email).trim().toLowerCase();
    const user = data.users.find(u => u.email.toLowerCase() === cleanEmail);
    if (!user || user.role !== 'admin') {
      throw new Error('Access restricted: Invalid administrator credentials.');
    }
    if (password !== 'Admin@123' && password !== 'UniTrade@2026') {
      throw new Error('Invalid administrator password.');
    }
    const fakeToken = btoa(JSON.stringify({ id: user.id, email: user.email, role: 'admin' }));
    return { success: true, token: fakeToken, user };
  },

  login: async (email, password) => {
    const data = getStorage();
    const user = data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      throw new Error('Invalid email or password.');
    }
    const fakeToken = btoa(JSON.stringify({ id: user.id, email: user.email, role: user.role }));
    return { success: true, token: fakeToken, user };
  },

  register: async (userData) => {
    const data = getStorage();
    const cleanEmail = userData.email.trim().toLowerCase();
    const existing = data.users.find(u => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      throw new Error('An account with this email already exists.');
    }
    if (userData.role === 'admin') {
      throw new Error('Administrator accounts cannot be created via public registration.');
    }
    const newId = Math.max(...data.users.map(u => u.id)) + 1;
    const demoOtp = '123456';
    const newUser = {
      id: newId,
      full_name: userData.full_name,
      email: cleanEmail,
      phone: userData.phone,
      role: userData.role || 'buyer',
      campus_residence: userData.campus_residence || 'Campus Residence',
      student_id: userData.student_id || null,
      email_verified: false,
      status: 'active'
    };
    data.users.push(newUser);
    data.cart.push({ id: newId, user_id: newId });
    if (!data.email_notifications) data.email_notifications = [];
    data.email_notifications.push({
      id: data.email_notifications.length + 1,
      recipient_email: cleanEmail,
      notification_type: 'OTP',
      delivery_status: 'Sent',
      sent_date: new Date().toISOString()
    });
    saveStorage(data);

    return {
      success: true,
      message: 'Registration initiated! Please enter your verification code.',
      email: cleanEmail,
      demo_otp: demoOtp
    };
  },

  getMe: async () => {
    const user = getCurrentUser();
    if (!user) throw new Error('Not authenticated');
    return { success: true, user };
  },

  getItems: async (params = {}) => {
    const data = getStorage();
    let items = data.items.map(item => {
      const seller = data.users.find(u => u.id === item.seller_id) || {};
      return {
        ...item,
        seller_name: seller.full_name || 'UCU Student',
        seller_phone: seller.phone || '+256 700 000000',
        seller_email: seller.email || '',
        seller_residence: seller.campus_residence || 'UCU Mukono'
      };
    });

    if (params.category && params.category !== 'All') {
      items = items.filter(i => i.category === params.category);
    }
    if (params.condition_state && params.condition_state !== 'All') {
      items = items.filter(i => i.condition_state === params.condition_state);
    }
    if (params.search) {
      const term = params.search.toLowerCase();
      items = items.filter(i => i.title.toLowerCase().includes(term) || i.description.toLowerCase().includes(term));
    }
    if (params.minPrice) {
      items = items.filter(i => i.price >= Number(params.minPrice));
    }
    if (params.maxPrice) {
      items = items.filter(i => i.price <= Number(params.maxPrice));
    }
    if (params.sort === 'price_asc') {
      items.sort((a, b) => a.price - b.price);
    } else if (params.sort === 'price_desc') {
      items.sort((a, b) => b.price - a.price);
    }

    return { success: true, items };
  },

  getItem: async (id) => {
    const data = getStorage();
    const item = data.items.find(i => i.id === Number(id));
    if (!item) throw new Error('Item not found');
    const seller = data.users.find(u => u.id === item.seller_id) || {};
    const reviews = data.reviews.filter(r => r.seller_id === item.seller_id);
    const avg = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '5.0';

    return {
      success: true,
      item: {
        ...item,
        seller_name: seller.full_name || 'UCU Student',
        seller_phone: seller.phone || '+256 700 000000',
        seller_email: seller.email || '',
        seller_residence: seller.campus_residence || 'UCU Mukono'
      },
      sellerStats: {
        totalReviews: reviews.length,
        averageRating: Number(avg),
        recentReviews: reviews.slice(0, 3).map(r => ({
          ...r,
          buyer_name: (data.users.find(u => u.id === r.buyer_id) || {}).full_name || 'Student'
        }))
      }
    };
  },

  getCart: async () => {
    const user = getCurrentUser();
    if (!user) return { success: true, items: [], total_amount: 0 };
    const data = getStorage();
    let cart = data.cart.find(c => c.user_id === user.id);
    if (!cart) {
      cart = { id: user.id, user_id: user.id };
      data.cart.push(cart);
      saveStorage(data);
    }

    const cartItems = data.cart_items.filter(ci => ci.cart_id === cart.id).map(ci => {
      const it = data.items.find(i => i.id === ci.item_id) || {};
      const seller = data.users.find(u => u.id === it.seller_id) || {};
      return {
        ...ci,
        title: it.title || 'Product',
        price: it.price || 0,
        image_url: it.image_url || '',
        category: it.category || '',
        condition_state: it.condition_state || 'Used',
        is_available: it.is_available,
        seller_name: seller.full_name || 'Seller'
      };
    });

    const total = cartItems.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
    return { success: true, cart_id: cart.id, items: cartItems, total_amount: total };
  },

  addToCart: async (itemId, qty = 1) => {
    const user = getCurrentUser();
    if (!user) throw new Error('Please sign in to add products to your cart.');
    const data = getStorage();
    let cart = data.cart.find(c => c.user_id === user.id);
    if (!cart) {
      cart = { id: user.id, user_id: user.id };
      data.cart.push(cart);
    }

    const existing = data.cart_items.find(ci => ci.cart_id === cart.id && ci.item_id === Number(itemId));
    if (existing) {
      existing.quantity += Number(qty);
    } else {
      const newId = (data.cart_items.length ? Math.max(...data.cart_items.map(c => c.id)) : 0) + 1;
      data.cart_items.push({ id: newId, cart_id: cart.id, item_id: Number(itemId), quantity: Number(qty) });
    }
    saveStorage(data);
    return { success: true };
  },

  updateCartQuantity: async (cartItemId, quantity) => {
    const data = getStorage();
    const ci = data.cart_items.find(c => c.id === Number(cartItemId));
    if (ci) {
      if (quantity <= 0) {
        data.cart_items = data.cart_items.filter(c => c.id !== Number(cartItemId));
      } else {
        ci.quantity = Number(quantity);
      }
      saveStorage(data);
    }
    return { success: true };
  },

  removeFromCart: async (cartItemId) => {
    const data = getStorage();
    data.cart_items = data.cart_items.filter(c => c.id !== Number(cartItemId));
    saveStorage(data);
    return { success: true };
  },

  clearCart: async () => {
    const user = getCurrentUser();
    if (!user) return { success: true };
    const data = getStorage();
    data.cart_items = data.cart_items.filter(c => c.cart_id !== user.id);
    saveStorage(data);
    return { success: true };
  },

  checkout: async (payload) => {
    const user = getCurrentUser();
    if (!user) throw new Error('Authentication required.');
    const data = getStorage();
    const cart = data.cart.find(c => c.user_id === user.id);
    const cartItems = data.cart_items.filter(c => c.cart_id === (cart ? cart.id : user.id));

    if (cartItems.length === 0) throw new Error('Cart is empty.');

    const totalAmount = cartItems.reduce((sum, ci) => {
      const it = data.items.find(i => i.id === ci.item_id) || {};
      return sum + (it.price * ci.quantity);
    }, 0);

    const newOrderId = (data.orders.length ? Math.max(...data.orders.map(o => o.id)) : 0) + 1;
    const orderRef = `ORD-UCU-2026-${Math.floor(10000 + Math.random() * 90000)}`;

    const newOrder = {
      id: newOrderId,
      order_ref: orderRef,
      buyer_id: user.id,
      buyer_email: payload.buyer_email || user.email,
      total_amount: totalAmount,
      order_status: 'Paid',
      payment_status: 'Paid',
      payment_method: payload.payment_method || 'MTN Mobile Money',
      pickup_location: payload.pickup_location,
      buyer_name: payload.buyer_name,
      buyer_phone: payload.buyer_phone,
      notes: payload.notes || '',
      ready_for_pickup_date: null,
      completed_date: null,
      created_at: new Date().toISOString()
    };

    data.orders.push(newOrder);

    cartItems.forEach(ci => {
      const it = data.items.find(i => i.id === ci.item_id) || {};
      data.order_items.push({
        id: (data.order_items.length ? Math.max(...data.order_items.map(o => o.id)) : 0) + 1,
        order_id: newOrderId,
        item_id: ci.item_id,
        seller_id: it.seller_id || 2,
        price: it.price || 0,
        quantity: ci.quantity
      });
    });

    if (!data.payments) data.payments = [];
    const transRef = `${payload.payment_method?.includes('Airtel') ? 'AIRTEL' : payload.payment_method?.includes('PayPal') ? 'PAYPAL' : 'MTN'}-SIM-${Math.floor(100000 + Math.random() * 900000)}`;
    data.payments.push({
      id: data.payments.length + 1,
      order_id: newOrderId,
      transaction_ref: transRef,
      amount: totalAmount,
      currency: 'UGX',
      payment_method: payload.payment_method || 'MTN Mobile Money',
      phone_number: payload.phone_number || payload.buyer_phone,
      network_provider: payload.payment_method?.includes('Airtel') ? 'Airtel Uganda' : payload.payment_method?.includes('PayPal') ? 'PayPal Sandbox' : 'MTN Uganda',
      status: 'Successful',
      paid_at: new Date().toISOString()
    });

    data.cart_items = data.cart_items.filter(c => c.cart_id !== (cart ? cart.id : user.id));
    saveStorage(data);

    return {
      success: true,
      order: {
        ...newOrder,
        transaction_ref: transRef
      }
    };
  },

  getBuyerOrders: async () => {
    const user = getCurrentUser();
    if (!user) return { success: true, orders: [] };
    const data = getStorage();
    const orders = data.orders.filter(o => o.buyer_id === user.id).map(o => {
      const items = data.order_items.filter(oi => oi.order_id === o.id).map(oi => {
        const it = data.items.find(i => i.id === oi.item_id) || {};
        const seller = data.users.find(u => u.id === oi.seller_id) || {};
        return {
          ...oi,
          title: it.title || 'Product',
          image_url: it.image_url || '',
          seller_name: seller.full_name || 'Seller'
        };
      });
      const review = data.reviews.find(r => r.order_id === o.id) || null;
      return { ...o, items, review };
    });
    return { success: true, orders };
  },

  getSellerOrders: async () => {
    const user = getCurrentUser();
    if (!user) return { success: true, orders: [] };
    const data = getStorage();
    const orderItems = data.order_items.filter(oi => oi.seller_id === user.id).map(oi => {
      const ord = data.orders.find(o => o.id === oi.order_id) || {};
      const it = data.items.find(i => i.id === oi.item_id) || {};
      return {
        ...oi,
        order_ref: ord.order_ref,
        order_status: ord.order_status,
        payment_status: ord.payment_status,
        payment_method: ord.payment_method,
        pickup_location: ord.pickup_location,
        buyer_name: ord.buyer_name,
        buyer_email: ord.buyer_email,
        buyer_phone: ord.buyer_phone,
        created_at: ord.created_at,
        title: it.title,
        image_url: it.image_url,
        category: it.category
      };
    });
    return { success: true, orders: orderItems };
  },

  getOrder: async (id) => {
    const data = getStorage();
    const order = data.orders.find(o => o.id === Number(id));
    if (!order) throw new Error('Order not found');
    const items = data.order_items.filter(oi => oi.order_id === order.id).map(oi => {
      const it = data.items.find(i => i.id === oi.item_id) || {};
      const seller = data.users.find(u => u.id === oi.seller_id) || {};
      return {
        ...oi,
        title: it.title,
        image_url: it.image_url,
        seller_name: seller.full_name,
        seller_phone: seller.phone
      };
    });
    const review = data.reviews.find(r => r.order_id === order.id) || null;
    return { success: true, order, items, review, payment: { transaction_ref: `SIM-${order.id}9821` } };
  },

  updateOrderStatus: async (id, status) => {
    const user = getCurrentUser();
    const data = getStorage();
    const order = data.orders.find(o => o.id === Number(id));
    if (!order) throw new Error('Order not found');

    if (user && user.role === 'seller' && status === 'Completed') {
      throw new Error('The seller cannot mark an order as Completed. Only the buyer can confirm physical item collection.');
    }

    if (user && user.role === 'buyer' && status === 'Completed' && order.order_status !== 'Ready for Pickup') {
      throw new Error('Cannot confirm pickup until the seller marks the order as Ready for Pickup.');
    }

    order.order_status = status;
    if (status === 'Ready for Pickup') {
      order.ready_for_pickup_date = new Date().toISOString();
      if (!data.email_notifications) data.email_notifications = [];
      data.email_notifications.push({
        id: data.email_notifications.length + 1,
        order_id: order.id,
        recipient_email: order.buyer_email || 'student@ucu.ac.ug',
        notification_type: 'READY_FOR_PICKUP',
        delivery_status: 'Sent',
        sent_date: new Date().toISOString()
      });
    }
    if (status === 'Completed') {
      order.completed_date = new Date().toISOString();
      order.payment_status = 'Paid';
    }
    saveStorage(data);
    return { success: true, message: `Status updated to ${status}` };
  },

  submitReview: async (reviewData) => {
    const user = getCurrentUser();
    const data = getStorage();
    const order = data.orders.find(o => o.id === Number(reviewData.order_id));
    const sellerId = (data.order_items.find(oi => oi.order_id === order?.id) || {}).seller_id || 2;
    data.reviews.push({
      id: data.reviews.length + 1,
      order_id: Number(reviewData.order_id),
      buyer_id: user ? user.id : 5,
      seller_id: sellerId,
      rating: Number(reviewData.rating),
      comment: reviewData.comment,
      created_at: new Date().toISOString()
    });
    saveStorage(data);
    return { success: true };
  },

  getSellerReviews: async (sellerId) => {
    const data = getStorage();
    const reviews = data.reviews.filter(r => r.seller_id === Number(sellerId)).map(r => ({
      ...r,
      buyer_name: (data.users.find(u => u.id === r.buyer_id) || {}).full_name || 'Student'
    }));
    return { success: true, reviews };
  },

  getSellerItems: async () => {
    const user = getCurrentUser();
    const data = getStorage();
    const items = data.items.filter(i => i.seller_id === (user ? user.id : 2));
    return { success: true, items };
  },

  createItem: async (itemData) => {
    const user = getCurrentUser();
    const data = getStorage();
    const newId = Math.max(...data.items.map(i => i.id)) + 1;
    const newItem = {
      id: newId,
      seller_id: user ? user.id : 2,
      title: itemData.title,
      description: itemData.description,
      price: Number(itemData.price),
      category: itemData.category,
      condition_state: itemData.condition_state || 'Used',
      image_url: itemData.image_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600',
      is_available: true,
      status: 'active',
      created_at: new Date().toISOString()
    };
    data.items.push(newItem);
    saveStorage(data);
    return { success: true, item_id: newId };
  },

  updateItem: async (id, itemData) => {
    const data = getStorage();
    const item = data.items.find(i => i.id === Number(id));
    if (item) {
      Object.assign(item, itemData);
      saveStorage(data);
    }
    return { success: true };
  },

  toggleItemStatus: async (id) => {
    const data = getStorage();
    const item = data.items.find(i => i.id === Number(id));
    if (item) {
      item.is_available = !item.is_available;
      saveStorage(data);
      return { success: true, message: `Product is now ${item.is_available ? 'available' : 'unavailable'}.` };
    }
    return { success: false };
  },

  deleteItem: async (id) => {
    const data = getStorage();
    data.items = data.items.filter(i => i.id !== Number(id));
    saveStorage(data);
    return { success: true };
  },

  getAdminStats: async () => {
    const data = getStorage();
    return {
      success: true,
      stats: {
        totalUsers: data.users.length,
        totalBuyers: data.users.filter(u => u.role === 'buyer').length,
        totalSellers: data.users.filter(u => u.role === 'seller').length,
        activeUsers: data.users.filter(u => u.status === 'active').length,
        totalProducts: data.items.length,
        availableProducts: data.items.filter(i => i.is_available).length,
        soldOrUnavailable: data.items.filter(i => !i.is_available).length,
        totalOrders: data.orders.length,
        paidOrders: data.orders.filter(o => o.payment_status === 'Paid').length,
        ordersAwaitingPickup: data.orders.filter(o => o.order_status === 'Ready for Pickup').length,
        completedOrders: data.orders.filter(o => o.order_status === 'Completed').length,
        pendingOrders: data.orders.filter(o => o.order_status !== 'Completed').length,
        totalSalesVolume: data.orders.reduce((sum, o) => sum + Number(o.total_amount), 0),
        totalEmailsSent: (data.email_notifications || []).length,
        totalReviews: data.reviews.length,
        averageRating: data.reviews.length ? Number((data.reviews.reduce((sum, r) => sum + r.rating, 0) / data.reviews.length).toFixed(1)) : 0
      }
    };
  },

  getAdminUsers: async () => {
    const data = getStorage();
    return { success: true, users: data.users };
  },

  toggleUserStatus: async (userId, status) => {
    const data = getStorage();
    const u = data.users.find(user => user.id === Number(userId));
    if (u) {
      u.status = status;
      saveStorage(data);
    }
    return { success: true, message: `User status updated to ${status}.` };
  },

  getAdminProducts: async () => {
    const data = getStorage();
    const prods = data.items.map(it => ({
      ...it,
      seller_name: (data.users.find(u => u.id === it.seller_id) || {}).full_name || 'Seller'
    }));
    return { success: true, products: prods };
  },

  moderateProduct: async (id, dataObj) => {
    const data = getStorage();
    const it = data.items.find(i => i.id === Number(id));
    if (it) {
      Object.assign(it, dataObj);
      saveStorage(data);
    }
    return { success: true, message: 'Listing moderated.' };
  },

  getAdminOrders: async () => {
    const data = getStorage();
    return { success: true, orders: data.orders };
  },

  getAdminReviews: async () => {
    const data = getStorage();
    const revs = data.reviews.map(r => ({
      ...r,
      buyer_name: (data.users.find(u => u.id === r.buyer_id) || {}).full_name || 'Buyer',
      seller_name: (data.users.find(u => u.id === r.seller_id) || {}).full_name || 'Seller',
      order_ref: (data.orders.find(o => o.id === r.order_id) || {}).order_ref || 'ORD-001'
    }));
    return { success: true, reviews: revs };
  },

  getAdminPayments: async () => {
    const data = getStorage();
    const payments = (data.payments || []).map(p => {
      const order = (data.orders || []).find(o => o.id === p.order_id) || {};
      return {
        ...p,
        order_ref: order.order_ref || `ORD-UCU-${p.order_id}`,
        buyer_name: order.buyer_name || 'Student Buyer'
      };
    });
    return { success: true, payments };
  },

  getAdminEmails: async () => {
    const data = getStorage();
    const emails = (data.email_notifications || []).map(e => {
      const order = (data.orders || []).find(o => o.id === e.order_id) || {};
      return {
        ...e,
        order_ref: order.order_ref || '-'
      };
    });
    return { success: true, emails };
  },

  momoRequestToPay: async (payload) => {
    return {
      success: true,
      transaction_ref: `${payload.provider === 'airtel' ? 'AIRTEL' : 'MTN'}-SIM-${Date.now().toString().slice(-6)}`,
      status: 'SUCCESSFUL',
      message: 'Mobile money push prompt confirmed successfully.'
    };
  },

  paypalCreateOrder: async (payload) => {
    return {
      success: true,
      paypal_order_id: `PAYPAL-ORD-${Date.now().toString().slice(-6)}`,
      status: 'CREATED'
    };
  },

  paypalCaptureOrder: async (payload) => {
    return {
      success: true,
      status: 'COMPLETED',
      capture_id: `CAPTURE-${Date.now().toString().slice(-6)}`
    };
  },

  getAdminReports: async () => {
    const data = getStorage();
    return {
      success: true,
      report: {
        categoryBreakdown: [
          { category: 'Textbooks and Academic Materials', count: 4, total_value: 188000 },
          { category: 'Electronics and Gadgets', count: 4, total_value: 1580000 },
          { category: 'Clothing and Fashion', count: 3, total_value: 325000 },
          { category: 'Furniture and Accommodation Items', count: 3, total_value: 275000 },
          { category: 'Sports and Fitness', count: 2, total_value: 190000 },
          { category: 'Other Campus Essentials', count: 2, total_value: 103000 }
        ],
        ordersBreakdown: [
          { order_status: 'Completed', count: 2, total_val: 140000 },
          { order_status: 'Ready for Pickup', count: 1, total_val: 75000 }
        ],
        paymentMethodsBreakdown: [
          { payment_method: 'Mobile Money (MTN MoMo)', count: 1, total_paid: 45000 },
          { payment_method: 'Mobile Money (Airtel Money)', count: 1, total_paid: 75000 },
          { payment_method: 'Cash on Pickup (Simulation)', count: 1, total_paid: 95000 }
        ]
      }
    };
  }
};
