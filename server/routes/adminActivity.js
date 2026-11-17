const express = require('express');
const db = require('../db');
const { requireAdmin } = require('../auth');

const router = express.Router();
router.use(requireAdmin);

// GET /api/admin/activity - Retrieve complete activity feed & metrics
router.get('/', (req, res) => {
  try {
    const data = db.getAdminActivityFeed();
    res.json(data);
  } catch (err) {
    console.error('[Admin Activity] Error fetching feed:', err);
    res.status(500).json({ error: 'Failed to retrieve activity feed' });
  }
});

// POST /api/admin/activity/sync - Synchronize client/remote orders & registrations
router.post('/sync', (req, res) => {
  try {
    const { users = [], orders = [] } = req.body || {};
    const result = db.syncAllAdminRecords(users, orders);
    res.json(result);
  } catch (err) {
    console.error('[Admin Activity] Error syncing records:', err);
    res.status(500).json({ error: 'Failed to synchronize records' });
  }
});

module.exports = router;
