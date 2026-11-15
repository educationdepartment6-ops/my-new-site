const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const db = require('./db');

// Admin Auth Middleware
function requireAdmin(req, res, next) {
  // If request contains a customer session, explicitly forbid with 403
  const customerToken = req.signedCookies?.customer_session || req.cookies?.customer_session;
  if (customerToken) {
    const customerSess = db.getCustomerSession(customerToken);
    if (customerSess) {
      return res.status(403).json({ error: 'Forbidden: Admin access restricted. Customer accounts cannot access admin portal.' });
    }
  }

  const token = req.signedCookies?.admin_session || req.cookies?.admin_session || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : null);
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Session missing' });
  }

  const session = db.getSession(token);
  if (!session) {
    res.clearCookie('admin_session');
    return res.status(401).json({ error: 'Unauthorized: Session invalid or expired' });
  }

  // Double check admin role
  if (session.admin_email !== (process.env.ADMIN_EMAIL || 'mog.wrldd@gmail.com')) {
    return res.status(403).json({ error: 'Forbidden: Insufficient privileges' });
  }

  req.admin = { email: session.admin_email, token, role: 'admin' };
  next();
}

// Customer Auth Middleware
function requireCustomer(req, res, next) {
  const token = req.signedCookies?.customer_session || req.cookies?.customer_session;
  if (!token) {
    return res.status(401).json({ error: 'Authentication required. Please sign in.' });
  }

  const sess = db.getCustomerSession(token);
  if (!sess) {
    res.clearCookie('customer_session');
    return res.status(401).json({ error: 'Session expired. Please sign in again.' });
  }

  if (sess.user.disabled === 1) {
    res.clearCookie('customer_session');
    return res.status(403).json({ error: 'This account has been disabled. Please contact support.' });
  }

  req.customer = sess.user;
  req.customerSessionToken = token;
  next();
}

// Optional Customer Auth Middleware (populates req.customer if session present)
function optionalCustomer(req, res, next) {
  const token = req.signedCookies?.customer_session || req.cookies?.customer_session;
  if (token) {
    const sess = db.getCustomerSession(token);
    if (sess && sess.user.disabled !== 1) {
      req.customer = sess.user;
      req.customerSessionToken = token;
    }
  }
  next();
}

// CSRF Validation Middleware for POST/PUT/DELETE/PATCH
function csrfProtection(req, res, next) {
  // Safe methods pass
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Header or body token check
  const headerToken = req.headers['x-csrf-token'];
  const cookieToken = req.signedCookies?.['csrf_token'] || req.cookies?.['csrf_token'];

  // Origin / Referer check
  const origin = req.headers['origin'];
  const host = req.headers['host'];
  if (origin && host) {
    try {
      const originHost = new URL(origin).host;
      if (originHost !== host) {
        return res.status(403).json({ error: 'CSRF verification failed: Origin mismatch' });
      }
    } catch (_) {}
  }

  // If CSRF cookie is present, require header match
  if (cookieToken && headerToken && cookieToken !== headerToken) {
    return res.status(403).json({ error: 'CSRF token mismatch' });
  }

  next();
}

function getClientIp(req) {
  return req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
}

module.exports = {
  requireAdmin,
  requireCustomer,
  optionalCustomer,
  csrfProtection,
  getClientIp
};
