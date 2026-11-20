const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken, requireRole } = require('../middleware/auth');
const emailService = require('../services/email.service');

// Generate unique campus order reference
function generateOrderRef() {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `ORD-UCU-${year}-${randomNum}`;
}

// ----------------------------------------------------------------------
// 1. CHECKOUT (Create Order & Process Payment: MTN, Airtel, or PayPal)
// ----------------------------------------------------------------------
router.post('/checkout', verifyToken, async (req, res) => {
  try {
    const {
      buyer_name,
      buyer_email,
      buyer_phone,
      pickup_location,
      payment_method = 'MTN Mobile Money',
      phone_number,
      paypal_order_id,
      notes = ''
    } = req.body;

    // Validate compulsory fields
    if (!buyer_name || !buyer_email || !buyer_phone || !pickup_location) {
      return res.status(400).json({
        success: false,
        message: 'Recipient full name, compulsory buyer email address, contact phone, and campus pickup location are required.'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(buyer_email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid buyer email address for order notifications.'
      });
    }

    // Validate payment method and credentials
    const validPaymentMethods = ['MTN Mobile Money', 'Airtel Money', 'PayPal'];
    if (!validPaymentMethods.includes(payment_method)) {
      return res.status(400).json({
        success: false,
        message: `Invalid payment method. Allowed options: ${validPaymentMethods.join(', ')}`
      });
    }

    // Validate phone number for Mobile Money options
    if (payment_method === 'MTN Mobile Money' || payment_method === 'Airtel Money') {
      const payPhone = (phone_number || buyer_phone).trim();
      if (!payPhone || payPhone.length < 9) {
        return res.status(400).json({
          success: false,
          message: `Please enter a valid mobile number for ${payment_method}.`
        });
      }
    }

    // 1. Get user's cart and cart items
    const [carts] = await db.query('SELECT id FROM cart WHERE user_id = ?', [req.user.id]);
    if (!carts || carts.length === 0) {
      return res.status(400).json({ success: false, message: 'Your shopping cart is empty.' });
    }

    const cartId = carts[0].id;
    const [cartItems] = await db.query(`
      SELECT cart_items.*, items.title, items.price, items.is_available, items.status, items.seller_id
      FROM cart_items
      JOIN items ON cart_items.item_id = items.id
      WHERE cart_items.cart_id = ?
    `, [cartId]);

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ success: false, message: 'Your shopping cart is empty.' });
    }

    // 2. Validate availability of all products
    for (const item of cartItems) {
      if (!item.is_available || item.status !== 'active') {
        return res.status(400).json({
          success: false,
          message: `Product "${item.title}" is no longer available. Please remove it from your cart before proceeding.`
        });
      }
    }

    // 3. Calculate total in UGX
    const totalAmount = cartItems.reduce((acc, it) => acc + (Number(it.price) * it.quantity), 0);
    const orderRef = generateOrderRef();

    // 4. Create Order with compulsory buyer_email
    const [orderResult] = await db.query(`
      INSERT INTO orders (order_ref, buyer_id, buyer_email, total_amount, order_status, payment_status, payment_method, pickup_location, buyer_name, buyer_phone, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      orderRef,
      req.user.id,
      buyer_email.trim().toLowerCase(),
      totalAmount,
      'Paid',
      'Paid',
      payment_method,
      pickup_location.trim(),
      buyer_name.trim(),
      buyer_phone.trim(),
      notes ? notes.trim() : ''
    ]);

    const orderId = orderResult.insertId;

    // 5. Create Order Items
    for (const item of cartItems) {
      await db.query(`
        INSERT INTO order_items (order_id, item_id, seller_id, price, quantity)
        VALUES (?, ?, ?, ?, ?)
      `, [orderId, item.item_id, item.seller_id, item.price, item.quantity]);
    }

    // 6. Record Payment with Transaction Reference
    let transRef = '';
    let networkProvider = '';
    if (payment_method === 'MTN Mobile Money') {
      transRef = `MTN-MOMO-${Math.floor(100000 + Math.random() * 900000)}`;
      networkProvider = 'MTN Uganda';
    } else if (payment_method === 'Airtel Money') {
      transRef = `AIRTEL-MOMO-${Math.floor(100000 + Math.random() * 900000)}`;
      networkProvider = 'Airtel Uganda';
    } else if (payment_method === 'PayPal') {
      transRef = paypal_order_id || `PAYPAL-CAP-${Math.floor(100000 + Math.random() * 900000)}`;
      networkProvider = 'PayPal Sandbox';
    }

    await db.query(`
      INSERT INTO payments (order_id, transaction_ref, amount, payment_method, phone_number, network_provider, status, is_simulated)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      orderId,
      transRef,
      totalAmount,
      payment_method,
      payment_method === 'PayPal' ? null : (phone_number || buyer_phone),
      networkProvider,
      'Successful',
      true
    ]);

    // 7. Clear Buyer's Cart
    await db.query('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);

    return res.status(201).json({
      success: true,
      message: `Order placed successfully! Payment confirmed via ${payment_method}.`,
      order: {
        id: orderId,
        order_ref: orderRef,
        buyer_email: buyer_email.trim().toLowerCase(),
        total_amount: totalAmount,
        order_status: 'Paid',
        payment_status: 'Paid',
        payment_method,
        pickup_location,
        transaction_ref: transRef,
        item_count: cartItems.length
      }
    });
  } catch (err) {
    console.error('Checkout error:', err);
    return res.status(500).json({
      success: false,
      message: 'Checkout process failed due to server error.'
    });
  }
});

// ----------------------------------------------------------------------
// 2. GET BUYER'S ORDERS
// ----------------------------------------------------------------------
router.get('/buyer/my-orders', verifyToken, async (req, res) => {
  try {
    const [orders] = await db.query(
      'SELECT * FROM orders WHERE buyer_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );

    // Attach items to each order
    const enriched = await Promise.all(orders.map(async (ord) => {
      const [items] = await db.query(`
        SELECT order_items.*, items.title, items.image_url, items.category, users.full_name AS seller_name, users.phone AS seller_phone
        FROM order_items
        JOIN items ON order_items.item_id = items.id
        JOIN users ON order_items.seller_id = users.id
        WHERE order_items.order_id = ?
      `, [ord.id]);

      const [reviews] = await db.query('SELECT * FROM reviews WHERE order_id = ?', [ord.id]);

      return {
        ...ord,
        items,
        review: reviews.length > 0 ? reviews[0] : null
      };
    }));

    return res.status(200).json({
      success: true,
      orders: enriched
    });
  } catch (err) {
    console.error('Fetch buyer orders error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve buyer orders.' });
  }
});

// ----------------------------------------------------------------------
// 3. GET SELLER'S INCOMING ORDERS
// ----------------------------------------------------------------------
router.get('/seller/my-orders', verifyToken, requireRole('seller', 'admin'), async (req, res) => {
  try {
    // Find all order items sold by this seller
    const [sellerOrderItems] = await db.query(
      'SELECT DISTINCT order_id FROM order_items WHERE seller_id = ?',
      [req.user.id]
    );

    if (!sellerOrderItems || sellerOrderItems.length === 0) {
      return res.status(200).json({ success: true, orders: [] });
    }

    const orderIds = sellerOrderItems.map(oi => oi.order_id);
    const [allOrders] = await db.query('SELECT * FROM orders ORDER BY created_at DESC');
    const orders = allOrders.filter(o => orderIds.includes(o.id));

    const enriched = await Promise.all(orders.map(async (ord) => {
      const [items] = await db.query(`
        SELECT order_items.*, items.title, items.image_url, items.category
        FROM order_items
        JOIN items ON order_items.item_id = items.id
        WHERE order_items.order_id = ? AND order_items.seller_id = ?
      `, [ord.id, req.user.id]);

      return {
        ...ord,
        items
      };
    }));

    return res.status(200).json({
      success: true,
      orders: enriched
    });
  } catch (err) {
    console.error('Fetch seller orders error:', err);
    return res.status(500).json({ success: false, message: 'Failed to load incoming seller orders.' });
  }
});

// ----------------------------------------------------------------------
// 4. GET SINGLE ORDER DETAILS
// ----------------------------------------------------------------------
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const orderId = Number(req.params.id);
    const [orders] = await db.query('SELECT * FROM orders WHERE id = ?', [orderId]);

    if (!orders || orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const order = orders[0];

    // Ownership check: must be buyer, seller of items, or admin
    let isSeller = false;
    const [items] = await db.query(`
      SELECT order_items.*, items.title, items.image_url, items.category, users.full_name AS seller_name, users.phone AS seller_phone
      FROM order_items
      JOIN items ON order_items.item_id = items.id
      JOIN users ON order_items.seller_id = users.id
      WHERE order_items.order_id = ?
    `, [order.id]);

    if (items.some(item => item.seller_id === req.user.id)) {
      isSeller = true;
    }

    if (req.user.role !== 'admin' && order.buyer_id !== req.user.id && !isSeller) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this order.' });
    }

    const [payments] = await db.query('SELECT * FROM payments WHERE order_id = ?', [order.id]);
    const payment = payments.length > 0 ? payments[0] : null;

    const [reviews] = await db.query('SELECT * FROM reviews WHERE order_id = ?', [order.id]);
    const review = reviews.length > 0 ? reviews[0] : null;

    return res.status(200).json({
      success: true,
      order,
      items,
      payment,
      review
    });
  } catch (err) {
    console.error('Fetch order detail error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve order details.' });
  }
});

// ----------------------------------------------------------------------
// 5. UPDATE ORDER STATUS (Strict Role-Based Progression)
// Sellers can update to: Accepted, Preparing, Ready for Pickup
// ONLY Buyers can update to: Completed (after physical collection)
// ----------------------------------------------------------------------
router.patch('/:id/status', verifyToken, async (req, res) => {
  try {
    const orderId = Number(req.params.id);
    const { status } = req.body;

    const validStatuses = [
      'Pending Payment',
      'Paid',
      'Accepted',
      'Preparing',
      'Ready for Pickup',
      'Completed',
      'Cancelled'
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid order status. Allowed values: ${validStatuses.join(', ')}`
      });
    }

    const [orders] = await db.query('SELECT * FROM orders WHERE id = ?', [orderId]);
    if (!orders || orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const order = orders[0];

    const [orderItems] = await db.query(`
      SELECT order_items.*, items.title, users.full_name AS seller_name
      FROM order_items
      JOIN items ON order_items.item_id = items.id
      JOIN users ON order_items.seller_id = users.id
      WHERE order_items.order_id = ?
    `, [orderId]);

    const sellerIds = orderItems.map(oi => oi.seller_id);
    const isSeller = sellerIds.includes(req.user.id);
    const isBuyer = order.buyer_id === req.user.id;
    const isAdmin = req.user.role === 'admin';

    // A. SELLER RESTRICTIONS:
    // Seller can only update to: Accepted, Preparing, Ready for Pickup
    // Seller CANNOT complete the order!
    if (isSeller && !isAdmin && !isBuyer) {
      const allowedSellerTransitions = ['Accepted', 'Preparing', 'Ready for Pickup'];
      if (status === 'Completed') {
        return res.status(403).json({
          success: false,
          message: 'The seller cannot mark an order as Completed. Only the buyer can confirm physical item collection to complete the order.'
        });
      }
      if (!allowedSellerTransitions.includes(status)) {
        return res.status(403).json({
          success: false,
          message: `Sellers can only update orders to: ${allowedSellerTransitions.join(', ')}.`
        });
      }
    }

    // B. BUYER RESTRICTIONS:
    // Buyer can only complete the order (Confirm Pickup) or Cancel if pending
    if (isBuyer && !isAdmin && !isSeller) {
      if (status === 'Completed') {
        // Enforce that order must already be Ready for Pickup
        if (order.order_status !== 'Ready for Pickup') {
          return res.status(400).json({
            success: false,
            message: 'You cannot confirm pickup yet. The seller must first prepare the item and mark the order as "Ready for Pickup".'
          });
        }
      } else if (status === 'Cancelled') {
        if (order.order_status !== 'Pending Payment' && order.order_status !== 'Paid') {
          return res.status(400).json({
            success: false,
            message: 'Orders in progress or ready for pickup cannot be cancelled directly.'
          });
        }
      } else {
        return res.status(403).json({
          success: false,
          message: 'Buyers can only confirm pickup (mark Completed) or cancel an order.'
        });
      }
    }

    // C. UNAUTHORIZED CHECK
    if (!isSeller && !isBuyer && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized to modify this order.' });
    }

    // Perform status update
    let newPaymentStatus = order.payment_status;
    if (status === 'Completed' || status === 'Paid' || status === 'Ready for Pickup') {
      newPaymentStatus = 'Paid';
    }

    await db.query(
      'UPDATE orders SET order_status = ?, payment_status = ? WHERE id = ?',
      [status, newPaymentStatus, orderId]
    );

    // D. AUTOMATIC EMAIL NOTIFICATION WHEN REACHING READY FOR PICKUP
    if (status === 'Ready for Pickup') {
      const itemsSummary = orderItems.map(oi => `${oi.title} (Qty: ${oi.quantity})`).join(', ');
      const sellerNames = [...new Set(orderItems.map(oi => oi.seller_name))].join(', ');

      // Send automatic notification
      try {
        await emailService.sendReadyForPickupEmail({
          order,
          buyerName: order.buyer_name,
          buyerEmail: order.buyer_email,
          sellerName: sellerNames || 'Campus Seller',
          pickupLocation: order.pickup_location,
          totalAmount: order.total_amount,
          orderRef: order.order_ref,
          itemsSummary
        });
      } catch (mailErr) {
        console.error('[UniTrade] Email notification dispatch failed:', mailErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: `Order status successfully updated to "${status}".`,
      order_status: status,
      payment_status: newPaymentStatus
    });
  } catch (err) {
    console.error('Update order status error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update order status.' });
  }
});

module.exports = router;
