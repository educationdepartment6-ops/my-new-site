const express = require('express');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const db = require('../db');

const router = express.Router();

// Initialize Razorpay client with environment variables
function getRazorpayInstance() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

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
 * Request: { amount (paise), currency, receipt }
 * Return: { order_id, amount, currency, key_id }
 */
async function createOrderHandler(req, res) {
  try {
    const { amount, currency = 'INR', receipt, notes } = req.body || {};

    // 1. Validation: amount must be present and >= 100 paise (₹1.00)
    if (amount === undefined || amount === null) {
      return res.status(400).json({ error: 'Amount is required' });
    }

    const parsedAmount = parseInt(amount, 10);
    if (isNaN(parsedAmount) || parsedAmount < 100) {
      return res.status(400).json({
        error: 'Amount must be at least 100 paise (minimum ₹1.00)'
      });
    }

    // 2. Validate Razorpay credentials
    const razorpay = getRazorpayInstance();
    if (!razorpay) {
      return res.status(401).json({
        error: 'Razorpay API credentials (KEY_ID or KEY_SECRET) are missing or invalid in server environment.'
      });
    }

    // 3. Create order in Razorpay
    const options = {
      amount: parsedAmount,
      currency: (currency || 'INR').toUpperCase(),
      receipt: receipt ? String(receipt).slice(0, 40) : `rcpt_${Date.now().toString().slice(-8)}`,
      notes: notes || {}
    };

    const order = await razorpay.orders.create(options);

    return res.status(200).json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      key_id: process.env.RAZORPAY_KEY_ID
    });
  } catch (err) {
    console.error('[Razorpay Create Order Error]:', err);

    // Authentication or Bad Request Error
    if (err.statusCode === 401 || err.error?.code === 'BAD_REQUEST_ERROR') {
      return res.status(401).json({
        error: err.error?.description || 'Razorpay authentication failed. Verify API credentials.'
      });
    }

    return res.status(500).json({
      error: err.error?.description || err.message || 'Failed to create Razorpay order'
    });
  }
}

/**
 * STEP 3: Verify Payment Signature
 * POST /api/verify-payment or POST /api/razorpay/verify-payment
 * Request: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
 * Algorithm: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
 */
async function verifyPaymentHandler(req, res) {
  try {
    const orderId = req.body.razorpay_order_id || req.body.order_id;
    const paymentId = req.body.razorpay_payment_id || req.body.payment_id;
    const signature = req.body.razorpay_signature || req.body.signature;
    const internalOrderId = req.body.internalOrderId || req.body.receipt;

    // 1. Validate required fields
    if (!orderId || !paymentId || !signature) {
      return res.status(400).json({
        success: false,
        error: 'Missing required payment verification fields. order_id, payment_id, and signature are mandatory.'
      });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
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
      return res.status(400).json({
        success: false,
        error: 'Signature verification failed. Generated signature does not match razorpay_signature.'
      });
    }

    // 4. Update order status in SQLite database if internal order ID was provided
    if (internalOrderId) {
      try {
        db.updateOrderStatus(internalOrderId, 'Paid', `Razorpay verification: ${paymentId}`);
      } catch (_) {}
    }

    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      payment_id: paymentId,
      order_id: orderId
    });
  } catch (err) {
    console.error('[Razorpay Verify Error]:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Internal error during payment signature verification'
    });
  }
}

// Router bindings
router.post('/create-order', createOrderHandler);
router.post('/verify-payment', verifyPaymentHandler);

// Expose public key only (never secret)
router.get('/key', (req, res) => {
  res.json({ key_id: process.env.RAZORPAY_KEY_ID || null });
});

module.exports = {
  router,
  createOrderHandler,
  verifyPaymentHandler
};
