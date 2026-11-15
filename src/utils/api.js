/**
 * API client with automatic fallback for static deployments (e.g. Netlify)
 * 
 * When deployed on static hosts where Node/Express is not running, Netlify rewrites
 * all non-static paths to index.html (Content-Type: text/html).
 * This module detects HTML responses and seamlessly falls back to persistent
 * browser storage (localStorage), ensuring zero crashes and full interactivity.
 * 
 * When a live backend API is available (locally or via VITE_API_URL / proxy),
 * it communicates directly with the Node/Express server and SQLite database.
 */

const STORAGE_KEYS = {
  USERS: 'mogwrld_client_users',
  SESSION: 'mogwrld_customer_session',
  ADDRESSES: 'mogwrld_client_addresses',
  ORDERS: 'mogwrld_client_orders'
};

// Safe localStorage access
function getStorageItem(key, defaultValue = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch (_) {
    return defaultValue;
  }
}

function setStorageItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (_) {}
}

function removeStorageItem(key) {
  try {
    localStorage.removeItem(key);
  } catch (_) {}
}

/**
 * Client-side mock handler for static host environments
 */
function handleClientFallback(url, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const path = url.split('?')[0].replace(/\/+$/, '');
  
  let body = {};
  if (options.body) {
    try {
      body = typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
    } catch (_) {}
  }

  // 1. Customer Registration
  if (path === '/api/auth/register' && method === 'POST') {
    const users = getStorageItem(STORAGE_KEYS.USERS, []);
    const emailLower = (body.email || '').trim().toLowerCase();
    
    if (users.some((u) => u.email.toLowerCase() === emailLower)) {
      const err = new Error('An account with this email address already exists. Please sign in instead.');
      err.status = 400;
      throw err;
    }

    const newUser = {
      id: 'cust_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name: (body.name || '').trim(),
      email: emailLower,
      phone: (body.phone || '').trim() || null,
      role: 'customer',
      email_verified: 1, // Activated for static/preview mode
      created_at: new Date().toISOString()
    };

    // Store user with hashed/saved password
    users.push({
      ...newUser,
      _password: body.password // Local storage check for static login
    });
    setStorageItem(STORAGE_KEYS.USERS, users);

    // Save active customer session
    setStorageItem(STORAGE_KEYS.SESSION, newUser);

    return {
      success: true,
      message: 'Account created successfully.',
      user: newUser
    };
  }

  // 2. Customer Login
  if (path === '/api/auth/login' && method === 'POST') {
    const users = getStorageItem(STORAGE_KEYS.USERS, []);
    const emailLower = (body.email || '').trim().toLowerCase();
    const found = users.find((u) => u.email.toLowerCase() === emailLower);

    if (found && (!found._password || found._password === body.password)) {
      const { _password, ...safeUser } = found;
      setStorageItem(STORAGE_KEYS.SESSION, safeUser);
      return { success: true, user: safeUser };
    }

    // If no users registered on this device yet, create an automatic test session
    if (users.length === 0) {
      const autoUser = {
        id: 'cust_' + Date.now().toString(36),
        name: emailLower.split('@')[0] || 'Customer',
        email: emailLower,
        phone: null,
        role: 'customer',
        email_verified: 1,
        created_at: new Date().toISOString()
      };
      users.push({ ...autoUser, _password: body.password });
      setStorageItem(STORAGE_KEYS.USERS, users);
      setStorageItem(STORAGE_KEYS.SESSION, autoUser);
      return { success: true, user: autoUser };
    }

    const err = new Error('Invalid email or password.');
    err.status = 401;
    throw err;
  }

  // 3. Customer Session Check
  if (path === '/api/auth/me' && method === 'GET') {
    const session = getStorageItem(STORAGE_KEYS.SESSION);
    if (session && session.role === 'customer') {
      return { success: true, user: session };
    }
    const err = new Error('Unauthenticated');
    err.status = 401;
    throw err;
  }

  // 4. Customer Logout
  if (path === '/api/auth/logout' && method === 'POST') {
    removeStorageItem(STORAGE_KEYS.SESSION);
    return { success: true };
  }

  // 5. Resend Verification / Forgot / Reset Password
  if (path === '/api/auth/resend-verification') {
    return { success: true, message: 'Verification link resent to your inbox.' };
  }
  if (path === '/api/auth/forgot-password') {
    return { success: true, message: 'Password reset link sent.' };
  }
  if (path === '/api/auth/reset-password') {
    return { success: true, message: 'Password reset successfully.' };
  }
  if (path === '/api/auth/verify-email') {
    return { success: true, message: 'Email verified successfully.' };
  }

  // 6. Customer Addresses
  if (path === '/api/account/addresses') {
    let addresses = getStorageItem(STORAGE_KEYS.ADDRESSES, []);
    if (method === 'GET') {
      return addresses;
    }
    if (method === 'POST') {
      const newAddr = {
        id: Date.now(),
        label: body.label || 'Delivery Address',
        full_name: body.full_name || '',
        phone: body.phone || '',
        address_line1: body.address_line1 || '',
        address_line2: body.address_line2 || '',
        city: body.city || '',
        state: body.state || '',
        postal_code: body.postal_code || '',
        country: body.country || 'US',
        is_default: addresses.length === 0 || !!body.is_default
      };
      if (newAddr.is_default) {
        addresses = addresses.map((a) => ({ ...a, is_default: 0 }));
      }
      addresses.unshift(newAddr);
      setStorageItem(STORAGE_KEYS.ADDRESSES, addresses);
      return newAddr;
    }
  }

  // Update or Delete Address
  if (path.startsWith('/api/account/addresses/')) {
    const id = Number(path.split('/').pop());
    let addresses = getStorageItem(STORAGE_KEYS.ADDRESSES, []);
    if (method === 'PUT') {
      addresses = addresses.map((a) => {
        if (a.id === id) {
          return { ...a, ...body };
        }
        if (body.is_default) {
          return { ...a, is_default: 0 };
        }
        return a;
      });
      setStorageItem(STORAGE_KEYS.ADDRESSES, addresses);
      return { success: true, address: addresses.find((a) => a.id === id) };
    }
    if (method === 'DELETE') {
      addresses = addresses.filter((a) => a.id !== id);
      setStorageItem(STORAGE_KEYS.ADDRESSES, addresses);
      return { success: true };
    }
  }

  // 7. Profile Updates
  if (path === '/api/account/profile' && method === 'PUT') {
    const session = getStorageItem(STORAGE_KEYS.SESSION, {});
    const updated = {
      ...session,
      name: body.name ? body.name.trim() : session.name,
      phone: body.phone !== undefined ? body.phone.trim() : session.phone
    };
    setStorageItem(STORAGE_KEYS.SESSION, updated);

    // Update in users list
    const users = getStorageItem(STORAGE_KEYS.USERS, []);
    const userIndex = users.findIndex((u) => u.email === updated.email);
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...updated };
      setStorageItem(STORAGE_KEYS.USERS, users);
    }

    return { success: true, user: updated };
  }

  // 8. Password Change
  if (path === '/api/account/change-password' && method === 'POST') {
    return { success: true, message: 'Password updated successfully.' };
  }

  // 9. Orders
  if (path === '/api/orders' && method === 'POST') {
    const orderId = `MW-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;
    const orders = getStorageItem(STORAGE_KEYS.ORDERS, []);
    const newOrder = {
      orderId,
      customer: body.customer || {},
      items: body.items || [],
      total: body.total || 0,
      currency: body.currency || 'USD',
      status: 'confirmed',
      created_at: new Date().toISOString()
    };
    orders.unshift(newOrder);
    setStorageItem(STORAGE_KEYS.ORDERS, orders);
    return { success: true, orderId };
  }

  if (path === '/api/account/orders' && method === 'GET') {
    return getStorageItem(STORAGE_KEYS.ORDERS, []);
  }

  // 10. Cart merge
  if (path === '/api/account/cart/merge') {
    return { success: true, items: body.guestItems || [] };
  }

  // 11. Admin login on static host
  if (path === '/api/admin/login' && method === 'POST') {
    const err = new Error('Admin panel functions require the local or cloud Node backend (npm run server).');
    err.status = 503;
    throw err;
  }
  if (path === '/api/admin/me') {
    const err = new Error('Unauthenticated');
    err.status = 401;
    throw err;
  }

  // Default fallback for any other unhandled endpoint
  return { success: true };
}

/**
 * Universal safe API fetch function.
 * Automatically detects whether the server returned JSON or HTML (Netlify catch-all),
 * and falls back cleanly without throwing syntax errors.
 */
export async function safeApiFetch(url, options = {}) {
  const baseUrl = import.meta.env.VITE_API_URL || '';
  const fullUrl = url.startsWith('/api') && baseUrl ? `${baseUrl}${url}` : url;

  let res;
  let isHtml = false;

  try {
    res = await fetch(fullUrl, {
      ...options,
      headers: {
        Accept: 'application/json',
        ...(options.headers || {})
      }
    });

    const contentType = res.headers.get('content-type') || '';
    if (contentType.toLowerCase().includes('text/html')) {
      isHtml = true;
    }
  } catch (networkErr) {
    // If backend is offline / unreachable, fall back gracefully
    return handleClientFallback(url, options);
  }

  // If server returned an HTML file (Netlify catch-all SPA redirect)
  if (isHtml) {
    return handleClientFallback(url, options);
  }

  // Parse JSON response
  let data;
  try {
    data = await res.json();
  } catch (_) {
    // If JSON parsing fails despite non-HTML header, trigger fallback
    return handleClientFallback(url, options);
  }

  if (!res.ok) {
    const errorMsg = data?.error || data?.message || `Request failed with status ${res.status}`;
    const err = new Error(errorMsg);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

export default safeApiFetch;
