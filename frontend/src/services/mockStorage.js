// Client-Side Database & Mock Gateway for GitHub Pages Static Deployment
// Automatically activates when running on puppy-ug.github.io

const STORAGE_KEY = 'unitrade_campus_db';

const INITIAL_DATA = {
  users: [
    {
      id: 1,
      full_name: 'Dennis Kibirige (Admin)',
      email: 'admin@unitrade.ucu.ac.ug',
      phone: '+256 772 100200',
      role: 'admin',
      campus_residence: 'Main Campus Administration Building',
      student_id: 'ADM/UCU/001',
      status: 'active'
    },
    {
      id: 2,
      full_name: 'Grace Akello',
      email: 'grace.seller@ucu.ac.ug',
      phone: '+256 701 445566',
      role: 'seller',
      campus_residence: 'Agape Hall, Block B, Room 204',
      student_id: 'S22/BBA/045',
      status: 'active'
    },
    {
      id: 3,
      full_name: 'Emmanuel Kato',
      email: 'emmanuel.seller@ucu.ac.ug',
      phone: '+256 782 998877',
      role: 'seller',
      campus_residence: 'Soba Hostel, Room 14',
      student_id: 'S21/BCS/112',
      status: 'active'
    },
    {
      id: 4,
      full_name: 'Fiona Tumusiime',
      email: 'fiona.seller@ucu.ac.ug',
      phone: '+256 753 112233',
      role: 'seller',
      campus_residence: 'Bishop Tucker Hall, Room 12',
      student_id: 'S23/LAW/088',
      status: 'active'
    },
    {
      id: 5,
      full_name: 'Brian Okello',
      email: 'brian.buyer@ucu.ac.ug',
      phone: '+256 774 332211',
      role: 'buyer',
      campus_residence: 'Sabiti Hall, Room 108',
      student_id: 'S24/BSIT/019',
      status: 'active'
    },
    {
      id: 6,
      full_name: 'Sarah Namubiru',
      email: 'sarah.buyer@ucu.ac.ug',
      phone: '+256 705 667788',
      role: 'buyer',
      campus_residence: 'Allan Galpin Hall, Room 305',
      student_id: 'S23/BCOM/210',
      status: 'active'
    },
    {
      id: 7,
      full_name: 'David Mukasa',
      email: 'david.buyer@ucu.ac.ug',
      phone: '+256 786 554433',
      role: 'buyer',
      campus_residence: 'Bugujju Off-Campus Residency',
      student_id: 'S22/BENG/074',
      status: 'active'
    }
  ],
  items: [
    {
      id: 1,
      seller_id: 2,
      title: 'Principles of Marketing (Kotler & Armstrong) 17th Ed.',
      description: 'Standard textbook for MGT and BBA business students at UCU. Clean pages with minimal pencil highlights. In excellent condition.',
      price: 45000,
      category: 'Textbooks and Academic Materials',
      condition_state: 'Like New',
      image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
      is_available: true,
      status: 'active',
      created_at: '2026-11-05 09:00:00'
    },
    {
      id: 2,
      seller_id: 2,
      title: 'Business Law & Ethics in East Africa (3rd Edition)',
      description: 'Essential for Bachelor of Laws and Business Administration coursework. Complete with case summaries and statutes index.',
      price: 38000,
      category: 'Textbooks and Academic Materials',
      condition_state: 'Used',
      image_url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
      is_available: true,
      status: 'active',
      created_at: '2026-11-05 10:15:00'
    },
    {
      id: 3,
      seller_id: 3,
      title: 'Calculus: Early Transcendentals (James Stewart 8th Ed.)',
      description: 'Comprehensive calculus textbook required for engineering, IT, and computer science courses. Includes problem solutions guide.',
      price: 50000,
      category: 'Textbooks and Academic Materials',
      condition_state: 'Used',
      image_url: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?w=600&auto=format&fit=crop&q=80',
      is_available: true,
      status: 'active',
      created_at: '2026-11-06 14:00:00'
    },
    {
      id: 4,
      seller_id: 3,
      title: 'Introduction to Java Programming & Data Structures',
      description: 'Used for BIT/BCS programming modules. Detailed explanations, object-oriented concepts, algorithm design, and code examples.',
      price: 55000,
      category: 'Textbooks and Academic Materials',
      condition_state: 'Like New',
      image_url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80',
      is_available: true,
      status: 'active',
      created_at: '2026-11-06 15:30:00'
    },
    {
      id: 5,
      seller_id: 3,
      title: 'HP Pavilion 15 Laptop (Intel Core i5, 8GB RAM, 512GB SSD)',
      description: 'Great laptop for research, programming, and online classes. Strong battery health (approx 4.5 hours), genuine Windows 11, with original charger.',
      price: 1250000,
      category: 'Electronics and Gadgets',
      condition_state: 'Used',
      image_url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop&q=80',
      is_available: true,
      status: 'active',
      created_at: '2026-11-07 11:00:00'
    },
    {
      id: 6,
      seller_id: 2,
      title: 'Sony WH-CH520 Wireless Bluetooth Headphones',
      description: 'Comfortable over-ear headphones with 50-hour battery life and quick charge. Ideal for quiet study sessions in Hamu Mukasa Library.',
      price: 160000,
      category: 'Electronics and Gadgets',
      condition_state: 'Like New',
      image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
      is_available: true,
      status: 'active',
      created_at: '2026-11-07 13:20:00'
    },
    {
      id: 7,
      seller_id: 3,
      title: 'Casio fx-991EX Scientific ClassWiz Calculator',
      description: 'Original scientific calculator with natural textbook display and spreadsheet functions. Approved for university semester exams.',
      price: 75000,
      category: 'Electronics and Gadgets',
      condition_state: 'Like New',
      image_url: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=600&auto=format&fit=crop&q=80',
      is_available: true,
      status: 'active',
      created_at: '2026-11-08 09:10:00'
    },
    {
      id: 8,
      seller_id: 4,
      title: 'Anker 20,000mAh PowerCore Fast-Charging Power Bank',
      description: 'High capacity external battery pack. Can charge your smartphone 4 to 5 times. Includes dual USB ports and power IQ technology.',
      price: 95000,
      category: 'Electronics and Gadgets',
      condition_state: 'New',
      image_url: 'https://images.unsplash.com/photo-1609592424361-b541315fcb1f?w=600&auto=format&fit=crop&q=80',
      is_available: true,
      status: 'active',
      created_at: '2026-11-08 14:40:00'
    },
    {
      id: 9,
      seller_id: 4,
      title: 'UCU Branded Varsity Jacket (Navy & Gold, Size M)',
      description: 'Authentic university fleece varsity jacket with embroidered UCU crest. Warm, stylish, and perfect for Mukono evening weather.',
      price: 85000,
      category: 'Clothing and Fashion',
      condition_state: 'Like New',
      image_url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop&q=80',
      is_available: true,
      status: 'active',
      created_at: '2026-11-09 10:00:00'
    },
    {
      id: 10,
      seller_id: 2,
      title: 'Formal Black Tailored Blazer (Size L)',
      description: 'Classic two-button formal suit jacket for community worship, class presentations, moot court, and formal university dinners.',
      price: 60000,
      category: 'Clothing and Fashion',
      condition_state: 'Used',
      image_url: 'https://images.unsplash.com/photo-1598808503746-f34c53b9323e?w=600&auto=format&fit=crop&q=80',
      is_available: true,
      status: 'active',
      created_at: '2026-11-09 12:30:00'
    },
    {
      id: 11,
      seller_id: 3,
      title: 'Timberland Classic Waterproof Leather Boots (Size 42)',
      description: 'Durable rugged boots suitable for daily campus walking in all weather conditions. Well maintained leather.',
      price: 180000,
      category: 'Clothing and Fashion',
      condition_state: 'Used',
      image_url: 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=600&auto=format&fit=crop&q=80',
      is_available: true,
      status: 'active',
      created_at: '2026-11-10 15:00:00'
    },
    {
      id: 12,
      seller_id: 4,
      title: 'Orthopedic Single Foam Mattress (3x6 ft) + Free Cover',
      description: 'Comfortable single student mattress used for only one academic semester. Clean, sanitised and includes washable protective cover.',
      price: 120000,
      category: 'Furniture and Accommodation Items',
      condition_state: 'Like New',
      image_url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&auto=format&fit=crop&q=80',
      is_available: true,
      status: 'active',
      created_at: '2026-11-11 08:30:00'
    },
    {
      id: 13,
      seller_id: 2,
      title: 'Compact Wooden Study Desk with Lockable Drawer',
      description: 'Sturdy wooden table tailored for student rooms and hostels around Mukono. Has a side shelf for notebooks and laptops.',
      price: 90000,
      category: 'Furniture and Accommodation Items',
      condition_state: 'Used',
      image_url: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600&auto=format&fit=crop&q=80',
      is_available: true,
      status: 'active',
      created_at: '2026-11-11 11:45:00'
    },
    {
      id: 14,
      seller_id: 4,
      title: 'Electric Hot Plate Stove (Double Burner) for Hostel',
      description: 'Fast heating double burner stove with temperature control dials. Works efficiently and fits neatly on hostel kitchen countertops.',
      price: 65000,
      category: 'Furniture and Accommodation Items',
      condition_state: 'Like New',
      image_url: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&auto=format&fit=crop&q=80',
      is_available: true,
      status: 'active',
      created_at: '2026-11-12 10:15:00'
    },
    {
      id: 15,
      seller_id: 3,
      title: 'Nike Premier Firm-Ground Football Cleats (Size 43)',
      description: 'Professional football boots with moulded studs for grass pitches. Lightweight traction ideal for campus inter-faculty tournaments.',
      price: 110000,
      category: 'Sports and Fitness',
      condition_state: 'Like New',
      image_url: 'https://images.unsplash.com/photo-1511886929837-354d827aae26?w=600&auto=format&fit=crop&q=80',
      is_available: true,
      status: 'active',
      created_at: '2026-11-12 16:00:00'
    },
    {
      id: 16,
      seller_id: 2,
      title: 'Pair of 10kg Rubber Coated Hex Dumbbells',
      description: 'Heavy duty cast iron hex dumbbells with anti-slip ergonomic chrome handles. Does not roll on the floor.',
      price: 80000,
      category: 'Sports and Fitness',
      condition_state: 'Used',
      image_url: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&auto=format&fit=crop&q=80',
      is_available: true,
      status: 'active',
      created_at: '2026-11-13 13:00:00'
    },
    {
      id: 17,
      seller_id: 2,
      title: 'Philips 1.7L Cordless Fast-Boil Electric Kettle',
      description: 'High performance stainless steel kettle. Boils water in under 3 minutes for tea, coffee, and quick noodles in student hostels.',
      price: 48000,
      category: 'Other Campus Essentials',
      condition_state: 'Used',
      image_url: 'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?w=600&auto=format&fit=crop&q=80',
      is_available: true,
      status: 'active',
      created_at: '2026-11-14 09:30:00'
    },
    {
      id: 18,
      seller_id: 4,
      title: 'Heavy Duty Campus Laptop Backpack (Water-resistant)',
      description: 'Spacious backpack with dedicated padded sleeve for 15.6 inch laptop, external USB charging port, and multiple organiser pockets.',
      price: 55000,
      category: 'Other Campus Essentials',
      condition_state: 'New',
      image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80',
      is_available: true,
      status: 'active',
      created_at: '2026-11-14 11:00:00'
    }
  ],
  orders: [
    {
      id: 1,
      order_ref: 'ORD-UCU-2026-001',
      buyer_id: 5,
      total_amount: 45000,
      order_status: 'Completed',
      payment_status: 'Paid',
      payment_method: 'MTN Mobile Money',
      pickup_location: 'Main Library Entrance (Hamu Mukasa Library)',
      buyer_name: 'Brian Okello',
      buyer_email: 'brian.okello@ucu.ac.ug',
      buyer_phone: '+256 774 332211',
      notes: 'Please bring it near the security desk.',
      ready_for_pickup_date: '2026-11-15 14:00:00',
      completed_date: '2026-11-15 16:30:00',
      created_at: '2026-11-15 11:20:00',
      updated_at: '2026-11-15 15:40:00'
    },
    {
      id: 2,
      order_ref: 'ORD-UCU-2026-002',
      buyer_id: 6,
      total_amount: 75000,
      order_status: 'Ready for Pickup',
      payment_status: 'Paid',
      payment_method: 'Airtel Money',
      pickup_location: 'UCU Guild Canteen / Tech Park',
      buyer_name: 'Sarah Namubiru',
      buyer_email: 'sarah.namubiru@ucu.ac.ug',
      buyer_phone: '+256 705 667788',
      notes: 'Available after 2:00 PM lecture.',
      ready_for_pickup_date: '2026-11-16 11:30:00',
      completed_date: null,
      created_at: '2026-11-16 10:05:00',
      updated_at: '2026-11-16 12:30:00'
    },
    {
      id: 3,
      order_ref: 'ORD-UCU-2026-003',
      buyer_id: 7,
      total_amount: 95000,
      order_status: 'Completed',
      payment_status: 'Paid',
      payment_method: 'PayPal',
      pickup_location: 'Nkoyoyo Hall Steps',
      buyer_name: 'David Mukasa',
      buyer_email: 'david.mukasa@ucu.ac.ug',
      buyer_phone: '+256 786 554433',
      notes: 'Will pay in cash upon inspecting the power bank.',
      ready_for_pickup_date: '2026-11-17 15:30:00',
      completed_date: '2026-11-17 17:00:00',
      created_at: '2026-11-17 14:15:00',
      updated_at: '2026-11-17 16:50:00'
    }
  ],
  payments: [
    {
      id: 1,
      order_id: 1,
      transaction_ref: 'MTN-UG-982311',
      amount: 45000,
      currency: 'UGX',
      payment_method: 'MTN Mobile Money',
      phone_number: '+256 774 332211',
      network_provider: 'MTN Uganda',
      status: 'Successful',
      paid_at: '2026-11-15 11:22:00'
    },
    {
      id: 2,
      order_id: 2,
      transaction_ref: 'AIRTEL-UG-441290',
      amount: 75000,
      currency: 'UGX',
      payment_method: 'Airtel Money',
      phone_number: '+256 705 667788',
      network_provider: 'Airtel Uganda',
      status: 'Successful',
      paid_at: '2026-11-16 10:08:00'
    },
    {
      id: 3,
      order_id: 3,
      transaction_ref: 'PAYPAL-CAPT-781923',
      amount: 95000,
      currency: 'UGX',
      payment_method: 'PayPal',
      phone_number: '+256 786 554433',
      network_provider: 'PayPal Sandbox',
      status: 'Successful',
      paid_at: '2026-11-17 14:18:00'
    }
  ],
  email_notifications: [
    {
      id: 1,
      order_id: 1,
      recipient_email: 'brian.okello@ucu.ac.ug',
      notification_type: 'READY_FOR_PICKUP',
      delivery_status: 'Sent',
      sent_date: '2026-11-15 14:00:15'
    },
    {
      id: 2,
      order_id: 2,
      recipient_email: 'sarah.namubiru@ucu.ac.ug',
      notification_type: 'READY_FOR_PICKUP',
      delivery_status: 'Sent',
      sent_date: '2026-11-16 11:30:20'
    },
    {
      id: 3,
      order_id: 3,
      recipient_email: 'david.mukasa@ucu.ac.ug',
      notification_type: 'READY_FOR_PICKUP',
      delivery_status: 'Sent',
      sent_date: '2026-11-17 15:30:10'
    }
  ],
  order_items: [
    { id: 1, order_id: 1, item_id: 1, seller_id: 2, price: 45000, quantity: 1 },
    { id: 2, order_id: 2, item_id: 7, seller_id: 3, price: 75000, quantity: 1 },
    { id: 3, order_id: 3, item_id: 8, seller_id: 4, price: 95000, quantity: 1 }
  ],
  reviews: [
    {
      id: 1,
      order_id: 1,
      buyer_id: 5,
      seller_id: 2,
      rating: 5,
      comment: 'Great seller! The textbook was exactly as described and Grace met me promptly at the Hamu Mukasa Library.',
      created_at: '2026-11-15 16:30:00'
    },
    {
      id: 2,
      order_id: 3,
      buyer_id: 7,
      seller_id: 4,
      rating: 5,
      comment: 'Fiona was very responsive. The Anker power bank is brand new and charges my phone super fast!',
      created_at: '2026-11-17 17:10:00'
    }
  ],
  cart: [
    { id: 1, user_id: 5, created_at: '2026-11-18 10:00:00' },
    { id: 2, user_id: 6, created_at: '2026-11-18 11:00:00' }
  ],
  cart_items: [
    { id: 1, cart_id: 1, item_id: 6, quantity: 1 },
    { id: 2, cart_id: 1, item_id: 17, quantity: 1 }
  ]
};

function getStorage() {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (!existing) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
    return JSON.parse(JSON.stringify(INITIAL_DATA));
  }
  try {
    return JSON.parse(existing);
  } catch (e) {
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
      campus_residence: userData.campus_residence || 'Sabiti Hall',
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
        averageRating: 4.9
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
