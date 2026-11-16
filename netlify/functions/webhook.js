const crypto = require('crypto');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
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

  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;
  const signature = event.headers['x-razorpay-signature'] || event.headers['X-Razorpay-Signature'];

  console.log('[Netlify Function: webhook] Received webhook event');
  console.log('[Netlify Function: webhook] Webhook secret configured:', Boolean(webhookSecret));

  if (!webhookSecret || !signature) {
    console.warn('[Netlify Function: webhook] Missing webhook secret or signature header');
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Missing signature or webhook secret' })
    };
  }

  const rawBody = event.body || '';
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex');

  const expectedBuffer = Buffer.from(expectedSignature, 'utf-8');
  const signatureBuffer = Buffer.from(signature, 'utf-8');

  const isMatch =
    expectedBuffer.length === signatureBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, signatureBuffer);

  if (!isMatch) {
    console.error('[Netlify Function: webhook] Invalid webhook signature');
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid webhook signature' })
    };
  }

  try {
    const payload = JSON.parse(rawBody);
    const eventType = payload.event;
    console.log('[Netlify Function: webhook] Verified event:', eventType);

    if (eventType === 'payment.captured' || eventType === 'order.paid') {
      const paymentEntity = payload.payload?.payment?.entity;
      const orderId = paymentEntity?.order_id;
      const paymentId = paymentEntity?.id;
      const amount = paymentEntity?.amount;
      console.log(`[Netlify Function: webhook] Payment captured: ${paymentId} for order ${orderId} (amount: ${amount})`);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ status: 'ok', received: true })
    };
  } catch (err) {
    console.error('[Netlify Function: webhook] Error processing payload:', err.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to process webhook event' })
    };
  }
};
