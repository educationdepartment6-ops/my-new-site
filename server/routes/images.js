const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { requireAdmin } = require('../auth');
const db = require('../db');

const router = express.Router();

const uploadDir = path.join(__dirname, '..', '..', 'public', 'products');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${cleanBase}_${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: (req, file, cb) => {
    const allowedMime = ['image/png', 'image/jpeg', 'image/webp'];
    if (allowedMime.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PNG, JPG, and WebP image formats are supported'));
    }
  }
});

router.post('/upload', requireAdmin, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file uploaded' });
  }

  const relativeUrl = `/products/${req.file.filename}`;

  // Also copy to dist/products if dist exists
  const distDir = path.join(__dirname, '..', '..', 'dist', 'products');
  if (fs.existsSync(distDir)) {
    fs.copyFileSync(req.file.path, path.join(distDir, req.file.filename));
  }

  db.logActivity(req.admin.email, 'UPLOAD_IMAGE', `Uploaded image: ${req.file.filename} (${(req.file.size / 1024).toFixed(1)} KB)`);
  res.json({ success: true, imageUrl: relativeUrl });
}, (error, req, res, next) => {
  res.status(400).json({ error: error.message || 'Image upload failed' });
});

module.exports = router;
