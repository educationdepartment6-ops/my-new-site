import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Building2, Loader2, AlertCircle } from 'lucide-react';
import SEO from '../seo/SEO';
import Breadcrumbs from '../components/common/Breadcrumbs';
import { useCartStore } from '../store/useCartStore';
import { useCurrencyStore } from '../store/useCurrencyStore';
import { useCustomerAuthStore } from '../store/useCustomerAuthStore';
import { formatPrice } from '../utils/pricing';
import { safeApiFetch } from '../utils/api';
import { getWhatsAppOrderUrl, formatWhatsAppOrderMessage } from '../config/whatsapp';

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
  state: z.string().min(2, 'State / Province is required'),
  postalCode: z.string().min(3, 'Postal code is required'),
  country: z.string().min(2, 'Country is required'),
  researchAcknowledgement: z.literal(true, {
    errorMap: () => ({
      message: 'You must confirm that you are at least 18 years old and agree to the Terms of Supply.',
    }),
  }),
});

function WhatsAppIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
    </svg>
  );
}

export default function CheckoutPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useCustomerAuthStore();
  const { items, getSubtotal, clearCart } = useCartStore();
  const currency = useCurrencyStore((state) => state.currency);
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const subtotal = getSubtotal(currency);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
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
      state: '',
      postalCode: '',
      country: 'India',
      researchAcknowledgement: false,
    },
  });

  const researchAcknowledgement = watch('researchAcknowledgement');

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
              if (def.recipient_name || def.full_name) setValue('fullName', def.recipient_name || def.full_name);
              if (def.phone) setValue('phone', def.phone);
              if (def.address_line1) {
                const combined = def.address_line2 ? `${def.address_line1}, ${def.address_line2}` : def.address_line1;
                setValue('address', combined);
              }
              if (def.city) setValue('city', def.city);
              if (def.state) setValue('state', def.state);
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
          className="py-2.5 px-6 rounded-xl bg-[var(--ink)] text-[var(--bg)] text-xs font-semibold cursor-pointer"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setErrorMessage('');

    // Normalize phone number to Indian format
    const cleanPhone = (data.phone || '').trim().replace(/[\s\-\(\)\.]/g, '');
    let normalizedPhone = cleanPhone;
    if (/^[6-9]\d{9}$/.test(cleanPhone)) {
      normalizedPhone = '+91' + cleanPhone;
    } else if (/^91[6-9]\d{9}$/.test(cleanPhone)) {
      normalizedPhone = '+' + cleanPhone;
    }
    const customerData = { ...data, phone: normalizedPhone };

    try {
      // 1. Save the order request on the server (POST to /api/orders)
      // Server will verify authoritative catalog prices
      const result = await safeApiFetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: customerData,
          items,
          total: subtotal,
          currency: 'INR',
          status: 'New - awaiting WhatsApp confirmation'
        }),
      });

      if (!result || (!result.orderId && !result.orderNumber && !result.id)) {
        throw new Error(result?.error || 'Failed to save order request on the server. Please try again.');
      }

      const orderId = result.orderId || result.orderNumber || result.id;
      const verifiedTotalInr = result.totalInr || subtotal;
      const verifiedItems = result.items || items;

      const orderSummary = {
        orderId,
        customer: customerData,
        items: verifiedItems,
        total: verifiedTotalInr,
        totalInr: verifiedTotalInr,
        currency: 'INR',
        status: result.status || 'New - awaiting WhatsApp confirmation',
        timestamp: new Date().toISOString(),
      };

      // 2. Build WhatsApp URL and message
      const whatsappUrl = getWhatsAppOrderUrl({
        orderId,
        orderNumber: orderId,
        customer: customerData,
        items: verifiedItems,
        totalInr: verifiedTotalInr
      });

      const whatsappMessage = formatWhatsAppOrderMessage({
        orderId,
        orderNumber: orderId,
        customer: customerData,
        items: verifiedItems,
        totalInr: verifiedTotalInr
      });

      orderSummary.whatsappUrl = whatsappUrl;
      orderSummary.whatsappMessage = whatsappMessage;

      // Persist to customer's browser orders list for offline/client view in /account
      try {
        const existingOrders = JSON.parse(localStorage.getItem('mogwrld_client_orders') || '[]');
        existingOrders.unshift(orderSummary);
        localStorage.setItem('mogwrld_client_orders', JSON.stringify(existingOrders));
      } catch (_) {}

      // 3. Open WhatsApp in a new tab
      try {
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      } catch (e) {
        console.warn('Could not auto-open WhatsApp window:', e);
      }

      // 4. Clear the cart ONLY AFTER the order is saved on the server
      clearCart();

      // 5. Navigate to confirmation screen
      navigate('/order-confirmation', { state: { order: orderSummary } });
    } catch (err) {
      console.error('[Checkout] Order request failed:', err);
      // Cart is NOT cleared on failure so customer can retry
      setErrorMessage(err.message || 'Unable to save your order request. Please check your connection and try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SEO
        title="Compliance Checkout"
        description="Verify laboratory shipping address and submit order request via WhatsApp."
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
                  <label className="block text-[var(--ink-muted)] mb-1 font-medium">Mobile Number (WhatsApp) *</label>
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
                  <label className="block text-[var(--ink-muted)] mb-1 font-medium">Address Line (Street) *</label>
                  <input
                    {...register('address')}
                    type="text"
                    placeholder="Lab Building 4, 100 Science Drive"
                    className="w-full p-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--ink)] outline-none focus:border-[var(--ink)]"
                  />
                  {errors.address && <p className="text-red-500 text-[11px] mt-1">{errors.address.message}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[var(--ink-muted)] mb-1 font-medium">City *</label>
                    <input
                      {...register('city')}
                      type="text"
                      placeholder="Mumbai / Delhi / Bengaluru"
                      className="w-full p-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--ink)] outline-none focus:border-[var(--ink)]"
                    />
                    {errors.city && <p className="text-red-500 text-[11px] mt-1">{errors.city.message}</p>}
                  </div>

                  <div>
                    <label className="block text-[var(--ink-muted)] mb-1 font-medium">State / Province *</label>
                    <input
                      {...register('state')}
                      type="text"
                      placeholder="Maharashtra"
                      className="w-full p-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--ink)] outline-none focus:border-[var(--ink)]"
                    />
                    {errors.state && <p className="text-red-500 text-[11px] mt-1">{errors.state.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[var(--ink-muted)] mb-1 font-medium">Postal / PIN Code *</label>
                    <input
                      {...register('postalCode')}
                      type="text"
                      placeholder="400001"
                      className="w-full p-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--ink)] outline-none focus:border-[var(--ink)] font-mono"
                    />
                    {errors.postalCode && <p className="text-red-500 text-[11px] mt-1">{errors.postalCode.message}</p>}
                  </div>

                  <div>
                    <label className="block text-[var(--ink-muted)] mb-1 font-medium">Country *</label>
                    <input
                      {...register('country')}
                      type="text"
                      placeholder="India"
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

              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex flex-col gap-2.5 animate-fade-in">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                    <span className="leading-relaxed">{errorMessage}</span>
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMessage('');
                        handleSubmit(onSubmit)();
                      }}
                      className="px-3 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 font-semibold text-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <span>Try again</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Offline WhatsApp notice */}
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-200 text-xs leading-relaxed">
                Payment is not taken online. Final total, shipping and payment details will be confirmed on WhatsApp.
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !researchAcknowledgement}
                className="w-full py-4 px-6 rounded-xl bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.99] text-white font-heading font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-xl shadow-[#25D366]/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Saving order request...</span>
                  </>
                ) : (
                  <>
                    <WhatsAppIcon className="w-5 h-5 text-white" />
                    <span>Send order on WhatsApp</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}

