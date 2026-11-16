const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', 'data.db');
const db = new DatabaseSync(dbPath);

// Enable WAL mode & foreign keys
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

// Initialize Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    color_hex TEXT
  );

  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL,
    category_name TEXT NOT NULL,
    purity TEXT NOT NULL DEFAULT '≥98.0% (HPLC)',
    primary_sku TEXT,
    short_description TEXT,
    specification TEXT,
    image_url TEXT,
    is_visible INTEGER NOT NULL DEFAULT 1,
    featured INTEGER NOT NULL DEFAULT 0,
    row_no INTEGER,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS variants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id TEXT NOT NULL,
    row_no INTEGER,
    sku TEXT NOT NULL,
    strength TEXT NOT NULL,
    label TEXT NOT NULL,
    specification TEXT NOT NULL,
    price_inr INTEGER NOT NULL,
    price_usd REAL NOT NULL,
    image_url TEXT,
    batch_number TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL,
    customer_id TEXT,
    customer_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    institution TEXT,
    address TEXT NOT NULL,
    city TEXT,
    postal_code TEXT,
    country TEXT,
    items_json TEXT NOT NULL,
    total_inr INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'INR',
    status TEXT NOT NULL DEFAULT 'Pending',
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    admin_email TEXT NOT NULL,
    action TEXT NOT NULL,
    details TEXT,
    timestamp TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    admin_email TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    expires_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS login_attempts (
    identifier TEXT PRIMARY KEY,
    attempts INTEGER NOT NULL DEFAULT 0,
    locked_until INTEGER NOT NULL DEFAULT 0,
    last_attempt INTEGER NOT NULL
  );

  -- Customer Accounts
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'customer',
    email_verified INTEGER NOT NULL DEFAULT 0,
    disabled INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    last_login_at TEXT
  );

  CREATE TABLE IF NOT EXISTS customer_sessions (
    token TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    expires_at INTEGER NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS user_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL,
    token_hash TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    used INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS user_addresses (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    recipient_name TEXT NOT NULL,
    phone TEXT,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'United States',
    is_default INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS user_carts (
    user_id TEXT PRIMARY KEY,
    items_json TEXT NOT NULL DEFAULT '[]',
    updated_at TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS coa_records (
    id TEXT PRIMARY KEY,
    product_id TEXT,
    product_name TEXT NOT NULL,
    category TEXT NOT NULL,
    strength TEXT NOT NULL,
    batch_number TEXT NOT NULL,
    test_date TEXT NOT NULL,
    lab TEXT NOT NULL,
    pdf_url TEXT NOT NULL,
    file_size TEXT NOT NULL,
    page_count INTEGER NOT NULL DEFAULT 1,
    is_visible INTEGER NOT NULL DEFAULT 1,
    in_catalog INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
`);

// Ensure customer_id column exists on orders table
try {
  const orderColumns = db.prepare('PRAGMA table_info(orders)').all();
  if (!orderColumns.some(c => c.name === 'customer_id')) {
    db.prepare('ALTER TABLE orders ADD COLUMN customer_id TEXT').run();
  }
} catch (e) {
  console.warn('[DB Migration] orders.customer_id check:', e.message);
}

// Auto-seed from JSON files if database is empty
function seedDatabase() {
  const countRow = db.prepare('SELECT COUNT(*) as count FROM products').get();
  if (countRow.count > 0) return; // already seeded

  console.log('[DB] Seeding database from JSON data files...');
  
  // Seed categories
  const catPath = path.join(__dirname, '..', 'src', 'data', 'categories.json');
  if (fs.existsSync(catPath)) {
    const categoriesData = JSON.parse(fs.readFileSync(catPath, 'utf8'));
    const insertCat = db.prepare('INSERT OR REPLACE INTO categories (id, name, slug, description) VALUES (?, ?, ?, ?)');
    for (const [slug, info] of Object.entries(categoriesData)) {
      insertCat.run(info.id || 1, info.name, info.slug, info.description || '');
    }
  }

  // Seed products and variants
  const prodPath = path.join(__dirname, '..', 'src', 'data', 'products.json');
  if (fs.existsSync(prodPath)) {
    const productsData = JSON.parse(fs.readFileSync(prodPath, 'utf8'));
    const insertProd = db.prepare(`
      INSERT INTO products (
        id, name, slug, category, category_name, purity, primary_sku,
        short_description, specification, image_url, is_visible, featured, row_no, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?)
    `);

    const insertVar = db.prepare(`
      INSERT INTO variants (
        product_id, row_no, sku, strength, label, specification, price_inr, price_usd, image_url, batch_number, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `);

    const now = new Date().toISOString();
    for (const p of productsData) {
      insertProd.run(
        p.id || p.slug,
        p.name,
        p.slug,
        p.category,
        p.categoryName,
        p.purity || '≥98.0% (HPLC)',
        p.primarySku,
        p.shortDescription,
        p.specification,
        p.imageUrl,
        p.featured ? 1 : 0,
        p.row || 1,
        now,
        now
      );

      if (p.variants && p.variants.length > 0) {
        for (const v of p.variants) {
          insertVar.run(
            p.id || p.slug,
            v.row || p.row || 1,
            v.sku,
            v.strength,
            v.label,
            v.specification,
            v.priceInr || v.price,
            v.priceUsd || Number((v.priceInr / 86.5).toFixed(2)),
            v.imageUrl,
            v.batchNumber || 'MW-2026-CERT'
          );
        }
      }
    }
    console.log(`[DB] Successfully seeded ${productsData.length} compounds into SQLite.`);
  }
}

seedDatabase();
seedCOARecords();

// Sync SQLite back to src/data/products.json and dist/src/data/products.json
function syncToJson() {
  try {
    const allProducts = getAllProducts(false);
    const jsonPath = path.join(__dirname, '..', 'src', 'data', 'products.json');
    fs.writeFileSync(jsonPath, JSON.stringify(allProducts, null, 2), 'utf8');

    const distJsonPath = path.join(__dirname, '..', 'dist', 'src', 'data', 'products.json');
    if (fs.existsSync(path.dirname(distJsonPath))) {
      fs.mkdirSync(path.dirname(distJsonPath), { recursive: true });
      fs.writeFileSync(distJsonPath, JSON.stringify(allProducts, null, 2), 'utf8');
    }
  } catch (err) {
    console.error('[DB] Error syncing to JSON:', err);
  }
}

// Queries & Mutations
function getAllProducts(includeHidden = false) {
  const prodSql = includeHidden
    ? 'SELECT * FROM products ORDER BY row_no ASC'
    : 'SELECT * FROM products WHERE is_visible = 1 ORDER BY row_no ASC';

  const rows = db.prepare(prodSql).all();
  const getVariants = db.prepare('SELECT * FROM variants WHERE product_id = ? AND is_active = 1 ORDER BY price_inr ASC');

  return rows.map((p) => {
    const variants = getVariants.all(p.id).map((v) => ({
      row: v.row_no,
      sku: v.sku,
      strength: v.strength,
      label: v.label,
      specification: v.specification,
      priceInr: v.price_inr,
      priceUsd: v.price_usd,
      price: v.price_inr,
      priceFormattedInr: v.strength.includes('ml') ? `₹${v.price_inr.toLocaleString()} per ${v.strength}` : `₹${v.price_inr.toLocaleString()} / vial`,
      priceFormattedUsd: v.strength.includes('ml') ? `$${v.price_usd} per ${v.strength}` : `$${v.price_usd} / vial`,
      imageUrl: v.image_url,
      batchNumber: v.batch_number,
      inStock: true
    }));

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      category: p.category,
      categoryName: p.category_name,
      purity: p.purity,
      primarySku: p.primary_sku,
      priceInr: variants[0]?.priceInr || 0,
      price: variants[0]?.priceInr || 0,
      priceFormattedInr: variants[0]?.priceFormattedInr || '',
      priceFormattedUsd: variants[0]?.priceFormattedUsd || '',
      shortDescription: p.short_description,
      specification: variants[0]?.specification || p.specification,
      imageUrl: variants[0]?.imageUrl || p.image_url,
      inStock: true,
      featured: Boolean(p.featured),
      isVisible: Boolean(p.is_visible),
      row: p.row_no,
      variants
    };
  });
}

function getProductById(id) {
  const p = db.prepare('SELECT * FROM products WHERE id = ? OR slug = ?').get(id, id);
  if (!p) return null;
  const variants = db.prepare('SELECT * FROM variants WHERE product_id = ? AND is_active = 1 ORDER BY price_inr ASC').all(p.id);
  return {
    ...p,
    variants: variants.map(v => ({
      id: v.id,
      sku: v.sku,
      strength: v.strength,
      label: v.label,
      specification: v.specification,
      priceInr: v.price_inr,
      priceUsd: v.price_usd,
      imageUrl: v.image_url,
      batchNumber: v.batch_number
    }))
  };
}

function updateProduct(id, data, adminEmail) {
  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  if (!existing) throw new Error('Product not found');

  const now = new Date().toISOString();
  db.prepare(`
    UPDATE products SET
      name = ?,
      category = ?,
      category_name = ?,
      short_description = ?,
      is_visible = ?,
      image_url = ?,
      updated_at = ?
    WHERE id = ?
  `).run(
    data.name ?? existing.name,
    data.category ?? existing.category,
    data.categoryName ?? existing.category_name,
    data.shortDescription ?? existing.short_description,
    data.isVisible !== undefined ? (data.isVisible ? 1 : 0) : existing.is_visible,
    data.imageUrl ?? existing.image_url,
    now,
    id
  );

  if (Array.isArray(data.variants)) {
    db.prepare('DELETE FROM variants WHERE product_id = ?').run(id);
    const insertVar = db.prepare(`
      INSERT INTO variants (
        product_id, row_no, sku, strength, label, specification, price_inr, price_usd, image_url, batch_number, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `);

    for (const v of data.variants) {
      const priceInr = parseInt(v.priceInr ?? v.price, 10);
      const priceUsd = v.priceUsd ? parseFloat(v.priceUsd) : Number((priceInr / 86.5).toFixed(2));
      const strength = (v.strength || '').trim();
      const sku = (v.sku || '').trim().toUpperCase();
      const label = v.label || (strength.includes('ml') ? `${strength} per container` : `${strength} / vial`);
      const spec = v.specification || (strength.includes('ml') ? strength : `${strength} per vial`);
      
      insertVar.run(
        id,
        v.row || existing.row_no || 1,
        sku,
        strength,
        label,
        spec,
        priceInr,
        priceUsd,
        v.imageUrl || existing.image_url,
        v.batchNumber || `MW-${sku}-CERT`
      );
    }
  }

  logActivity(adminEmail, 'UPDATE_PRODUCT', `Updated compound '${existing.name}' (${id})`);
  syncToJson();
  return getProductById(id);
}

function addProduct(data, adminEmail) {
  const slug = (data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
  const now = new Date().toISOString();
  
  db.prepare(`
    INSERT INTO products (
      id, name, slug, category, category_name, purity, primary_sku,
      short_description, specification, image_url, is_visible, featured, row_no, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0, 999, ?, ?)
  `).run(
    slug,
    data.name,
    slug,
    data.category,
    data.categoryName || data.category,
    data.purity || '≥98.0% (HPLC)',
    data.primarySku || (data.variants?.[0]?.sku) || 'NEW',
    data.shortDescription || `${data.name} analytical research compound. For laboratory research use only.`,
    data.specification || 'Research compound per vial',
    data.imageUrl || '/brand/molecule-icon.png',
    now,
    now
  );

  if (Array.isArray(data.variants)) {
    const insertVar = db.prepare(`
      INSERT INTO variants (
        product_id, row_no, sku, strength, label, specification, price_inr, price_usd, image_url, batch_number, is_active
      ) VALUES (?, 999, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `);
    for (const v of data.variants) {
      const priceInr = parseInt(v.priceInr ?? v.price, 10);
      insertVar.run(
        slug,
        v.sku.toUpperCase(),
        v.strength,
        v.label || `${v.strength} / vial`,
        v.specification || `${v.strength} per vial`,
        priceInr,
        Number((priceInr / 86.5).toFixed(2)),
        v.imageUrl || '/brand/molecule-icon.png',
        `MW-${v.sku}-CERT`
      );
    }
  }

  logActivity(adminEmail, 'ADD_PRODUCT', `Added new compound '${data.name}' (${slug})`);
  syncToJson();
  return getProductById(slug);
}

function toggleProductVisibility(id, isVisible, adminEmail) {
  db.prepare('UPDATE products SET is_visible = ?, updated_at = ? WHERE id = ?').run(
    isVisible ? 1 : 0,
    new Date().toISOString(),
    id
  );
  logActivity(adminEmail, 'VISIBILITY_TOGGLE', `Set visibility of '${id}' to ${isVisible ? 'VISIBLE' : 'HIDDEN'}`);
  syncToJson();
}

function getAllCategories() {
  const cats = db.prepare('SELECT * FROM categories ORDER BY id ASC').all();
  const countStmt = db.prepare('SELECT COUNT(*) as count FROM products WHERE category = ? AND is_visible = 1');
  return cats.map(c => ({
    ...c,
    productCount: countStmt.get(c.slug).count
  }));
}

function updateCategory(id, name, description, adminEmail) {
  db.prepare('UPDATE categories SET name = ?, description = ? WHERE id = ?').run(name, description, id);
  const cat = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
  if (cat) {
    db.prepare('UPDATE products SET category_name = ? WHERE category = ?').run(name, cat.slug);
  }
  logActivity(adminEmail, 'UPDATE_CATEGORY', `Updated category #${id} name to '${name}'`);
  syncToJson();
}

function moveProductCategory(productId, newCategorySlug, adminEmail) {
  const cat = db.prepare('SELECT * FROM categories WHERE slug = ?').get(newCategorySlug);
  if (!cat) throw new Error('Category not found');
  db.prepare('UPDATE products SET category = ?, category_name = ?, updated_at = ? WHERE id = ?').run(
    cat.slug,
    cat.name,
    new Date().toISOString(),
    productId
  );
  logActivity(adminEmail, 'MOVE_CATEGORY', `Moved product '${productId}' to category '${cat.name}'`);
  syncToJson();
}

// Orders
function createOrder(data, customerId = null) {
  const orderId = `MW-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO orders (
      id, order_number, customer_id, customer_name, email, phone, institution, address, city, postal_code, country,
      items_json, total_inr, currency, status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', ?)
  `).run(
    orderId,
    orderId,
    customerId || data.customerId || null,
    data.customer?.fullName || data.customerName,
    (data.customer?.email || data.email || '').toLowerCase().trim(),
    data.customer?.phone || data.phone || '',
    data.customer?.institution || data.institution || '',
    data.customer?.address || data.address || '',
    data.customer?.city || data.city || '',
    data.customer?.postalCode || data.postalCode || '',
    data.customer?.country || data.country || 'United States',
    JSON.stringify(data.items || []),
    parseInt(data.total || 0, 10),
    data.currency || 'INR',
    now
  );
  return { orderId, status: 'Pending', createdAt: now };
}

function getAllOrders() {
  const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
  return orders.map(o => ({
    ...o,
    items: JSON.parse(o.items_json || '[]')
  }));
}

function updateOrderStatus(id, status, adminEmail) {
  db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, id);
  logActivity(adminEmail, 'UPDATE_ORDER', `Changed order #${id} status to '${status}'`);
}

// Activity Logs
function logActivity(adminEmail, action, details) {
  const now = new Date().toISOString();
  db.prepare('INSERT INTO activity_logs (admin_email, action, details, timestamp) VALUES (?, ?, ?, ?)').run(
    adminEmail || 'admin',
    action,
    details || '',
    now
  );
}

function getActivityLogs(limit = 100) {
  return db.prepare('SELECT * FROM activity_logs ORDER BY id DESC LIMIT ?').all(limit);
}

// Admin Session Store
function createSession(token, email, maxAgeMs) {
  const now = Date.now();
  const expiresAt = now + maxAgeMs;
  db.prepare('INSERT OR REPLACE INTO sessions (token, admin_email, created_at, expires_at) VALUES (?, ?, ?, ?)').run(
    token,
    email,
    now,
    expiresAt
  );
}

function getSession(token) {
  if (!token) return null;
  const sess = db.prepare('SELECT * FROM sessions WHERE token = ?').get(token);
  if (!sess) return null;
  if (Date.now() > sess.expires_at) {
    db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
    return null;
  }
  return sess;
}

function deleteSession(token) {
  if (!token) return;
  db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
}

// Login Rate Limiting (handles IP or email)
function checkLoginRateLimit(identifier) {
  const now = Date.now();
  const entry = db.prepare('SELECT * FROM login_attempts WHERE identifier = ?').get(identifier);
  if (!entry) return { allowed: true, remainingAttempts: 5 };

  if (entry.locked_until > now) {
    const minutesRemaining = Math.ceil((entry.locked_until - now) / 60000);
    return { allowed: false, lockedUntil: entry.locked_until, minutesRemaining };
  }

  if (now - entry.last_attempt > 15 * 60 * 1000) {
    db.prepare('DELETE FROM login_attempts WHERE identifier = ?').run(identifier);
    return { allowed: true, remainingAttempts: 5 };
  }

  return { allowed: true, remainingAttempts: Math.max(0, 5 - entry.attempts) };
}

function recordFailedLogin(identifier) {
  const now = Date.now();
  const entry = db.prepare('SELECT * FROM login_attempts WHERE identifier = ?').get(identifier);
  if (!entry) {
    db.prepare('INSERT INTO login_attempts (identifier, attempts, locked_until, last_attempt) VALUES (?, 1, 0, ?)').run(identifier, now);
    return { attempts: 1, locked: false };
  }

  const newAttempts = entry.attempts + 1;
  let lockedUntil = 0;
  if (newAttempts >= 5) {
    lockedUntil = now + 15 * 60 * 1000; // 15 minute lockout
  }

  db.prepare('UPDATE login_attempts SET attempts = ?, locked_until = ?, last_attempt = ? WHERE identifier = ?').run(
    newAttempts,
    lockedUntil,
    now,
    identifier
  );

  return { attempts: newAttempts, locked: newAttempts >= 5, minutesRemaining: 15 };
}

function clearLoginAttempts(identifier) {
  db.prepare('DELETE FROM login_attempts WHERE identifier = ?').run(identifier);
}

// ==============================================================================
// CUSTOMER AUTH & USER MANAGEMENT
// ==============================================================================

function normalizeIndianPhone(phone) {
  if (!phone || typeof phone !== 'string') return null;
  const clean = phone.trim().replace(/[\s\-\(\)\.]/g, '');
  if (/^\+91[6-9]\d{9}$/.test(clean)) return clean;
  if (/^91[6-9]\d{9}$/.test(clean)) return '+' + clean;
  if (/^[6-9]\d{9}$/.test(clean)) return '+91' + clean;
  return null;
}

function createCustomer(data) {
  const id = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const now = new Date().toISOString();
  const email = data.email.trim().toLowerCase();
  const normalizedPhone = normalizeIndianPhone(data.phone);

  if (!normalizedPhone) {
    throw new Error('A valid 10-digit Indian mobile number is required (starts with 6, 7, 8, or 9).');
  }

  // ALWAYS force role = 'customer' on server regardless of payload
  db.prepare(`
    INSERT INTO users (
      id, name, email, phone, password_hash, role, email_verified, disabled, created_at, last_login_at
    ) VALUES (?, ?, ?, ?, ?, 'customer', ?, 0, ?, NULL)
  `).run(
    id,
    data.name.trim(),
    email,
    normalizedPhone,
    data.passwordHash,
    data.emailVerified ? 1 : 0,
    now
  );

  return getUserById(id);
}

function getUserByEmail(email) {
  if (!email) return null;
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email.trim().toLowerCase());
}

function getUserById(id) {
  if (!id) return null;
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
}

function createCustomerSession(token, userId, maxAgeMs) {
  const now = Date.now();
  const expiresAt = now + maxAgeMs;
  db.prepare('INSERT OR REPLACE INTO customer_sessions (token, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)').run(
    token,
    userId,
    now,
    expiresAt
  );
}

function getCustomerSession(token) {
  if (!token) return null;
  const sess = db.prepare('SELECT * FROM customer_sessions WHERE token = ?').get(token);
  if (!sess) return null;
  if (Date.now() > sess.expires_at) {
    db.prepare('DELETE FROM customer_sessions WHERE token = ?').run(token);
    return null;
  }
  const user = getUserById(sess.user_id);
  if (!user || user.disabled === 1) return null;
  return { ...sess, user };
}

function deleteCustomerSession(token) {
  if (!token) return;
  db.prepare('DELETE FROM customer_sessions WHERE token = ?').run(token);
}

function deleteAllCustomerSessions(userId) {
  db.prepare('DELETE FROM customer_sessions WHERE user_id = ?').run(userId);
}

// User Tokens (verification & password reset)
function createToken(userId, type, tokenHash, expiresAt) {
  const now = Date.now();
  // Invalidate any existing unused tokens of this type for user
  db.prepare('UPDATE user_tokens SET used = 1 WHERE user_id = ? AND type = ? AND used = 0').run(userId, type);
  db.prepare(`
    INSERT INTO user_tokens (user_id, type, token_hash, expires_at, used, created_at)
    VALUES (?, ?, ?, ?, 0, ?)
  `).run(userId, type, tokenHash, expiresAt, now);
}

function verifyAndConsumeToken(tokenHash, type) {
  const now = Date.now();
  const row = db.prepare('SELECT * FROM user_tokens WHERE token_hash = ? AND type = ? AND used = 0').get(tokenHash, type);
  if (!row) return null;
  if (row.expires_at < now) return null; // expired

  // Mark as used
  db.prepare('UPDATE user_tokens SET used = 1 WHERE id = ?').run(row.id);
  return getUserById(row.user_id);
}

function updateCustomerProfile(userId, { name, phone }) {
  const existing = getUserById(userId);
  if (!existing) throw new Error('User not found');

  let normalizedPhone = existing.phone;
  if (phone !== undefined) {
    normalizedPhone = normalizeIndianPhone(phone);
    if (!normalizedPhone) {
      throw new Error('A valid 10-digit Indian mobile number is required and cannot be blank.');
    }
  }

  db.prepare('UPDATE users SET name = ?, phone = ? WHERE id = ?').run(
    name ? name.trim() : existing.name,
    normalizedPhone,
    userId
  );
  return getUserById(userId);
}

function updateCustomerPassword(userId, newPasswordHash) {
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(newPasswordHash, userId);
  deleteAllCustomerSessions(userId); // Log out all other sessions
}

function markEmailVerified(userId) {
  db.prepare('UPDATE users SET email_verified = 1 WHERE id = ?').run(userId);
}

function updateLastLogin(userId) {
  db.prepare('UPDATE users SET last_login_at = ? WHERE id = ?').run(new Date().toISOString(), userId);
}

// Saved Addresses
function getCustomerAddresses(userId) {
  return db.prepare('SELECT * FROM user_addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC').all(userId);
}

function addCustomerAddress(userId, data) {
  const id = `addr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const count = db.prepare('SELECT COUNT(*) as count FROM user_addresses WHERE user_id = ?').get(userId).count;
  const isDefault = data.isDefault || count === 0 ? 1 : 0;

  if (isDefault) {
    db.prepare('UPDATE user_addresses SET is_default = 0 WHERE user_id = ?').run(userId);
  }

  db.prepare(`
    INSERT INTO user_addresses (
      id, user_id, recipient_name, phone, address_line1, address_line2, city, postal_code, country, is_default, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    userId,
    data.recipientName.trim(),
    data.phone ? data.phone.trim() : null,
    data.addressLine1.trim(),
    data.addressLine2 ? data.addressLine2.trim() : null,
    data.city.trim(),
    data.postalCode.trim(),
    data.country || 'United States',
    isDefault,
    new Date().toISOString()
  );

  return db.prepare('SELECT * FROM user_addresses WHERE id = ?').get(id);
}

function updateCustomerAddress(userId, addrId, data) {
  const existing = db.prepare('SELECT * FROM user_addresses WHERE id = ? AND user_id = ?').get(addrId, userId);
  if (!existing) throw new Error('Address not found');

  if (data.isDefault) {
    db.prepare('UPDATE user_addresses SET is_default = 0 WHERE user_id = ?').run(userId);
  }

  db.prepare(`
    UPDATE user_addresses SET
      recipient_name = ?,
      phone = ?,
      address_line1 = ?,
      address_line2 = ?,
      city = ?,
      postal_code = ?,
      country = ?,
      is_default = ?
    WHERE id = ? AND user_id = ?
  `).run(
    data.recipientName ?? existing.recipient_name,
    data.phone ?? existing.phone,
    data.addressLine1 ?? existing.address_line1,
    data.addressLine2 ?? existing.address_line2,
    data.city ?? existing.city,
    data.postalCode ?? existing.postal_code,
    data.country ?? existing.country,
    data.isDefault !== undefined ? (data.isDefault ? 1 : 0) : existing.is_default,
    addrId,
    userId
  );

  return db.prepare('SELECT * FROM user_addresses WHERE id = ?').get(addrId);
}

function deleteCustomerAddress(userId, addrId) {
  db.prepare('DELETE FROM user_addresses WHERE id = ? AND user_id = ?').run(addrId, userId);
}

// Customer Orders
function getCustomerOrders(email) {
  if (!email) return [];
  const rows = db.prepare('SELECT * FROM orders WHERE LOWER(email) = ? ORDER BY created_at DESC').all(email.toLowerCase());
  return rows.map(r => ({
    ...r,
    items: JSON.parse(r.items_json || '[]')
  }));
}

// Customer Cart
function getCustomerCart(userId) {
  const row = db.prepare('SELECT items_json FROM user_carts WHERE user_id = ?').get(userId);
  return row ? JSON.parse(row.items_json || '[]') : [];
}

function saveCustomerCart(userId, items) {
  const json = JSON.stringify(items || []);
  const now = new Date().toISOString();
  db.prepare('INSERT OR REPLACE INTO user_carts (user_id, items_json, updated_at) VALUES (?, ?, ?)').run(
    userId,
    json,
    now
  );
}

// Admin Customer Listing & Controls
function getAllCustomersForAdmin() {
  const users = db.prepare("SELECT id, name, email, phone, role, email_verified, disabled, created_at, last_login_at FROM users WHERE role = 'customer' ORDER BY created_at DESC").all();
  const orderCountStmt = db.prepare('SELECT COUNT(*) as count FROM orders WHERE LOWER(email) = ?');
  return users.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    role: u.role,
    emailVerified: Boolean(u.email_verified),
    disabled: Boolean(u.disabled),
    createdAt: u.created_at,
    lastLoginAt: u.last_login_at,
    orderCount: orderCountStmt.get(u.email.toLowerCase()).count
  }));
}

function setCustomerDisabledStatus(userId, disabled, adminEmail) {
  const user = getUserById(userId);
  if (!user) throw new Error('Customer not found');

  db.prepare('UPDATE users SET disabled = ? WHERE id = ?').run(disabled ? 1 : 0, userId);
  if (disabled) {
    deleteAllCustomerSessions(userId); // Terminate all sessions
  }
  logActivity(adminEmail, 'CUSTOMER_STATUS', `Set customer '${user.email}' status to ${disabled ? 'DISABLED' : 'ENABLED'}`);
}

function createCustomerFromAdmin(data, adminEmail) {
  const normalizedPhone = normalizeIndianPhone(data.phone);
  if (!normalizedPhone) {
    throw new Error('A valid 10-digit Indian mobile number is required.');
  }
  const cleanEmail = data.email.trim().toLowerCase();
  const existing = getUserByEmail(cleanEmail);
  if (existing) {
    throw new Error('An account with this email already exists.');
  }
  const bcrypt = require('bcryptjs');
  const tempPasswordHash = data.password ? bcrypt.hashSync(data.password, 12) : bcrypt.hashSync('Customer2026!', 12);
  const id = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO users (
      id, name, email, phone, password_hash, role, email_verified, disabled, created_at, last_login_at
    ) VALUES (?, ?, ?, ?, ?, 'customer', 1, 0, ?, NULL)
  `).run(
    id,
    data.name ? data.name.trim() : 'Customer',
    cleanEmail,
    normalizedPhone,
    tempPasswordHash,
    now
  );

  logActivity(adminEmail, 'CREATE_CUSTOMER', `Created customer '${cleanEmail}' with phone ${normalizedPhone}`);
  return getUserById(id);
}

function updateCustomerFromAdmin(userId, data, adminEmail) {
  const existing = getUserById(userId);
  if (!existing) throw new Error('Customer not found');

  let normalizedPhone = existing.phone;
  if (data.phone !== undefined) {
    normalizedPhone = normalizeIndianPhone(data.phone);
    if (!normalizedPhone) {
      throw new Error('A valid 10-digit Indian mobile number is required.');
    }
  }

  db.prepare('UPDATE users SET name = ?, phone = ? WHERE id = ?').run(
    data.name ? data.name.trim() : existing.name,
    normalizedPhone,
    userId
  );

  logActivity(adminEmail, 'UPDATE_CUSTOMER', `Updated customer '${existing.email}' profile (phone: ${normalizedPhone})`);
  return getUserById(userId);
}

// ==============================================================================
// COA MANAGEMENT
// ==============================================================================

function getAllCOARecords() {
  return db.prepare('SELECT * FROM coa_records ORDER BY created_at DESC').all();
}

function getCOARecordById(id) {
  return db.prepare('SELECT * FROM coa_records WHERE id = ?').get(id);
}

function createCOARecord(data) {
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO coa_records (
      id, product_id, product_name, category, strength, batch_number,
      test_date, lab, pdf_url, file_size, page_count, is_visible, in_catalog, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    data.id,
    data.productId || null,
    data.productName,
    data.category,
    data.strength,
    data.batchNumber,
    data.testDate,
    data.lab,
    data.pdfUrl,
    data.fileSize,
    data.pageCount || 1,
    data.isVisible !== undefined ? data.isVisible : 1,
    data.inCatalog !== undefined ? data.inCatalog : 1,
    now,
    now
  );
  return getCOARecordById(data.id);
}

function updateCOARecord(id, data) {
  const existing = getCOARecordById(id);
  if (!existing) throw new Error('COA record not found');
  const now = new Date().toISOString();
  db.prepare(`
    UPDATE coa_records SET
      batch_number = ?,
      test_date = ?,
      strength = ?,
      lab = ?,
      is_visible = ?,
      updated_at = ?
    WHERE id = ?
  `).run(
    data.batchNumber ? data.batchNumber.trim() : existing.batch_number,
    data.testDate ? data.testDate.trim() : existing.test_date,
    data.strength ? data.strength.trim() : existing.strength,
    data.lab ? data.lab.trim() : existing.lab,
    data.isVisible !== undefined ? (data.isVisible ? 1 : 0) : existing.is_visible,
    now,
    id
  );
  return getCOARecordById(id);
}

function deleteCOARecord(id) {
  db.prepare('DELETE FROM coa_records WHERE id = ?').run(id);
}

function seedCOARecords() {
  try {
    const count = db.prepare('SELECT COUNT(*) as count FROM coa_records').get().count;
    if (count > 0) return;
    const jsonPath = path.join(__dirname, '..', 'src', 'data', 'coa_records.json');
    if (fs.existsSync(jsonPath)) {
      const list = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      const now = new Date().toISOString();
      const insert = db.prepare(`
        INSERT INTO coa_records (
          id, product_id, product_name, category, strength, batch_number,
          test_date, lab, pdf_url, file_size, page_count, is_visible, in_catalog, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const item of list) {
        insert.run(
          item.id,
          item.productId || null,
          item.productName,
          item.category,
          item.strength,
          item.batchNumber,
          item.testDate,
          item.lab,
          item.pdfUrl,
          item.fileSize,
          item.pageCount || 1,
          item.isVisible ? 1 : 0,
          item.inCatalog ? 1 : 0,
          now,
          now
        );
      }
      console.log(`[DB] Successfully seeded ${list.length} COA records into SQLite.`);
    }
  } catch (err) {
    console.error('[DB] Error seeding COA records:', err);
  }
}

module.exports = {
  db,
  getAllProducts,
  getProductById,
  updateProduct,
  addProduct,
  toggleProductVisibility,
  getAllCategories,
  updateCategory,
  moveProductCategory,
  createOrder,
  getAllOrders,
  updateOrderStatus,
  logActivity,
  getActivityLogs,
  createSession,
  getSession,
  deleteSession,
  checkLoginRateLimit,
  recordFailedLogin,
  clearLoginAttempts,
  // Customer functions
  createCustomer,
  getUserByEmail,
  getUserById,
  createCustomerSession,
  getCustomerSession,
  deleteCustomerSession,
  deleteAllCustomerSessions,
  createToken,
  verifyAndConsumeToken,
  updateCustomerProfile,
  updateCustomerPassword,
  markEmailVerified,
  updateLastLogin,
  getCustomerAddresses,
  addCustomerAddress,
  updateCustomerAddress,
  deleteCustomerAddress,
  getCustomerOrders,
  getCustomerCart,
  saveCustomerCart,
  getAllCustomersForAdmin,
  setCustomerDisabledStatus,
  createCustomerFromAdmin,
  updateCustomerFromAdmin,
  normalizeIndianPhone,
  // COA functions
  getAllCOARecords,
  getCOARecordById,
  createCOARecord,
  updateCOARecord,
  deleteCOARecord,
  seedCOARecords
};
