const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { verifyToken, requireRole } = require('../middleware/auth');

// POST /api/upload - Upload product photograph
router.post('/', verifyToken, requireRole('seller', 'admin'), upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file uploaded. Please select an image (JPEG, PNG, WEBP).'
      });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    return res.status(200).json({
      success: true,
      message: 'Product photo uploaded successfully.',
      imageUrl: fileUrl,
      filename: req.file.filename
    });
  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Error occurred while uploading photograph.'
    });
  }
});

module.exports = router;
