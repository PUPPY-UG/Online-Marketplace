const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'unitrade_ucu_campus_secure_jwt_secret_key_2026_mgt3151';

// Verify JWT token from Authorization header
async function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please sign in to access this campus resource.'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    // Fetch user from DB to verify active status
    const [users] = await db.query('SELECT id, full_name, email, role, phone, campus_residence, student_id, status FROM users WHERE id = ?', [decoded.id]);
    
    if (!users || users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'User account not found or has been removed.'
      });
    }

    const user = users[0];
    if (user.status === 'deactivated') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated by the campus administrator.'
      });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Your session has expired. Please sign in again.'
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid authentication token.'
    });
  }
}

// Role-based Access Control (RBAC) middleware
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. This action is restricted to [${allowedRoles.join(', ')}] roles only.`
      });
    }

    next();
  };
}

module.exports = {
  verifyToken,
  requireRole,
  JWT_SECRET
};
