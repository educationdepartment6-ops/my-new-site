import { safeApiFetch } from './api';

/**
 * Loads the Razorpay checkout.js script if not already loaded on the page.
 */
export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error('Failed to load Razorpay SDK');
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

/**
 * Initiates the standard Razorpay checkout flow:
 * 1. Creates order via server endpoint (calculates price on server from cart items)
 * 2. Opens Razorpay payment modal (UPI, cards, netbanking, wallets)
 * 3. Verifies payment signature via server endpoint (HMAC SHA256)
 *
 * @param {Object} options
 * @param {Array} options.items - Cart items with SKU and quantity
 * @param {string} options.currency - Default 'INR'
 * @param {string} options.receipt - Optional receipt/order reference
 * @param {Object} options.customer - Customer info { fullName, email, phone, institution, address }
 * @param {Function} options.onSuccess - Callback on verified payment { payment_id, order_id, signature }
 * @param {Function} options.onError - Callback on payment error or verification failure
 * @param {Function} options.onDismiss - Callback when user dismisses the modal
 */
export async function openRazorpayCheckout({
  items = [],
  currency = 'INR',
  receipt,
  customer = {},
  onSuccess,
  onError,
  onDismiss
}) {
  const isLoaded = await loadRazorpayScript();
  if (!isLoaded || !window.Razorpay) {
    if (onError) onError(new Error('Razorpay payment gateway failed to load. Please check your network connection and try again.'));
    return;
  }

  // 1. Create order on backend (server calculates amount from items in database/catalog)
  let orderData;
  const orderPayload = {
    items: items.map((i) => ({
      sku: i.sku || i.key?.split('_')[1] || '',
      productSlug: i.productSlug || i.slug || '',
      quantity: i.quantity || 1,
      variantLabel: i.variantLabel || ''
    })),
    currency,
    receipt,
    customer: {
      name: customer.fullName || customer.name || '',
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || '',
      city: customer.city || '',
      institution: customer.institution || ''
    }
  };

  try {
    // Try /api/create-order first
    let res = await fetch('/api/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(orderPayload)
    });

    const contentType = res.headers.get('content-type') || '';

    // If server returned HTML (e.g. Netlify fallback or unmapped proxy), try direct function route
    if (!res.ok || contentType.toLowerCase().includes('text/html')) {
      console.warn('[Razorpay Checkout] /api/create-order returned non-JSON/status', res.status, '- attempting /.netlify/functions/create-order fallback');
      const fallbackRes = await fetch('/.netlify/functions/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify(orderPayload)
      });

      if (fallbackRes.ok && (fallbackRes.headers.get('content-type') || '').toLowerCase().includes('application/json')) {
        res = fallbackRes;
      }
    }

    const finalContentType = res.headers.get('content-type') || '';
    if (finalContentType.toLowerCase().includes('text/html')) {
      throw new Error('Payment server could not be reached (server returned HTML). Please ensure the backend is running.');
    }

    orderData = await res.json();

    if (!res.ok) {
      throw new Error(orderData?.error || 'Payment could not be started. Please try again.');
    }
  } catch (err) {
    console.error('[Razorpay Checkout] Order creation failed:', err);
    if (onError) onError(new Error(err.message || 'Payment could not be started. Please try again.'));
    return;
  }

  const orderId = orderData?.orderId || orderData?.order_id;
  if (!orderId || typeof orderId !== 'string' || !orderId.startsWith('order_')) {
    console.error('[Razorpay Checkout] Invalid order response from server:', orderData);
    if (onError) onError(new Error('Payment could not be started. Failed to obtain a valid Razorpay Order ID from server.'));
    return;
  }

  // Use Key ID from server response or environment variable (never Key Secret)
  const keyId = orderData.keyId || orderData.key_id || import.meta.env.VITE_RAZORPAY_KEY_ID;

  if (keyId && keyId.startsWith('rzp_test_')) {
    console.log('[Razorpay Checkout] Initializing in TEST mode with key:', keyId);
  }

  // 2. Configure Razorpay modal options
  const razorpayOptions = {
    key: keyId,
    amount: orderData.amount,
    currency: orderData.currency || 'INR',
    name: 'MOG WRLD',
    description: 'Laboratory Research Reagents',
    image: '/favicon.ico',
    order_id: orderId,
    prefill: {
      name: customer.fullName || customer.name || '',
      email: customer.email || '',
      contact: customer.phone || ''
    },
    notes: {
      institution: customer.institution || 'Independent Research',
      shipping_address: customer.address ? `${customer.address}, ${customer.city || ''}` : ''
    },
    theme: {
      color: '#10b981' // Emerald brand theme
    },
    handler: async function (response) {
      // 3. Send signature, payment ID and order ID to server for HMAC-SHA256 verification
      try {
        const verifyPayload = {
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
          receipt: receipt || orderData.receipt,
          customer,
          items: orderPayload.items
        };

        let vRes = await fetch('/api/verify-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          },
          body: JSON.stringify(verifyPayload)
        });

        const vContentType = vRes.headers.get('content-type') || '';
        if (!vRes.ok || vContentType.toLowerCase().includes('text/html')) {
          const fallbackVRes = await fetch('/.netlify/functions/verify-payment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json'
            },
            body: JSON.stringify(verifyPayload)
          });
          if (fallbackVRes.ok && (fallbackVRes.headers.get('content-type') || '').toLowerCase().includes('application/json')) {
            vRes = fallbackVRes;
          }
        }

        const verifyResult = await vRes.json();

        if (vRes.ok && verifyResult && verifyResult.success) {
          if (onSuccess) {
            onSuccess({
              payment_id: response.razorpay_payment_id,
              order_id: response.razorpay_order_id,
              signature: response.razorpay_signature,
              verified: true,
              orderNumber: verifyResult.orderNumber
            });
          }
        } else {
          const errMsg = verifyResult?.error || 'Payment signature verification failed. Your transaction was not marked as paid.';
          if (onError) onError(new Error(errMsg));
        }
      } catch (err) {
        console.error('[Razorpay Checkout] Verification error:', err);
        if (onError) onError(new Error(err.message || 'Payment verification failed. Please contact support with your payment ID: ' + response.razorpay_payment_id));
      }
    },
    modal: {
      ondismiss: function () {
        console.log('[Razorpay Checkout] Customer closed the payment modal.');
        if (onDismiss) onDismiss();
      }
    }
  };

  const rzpInstance = new window.Razorpay(razorpayOptions);

  rzpInstance.on('payment.failed', function (failResponse) {
    console.error('[Razorpay Checkout] Payment failed event:', failResponse?.error);
    const errorDescription =
      failResponse?.error?.description ||
      failResponse?.error?.reason ||
      'Payment was not completed. Please try again.';
    if (onError) onError(new Error(errorDescription));
  });

  rzpInstance.open();
}
