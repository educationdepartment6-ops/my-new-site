const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const db = require('../db');
const { requireAdmin, getClientIp } = require('../auth');

const router = express.Router();

router.post('/login', (req, res) => {
  const ip = getClientIp(req);
  const rateLimit = db.checkLoginRateLimit(ip);
  if (!rateLimit.allowed) {
    return res.status(429).json({
      error: `Account temporarily locked due to too many failed attempts. Try again in ${rateLimit.minutesRemaining} minutes.`
    });
  }

  const { email, password } = req.body || {};
  if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
    const status = db.recordFailedLogin(ip);
    const msg = status.locked
      ? 'Too many failed login attempts. Locked for 15 minutes.'
      : 'Invalid email or password';
    return res.status(status.locked ? 429 : 401).json({ error: msg });
  }

  const adminEmail = process.env.ADMIN_EMAIL || 'mog.wrldd@gmail.com';
  const adminHash = process.env.ADMIN_PASSWORD_HASH;

  // Strict email check
  if (email.trim().toLowerCase() !== adminEmail.toLowerCase() || !adminHash) {
    const status = db.recordFailedLogin(ip);
    const msg = status.locked
      ? 'Too many failed login attempts. Locked for 15 minutes.'
      : 'Invalid email or password';
    return res.status(status.locked ? 429 : 401).json({ error: msg });
  }

  // Password verify
  const isMatch = bcrypt.compareSync(password, adminHash);
  if (!isMatch) {
    const status = db.recordFailedLogin(ip);
    const msg = status.locked
      ? 'Too many failed login attempts. Locked for 15 minutes.'
      : 'Invalid email or password';
    return res.status(status.locked ? 429 : 401).json({ error: msg });
  }

  // Success
  db.clearLoginAttempts(ip);
  const sessionToken = crypto.randomBytes(32).toString('hex');
  const maxAgeMs = 24 * 60 * 60 * 1000; // 24 hours
  db.createSession(sessionToken, adminEmail, maxAgeMs);

  res.cookie('admin_session', sessionToken, {
    httpOnly: true,
    sameSite: 'strict',
    signed: true,
    secure: Boolean(req.secure || req.headers['x-forwarded-proto'] === 'https'),
    maxAge: maxAgeMs,
    path: '/'
  });

  db.logActivity(adminEmail, 'LOGIN', 'Admin logged in successfully from ' + ip);
  return res.json({ success: true, email: adminEmail });
});

router.post('/logout', (req, res) => {
  const token = req.signedCookies?.admin_session || req.cookies?.admin_session;
  if (token) {
    db.deleteSession(token);
  }
  res.clearCookie('admin_session', { path: '/' });
  db.logActivity(req.admin?.email || 'admin', 'LOGOUT', 'Admin logged out');
  return res.json({ success: true });
});

router.get('/me', requireAdmin, (req, res) => {
  return res.json({ email: req.admin.email });
});

router.post('/change-password', requireAdmin, (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body || {};
  if (!currentPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ error: 'New passwords do not match.' });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
  }

  const adminHash = process.env.ADMIN_PASSWORD_HASH;
  if (!bcrypt.compareSync(currentPassword, adminHash)) {
    return res.status(400).json({ error: 'Current password is incorrect.' });
  }

  const newHash = bcrypt.hashSync(newPassword, 12);
  process.env.ADMIN_PASSWORD_HASH = newHash;

  // Persist to .env
  try {
    const envPath = path.join(__dirname, '..', '..', '.env');
    if (fs.existsSync(envPath)) {
      let content = fs.readFileSync(envPath, 'utf8');
      if (content.includes('ADMIN_PASSWORD_HASH=')) {
        content = content.replace(/ADMIN_PASSWORD_HASH=.*/, `ADMIN_PASSWORD_HASH=${newHash}`);
      } else {
        content += `\nADMIN_PASSWORD_HASH=${newHash}\n`;
      }
      fs.writeFileSync(envPath, content, 'utf8');
    }
  } catch (err) {
    console.error('Error writing .env file:', err);
  }

  db.logActivity(req.admin.email, 'CHANGE_PASSWORD', 'Admin updated master password');
  return res.json({ success: true, message: 'Password updated successfully' });
});

module.exports = router;
