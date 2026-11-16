import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ShieldAlert, Lock, CheckCircle2, CreditCard, Building2, FlaskConical, Loader2, AlertCircle } from 'lucide-react';
import SEO from '../seo/SEO';
import Breadcrumbs from '../components/common/Breadcrumbs';
import { useCartStore } from '../store/useCartStore';
import { useCurrencyStore } from '../store/useCurrencyStore';
import { useCustomerAuthStore } from '../store/useCustomerAuthStore';
import { formatPrice } from '../utils/pricing';
import { safeApiFetch } from '../utils/api';
import { openRazorpayCheckout } from '../utils/razorpay';

const checkoutSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Valid institutional email is required'),
  phone: z.string().refine((val) => {
    if (!val) return false;
    const clean = val.trim().replace(/[\s\-\(\)\.]/g, '');
    return /^(?:\+91)?[6-9]\d{9}$/.test(clean) || /^91[6-9]\d{9}$/.test(clean);
  }, {
    message: 'Please enter a valid 10-digit Indian mobile number (e.g. 9876543210 or +91 9876543210)',
  }),
  institution: z.string().min(2, 'Company or organization name is required'),
  address: z.string().min(5, 'Physical delivery address is required'),
  city: z.string().min(2, 'City is required'),
  postalCode: z.string().min(3, 'Postal code is required'),
  country: z.string().min(2, 'Country is required'),
  researchAcknowledgement: z.literal(true, {
    errorMap: () => ({
      message: 'You must confirm that you are at least 18 years old and agree to the Terms of Supply.',
    }),
  }),
});

export default function CheckoutPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useCustomerAuthStore();
  const { items, getSubtotal, clearCart } = useCartStore();
  const currency = useCurrencyStore((state) => state.currency);
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const subtotal = getSubtotal(currency);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      institution: '',
      address: '',
      city: '',
      postalCode: '',
      country: 'United States',
      researchAcknowledgement: false,
    },
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login?redirect=/checkout', { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (user) {
      if (user.name) setValue('fullName', user.name);
      if (user.email) setValue('email', user.email);
      if (user.phone) setValue('phone', user.phone);

      // Attempt to load customer's default address
      safeApiFetch('/api/account/addresses')
        .then((addresses) => {
          if (Array.isArray(addresses) && addresses.length > 0) {
            const def = addresses.find((a) => a.is_default) || addresses[0];
            if (def) {
              if (def.full_name) setValue('fullName', def.full_name);
              if (def.phone) setValue('phone', def.phone);
              if (def.address_line1) {
                const combined = def.address_line2 ? `${def.address_line1}, ${def.address_line2}` : def.address_line1;
                setValue('address', combined);
              }
              if (def.city) setValue('city', def.city);
              if (def.postal_code) setValue('postalCode', def.postal_code);
              if (def.country) setValue('country', def.country);
            }
          }
        })
        .catch(() => {});
    }
  }, [user, setValue]);

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--ink)]" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <h2 className="text-xl font-heading font-bold mb-3">Your Cart is Empty</h2>
        <p className="text-xs text-[var(--ink-muted)] mb-6">
          Please add products to your cart before proceeding to checkout.
        </p>
        <button
          onClick={() => navigate('/shop')}
          className="py-2.5 px-6 rounded-xl bg-[var(--ink)] text-[var(--bg)] text-xs font-semibold"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setPaymentError('');

    // Normalize phone number to Indian format
    const cleanPhone = (data.phone || '').trim().replace(/[\s\-\(\)\.]/g, '');
    let normalizedPhone = cleanPhone;
    if (/^[6-9]\d{9}$/.test(cleanPhone)) {
      normalizedPhone = '+91' + cleanPhone;
    } else if (/^91[6-9]\d{9}$/.test(cleanPhone)) {
      normalizedPhone = '+' + cleanPhone;
    }
    const customerData = { ...data, phone: normalizedPhone };

    const receiptId = `rcpt_${Date.now().toString().slice(-8)}`;

    try {
      await openRazorpayCheckout({
        items,
        currency: 'INR',
        receipt: receiptId,
        customer: customerData,
        onSuccess: async (paymentResult) => {
          let orderId = paymentResult.orderNumber || `MW-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;
          try {
            const result = await safeApiFetch('/api/orders', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                customer: customerData,
                items,
                total: subtotal,
                currency,
                status: 'Paid',
                paymentId: paymentResult.payment_id,
                razorpayOrderId: paymentResult.order_id
              }),
            });
            if (result && result.orderId) {
              orderId = result.orderId;
            }
          } catch (err) {
            console.warn('Order persisted locally:', err);
          }

          const orderSummary = {
            orderId,
            customer: customerData,
            items,
            total: subtotal,
            currency,
            paymentId: paymentResult.payment_id,
            paymentStatus: 'Paid (Razorpay)',
            timestamp: new Date().toISOString(),
          };

          // Also persist to customer's browser orders list for offline/client view in /account
          try {
            const existingOrders = JSON.parse(localStorage.getItem('mogwrld_client_orders') || '[]');
            existingOrders.unshift(orderSummary);
            localStorage.setItem('mogwrld_client_orders', JSON.stringify(existingOrders));
          } catch (_) {}

          clearCart();
          navigate('/order-confirmation', { state: { order: orderSummary } });
          setIsSubmitting(false);
        },
        onError: (err) => {
          setIsSubmitting(false);
          setPaymentError(err.message || 'Payment processing failed. Please try again.');
        },
        onDismiss: () => {
          setIsSubmitting(false);
          setPaymentError('Payment window was closed. You can try again when you are ready.');
        }
      });
    } catch (err) {
      setIsSubmitting(false);
      setPaymentError(err.message || 'Payment could not be started. Please try again.');
    }
  };

  return (
    <>
      <SEO
        title="Compliance Checkout"
        description="Verify laboratory shipping address and research use declaration."
        canonicalPath="/checkout"
        noindex={true}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs
          items={[
            { name: 'Cart', url: '/cart' },
            { name: 'Compliance Checkout', url: '/checkout' },
          ]}
        />

        <div className="py-6 border-b border-[var(--border)] mb-8">
          <span className="badge-ruo mb-2 inline-block">Strictly In Vitro Research Reagents</span>
          <h1 className="text-3xl font-heading font-bold text-[var(--ink)]">
            Laboratory Requisition & Compliance Checkout
          </h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Form: Details & Verification */}
          <div className="lg:col-span-7 space-y-8">
            {/* Institution & Contact Section */}
            <div className="p-6 rounded-2xl glass-panel bg-white/70 dark:bg-[#141517]/70 border border-[var(--border)] space-y-4">
              <h2 className="font-heading font-bold text-base text-[var(--ink)] flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[var(--chrome)]" />
                <span>1. Institution & Contact Details</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-[var(--ink-muted)] mb-1 font-medium">Full Name *</label>
                  <input
                    {...register('fullName')}
                    type="text"
                    placeholder="Dr. Jane Doe"
                    className="w-full p-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--ink)] outline-none focus:border-[var(--ink)]"
                  />
                  {errors.fullName && <p className="text-red-500 text-[11px] mt-1">{errors.fullName.message}</p>}
                </div>

                <div>
                  <label className="block text-[var(--ink-muted)] mb-1 font-medium">Institutional Email *</label>
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="j.doe@institution.edu"
                    className="w-full p-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--ink)] outline-none focus:border-[var(--ink)]"
                  />
                  {errors.email && <p className="text-red-500 text-[11px] mt-1">{errors.email.message}</p>}
                </div>

                <div>
                  <label className="block text-[var(--ink-muted)] mb-1 font-medium">Institution / Laboratory *</label>
                  <input
                    {...register('institution')}
                    type="text"
                    placeholder="BioMolecular Research Dept"
                    className="w-full p-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--ink)] outline-none focus:border-[var(--ink)]"
                  />
                  {errors.institution && <p className="text-red-500 text-[11px] mt-1">{errors.institution.message}</p>}
                </div>

                <div>
                  <label className="block text-[var(--ink-muted)] mb-1 font-medium">Mobile Number *</label>
                  <input
                    {...register('phone')}
                    type="tel"
                    placeholder="9876543210 or +91 9876543210"
                    className="w-full p-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--ink)] outline-none focus:border-[var(--ink)] font-mono"
                  />
                  {errors.phone && <p className="text-red-500 text-[11px] mt-1">{errors.phone.message}</p>}
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="p-6 rounded-2xl glass-panel bg-white/70 dark:bg-[#141517]/70 border border-[var(--border)] space-y-4">
              <h2 className="font-heading font-bold text-base text-[var(--ink)]">
                2. Laboratory Delivery Address
              </h2>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-[var(--ink-muted)] mb-1 font-medium">Address Line *</label>
                  <input
                    {...register('address')}
                    type="text"
                    placeholder="Lab Building 4, 100 Science Drive"
                    className="w-full p-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--ink)] outline-none focus:border-[var(--ink)]"
                  />
                  {errors.address && <p className="text-red-500 text-[11px] mt-1">{errors.address.message}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[var(--ink-muted)] mb-1 font-medium">City *</label>
                    <input
                      {...register('city')}
                      type="text"
                      placeholder="Boston"
                      className="w-full p-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--ink)] outline-none focus:border-[var(--ink)]"
                    />
                    {errors.city && <p className="text-red-500 text-[11px] mt-1">{errors.city.message}</p>}
                  </div>

                  <div>
                    <label className="block text-[var(--ink-muted)] mb-1 font-medium">Postal / ZIP Code *</label>
                    <input
                      {...register('postalCode')}
                      type="text"
                      placeholder="02115"
                      className="w-full p-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--ink)] outline-none focus:border-[var(--ink)]"
                    />
                    {errors.postalCode && <p className="text-red-500 text-[11px] mt-1">{errors.postalCode.message}</p>}
                  </div>

                  <div>
                    <label className="block text-[var(--ink-muted)] mb-1 font-medium">Country *</label>
                    <input
                      {...register('country')}
                      type="text"
                      placeholder="United States"
                      className="w-full p-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--ink)] outline-none focus:border-[var(--ink)]"
                    />
                    {errors.country && <p className="text-red-500 text-[11px] mt-1">{errors.country.message}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Single Research Notice */}
            <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-xs text-[var(--ink-muted)] leading-relaxed">
              These products are sold for research purposes only. Not for human or veterinary use. Not medical advice.
            </div>

            {/* Agreement Checkbox */}
            <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] space-y-2">
              <div className="flex items-start gap-3">
                <input
                  {...register('researchAcknowledgement')}
                  id="researchCheck"
                  type="checkbox"
                  className="mt-0.5 w-4 h-4 rounded border-[var(--border)] text-[var(--ink)] cursor-pointer"
                />
                <label htmlFor="researchCheck" className="text-xs text-[var(--ink)] leading-relaxed cursor-pointer select-none">
                  I confirm that I am at least 18 years old and agree to the Terms of Supply.
                </label>
              </div>
              {errors.researchAcknowledgement && (
                <p className="text-red-600 dark:text-red-400 font-medium text-xs pl-7">
                  {errors.researchAcknowledgement.message}
                </p>
              )}
            </div>

            {/* Payment Method Section */}
            <div className="p-6 rounded-2xl glass-panel bg-white/70 dark:bg-[#141517]/70 border border-[var(--border)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-heading font-bold text-sm text-[var(--ink)] flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-500" />
                  <span>3. Payment Method</span>
                </span>
                {(import.meta.env.VITE_RAZORPAY_KEY_ID || '').startsWith('rzp_test_') && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20">
                    Test mode
                  </span>
                )}
              </div>
              <p className="text-xs text-[var(--ink-muted)] leading-relaxed">
                Pay securely with UPI, cards, netbanking or wallets. You choose the method in the next step.
              </p>
            </div>
          </div>

          {/* Right Column: Requisition Summary */}
          <div className="lg:col-span-5">
            <div className="sticky top-28 p-6 rounded-2xl glass-panel bg-white/70 dark:bg-[#141517]/70 border border-[var(--border)] space-y-5">
              <h2 className="font-heading font-bold text-base text-[var(--ink)] border-b border-[var(--border)] pb-3">
                Order Items ({items.length})
              </h2>

              <div className="max-h-60 overflow-y-auto space-y-3 pr-1 divide-y divide-[var(--border)]">
                {items.map((item) => (
                  <div key={item.key} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-heading font-semibold text-[var(--ink)]">{item.productName}</div>
                      <div className="text-[11px] text-[var(--ink-muted)] font-mono">
                        {item.sku} • {item.variantLabel} × {item.quantity} {item.quantity === 1 ? 'vial' : 'vials'}
                      </div>
                    </div>
                    <span className="font-mono font-bold text-[var(--ink)]">
                      {formatPrice(
                        (currency === 'INR' ? (item.unitPriceInr ?? item.unitPrice) : (item.unitPriceUsd ?? item.unitPrice)) * item.quantity,
                        currency
                      )}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-[var(--border)] space-y-2 text-xs text-[var(--ink-muted)]">
                <div className="flex items-center justify-between">
                  <span>Subtotal:</span>
                  <span className="font-mono font-semibold text-[var(--ink)]">
                    {formatPrice(subtotal, currency)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Cold-Chain Packaging:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">Free / Included</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Shipping:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">Free</span>
                </div>
                <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between text-sm">
                  <span className="font-bold text-[var(--ink)]">Total:</span>
                  <span className="font-heading font-extrabold text-xl text-[var(--ink)]">
                    {formatPrice(subtotal, currency)}
                  </span>
                </div>
              </div>

              {paymentError && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex flex-col gap-2.5 animate-fade-in">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                    <span className="leading-relaxed">{paymentError}</span>
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentError('');
                        handleSubmit(onSubmit)();
                      }}
                      className="px-3 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 font-semibold text-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <span>Try again</span>
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-heading font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/10 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                    <span>Connecting to Razorpay...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Pay {formatPrice(subtotal, currency)} with Razorpay</span>
                  </>
                )}
              </button>

              <div className="flex flex-col items-center gap-1 text-[11px] text-[var(--ink-muted)] text-center leading-tight">
                <div className="flex items-center gap-2 font-mono">
                  <Lock className="w-3 h-3 text-emerald-500" />
                  <span>256-bit SSL Secure Checkout</span>
                </div>
                <div className="text-[10px] text-zinc-500 font-sans">
                  Accepts UPI (GPay, PhonePe, Paytm), Credit/Debit Cards, NetBanking & Wallets
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
