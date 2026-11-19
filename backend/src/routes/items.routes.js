const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken, requireRole } = require('../middleware/auth');

// GET /api/items - Browse & search products with filters
router.get('/', async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, condition_state, sort, limit } = req.query;

    let sql = `
      SELECT items.*, users.full_name AS seller_name, users.phone AS seller_phone, 
             users.email AS seller_email, users.campus_residence AS seller_residence
      FROM items
      JOIN users ON items.seller_id = users.id
      WHERE items.status = 'active'
    `;
    const params = [];

    // Filter by category
    if (category && category !== 'All' && category !== 'all') {
      sql += ' AND items.category = ?';
      params.push(category);
    }

    // Filter by search keyword
    if (search && search.trim() !== '') {
      sql += ' AND (items.title LIKE ? OR items.description LIKE ?)';
      params.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }

    // Filter by condition
    if (condition_state && condition_state !== 'All') {
      sql += ' AND items.condition_state = ?';
      params.push(condition_state);
    }

    // Filter by price range
    if (minPrice && !isNaN(Number(minPrice))) {
      sql += ' AND items.price >= ?';
      params.push(Number(minPrice));
    }
    if (maxPrice && !isNaN(Number(maxPrice))) {
      sql += ' AND items.price <= ?';
      params.push(Number(maxPrice));
    }

    // Sorting
    if (sort === 'price_asc') {
      sql += ' ORDER BY items.price ASC';
    } else if (sort === 'price_desc') {
      sql += ' ORDER BY items.price DESC';
    } else {
      sql += ' ORDER BY items.created_at DESC';
    }

    const [items] = await db.query(sql, params);

    // Apply limit if requested
    let resultItems = items;
    if (limit && !isNaN(Number(limit))) {
      resultItems = resultItems.slice(0, Number(limit));
    }

    return res.status(200).json({
      success: true,
      count: resultItems.length,
      items: resultItems
    });
  } catch (err) {
    console.error('Fetch items error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve products from marketplace.'
    });
  }
});

// GET /api/items/featured - Featured products for homepage
router.get('/featured', async (req, res) => {
  try {
    const [items] = await db.query(`
      SELECT items.*, users.full_name AS seller_name, users.campus_residence AS seller_residence
      FROM items
      JOIN users ON items.seller_id = users.id
      WHERE items.status = 'active' AND items.is_available = 1
      ORDER BY items.id ASC
    `);

    // Featured items selection
    const featured = items.slice(0, 6);
    return res.status(200).json({
      success: true,
      items: featured
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve featured items.' });
  }
});

// GET /api/items/recent - Recently added products for homepage
router.get('/recent', async (req, res) => {
  try {
    const [items] = await db.query(`
      SELECT items.*, users.full_name AS seller_name, users.campus_residence AS seller_residence
      FROM items
      JOIN users ON items.seller_id = users.id
      WHERE items.status = 'active' AND items.is_available = 1
      ORDER BY items.created_at DESC
    `);

    const recent = items.slice(0, 8);
    return res.status(200).json({
      success: true,
      items: recent
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve recent items.' });
  }
});

// GET /api/items/seller/my-items - Get products listed by the logged-in seller
router.get('/seller/my-items', verifyToken, requireRole('seller'), async (req, res) => {
  try {
    const [items] = await db.query(`
      SELECT * FROM items 
      WHERE seller_id = ? 
      ORDER BY created_at DESC
    `, [req.user.id]);

    return res.status(200).json({
      success: true,
      count: items.length,
      items
    });
  } catch (err) {
    console.error('Fetch seller items error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to load seller listings.'
    });
  }
});

// GET /api/items/:id - Single product details
router.get('/:id', async (req, res) => {
  try {
    const itemId = Number(req.params.id);
    const [items] = await db.query(`
      SELECT items.*, users.full_name AS seller_name, users.phone AS seller_phone, 
             users.email AS seller_email, users.campus_residence AS seller_residence
      FROM items
      JOIN users ON items.seller_id = users.id
      WHERE items.id = ?
    `, [itemId]);

    if (!items || items.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found on UniTrade.'
      });
    }

    const item = items[0];

    // Fetch seller's ratings & reviews
    const [reviews] = await db.query(`
      SELECT reviews.*, users.full_name AS buyer_name
      FROM reviews
      JOIN users ON reviews.buyer_id = users.id
      WHERE reviews.seller_id = ?
      ORDER BY reviews.created_at DESC
    `, [item.seller_id]);

    const avgRating = reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : '5.0';

    return res.status(200).json({
      success: true,
      item,
      sellerStats: {
        totalReviews: reviews.length,
        averageRating: Number(avgRating),
        recentReviews: reviews.slice(0, 5)
      }
    });
  } catch (err) {
    console.error('Fetch single item error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to load product details.'
    });
  }
});

// POST /api/items - Add a new product (Sellers only)
router.post('/', verifyToken, requireRole('seller'), async (req, res) => {
  try {
    const { title, description, price, category, condition_state, image_url } = req.body;

    if (!title || !description || !price || !category) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, price, and category are required.'
      });
    }

    if (isNaN(Number(price)) || Number(price) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid price greater than zero.'
      });
    }

    const defaultImg = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600';
    const finalImage = image_url && image_url.trim() !== '' ? image_url.trim() : defaultImg;

    const [result] = await db.query(`
      INSERT INTO items (seller_id, title, description, price, category, condition_state, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      req.user.id,
      title.trim(),
      description.trim(),
      Number(price),
      category,
      condition_state || 'Used',
      finalImage
    ]);

    return res.status(201).json({
      success: true,
      message: 'Product listed successfully on UniTrade.',
      item_id: result.insertId
    });
  } catch (err) {
    console.error('Create item error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to create product listing.'
    });
  }
});

// PUT /api/items/:id - Edit an existing product (Seller must own item)
router.put('/:id', verifyToken, requireRole('seller', 'admin'), async (req, res) => {
  try {
    const itemId = Number(req.params.id);
    const { title, description, price, category, condition_state, image_url, is_available } = req.body;

    // Check ownership
    const [existing] = await db.query('SELECT * FROM items WHERE id = ?', [itemId]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Product listing not found.' });
    }

    const item = existing[0];
    if (req.user.role !== 'admin' && item.seller_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. You can only edit your own listings.'
      });
    }

    await db.query(`
      UPDATE items 
      SET title = ?, description = ?, price = ?, category = ?, condition_state = ?, image_url = ?, id = ?
      WHERE id = ?
    `, [
      title || item.title,
      description || item.description,
      price ? Number(price) : item.price,
      category || item.category,
      condition_state || item.condition_state,
      image_url || item.image_url,
      itemId,
      itemId
    ]);

    return res.status(200).json({
      success: true,
      message: 'Product listing updated successfully.'
    });
  } catch (err) {
    console.error('Update item error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to update product listing.'
    });
  }
});

// PATCH /api/items/:id/toggle-status - Toggle availability or active status
router.patch('/:id/toggle-status', verifyToken, requireRole('seller', 'admin'), async (req, res) => {
  try {
    const itemId = Number(req.params.id);
    const [existing] = await db.query('SELECT * FROM items WHERE id = ?', [itemId]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Product listing not found.' });
    }

    const item = existing[0];
    if (req.user.role !== 'admin' && item.seller_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized action.' });
    }

    const newAvailability = !item.is_available;
    await db.query('UPDATE items SET is_available = ? WHERE id = ?', [newAvailability, itemId]);

    return res.status(200).json({
      success: true,
      message: `Product is now ${newAvailability ? 'available' : 'marked unavailable'}.`,
      is_available: newAvailability
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update status.' });
  }
});

// DELETE /api/items/:id - Delete or deactivate product
router.delete('/:id', verifyToken, requireRole('seller', 'admin'), async (req, res) => {
  try {
    const itemId = Number(req.params.id);
    const [existing] = await db.query('SELECT * FROM items WHERE id = ?', [itemId]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Product listing not found.' });
    }

    const item = existing[0];
    if (req.user.role !== 'admin' && item.seller_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. You can only remove your own listings.'
      });
    }

    await db.query('DELETE FROM items WHERE id = ?', [itemId]);

    return res.status(200).json({
      success: true,
      message: 'Product listing successfully removed.'
    });
  } catch (err) {
    console.error('Delete item error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete product listing.'
    });
  }
});

module.exports = router;
