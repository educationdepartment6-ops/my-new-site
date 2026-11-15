const express = require('express');
const db = require('../db');
const { requireAdmin } = require('../auth');

const router = express.Router();

// Compounds listing: Public visible on /api/products, Admin all on /api/admin/products or /api/products/admin
router.get(['/', '/admin'], (req, res, next) => {
  if (req.baseUrl === '/api/admin/products' || req.path === '/admin') {
    return requireAdmin(req, res, () => {
      const products = db.getAllProducts(true);
      res.json(products);
    });
  }
  const products = db.getAllProducts(false);
  res.json(products);
});

// Admin: Get single compound
router.get(['/admin/:id', '/:id'], (req, res, next) => {
  if (req.baseUrl === '/api/admin/products' || req.path.startsWith('/admin')) {
    return requireAdmin(req, res, () => {
      const product = db.getProductById(req.params.id);
      if (!product) return res.status(404).json({ error: 'Product not found' });
      res.json(product);
    });
  }
  next();
});

// Admin: Create new compound
router.post(['/admin', '/'], requireAdmin, (req, res) => {
  const { name, category, variants } = req.body || {};
  if (!name || !category) {
    return res.status(400).json({ error: 'Name and category are required' });
  }

  if (variants && Array.isArray(variants)) {
    for (const v of variants) {
      if (!v.sku || !v.strength || !v.priceInr || v.priceInr <= 0) {
        return res.status(400).json({ error: 'Each variant must have SKU, strength, and positive INR price' });
      }
    }
  }

  try {
    const product = db.addProduct(req.body, req.admin.email);
    res.status(201).json({ success: true, product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Update compound
router.put(['/admin/:id', '/:id'], requireAdmin, (req, res) => {
  const { name, category, variants } = req.body || {};
  if (!name || !category) {
    return res.status(400).json({ error: 'Name and category are required' });
  }

  if (variants && Array.isArray(variants)) {
    for (const v of variants) {
      if (!v.sku || !v.strength || !v.priceInr || v.priceInr <= 0) {
        return res.status(400).json({ error: 'Each variant must have SKU, strength, and positive INR price' });
      }
    }
  }

  try {
    const product = db.updateProduct(req.params.id, req.body, req.admin.email);
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Toggle visibility
router.patch(['/admin/:id/visibility', '/:id/visibility'], requireAdmin, (req, res) => {
  const { isVisible } = req.body;
  if (typeof isVisible !== 'boolean') {
    return res.status(400).json({ error: 'isVisible must be a boolean' });
  }
  try {
    db.toggleProductVisibility(req.params.id, isVisible, req.admin.email);
    res.json({ success: true, isVisible });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
