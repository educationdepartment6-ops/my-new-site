const express = require('express');
const db = require('../db');
const { requireAdmin } = require('../auth');

const router = express.Router();
router.use(requireAdmin);

// GET /api/admin/activity - Retrieve complete activity feed & metrics
router.get('/', async (req, res) => {
  try {
    // Attempt remote sync from live Netlify deployment
    try {
      const netlifyRes = await fetch('https://mogwrld.netlify.app/.netlify/functions/admin-activity', {
        signal: AbortSignal.timeout(3000)
      });
      if (netlifyRes.ok) {
        const netlifyData = await netlifyRes.json();
        if (Array.isArray(netlifyData.customers) || Array.isArray(netlifyData.orders)) {
          db.syncAllAdminRecords(netlifyData.customers || [], netlifyData.orders || []);
        }
      }
    } catch (_) {
      // Gracefully continue with SQLite if Netlify is offline
    }

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
