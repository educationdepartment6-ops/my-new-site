const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { requireCustomer } = require('../auth');

const router = express.Router();
router.use(requireCustomer);

// Profile: Get & Update
router.get('/profile', (req, res) => {
  const u = req.customer;
  res.json({
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    createdAt: u.created_at,
    lastLoginAt: u.last_login_at
  });
});

const handleUpdateProfile = (req, res) => {
  const { name, phone } = req.body || {};
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({ error: 'Name must be at least 2 characters long.' });
  }

  try {
    const updated = db.updateCustomerProfile(req.customer.id, { name, phone });
    res.json({
      success: true,
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        phone: updated.phone
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

router.put('/profile', handleUpdateProfile);
router.patch('/profile', handleUpdateProfile);

// Change Password
router.post('/change-password', (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body || {};
  if (!currentPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({ error: 'All password fields are required.' });
  }

  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
  if (!passwordRegex.test(newPassword)) {
    return res.status(400).json({
      error: 'New password must be at least 8 characters long and contain both letters and numbers.'
    });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ error: 'New passwords do not match.' });
  }

  const user = db.getUserById(req.customer.id);
  if (!bcrypt.compareSync(currentPassword, user.password_hash)) {
    return res.status(400).json({ error: 'Current password is incorrect.' });
  }

  const newHash = bcrypt.hashSync(newPassword, 12);
  db.updateCustomerPassword(user.id, newHash);

  // Clear current session so customer signs in with new password
  res.clearCookie('customer_session', { path: '/' });
  res.json({ success: true, message: 'Password updated successfully. Please sign in again.' });
});

// Saved Addresses
router.get('/addresses', (req, res) => {
  const addresses = db.getCustomerAddresses(req.customer.id);
  res.json(addresses);
});

router.post('/addresses', (req, res) => {
  const recipientName = req.body?.recipientName || req.body?.fullName;
  const { phone, addressLine1, addressLine2, city, postalCode, country } = req.body || {};
  const isDefault = req.body?.isDefault !== undefined ? req.body.isDefault : (req.body?.is_default !== undefined ? req.body.is_default : false);

  if (!recipientName || !addressLine1 || !city || !postalCode) {
    return res.status(400).json({ error: 'Recipient name, address, city, and postal code are required.' });
  }

  try {
    const addr = db.addCustomerAddress(req.customer.id, {
      recipientName,
      phone,
      addressLine1,
      addressLine2,
      city,
      postalCode,
      country,
      isDefault
    });
    res.status(201).json({ success: true, address: addr });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/addresses/:id', (req, res) => {
  try {
    const updated = db.updateCustomerAddress(req.customer.id, req.params.id, req.body);
    res.json({ success: true, address: updated });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/addresses/:id', (req, res) => {
  try {
    db.deleteCustomerAddress(req.customer.id, req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Customer Orders
router.get('/orders', (req, res) => {
  const orders = db.getCustomerOrders(req.customer.email);
  res.json(orders);
});

// Cart Sync & Merge
router.get('/cart', (req, res) => {
  const items = db.getCustomerCart(req.customer.id);
  res.json({ items });
});

router.post('/cart/merge', (req, res) => {
  const { guestItems } = req.body || {};
  const currentSaved = db.getCustomerCart(req.customer.id);

  const mergedMap = new Map();
  // Add saved items
  for (const it of currentSaved) {
    const k = it.key || `${it.compoundId || it.id || 'item'}-${it.strength || it.code || ''}`;
    mergedMap.set(k, { ...it, key: k });
  }
  // Merge guest items (sum quantity if same key)
  if (Array.isArray(guestItems)) {
    for (const g of guestItems) {
      const itemKey = g.key || `${g.compoundId || g.id || 'item'}-${g.strength || g.code || ''}`;
      if (mergedMap.has(itemKey)) {
        mergedMap.get(itemKey).quantity += (g.quantity || 1);
      } else {
        mergedMap.set(itemKey, { ...g, key: itemKey });
      }
    }
  }

  const mergedList = Array.from(mergedMap.values());
  db.saveCustomerCart(req.customer.id, mergedList);
  res.json({ success: true, items: mergedList });
});

module.exports = router;
