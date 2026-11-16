const crypto = require('crypto');

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

  const keySecret = process.env.RAZORPAY_KEY_SECRET || 'jZ9hZFCoX7260vzb4e2UqnCe';
  console.log('[Netlify Function: verify-payment] Invoked');
  console.log('[Netlify Function: verify-payment] RAZORPAY_KEY_SECRET present:', Boolean(keySecret));

  if (!keySecret) {
    console.error('[Netlify Function: verify-payment] Missing RAZORPAY_KEY_SECRET in server environment');
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Server configuration error: Key Secret missing' })
    };
  }

  let body = {};
  try {
    body = event.body ? JSON.parse(event.body) : {};
  } catch (_) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid JSON request body' })
    };
  }

  const orderId = body.razorpay_order_id || body.order_id;
  const paymentId = body.razorpay_payment_id || body.payment_id;
  const signature = body.razorpay_signature || body.signature;

  if (!orderId || !paymentId || !signature) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Missing required payment verification fields: order_id, payment_id, and signature are required'
      })
    };
  }

  // Algorithm: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
  const payload = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(payload)
    .digest('hex');

  const expectedBuffer = Buffer.from(expectedSignature, 'utf-8');
  const signatureBuffer = Buffer.from(signature, 'utf-8');

  const isMatch =
    expectedBuffer.length === signatureBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, signatureBuffer);

  if (!isMatch) {
    console.warn('[Netlify Function: verify-payment] Signature mismatch for order:', orderId, 'payment:', paymentId);
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Payment verification failed: Signature mismatch. Order not marked as paid.'
      })
    };
  }

  console.log('[Netlify Function: verify-payment] Payment verified successfully for order:', orderId, 'payment:', paymentId);

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      message: 'Payment verified successfully',
      payment_id: paymentId,
      order_id: orderId
    })
  };
};
