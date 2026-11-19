const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const { initDatabase, isEmbedded } = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth.routes');
const itemRoutes = require('./routes/items.routes');
const cartRoutes = require('./routes/cart.routes');
const orderRoutes = require('./routes/orders.routes');
const reviewRoutes = require('./routes/reviews.routes');
const adminRoutes = require('./routes/admin.routes');
const uploadRoutes = require('./routes/upload.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Cross-Origin Resource Sharing
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file hosting for uploaded images
const uploadsPath = path.resolve(__dirname, '../../uploads');
app.use('/uploads', express.static(uploadsPath));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    system: 'UniTrade - Campus Online Marketplace API',
    institution: 'Uganda Christian University (UCU)',
    course: 'MGT3151 - E-Business, E-Commerce and E-Governance',
    database_mode: isEmbedded() ? 'Embedded Relational Engine (Persistent)' : 'MySQL Database (mysql2)',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);

// Static hosting for built React frontend
const frontendDist = path.resolve(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
} else {
  // Global 404 Route for unmatched API endpoints when dist not yet built
  app.use('/api/*', (req, res) => {
    res.status(404).json({
      success: false,
      message: `API endpoint '${req.originalUrl}' not found on UniTrade Server.`
    });
  });
}

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[UniTrade Server Error]:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Initialize database and start HTTP server
async function startServer() {
  await initDatabase();
  app.listen(PORT, () => {
    console.log(`================================================================`);
    console.log(` UniTrade Platform live on http://localhost:${PORT}`);
    console.log(` Institution: Uganda Christian University (UCU)`);
    console.log(` Health Check: http://localhost:${PORT}/api/health`);
    console.log(` Uploads:      http://localhost:${PORT}/uploads`);
    console.log(` Mode:         ${isEmbedded() ? 'Embedded Persistence (Auto)' : 'MySQL Production'}`);
    console.log(`================================================================`);
  });
}

startServer();

module.exports = app;
