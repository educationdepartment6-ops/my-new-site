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
