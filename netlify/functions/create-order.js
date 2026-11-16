const Razorpay = require('razorpay');
const catalog = require('../../src/data/products.json');

// Helper to calculate total in paise from product catalog
function calculateAmountInPaise(items, fallbackAmount) {
  if (Array.isArray(items) && items.length > 0) {
    let totalInr = 0;
    for (const item of items) {
      const qty = parseInt(item.quantity, 10);
      if (isNaN(qty) || qty <= 0) continue;

      const sku = (item.sku || '').trim().toUpperCase();
      const slug = (item.productSlug || item.slug || item.productId || item.id || '').trim().toLowerCase();

      let matchedPrice = null;

      if (sku) {
        for (const prod of catalog) {
          if (Array.isArray(prod.variants)) {
            const v = prod.variants.find((variant) => (variant.sku || '').toUpperCase() === sku);
            if (v) {
              matchedPrice = typeof v.priceInr === 'number' ? v.priceInr : v.price;
              break;
            }
          }
        }
      }

      if (matchedPrice === null && slug) {
        const prod = catalog.find((p) => p.slug === slug || p.id === slug);
        if (prod) {
          matchedPrice = typeof prod.priceInr === 'number' ? prod.priceInr : prod.price;
        }
      }

      if (matchedPrice === null || isNaN(matchedPrice)) {
        matchedPrice = typeof item.unitPriceInr === 'number'
          ? item.unitPriceInr
          : (typeof item.unitPrice === 'number' ? item.unitPrice : 0);
      }

      totalInr += matchedPrice * qty;
    }

    if (totalInr > 0) {
      return Math.round(totalInr * 100);
    }
  }

  // If no items passed, validate fallback
  if (typeof fallbackAmount === 'number' && !isNaN(fallbackAmount) && fallbackAmount >= 100) {
    return Math.round(fallbackAmount);
  }

  return 0;
}

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-Requested-With, Accept',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  // Diagnostic log (never print secret values)
  console.log('[Netlify Function: create-order] Invoked');
  console.log('[Netlify Function: create-order] RAZORPAY_KEY_ID present:', Boolean(keyId));
  console.log('[Netlify Function: create-order] RAZORPAY_KEY_SECRET present:', Boolean(keySecret));

  if (!keyId || !keySecret) {
    console.error('[Netlify Function: create-order] Missing Razorpay credentials in server environment');
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Razorpay API credentials not configured in server environment (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET)'
      })
    };
  }

  let body = {};
  try {
    body = event.body ? JSON.parse(event.body) : {};
  } catch (parseErr) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid JSON request body' })
    };
  }

  // Calculate amount on server from catalog
  const amountPaise = calculateAmountInPaise(body.items, body.amount);

  if (amountPaise < 100) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        error: 'Calculated order amount must be at least 100 paise (₹1.00)'
      })
    };
  }

  const receipt = (body.receipt ? String(body.receipt) : `rcpt_${Date.now().toString().slice(-8)}`).slice(0, 39);

  try {
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    });

    const orderOptions = {
      amount: amountPaise,
      currency: 'INR',
      receipt,
      notes: body.notes || {}
    };

    console.log('[Netlify Function: create-order] Calling Razorpay API with amount (paise):', amountPaise, 'currency: INR');
    const order = await razorpay.orders.create(orderOptions);

    console.log('[Netlify Function: create-order] Successfully created Razorpay order:', order.id);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        orderId: order.id,
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: keyId,
        key_id: keyId,
        receipt: order.receipt
      })
    };
  } catch (err) {
    console.error('[Netlify Function: create-order] Razorpay API Error:', err.error?.description || err.message);
    const statusCode = err.statusCode === 401 ? 401 : 500;
    return {
      statusCode,
      headers,
      body: JSON.stringify({
        error: err.error?.description || err.message || 'Payment could not be started. Please try again.'
      })
    };
  }
};
