const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { getClientIp, requireCustomer } = require('../auth');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../mailer');

const router = express.Router();

// Helper to hash token with SHA-256 for storage
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// CSRF Token Provider
router.get('/csrf', (req, res) => {
  let token = req.signedCookies?.['csrf_token'] || req.cookies?.['csrf_token'];
  if (!token) {
    token = crypto.randomBytes(24).toString('hex');
    res.cookie('csrf_token', token, {
      httpOnly: false, // Frontend needs to read this cookie to send in header
      sameSite: 'strict',
      secure: Boolean(req.secure || req.headers['x-forwarded-proto'] === 'https'),
      path: '/'
    });
  }
  res.json({ csrfToken: token });
});

// Registration (/api/auth/register)
router.post('/register', async (req, res) => {
  const { name, email, phone, password, confirmPassword, agreeTerms } = req.body || {};

  // Validation
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({ error: 'Full name is required (minimum 2 characters).' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }

  // Password rule: >= 8 chars, letter + number
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
  if (!password || typeof password !== 'string' || !passwordRegex.test(password)) {
    return res.status(400).json({
      error: 'Password must be at least 8 characters long and contain both letters and numbers.'
    });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match.' });
  }

  if (!agreeTerms) {
    return res.status(400).json({ error: 'You must agree to the Terms & Privacy Policy.' });
  }

  const cleanEmail = email.trim().toLowerCase();

  // Duplicate check: Do not reveal whether email exists (generic response)
  const existingUser = db.getUserByEmail(cleanEmail);
  if (existingUser) {
    // If user already exists but unverified, send another verification link
    if (existingUser.email_verified === 0) {
      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = hashToken(rawToken);
      const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
      db.createToken(existingUser.id, 'verify_email', tokenHash, expiresAt);
      sendVerificationEmail(existingUser.email, existingUser.name, rawToken).catch(() => {});
    }
    return res.json({
      success: true,
      message: "If this email can be used, we've sent a verification link. Please check your inbox."
    });
  }

  // Create Customer: ALWAYS role = 'customer'
  const passwordHash = bcrypt.hashSync(password, 12);
  const newUser = db.createCustomer({
    name,
    email: cleanEmail,
    phone,
    passwordHash
  });

  // Create verification token
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashToken(rawToken);
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  db.createToken(newUser.id, 'verify_email', tokenHash, expiresAt);

  // Send verification email
  sendVerificationEmail(newUser.email, newUser.name, rawToken).catch(() => {});

  return res.status(201).json({
    success: true,
    message: "If this email can be used, we've sent a verification link. Please check your inbox."
  });
});

// Resend Verification Email
router.post('/resend-verification', (req, res) => {
  const { email } = req.body || {};
  if (!email || typeof email !== 'string') {
    return res.json({ success: true, message: "If this email can be used, we've sent a verification link." });
  }

  const cleanEmail = email.trim().toLowerCase();
  const user = db.getUserByEmail(cleanEmail);

  if (user && user.email_verified === 0 && user.disabled === 0) {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashToken(rawToken);
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
    db.createToken(user.id, 'verify_email', tokenHash, expiresAt);
    sendVerificationEmail(user.email, user.name, rawToken).catch(() => {});
  }

  return res.json({
    success: true,
    message: "If this email can be used, we've sent a verification link. Please check your inbox."
  });
});

// Email Verification Link Consumption (/api/auth/verify-email?token=...)
router.get('/verify-email', (req, res) => {
  const { token } = req.query;
  if (!token || typeof token !== 'string') {
    return res.status(400).json({ error: 'Verification token is required.' });
  }

  const tokenHash = hashToken(token);
  const user = db.verifyAndConsumeToken(tokenHash, 'verify_email');

  if (!user) {
    return res.status(400).json({
      error: 'Invalid or expired verification link. Please request a new one.'
    });
  }

  db.markEmailVerified(user.id);
  return res.json({
    success: true,
    message: 'Your email has been verified successfully. You can now sign in.'
  });
});

// Customer Sign In (/api/auth/login)
router.post('/login', (req, res) => {
  const ip = getClientIp(req);
  const { email, password } = req.body || {};

  // Rate Limiting by IP and by Email
  const ipRateLimit = db.checkLoginRateLimit(`ip:${ip}`);
  if (!ipRateLimit.allowed) {
    return res.status(429).json({
      error: `Too many failed attempts. Account locked for ${ipRateLimit.minutesRemaining} minutes.`
    });
  }

  if (email && typeof email === 'string') {
    const emailRateLimit = db.checkLoginRateLimit(`email:${email.trim().toLowerCase()}`);
    if (!emailRateLimit.allowed) {
      return res.status(429).json({
        error: `Too many failed attempts for this account. Locked for ${emailRateLimit.minutesRemaining} minutes.`
      });
    }
  }

  if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
    db.recordFailedLogin(`ip:${ip}`);
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const user = db.getUserByEmail(cleanEmail);

  // If user not found, disabled, or not customer role
  if (!user || user.role !== 'customer') {
    db.recordFailedLogin(`ip:${ip}`);
    db.recordFailedLogin(`email:${cleanEmail}`);
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // Account disabled check
  if (user.disabled === 1) {
    return res.status(403).json({ error: 'This account has been disabled. Please contact support.' });
  }

  // Password check
  const isMatch = bcrypt.compareSync(password, user.password_hash);
  if (!isMatch) {
    const ipStatus = db.recordFailedLogin(`ip:${ip}`);
    const emailStatus = db.recordFailedLogin(`email:${cleanEmail}`);
    const locked = ipStatus.locked || emailStatus.locked;
    return res.status(locked ? 429 : 401).json({
      error: locked ? 'Too many failed login attempts. Locked for 15 minutes.' : 'Invalid email or password'
    });
  }

  // Email verified check
  if (user.email_verified === 0) {
    return res.status(403).json({
      error: 'Please verify your email address before signing in. Check your inbox or request a new verification email.',
      unverified: true
    });
  }

  // Success: Clear login attempts
  db.clearLoginAttempts(`ip:${ip}`);
  db.clearLoginAttempts(`email:${cleanEmail}`);
  db.updateLastLogin(user.id);

  // Create 7-day session
  const sessionToken = crypto.randomBytes(32).toString('hex');
  const maxAgeMs = 7 * 24 * 60 * 60 * 1000; // 7 days
  db.createCustomerSession(sessionToken, user.id, maxAgeMs);

  res.cookie('customer_session', sessionToken, {
    httpOnly: true,
    sameSite: 'strict',
    signed: true,
    secure: Boolean(req.secure || req.headers['x-forwarded-proto'] === 'https'),
    maxAge: maxAgeMs,
    path: '/'
  });

  return res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: 'customer'
    }
  });
});

// Logout (/api/auth/logout)
router.post('/logout', (req, res) => {
  const token = req.signedCookies?.customer_session || req.cookies?.customer_session;
  if (token) {
    db.deleteCustomerSession(token);
  }
  res.clearCookie('customer_session', { path: '/' });
  return res.json({ success: true });
});

// Current Customer Profile (/api/auth/me)
router.get('/me', requireCustomer, (req, res) => {
  const u = req.customer;
  return res.json({
    user: {
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      role: u.role,
      emailVerified: Boolean(u.email_verified),
      createdAt: u.created_at
    }
  });
});

// Forgot Password (/api/auth/forgot-password)
router.post('/forgot-password', (req, res) => {
  const { email } = req.body || {};
  const ip = getClientIp(req);
  db.recordFailedLogin(`reset:${ip}`); // light throttling

  if (!email || typeof email !== 'string') {
    return res.json({
      success: true,
      message: 'If an account exists with that email, a password reset link has been sent.'
    });
  }

  const cleanEmail = email.trim().toLowerCase();
  const user = db.getUserByEmail(cleanEmail);

  if (user && user.role === 'customer' && user.disabled === 0) {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashToken(rawToken);
    const expiresAt = Date.now() + 30 * 60 * 1000; // 30 minutes
    db.createToken(user.id, 'reset_password', tokenHash, expiresAt);
    sendPasswordResetEmail(user.email, user.name, rawToken).catch(() => {});
  }

  return res.json({
    success: true,
    message: 'If an account exists with that email, a password reset link has been sent.'
  });
});

// Reset Password (/api/auth/reset-password)
router.post('/reset-password', (req, res) => {
  const { token, newPassword, confirmPassword } = req.body || {};
  if (!token || typeof token !== 'string') {
    return res.status(400).json({ error: 'Reset token is required.' });
  }

  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
  if (!newPassword || typeof newPassword !== 'string' || !passwordRegex.test(newPassword)) {
    return res.status(400).json({
      error: 'New password must be at least 8 characters long and contain both letters and numbers.'
    });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match.' });
  }

  const tokenHash = hashToken(token);
  const user = db.verifyAndConsumeToken(tokenHash, 'reset_password');

  if (!user || user.role !== 'customer') {
    return res.status(400).json({
      error: 'Invalid or expired password reset link. Please request a new one.'
    });
  }

  // Update password and invalidate all customer sessions
  const newHash = bcrypt.hashSync(newPassword, 12);
  db.updateCustomerPassword(user.id, newHash);

  res.clearCookie('customer_session', { path: '/' });
  return res.json({
    success: true,
    message: 'Password reset successfully. You can now sign in with your new password.'
  });
});

module.exports = router;
