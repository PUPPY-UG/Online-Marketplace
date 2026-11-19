const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { verifyToken, JWT_SECRET } = require('../middleware/auth');

// Register a new Buyer or Seller
router.post('/register', async (req, res) => {
  try {
    const { full_name, email, password, phone, role, campus_residence, student_id } = req.body;

    // Validation
    if (!full_name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Full name, email, password, and phone number are required.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const assignedRole = role === 'seller' ? 'seller' : 'buyer'; // admin cannot be registered openly

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    // Check if user email already exists
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [cleanEmail]);
    if (existing && existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    // Hash password securely with bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user
    const [result] = await db.query(
      'INSERT INTO users (full_name, email, password, phone, role, campus_residence, student_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [full_name.trim(), cleanEmail, hashedPassword, phone.trim(), assignedRole, campus_residence || 'Main Campus (Mukono)', student_id || null]
    );

    const userId = result.insertId;

    // Automatically create empty cart for the new user
    await db.query('INSERT INTO cart (user_id) VALUES (?)', [userId]);

    // Generate JWT token
    const token = jwt.sign(
      { id: userId, email: cleanEmail, role: assignedRole },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      message: 'Campus account registered successfully.',
      token,
      user: {
        id: userId,
        full_name: full_name.trim(),
        email: cleanEmail,
        phone: phone.trim(),
        role: assignedRole,
        campus_residence: campus_residence || 'Main Campus (Mukono)',
        student_id: student_id || null,
        status: 'active'
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to complete registration due to server error.'
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Query user by email
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [cleanEmail]);
    if (!users || users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email address or password.'
      });
    }

    const user = users[0];

    // Check account status
    if (user.status === 'deactivated') {
      return res.status(403).json({
        success: false,
        message: 'Your account is deactivated. Please contact the campus marketplace administrator.'
      });
    }

    // Compare bcrypt password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email address or password.'
      });
    }

    // Ensure cart exists
    const [carts] = await db.query('SELECT id FROM cart WHERE user_id = ?', [user.id]);
    if (!carts || carts.length === 0) {
      await db.query('INSERT INTO cart (user_id) VALUES (?)', [user.id]);
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      message: `Welcome back, ${user.full_name}!`,
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        campus_residence: user.campus_residence,
        student_id: user.student_id,
        status: user.status
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to log in due to an internal server error.'
    });
  }
});

// Get current user profile
router.get('/me', verifyToken, async (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user
  });
});

// Update profile details
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { full_name, phone, campus_residence, student_id } = req.body;
    await db.query(
      'UPDATE users SET full_name = ?, phone = ?, campus_residence = ?, student_id = ? WHERE id = ?',
      [full_name || req.user.full_name, phone || req.user.phone, campus_residence || req.user.campus_residence, student_id || req.user.student_id, req.user.id]
    );

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.'
    });
  } catch (err) {
    console.error('Profile update error:', err);
    return res.status(500).json({
      success: false,
      message: 'Error updating user profile.'
    });
  }
});

module.exports = router;
