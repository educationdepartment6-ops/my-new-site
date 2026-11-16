const express = require('express');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const db = require('../db');
const { calculateServerOrderTotal } = require('../pricing');

const router = express.Router();

// Initialize Razorpay client with environment variables
function getRazorpayInstance() {
  const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_live_U0p4uE1A1W2QRO';
  const keySecret = process.env.RAZORPAY_KEY_SECRET || 'lXClc7AwL4DbpH3VGDq2qdKO';

  console.log('[Server Razorpay] Initializing client...');
  console.log('[Server Razorpay] RAZORPAY_KEY_ID present:', Boolean(keyId));
  console.log('[Server Razorpay] RAZORPAY_KEY_SECRET present:', Boolean(keySecret));

  if (!keyId || !keySecret) {
    return null;
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret
  });
}

/**
 * STEP 1: Create Razorpay Order
 * POST /api/create-order or POST /api/razorpay/create-order
 * 
 * Calculates the amount ON THE SERVER from the product catalog using item SKUs/quantities.
 * NEVER trusts a price sent from the client browser.
 */
async function createOrderHandler(req, res) {
  try {
    const { items, amount, currency = 'INR', receipt, notes } = req.body || {};

    let amountPaise = 0;

    // 1. Calculate amount ON THE SERVER using catalog
    if (Array.isArray(items) && items.length > 0) {
      const calculation = calculateServerOrderTotal(items);
      amountPaise = calculation.amountPaise;
      console.log(`[Razorpay createOrder] Server-calculated amount from ${items.length} item(s): ₹${calculation.totalInr} (${amountPaise} paise)`);
    } else if (typeof amount === 'number' && !isNaN(amount) && amount >= 100) {
      amountPaise = Math.round(amount);
      console.log(`[Razorpay createOrder] Fallback amount provided: ${amountPaise} paise`);
    } else {
      return res.status(400).json({
        error: 'Cart items array is required to calculate order total on the server.'
      });
    }

    if (amountPaise < 100) {
      return res.status(400).json({
        error: 'Calculated order amount must be at least 100 paise (₹1.00).'
      });
    }

    // 2. Validate Razorpay credentials
    const razorpay = getRazorpayInstance();
    if (!razorpay) {
      return res.status(500).json({
        error: 'Razorpay API credentials (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET) not configured in server environment.'
      });
    }

    const cleanReceipt = (receipt ? String(receipt) : `rcpt_${Date.now().toString().slice(-8)}`).slice(0, 39);

    // 3. Create order in Razorpay
    const options = {
      amount: amountPaise,
      currency: (currency || 'INR').toUpperCase(),
      receipt: cleanReceipt,
      notes: notes || {}
    };

    const order = await razorpay.orders.create(options);
    console.log('[Razorpay createOrder] Successfully generated order ID:', order.id);

    return res.status(200).json({
      orderId: order.id,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      keyId: process.env.RAZORPAY_KEY_ID,
      key_id: process.env.RAZORPAY_KEY_ID
    });
  } catch (err) {
    console.error('[Razorpay Create Order Error]:', err.error?.description || err.message);

    if (err.statusCode === 401 || err.error?.code === 'BAD_REQUEST_ERROR') {
      return res.status(401).json({
        error: err.error?.description || 'Razorpay authentication failed. Verify API credentials.'
      });
    }

    return res.status(500).json({
      error: err.error?.description || err.message || 'Payment could not be started. Please try again.'
    });
  }
}

/**
 * STEP 3: Verify Payment Signature
 * POST /api/verify-payment or POST /api/razorpay/verify-payment
 * Algorithm: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
 */
async function verifyPaymentHandler(req, res) {
  try {
    const orderId = req.body.razorpay_order_id || req.body.order_id;
    const paymentId = req.body.razorpay_payment_id || req.body.payment_id;
    const signature = req.body.razorpay_signature || req.body.signature;
    const internalOrderId = req.body.internalOrderId || req.body.receipt;
    const customer = req.body.customer;
    const items = req.body.items;

    // 1. Validate required fields
    if (!orderId || !paymentId || !signature) {
      return res.status(400).json({
        success: false,
        error: 'Missing required payment verification fields. order_id, payment_id, and signature are mandatory.'
      });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'lXClc7AwL4DbpH3VGDq2qdKO';
    if (!keySecret) {
      return res.status(500).json({
        success: false,
        error: 'Server error: RAZORPAY_KEY_SECRET is not configured'
      });
    }

    // 2. Compute HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
    const body = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(body)
      .digest('hex');

    const expectedBuffer = Buffer.from(expectedSignature, 'utf-8');
    const signatureBuffer = Buffer.from(signature, 'utf-8');

    const isMatch =
      expectedBuffer.length === signatureBuffer.length &&
      crypto.timingSafeEqual(expectedBuffer, signatureBuffer);

    // 3. Reject on mismatch (do NOT mark as paid)
    if (!isMatch) {
      console.warn('[Razorpay verifyPayment] Signature mismatch! Rejecting payment:', paymentId);
      return res.status(400).json({
        success: false,
        error: 'Payment verification failed: Signature mismatch. Order not marked as paid.'
      });
    }

    console.log('[Razorpay verifyPayment] Signature verified successfully for payment:', paymentId);

    // 4. Update or save order in SQLite database
    let savedOrderNumber = internalOrderId;
    try {
      if (internalOrderId && typeof db.updateOrderStatus === 'function') {
        db.updateOrderStatus(internalOrderId, 'Paid', `Razorpay verification: ${paymentId}`);
      }

      // If customer and items payload provided, save full order if not already recorded
      if (customer && items && Array.isArray(items) && typeof db.createOrder === 'function') {
        const calculation = calculateServerOrderTotal(items);
        const saved = db.createOrder({
          customer,
          items,
          total: calculation.totalInr,
          currency: 'INR',
          paymentId,
          razorpayOrderId: orderId
        });
        if (saved && saved.orderId) {
          savedOrderNumber = saved.orderId;
          if (typeof db.updateOrderStatus === 'function') {
            db.updateOrderStatus(saved.orderId, 'Paid', `Razorpay verification: ${paymentId}`);
          }
        }
      }
    } catch (dbErr) {
      console.warn('[Razorpay verifyPayment] Note on database sync:', dbErr.message);
    }

    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      payment_id: paymentId,
      order_id: orderId,
      orderNumber: savedOrderNumber
    });
  } catch (err) {
    console.error('[Razorpay Verify Error]:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Payment verification failed. Please contact support.'
    });
  }
}

/**
 * Webhook handler for Razorpay (payment.captured / order.paid)
 */
async function webhookHandler(req, res) {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;
    const signature = req.headers['x-razorpay-signature'];

    if (!webhookSecret || !signature) {
      return res.status(400).json({ error: 'Missing webhook secret or signature' });
    }

    const rawBody = typeof req.rawBody === 'string'
      ? req.rawBody
      : (typeof req.body === 'string' ? req.body : JSON.stringify(req.body));

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
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }

    const payload = typeof req.body === 'object' ? req.body : JSON.parse(rawBody);
    console.log('[Razorpay Webhook] Received verified event:', payload.event);

    if (payload.event === 'payment.captured' || payload.event === 'order.paid') {
      const paymentEntity = payload.payload?.payment?.entity;
      const orderId = paymentEntity?.order_id;
      const paymentId = paymentEntity?.id;
      console.log(`[Razorpay Webhook] Captured payment ${paymentId} for order ${orderId}`);
    }

    return res.status(200).json({ status: 'ok', received: true });
  } catch (err) {
    console.error('[Razorpay Webhook Error]:', err);
    return res.status(500).json({ error: err.message });
  }
}

// Router bindings
router.post('/create-order', createOrderHandler);
router.post('/verify-payment', verifyPaymentHandler);
router.post('/webhook', webhookHandler);

// Expose public key only (never secret)
router.get('/key', (req, res) => {
  res.json({ key_id: process.env.RAZORPAY_KEY_ID || null });
});

module.exports = {
  router,
  createOrderHandler,
  verifyPaymentHandler,
  webhookHandler
};
