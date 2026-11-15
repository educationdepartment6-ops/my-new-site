const express = require('express');
const db = require('../db');
const { requireAdmin } = require('../auth');

const router = express.Router();

router.post('/', (req, res) => {
  const { customer, items, total } = req.body || {};
  if (!customer?.email || !items || !items.length) {
    return res.status(400).json({ error: 'Customer email and requisition items are required' });
  }

  try {
    const order = db.createOrder(req.body);
    res.status(201).json({ success: true, ...order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get(['/admin', '/'], (req, res, next) => {
  if (req.baseUrl === '/api/admin/orders' || req.path === '/admin') {
    return requireAdmin(req, res, () => {
      res.json(db.getAllOrders());
    });
  }
  next();
});

router.put(['/admin/:id/status', '/:id/status'], requireAdmin, (req, res) => {
  const { status } = req.body || {};
  const allowed = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ error: `Status must be one of: ${allowed.join(', ')}` });
  }
  try {
    db.updateOrderStatus(req.params.id, status, req.admin.email);
    res.json({ success: true, status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
