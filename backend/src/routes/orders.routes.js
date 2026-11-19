const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken, requireRole } = require('../middleware/auth');

// Helper to generate unique campus order reference
function generateOrderRef() {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `ORD-UCU-${year}-${randomNum}`;
}

// POST /api/orders/checkout - Place order with mock payment simulation
router.post('/checkout', verifyToken, async (req, res) => {
  try {
    const {
      pickup_location,
      buyer_name,
      buyer_phone,
      payment_method = 'Mobile Money (MTN MoMo)',
      phone_number,
      network_provider = 'MTN Uganda',
      notes = ''
    } = req.body;

    if (!pickup_location || !buyer_name || !buyer_phone) {
      return res.status(400).json({
        success: false,
        message: 'Pickup location, recipient name, and contact phone are required for campus order fulfillment.'
      });
    }

    // 1. Get user cart and cart items
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

    // 2. Validate availability of each item
    for (const item of cartItems) {
      if (!item.is_available || item.status !== 'active') {
        return res.status(400).json({
          success: false,
          message: `Product "${item.title}" is no longer available. Please remove it from your cart before completing checkout.`
        });
      }
    }

    // 3. Calculate total
    const totalAmount = cartItems.reduce((acc, it) => acc + (Number(it.price) * it.quantity), 0);
    const orderRef = generateOrderRef();

    // Determine initial payment and order status
    const isCash = payment_method.toLowerCase().includes('cash');
    const paymentStatus = isCash ? 'Unpaid' : 'Paid';
    const initialOrderStatus = isCash ? 'Pending' : 'Paid';

    // 4. Create Order
    const [orderResult] = await db.query(`
      INSERT INTO orders (order_ref, buyer_id, total_amount, order_status, payment_status, payment_method, pickup_location, buyer_name, buyer_phone, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      orderRef,
      req.user.id,
      totalAmount,
      initialOrderStatus,
      paymentStatus,
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

    // 6. Record Simulated Payment
    const transRef = `${isCash ? 'CASH' : 'MOMO'}-SIM-${Math.floor(100000 + Math.random() * 900000)}`;
    await db.query(`
      INSERT INTO payments (order_id, transaction_ref, amount, payment_method, phone_number, network_provider, status, is_simulated)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      orderId,
      transRef,
      totalAmount,
      payment_method,
      phone_number || buyer_phone,
      isCash ? 'Cash on Pickup' : (network_provider || 'MTN Uganda'),
      'Successful',
      true
    ]);

    // 7. Clear Buyer's Cart
    await db.query('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);

    return res.status(201).json({
      success: true,
      message: 'Order created and payment simulated successfully!',
      order: {
        id: orderId,
        order_ref: orderRef,
        total_amount: totalAmount,
        order_status: initialOrderStatus,
        payment_status: paymentStatus,
        payment_method,
        pickup_location,
        transaction_ref: transRef,
        is_simulated: true,
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

// GET /api/orders/buyer/my-orders - List all orders placed by the current buyer
router.get('/buyer/my-orders', verifyToken, async (req, res) => {
  try {
    const [orders] = await db.query(`
      SELECT * FROM orders 
      WHERE buyer_id = ? 
      ORDER BY created_at DESC
    `, [req.user.id]);

    // Attach items to each order
    const enrichedOrders = [];
    for (const order of orders) {
      const [items] = await db.query(`
        SELECT order_items.*, items.title, items.image_url, items.category, users.full_name AS seller_name
        FROM order_items
        JOIN items ON order_items.item_id = items.id
        JOIN users ON order_items.seller_id = users.id
        WHERE order_items.order_id = ?
      `, [order.id]);

      // Check if review already submitted
      const [reviews] = await db.query('SELECT id, rating, comment FROM reviews WHERE order_id = ?', [order.id]);

      enrichedOrders.push({
        ...order,
        items,
        review: reviews.length > 0 ? reviews[0] : null
      });
    }

    return res.status(200).json({
      success: true,
      count: enrichedOrders.length,
      orders: enrichedOrders
    });
  } catch (err) {
    console.error('Fetch buyer orders error:', err);
    return res.status(500).json({ success: false, message: 'Failed to load your campus orders.' });
  }
});

// GET /api/orders/seller/my-orders - List orders containing products belonging to this seller
router.get('/seller/my-orders', verifyToken, requireRole('seller'), async (req, res) => {
  try {
    const [orderItems] = await db.query(`
      SELECT order_items.*, orders.order_ref, orders.order_status, orders.payment_status,
             orders.payment_method, orders.pickup_location, orders.buyer_name, orders.buyer_phone,
             orders.created_at, items.title, items.image_url, items.category
      FROM order_items
      JOIN orders ON order_items.order_id = orders.id
      JOIN items ON order_items.item_id = items.id
      WHERE order_items.seller_id = ?
      ORDER BY orders.created_at DESC
    `, [req.user.id]);

    return res.status(200).json({
      success: true,
      count: orderItems.length,
      orders: orderItems
    });
  } catch (err) {
    console.error('Fetch seller orders error:', err);
    return res.status(500).json({ success: false, message: 'Failed to load incoming seller orders.' });
  }
});

// GET /api/orders/:id - Get single order details with tracking timeline
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const orderId = Number(req.params.id);
    const [orders] = await db.query('SELECT * FROM orders WHERE id = ?', [orderId]);

    if (!orders || orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const order = orders[0];

    // Ownership check: must be buyer, seller of items in order, or admin
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

    // Payment details
    const [payments] = await db.query('SELECT * FROM payments WHERE order_id = ?', [order.id]);
    const payment = payments.length > 0 ? payments[0] : null;

    // Review if exists
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

// PATCH /api/orders/:id/status - Update order status (Pending -> Paid -> Ready for Pickup -> Completed)
router.patch('/:id/status', verifyToken, async (req, res) => {
  try {
    const orderId = Number(req.params.id);
    const { status } = req.body;

    const validStatuses = ['Pending', 'Paid', 'Ready for Pickup', 'Completed', 'Cancelled'];
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

    // Authorization: Sellers who sell items in this order, Admins, or Buyers confirming receipt
    const [orderItems] = await db.query('SELECT seller_id FROM order_items WHERE order_id = ?', [orderId]);
    const sellerIds = orderItems.map(oi => oi.seller_id);
    const isSeller = sellerIds.includes(req.user.id);
    const isBuyer = order.buyer_id === req.user.id;
    const isAdmin = req.user.role === 'admin';

    // Buyer can only mark as Completed (confirm receipt) or Cancel if pending
    if (isBuyer && !isAdmin && !isSeller) {
      if (status !== 'Completed' && status !== 'Cancelled') {
        return res.status(403).json({
          success: false,
          message: 'As a buyer, you can only confirm receipt (mark as Completed) or cancel a pending order.'
        });
      }
    } else if (!isSeller && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized to update this order status.' });
    }

    // If marked completed, ensure payment status is Paid
    let newPaymentStatus = order.payment_status;
    if (status === 'Completed' || status === 'Paid') {
      newPaymentStatus = 'Paid';
    }

    await db.query(`
      UPDATE orders 
      SET order_status = ?, payment_status = ? 
      WHERE id = ?
    `, [status, newPaymentStatus, orderId]);

    return res.status(200).json({
      success: true,
      message: `Order status updated to "${status}".`,
      order_status: status,
      payment_status: newPaymentStatus
    });
  } catch (err) {
    console.error('Update order status error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update order status.' });
  }
});

module.exports = router;
