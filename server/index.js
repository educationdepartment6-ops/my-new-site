require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const express = require('express');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const imageRoutes = require('./routes/images');
const orderRoutes = require('./routes/orders');
const logRoutes = require('./routes/logs');

// Customer Routes
const customerAuthRoutes = require('./routes/customerAuth');
const customerAccountRoutes = require('./routes/customerAccount');
const adminCustomerRoutes = require('./routes/adminCustomers');
const adminCOARoutes = require('./routes/adminCOA');
const razorpayRoutes = require('./routes/razorpay');
const { csrfProtection } = require('./auth');

const app = express();
const PORT = process.env.PORT || 4173;
const SESSION_SECRET = process.env.SESSION_SECRET || 'mog-wrld-fallback-secret-2026';

// Security Headers with Helmet
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// Cookie Parser & Body Parsers
app.use(cookieParser(SESSION_SECRET));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// Anti-indexing header on /admin paths
app.use('/admin', (req, res, next) => {
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  next();
});

// CSRF Protection on API mutating endpoints
app.use('/api', csrfProtection);

// Customer API Routes
app.use('/api/auth', customerAuthRoutes);
app.use('/api/account', customerAccountRoutes);

// Admin API Routes
app.use('/api/admin', authRoutes);
app.use('/api/admin/products', productRoutes);
app.use('/api/admin/orders', orderRoutes);
app.use('/api/admin/images', imageRoutes);
app.use('/api/admin/logs', logRoutes);
app.use('/api/admin/customers', adminCustomerRoutes);
app.use('/api/admin/coa', adminCOARoutes);

// Public API Routes
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/coa', adminCOARoutes);

// Razorpay Payment Routes
app.use('/api/razorpay', razorpayRoutes.router);
app.post('/api/create-order', razorpayRoutes.createOrderHandler);
app.post('/api/verify-payment', razorpayRoutes.verifyPaymentHandler);
app.post('/api/razorpay-webhook', razorpayRoutes.webhookHandler);

// Static assets
const distDir = path.join(__dirname, '..', 'dist');
const publicDir = path.join(__dirname, '..', 'public');

app.use(express.static(distDir));
app.use(express.static(publicDir));

// Fallback to index.html for client-side routing
app.use((req, res) => {
  const indexPath = path.join(distDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    if (req.path.startsWith('/admin')) {
      res.setHeader('X-Robots-Tag', 'noindex, nofollow');
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    }
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(fs.readFileSync(indexPath, 'utf8'));
  } else {
    res.status(404).send('Site build not found. Run npm run build first.');
  }
});

app.listen(PORT, () => {
  console.log(`[MOG WRLD] Server running on http://localhost:${PORT}`);
  console.log(`[MOG WRLD] Customer sign-in at http://localhost:${PORT}/login`);
  console.log(`[MOG WRLD] Admin sign-in at http://localhost:${PORT}/admin/login`);
});
