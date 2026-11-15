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
 * 1. Creates order via backend POST /api/create-order
 * 2. Opens Razorpay payment modal
 * 3. Verifies payment signature via backend POST /api/verify-payment
 * 
 * @param {Object} options
 * @param {number} options.amountPaise - Amount in paise (minimum 100 paise)
 * @param {string} options.currency - Default 'INR'
 * @param {string} options.receipt - Optional receipt/order reference
 * @param {Object} options.customer - Customer info { fullName, email, phone, institution, address }
 * @param {Function} options.onSuccess - Callback on verified payment { payment_id, order_id, signature, rawOrder }
 * @param {Function} options.onError - Callback on payment error or verification failure
 * @param {Function} options.onDismiss - Callback when user dismisses the modal
 */
export async function openRazorpayCheckout({
  amountPaise,
  currency = 'INR',
  receipt,
  customer = {},
  onSuccess,
  onError,
  onDismiss
}) {
  const isLoaded = await loadRazorpayScript();
  if (!isLoaded || !window.Razorpay) {
    if (onError) onError(new Error('Razorpay payment gateway failed to load. Please check your network connection.'));
    return;
  }

  // 1. Create order on backend
  let orderData;
  try {
    orderData = await safeApiFetch('/api/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: amountPaise,
        currency,
        receipt
      })
    });
  } catch (err) {
    if (onError) onError(err);
    return;
  }

  if (!orderData || !orderData.order_id) {
    if (onError) onError(new Error('Failed to obtain a valid Razorpay Order ID from server.'));
    return;
  }

  // Use VITE_RAZORPAY_KEY_ID or fallback to key_id returned from create-order endpoint
  const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID || orderData.key_id;

  // 2. Configure Razorpay modal options
  const razorpayOptions = {
    key: keyId,
    amount: orderData.amount,
    currency: orderData.currency || 'INR',
    name: 'MOG WRLD',
    description: 'Laboratory Research Reagents',
    image: '/favicon.ico',
    order_id: orderData.order_id,
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
      color: '#10b981' // Emerald brand color
    },
    handler: async function (response) {
      // 3. Verify signature on backend
      try {
        const verifyResult = await safeApiFetch('/api/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            receipt: receipt || orderData.receipt
          })
        });

        if (verifyResult && verifyResult.success) {
          if (onSuccess) {
            onSuccess({
              payment_id: response.razorpay_payment_id,
              order_id: response.razorpay_order_id,
              signature: response.razorpay_signature,
              verified: true
            });
          }
        } else {
          const errMsg = verifyResult?.error || 'Payment signature verification failed';
          if (onError) onError(new Error(errMsg));
        }
      } catch (err) {
        if (onError) onError(err);
      }
    },
    modal: {
      ondismiss: function () {
        if (onDismiss) onDismiss();
      }
    }
  };

  const rzpInstance = new window.Razorpay(razorpayOptions);

  rzpInstance.on('payment.failed', function (failResponse) {
    const errorDescription =
      failResponse?.error?.description ||
      failResponse?.error?.reason ||
      'Payment was not completed. Please try again.';
    if (onError) onError(new Error(errorDescription));
  });

  rzpInstance.open();
}
