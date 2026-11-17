const express = require('express');
const rateLimit = require('express-rate-limit');
const db = require('../db');
const { requireAdmin } = require('../auth');

const router = express.Router();

// Rate limiter for creating order requests: 5 per hour per IP
const orderLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many order requests from this IP. Please try again later or reach out on WhatsApp.' }
});

router.post('/', orderLimiter, (req, res) => {
  const { customer, items } = req.body || {};
  if (!customer) {
    return res.status(400).json({ error: 'Customer details are required' });
  }

  const name = customer.fullName || customer.name || '';
  const email = (customer.email || '').trim().toLowerCase();
  const phone = customer.phone || '';
  const address = customer.address || '';
  const city = customer.city || '';
  const state = customer.state || '';
  const postalCode = customer.postalCode || customer.postal_code || '';

  if (!name.trim()) {
    return res.status(400).json({ error: 'Customer name is required' });
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'A valid email address is required' });
  }
  if (!phone.trim()) {
    return res.status(400).json({ error: 'A valid phone number is required' });
  }
  if (!address.trim() || !city.trim() || !state.trim() || !postalCode.trim()) {
    return res.status(400).json({ error: 'Full delivery address (street, city, state, postal code) is required' });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'At least one item is required in the order request' });
  }

  try {
    const order = db.createOrder(req.body);
    res.status(201).json({ success: true, ...order });
  } catch (err) {
    console.error('[Orders Route] Error creating order:', err);
    res.status(500).json({ error: err.message || 'Failed to save order request' });
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

// Update order status
router.put(['/admin/:id/status', '/:id/status'], requireAdmin, (req, res) => {
  const { status } = req.body || {};
  const allowed = [
    'New',
    'New - awaiting WhatsApp confirmation',
    'Confirmed on WhatsApp',
    'Payment received',
    'Shipped',
    'Delivered',
    'Cancelled'
  ];
  if (!status || !allowed.some(s => s.toLowerCase() === status.toLowerCase())) {
    return res.status(400).json({ error: `Status must be one of: ${allowed.join(', ')}` });
  }

  // Preserve exact case of allowed status
  const matchedStatus = allowed.find(s => s.toLowerCase() === status.toLowerCase()) || status;

  try {
    const updated = db.updateOrderStatus(req.params.id, matchedStatus, req.admin.email);
    res.json({ success: true, status: matchedStatus, order: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update order notes and tracking number
router.put(['/admin/:id/details', '/:id/details'], requireAdmin, (req, res) => {
  const { notes, trackingNumber } = req.body || {};
  try {
    const updated = db.updateOrderNotesAndTracking(req.params.id, { notes, trackingNumber }, req.admin.email);
    res.json({ success: true, order: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

