const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken, requireRole } = require('../middleware/auth');

// All admin routes require admin role
router.use(verifyToken, requireRole('admin'));

// GET /api/admin/stats - Overview statistics for Admin Dashboard
router.get('/stats', async (req, res) => {
  try {
    const [users] = await db.query('SELECT role, status FROM users');
    const [items] = await db.query('SELECT id, is_available, status, price, category FROM items');
    const [orders] = await db.query('SELECT id, total_amount, order_status, payment_status, created_at FROM orders');
    const [reviews] = await db.query('SELECT rating FROM reviews');

    const totalUsers = users.length;
    const totalBuyers = users.filter(u => u.role === 'buyer').length;
    const totalSellers = users.filter(u => u.role === 'seller').length;
    const activeUsers = users.filter(u => u.status === 'active').length;

    const totalProducts = items.length;
    const availableProducts = items.filter(i => i.is_available && i.status === 'active').length;
    const soldOrUnavailable = totalProducts - availableProducts;

    const totalOrders = orders.length;
    const completedOrders = orders.filter(o => o.order_status === 'Completed').length;
    const pendingOrders = orders.filter(o => o.order_status === 'Pending' || o.order_status === 'Paid' || o.order_status === 'Ready for Pickup').length;
    const totalSalesVolume = orders
      .filter(o => o.order_status === 'Completed' || o.payment_status === 'Paid')
      .reduce((sum, o) => sum + Number(o.total_amount), 0);

    const averageRating = reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : '5.0';

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalBuyers,
        totalSellers,
        activeUsers,
        totalProducts,
        availableProducts,
        soldOrUnavailable,
        totalOrders,
        completedOrders,
        pendingOrders,
        totalSalesVolume,
        totalReviews: reviews.length,
        averageRating: Number(averageRating)
      }
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    return res.status(500).json({ success: false, message: 'Failed to load system statistics.' });
  }
});

// GET /api/admin/users - List all campus users
router.get('/users', async (req, res) => {
  try {
    const [users] = await db.query(`
      SELECT id, full_name, email, phone, role, campus_residence, student_id, status, created_at
      FROM users
      ORDER BY id ASC
    `);

    return res.status(200).json({
      success: true,
      users
    });
  } catch (err) {
    console.error('Admin users error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve users.' });
  }
});

// PATCH /api/admin/users/:id/status - Activate or Deactivate user account
router.patch('/users/:id/status', async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const { status } = req.body;

    if (!['active', 'deactivated'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status. Use "active" or "deactivated".' });
    }

    if (userId === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot deactivate your own admin account.' });
    }

    await db.query('UPDATE users SET status = ? WHERE id = ?', [status, userId]);

    return res.status(200).json({
      success: true,
      message: `User account has been ${status === 'active' ? 'activated' : 'deactivated'}.`
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update user status.' });
  }
});

// GET /api/admin/products - List all product listings
router.get('/products', async (req, res) => {
  try {
    const [items] = await db.query(`
      SELECT items.*, users.full_name AS seller_name, users.email AS seller_email
      FROM items
      JOIN users ON items.seller_id = users.id
      ORDER BY items.created_at DESC
    `);

    return res.status(200).json({
      success: true,
      products: items
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve products.' });
  }
});

// PATCH /api/admin/products/:id/moderate - Moderate / deactivate inappropriate listing
router.patch('/products/:id/moderate', async (req, res) => {
  try {
    const itemId = Number(req.params.id);
    const { status, is_available } = req.body;

    await db.query(`
      UPDATE items 
      SET status = ?, is_available = ? 
      WHERE id = ?
    `, [status || 'deactivated', is_available !== undefined ? is_available : false, itemId]);

    return res.status(200).json({
      success: true,
      message: 'Product listing moderation status updated.'
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to moderate product listing.' });
  }
});

// GET /api/admin/orders - List all orders across campus
router.get('/orders', async (req, res) => {
  try {
    const [orders] = await db.query(`
      SELECT orders.*, users.email AS buyer_email
      FROM orders
      JOIN users ON orders.buyer_id = users.id
      ORDER BY orders.created_at DESC
    `);

    return res.status(200).json({
      success: true,
      orders
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve orders.' });
  }
});

// GET /api/admin/reviews - List all campus reviews
router.get('/reviews', async (req, res) => {
  try {
    const [reviews] = await db.query(`
      SELECT reviews.*, buyer.full_name AS buyer_name, seller.full_name AS seller_name, orders.order_ref
      FROM reviews
      JOIN users AS buyer ON reviews.buyer_id = buyer.id
      JOIN users AS seller ON reviews.seller_id = seller.id
      JOIN orders ON reviews.order_id = orders.id
      ORDER BY reviews.created_at DESC
    `);

    return res.status(200).json({
      success: true,
      reviews
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve reviews.' });
  }
});

// GET /api/admin/reports - System activity and sales report
router.get('/reports', async (req, res) => {
  try {
    const [items] = await db.query('SELECT category, COUNT(*) as count, SUM(price) as total_value FROM items GROUP BY category');
    const [orders] = await db.query('SELECT order_status, COUNT(*) as count, SUM(total_amount) as total_val FROM orders GROUP BY order_status');
    const [payments] = await db.query('SELECT payment_method, COUNT(*) as count, SUM(amount) as total_paid FROM payments GROUP BY payment_method');

    return res.status(200).json({
      success: true,
      generated_at: new Date().toISOString(),
      institution: 'Uganda Christian University (UCU)',
      course: 'MGT3151 - E-Business, E-Commerce and E-Governance',
      report: {
        categoryBreakdown: items,
        ordersBreakdown: orders,
        paymentMethodsBreakdown: payments
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to generate reports.' });
  }
});

module.exports = router;
