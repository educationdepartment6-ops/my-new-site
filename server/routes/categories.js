const express = require('express');
const db = require('../db');
const { requireAdmin } = require('../auth');

const router = express.Router();

router.get('/', (req, res) => {
  res.json(db.getAllCategories());
});

router.put('/admin/:id', requireAdmin, (req, res) => {
  const { name, description } = req.body || {};
  if (!name) return res.status(400).json({ error: 'Category name is required' });
  try {
    db.updateCategory(req.params.id, name, description || '', req.admin.email);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/admin/move-product', requireAdmin, (req, res) => {
  const { productId, categorySlug } = req.body || {};
  if (!productId || !categorySlug) {
    return res.status(400).json({ error: 'productId and categorySlug are required' });
  }
  try {
    db.moveProductCategory(productId, categorySlug, req.admin.email);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
