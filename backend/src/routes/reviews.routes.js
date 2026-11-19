const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken, requireRole } = require('../middleware/auth');

// POST /api/reviews - Submit review for completed order
router.post('/', verifyToken, requireRole('buyer'), async (req, res) => {
  try {
    const { order_id, rating, comment } = req.body;

    if (!order_id || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Order ID, rating (1-5 stars), and review comments are required.'
      });
    }

    const ratingNum = Number(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be an integer between 1 and 5 stars.'
      });
    }

    // 1. Verify order exists and belongs to this buyer
    const [orders] = await db.query('SELECT * FROM orders WHERE id = ?', [Number(order_id)]);
    if (!orders || orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const order = orders[0];
    if (order.buyer_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You can only review orders you placed.' });
    }

    // 2. Order must be completed
    if (order.order_status !== 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'Reviews can only be submitted after the order has been completed and received.'
      });
    }

    // 3. Prevent duplicate review for the same order
    const [existing] = await db.query('SELECT id FROM reviews WHERE order_id = ?', [order.id]);
    if (existing && existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a review for this completed order.'
      });
    }

    // 4. Identify seller from order_items
    const [orderItems] = await db.query('SELECT seller_id FROM order_items WHERE order_id = ?', [order.id]);
    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ success: false, message: 'No seller associated with this order item.' });
    }

    const sellerId = orderItems[0].seller_id;

    // 5. Insert review
    const [result] = await db.query(`
      INSERT INTO reviews (order_id, buyer_id, seller_id, rating, comment)
      VALUES (?, ?, ?, ?, ?)
    `, [order.id, req.user.id, sellerId, ratingNum, comment.trim()]);

    return res.status(201).json({
      success: true,
      message: 'Thank you! Your seller review and rating have been recorded.',
      review_id: result.insertId
    });
  } catch (err) {
    console.error('Submit review error:', err);
    return res.status(500).json({ success: false, message: 'Failed to submit review.' });
  }
});

// GET /api/reviews/seller/:sellerId - Get all reviews for a specific seller
router.get('/seller/:sellerId', async (req, res) => {
  try {
    const sellerId = Number(req.params.sellerId);
    const [reviews] = await db.query(`
      SELECT reviews.*, users.full_name AS buyer_name, orders.order_ref
      FROM reviews
      JOIN users ON reviews.buyer_id = users.id
      JOIN orders ON reviews.order_id = orders.id
      WHERE reviews.seller_id = ?
      ORDER BY reviews.created_at DESC
    `, [sellerId]);

    const avg = reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : '5.0';

    return res.status(200).json({
      success: true,
      count: reviews.length,
      averageRating: Number(avg),
      reviews
    });
  } catch (err) {
    console.error('Fetch seller reviews error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve seller feedback.' });
  }
});

module.exports = router;
