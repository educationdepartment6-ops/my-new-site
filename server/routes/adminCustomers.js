const express = require('express');
const db = require('../db');
const { requireAdmin } = require('../auth');

const router = express.Router();
router.use(requireAdmin);

// List all customers
router.get('/', (req, res) => {
  const customers = db.getAllCustomersForAdmin();
  res.json(customers);
});

// Create customer from admin
router.post('/', (req, res) => {
  const { name, email, phone, password } = req.body || {};
  if (!email || !phone) {
    return res.status(400).json({ error: 'Email and a valid Indian mobile number are required.' });
  }

  try {
    const customer = db.createCustomerFromAdmin({ name, email, phone, password }, req.admin.email);
    res.status(201).json(customer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update customer from admin
router.put('/:id', (req, res) => {
  const { name, phone } = req.body || {};
  if (!phone) {
    return res.status(400).json({ error: 'A valid Indian mobile number is required.' });
  }

  try {
    const customer = db.updateCustomerFromAdmin(req.params.id, { name, phone }, req.admin.email);
    res.json(customer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Toggle disabled status
router.patch('/:id/status', (req, res) => {
  const { disabled } = req.body;
  if (typeof disabled !== 'boolean') {
    return res.status(400).json({ error: 'disabled must be a boolean' });
  }

  try {
    db.setCustomerDisabledStatus(req.params.id, disabled, req.admin.email);
    res.json({ success: true, disabled });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

