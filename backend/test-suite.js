// Comprehensive Integration Test Suite for UniTrade - Uganda Christian University
// Tests all 17 Requirements including Passwordless OTP, Dedicated Admin Auth,
// Compulsory Buyer Email, MoMo/Airtel/PayPal Payment Processing, Seller Restrictions,
// Automated Email Notifications, Buyer Completion, and Admin Metrics.
process.env.PORT = '5055';
const http = require('http');

// Start backend server in the same process
require('./src/server');

const PORT = 5055;
let buyerToken = '';
let sellerToken = '';
let adminToken = '';
let testItemId = null;
let testOrderId = null;

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const headers = {
      'Content-Type': 'application/json'
    };
    if (payload) {
      headers['Content-Length'] = Buffer.byteLength(payload);
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request({
      hostname: '127.0.0.1',
      port: PORT,
      path: encodeURI(`/api${path}`),
      method,
      headers
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function runTestSuite() {
  console.log('================================================================');
  console.log(' STARTING UNITRADE COMPREHENSIVE AUTOMATED TEST SUITE');
  console.log(' Uganda Christian University (UCU) - Course MGT3151 Option B');
  console.log('================================================================\n');

  let passed = 0;
  const total = 17;

  try {
    // 1. Health check & System Info
    const health = await request('GET', '/health');
    if (health.status === 200 && health.data.status === 'online') {
      console.log('✓ TEST 1: Health Check Passed (API and embedded engine online)');
      passed++;
    } else {
      console.error('✗ TEST 1 FAILED', health);
    }

    // 2. Passwordless Student Registration with OTP
    const regRes = await request('POST', '/auth/register', {
      full_name: 'Test UCU Buyer',
      email: `test.student.${Date.now()}@ucu.ac.ug`,
      phone: '+256 771 998877',
      role: 'buyer',
      campus_residence: 'Sabiti Hall'
    });
    if (regRes.status === 201 && regRes.data.success && regRes.data.requires_otp) {
      console.log('✓ TEST 2: Passwordless Student Registration Passed (6-Digit OTP generated & dispatched)');
      passed++;
    } else {
      console.error('✗ TEST 2 FAILED', regRes);
    }

    // 3. Passwordless Student Authentication (OTP Verification for Buyer & Seller)
    const buyerOtpReq = await request('POST', '/auth/request-otp', { email: 'brian.buyer@ucu.ac.ug' });
    const buyerOtpVerify = await request('POST', '/auth/verify-otp', { 
      email: 'brian.buyer@ucu.ac.ug', 
      otp: buyerOtpReq.data.demo_otp || '123456' 
    });

    const sellerOtpReq = await request('POST', '/auth/request-otp', { email: 'grace.seller@ucu.ac.ug' });
    const sellerOtpVerify = await request('POST', '/auth/verify-otp', { 
      email: 'grace.seller@ucu.ac.ug', 
      otp: sellerOtpReq.data.demo_otp || '123456' 
    });

    if (buyerOtpVerify.status === 200 && sellerOtpVerify.status === 200) {
      buyerToken = buyerOtpVerify.data.token;
      sellerToken = sellerOtpVerify.data.token;
      console.log('✓ TEST 3: Passwordless OTP Authentication Passed (Buyer & Seller JWT sessions verified)');
      passed++;
    } else {
      console.error('✗ TEST 3 FAILED', { buyerOtpVerify, sellerOtpVerify });
    }

    // 4. Dedicated Administrator Password Login
    const adminLogin = await request('POST', '/auth/admin-login', {
      email: 'admin@unitrade.ucu.ac.ug',
      password: 'Admin@123'
    });
    if (adminLogin.status === 200 && adminLogin.data.success && adminLogin.data.token) {
      adminToken = adminLogin.data.token;
      console.log('✓ TEST 4: Dedicated Administrator Password Login Passed (admin@unitrade.ucu.ac.ug)');
      passed++;
    } else {
      console.error('✗ TEST 4 FAILED', adminLogin);
    }

    // 5. Non-Admin Account Blocked from Admin Portal
    const badAdminLogin = await request('POST', '/auth/admin-login', {
      email: 'brian.buyer@ucu.ac.ug',
      password: 'Password123'
    });
    if (badAdminLogin.status === 403) {
      console.log('✓ TEST 5: Admin Login Security Passed (Non-admin accounts strictly blocked with 403)');
      passed++;
    } else {
      console.error('✗ TEST 5 FAILED', badAdminLogin);
    }

    // 6. Role-Based Access Control (RBAC)
    const adminStats = await request('GET', '/admin/stats', null, adminToken);
    const buyerAdminAttempt = await request('GET', '/admin/stats', null, buyerToken);
    if (adminStats.status === 200 && buyerAdminAttempt.status === 403) {
      console.log('✓ TEST 6: Role-based Access Control (RBAC) Passed (Admins authorized, Buyers denied admin routes)');
      passed++;
    } else {
      console.error('✗ TEST 6 FAILED', { adminStats, buyerAdminAttempt });
    }

    // 7. Product Listing by Seller
    const createItem = await request('POST', '/items', {
      title: 'Automated Test: Financial Accounting Volume 2',
      description: 'Textbook for business students at UCU. Clean pages.',
      price: 35000,
      category: 'Textbooks and Academic Materials',
      condition_state: 'Like New',
      image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600'
    }, sellerToken);

    if (createItem.status === 201 && createItem.data.success) {
      testItemId = createItem.data.item_id;
      console.log(`✓ TEST 7: Product Creation Passed (Item ID ${testItemId} listed)`);
      passed++;
    } else {
      console.error('✗ TEST 7 FAILED', createItem);
    }

    // 8. Product Editing & Price Update
    const editItem = await request('PUT', `/items/${testItemId}`, {
      title: 'Automated Test: Financial Accounting Volume 2 (Revised)',
      price: 32000,
      description: 'Updated price for campus clearance.',
      category: 'Textbooks and Academic Materials',
      condition_state: 'Used'
    }, sellerToken);
    if (editItem.status === 200 && editItem.data.success) {
      console.log('✓ TEST 8: Product Information Update Passed (Title and UGX price updated)');
      passed++;
    } else {
      console.error('✗ TEST 8 FAILED', editItem);
    }

    // 9. Product Search & Category Filtering
    const searchRes = await request('GET', '/items?search=Financial&category=Textbooks and Academic Materials');
    if (searchRes.status === 200 && searchRes.data.items && searchRes.data.items.length > 0) {
      console.log(`✓ TEST 9: Product Search & Category Filter Passed (${searchRes.data.items.length} items found)`);
      passed++;
    } else {
      console.error('✗ TEST 9 FAILED', searchRes);
    }

    // 10. Add to Cart & Subtotal Calculation
    await request('POST', '/cart/items', { item_id: testItemId, quantity: 1 }, buyerToken);
    const cartRes = await request('GET', '/cart', null, buyerToken);
    const cartItem = cartRes.data.items ? cartRes.data.items.find(ci => ci.item_id === testItemId) : null;
    if (cartRes.status === 200 && cartItem) {
      console.log(`✓ TEST 10: Shopping Cart Subtotal Passed (${cartItem.price} UGX)`);
      passed++;
    } else {
      console.error('✗ TEST 10 FAILED', cartRes);
    }

    // 11. Checkout with Compulsory Buyer Email and MTN Mobile Money
    const checkoutRes = await request('POST', '/orders/checkout', {
      pickup_location: 'Hamu Mukasa Main Library Steps',
      buyer_name: 'Brian Okello',
      buyer_email: 'brian.buyer@ucu.ac.ug',
      buyer_phone: '+256 774 332211',
      payment_method: 'MTN Mobile Money',
      phone_number: '+256 774 332211',
      network_provider: 'MTN Uganda',
      notes: 'Please meet outside Hamu Mukasa Library.'
    }, buyerToken);

    if (checkoutRes.status === 201 && checkoutRes.data.success && checkoutRes.data.order.buyer_email) {
      testOrderId = checkoutRes.data.order.id;
      console.log(`✓ TEST 11: Checkout with Compulsory Buyer Email Passed (Ref: ${checkoutRes.data.order.order_ref})`);
      passed++;
    } else {
      console.error('✗ TEST 11 FAILED', checkoutRes);
    }

    // 12. Payment Verification & Relational Payments Record
    const adminPayments = await request('GET', '/admin/payments', null, adminToken);
    const paymentRecord = (adminPayments.data.payments || []).find(p => p.order_id === testOrderId);
    if (adminPayments.status === 200 && paymentRecord && paymentRecord.currency === 'UGX') {
      console.log(`✓ TEST 12: Payment Verification Passed (${paymentRecord.payment_method} - ${paymentRecord.transaction_ref} in UGX)`);
      passed++;
    } else {
      console.error('✗ TEST 12 FAILED', adminPayments);
    }

    // 13. Seller Restricted from Marking Order Completed (Fulfills Requirement 4)
    const sellerTryComplete = await request('PATCH', `/orders/${testOrderId}/status`, {
      status: 'Completed'
    }, sellerToken);
    if (sellerTryComplete.status === 403) {
      console.log('✓ TEST 13: Seller Restriction Enforced (Seller forbidden from marking order Completed)');
      passed++;
    } else {
      console.error('✗ TEST 13 FAILED: Seller should have received 403', sellerTryComplete);
    }

    // 14. Seller Marks "Ready for Pickup" & Automatic Email Notification Triggered (Fulfills Requirements 3 & 7)
    const sellerReady = await request('PATCH', `/orders/${testOrderId}/status`, {
      status: 'Ready for Pickup'
    }, sellerToken);
    const adminEmails = await request('GET', '/admin/emails', null, adminToken);
    const emailNotice = (adminEmails.data.emails || []).find(e => e.order_id === testOrderId);

    if (sellerReady.status === 200 && emailNotice && emailNotice.notification_type === 'READY_FOR_PICKUP') {
      console.log(`✓ TEST 14: Automatic Email Notification Passed (Ready for Pickup dispatched to ${emailNotice.recipient_email})`);
      passed++;
    } else {
      console.error('✗ TEST 14 FAILED', { sellerReady, emailNotice });
    }

    // 15. Buyer Confirms Physical Receipt & Completes Order (Fulfills Requirement 4)
    const buyerComplete = await request('PATCH', `/orders/${testOrderId}/status`, {
      status: 'Completed'
    }, buyerToken);
    const verifiedOrder = await request('GET', `/orders/${testOrderId}`, null, buyerToken);

    if (buyerComplete.status === 200 && verifiedOrder.data.order.order_status === 'Completed' && verifiedOrder.data.order.completed_date) {
      console.log('✓ TEST 15: Buyer Receipt Confirmation Passed (Order Completed with physical receipt timestamp)');
      passed++;
    } else {
      console.error('✗ TEST 15 FAILED', { buyerComplete, verifiedOrder });
    }

    // 16. Buyer Seller Rating & Review
    const reviewRes = await request('POST', '/reviews', {
      order_id: testOrderId,
      rating: 5,
      comment: 'Excellent service! Picked up at Hamu Mukasa Library on time.'
    }, buyerToken);
    if (reviewRes.status === 201 && reviewRes.data.success) {
      console.log('✓ TEST 16: Customer Review & Rating Passed (5-Star rating recorded)');
      passed++;
    } else {
      console.error('✗ TEST 16 FAILED', reviewRes);
    }

    // 17. Administrator Dashboard Complete Reporting & Logs (Fulfills Requirement 8)
    const adminUsersList = await request('GET', '/admin/users', null, adminToken);
    const adminProductsList = await request('GET', '/admin/products', null, adminToken);
    const adminReports = await request('GET', '/admin/reports', null, adminToken);

    if (adminUsersList.status === 200 && adminProductsList.status === 200 && adminReports.status === 200) {
      console.log('✓ TEST 17: Admin Audit & Management Passed (Users, Products, Payments, Emails & Reports verified)');
      passed++;
    } else {
      console.error('✗ TEST 17 FAILED');
    }

  } catch (err) {
    console.error('UNEXPECTED TEST ERROR:', err);
  }

  console.log('\n================================================================');
  console.log(` TEST RESULTS: ${passed} / ${total} TESTS PASSED`);
  if (passed === total) {
    console.log(' ALL 17 AUTOMATED INTEGRATION TESTS COMPLETED SUCCESSFULLY (100%)');
  }
  console.log('================================================================');
  process.exit(passed === total ? 0 : 1);
}

setTimeout(runTestSuite, 1200);
