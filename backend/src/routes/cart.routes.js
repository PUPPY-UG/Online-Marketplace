const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken, requireRole } = require('../middleware/auth');

// Helper to get or create cart for user
async function getOrCreateCart(userId) {
  let [carts] = await db.query('SELECT * FROM cart WHERE user_id = ?', [userId]);
  if (!carts || carts.length === 0) {
    const [res] = await db.query('INSERT INTO cart (user_id) VALUES (?)', [userId]);
    return { id: res.insertId, user_id: userId };
  }
  return carts[0];
}

// GET /api/cart - Fetch current buyer's cart
router.get('/', verifyToken, async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user.id);
    const [cartItems] = await db.query(`
      SELECT cart_items.id, cart_items.cart_id, cart_items.item_id, cart_items.quantity,
             items.title, items.price, items.image_url, items.category, 
             items.condition_state, items.is_available, items.seller_id,
             users.full_name AS seller_name
      FROM cart_items
      JOIN items ON cart_items.item_id = items.id
      JOIN users ON items.seller_id = users.id
      WHERE cart_items.cart_id = ?
    `, [cart.id]);

    const total = cartItems.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);

    return res.status(200).json({
      success: true,
      cart_id: cart.id,
      items: cartItems,
      total_amount: total,
      item_count: cartItems.reduce((count, item) => count + item.quantity, 0)
    });
  } catch (err) {
    console.error('Fetch cart error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve shopping cart.' });
  }
});

// POST /api/cart/items - Add product to cart
router.post('/items', verifyToken, async (req, res) => {
  try {
    const { item_id, quantity = 1 } = req.body;
    if (!item_id) {
      return res.status(400).json({ success: false, message: 'Item ID is required.' });
    }

    const itemId = Number(item_id);

    // Verify product exists and is available
    const [items] = await db.query('SELECT * FROM items WHERE id = ?', [itemId]);
    if (!items || items.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const item = items[0];
    if (!item.is_available || item.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Sorry, this product is no longer available.' });
    }

    // Prevent buyers from buying their own listed items if they are also sellers
    if (item.seller_id === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot add your own listed product to your shopping cart.' });
    }

    const cart = await getOrCreateCart(req.user.id);

    // Check if already in cart
    const [existing] = await db.query(`
      SELECT * FROM cart_items WHERE cart_id = ? AND item_id = ?
    `, [cart.id, itemId]);

    if (existing && existing.length > 0) {
      const newQty = existing[0].quantity + Number(quantity);
      await db.query(`
        UPDATE cart_items SET quantity = ? WHERE id = ?
      `, [newQty, existing[0].id]);
    } else {
      await db.query(`
        INSERT INTO cart_items (cart_id, item_id, quantity) VALUES (?, ?, ?)
      `, [cart.id, itemId, Number(quantity)]);
    }

    return res.status(200).json({
      success: true,
      message: `"${item.title}" added to your cart.`
    });
  } catch (err) {
    console.error('Add to cart error:', err);
    return res.status(500).json({ success: false, message: 'Failed to add item to cart.' });
  }
});

// PUT /api/cart/items/:id - Update cart item quantity
router.put('/items/:id', verifyToken, async (req, res) => {
  try {
    const cartItemId = Number(req.params.id);
    const { quantity } = req.body;

    if (!quantity || Number(quantity) <= 0) {
      // Remove if quantity is 0 or negative
      await db.query('DELETE FROM cart_items WHERE id = ?', [cartItemId]);
      return res.status(200).json({ success: true, message: 'Item removed from cart.' });
    }

    await db.query('UPDATE cart_items SET quantity = ? WHERE id = ?', [Number(quantity), cartItemId]);

    return res.status(200).json({
      success: true,
      message: 'Cart quantity updated.'
    });
  } catch (err) {
    console.error('Update cart item error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update quantity.' });
  }
});

// DELETE /api/cart/items/:id - Remove item from cart
router.delete('/items/:id', verifyToken, async (req, res) => {
  try {
    const cartItemId = Number(req.params.id);
    await db.query('DELETE FROM cart_items WHERE id = ?', [cartItemId]);

    return res.status(200).json({
      success: true,
      message: 'Item removed from shopping cart.'
    });
  } catch (err) {
    console.error('Delete cart item error:', err);
    return res.status(500).json({ success: false, message: 'Failed to remove item.' });
  }
});

// DELETE /api/cart/clear - Clear the user's cart
router.delete('/clear', verifyToken, async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user.id);
    await db.query('DELETE FROM cart_items WHERE cart_id = ?', [cart.id]);

    return res.status(200).json({
      success: true,
      message: 'Cart cleared successfully.'
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to clear cart.' });
  }
});

module.exports = router;
