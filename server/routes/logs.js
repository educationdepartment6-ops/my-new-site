const express = require('express');
const db = require('../db');
const { requireAdmin } = require('../auth');

const router = express.Router();

router.get(['/admin', '/'], requireAdmin, (req, res) => {
  res.json(db.getActivityLogs(100));
});

module.exports = router;
