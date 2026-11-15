import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShieldCheck, ShoppingBag, ArrowLeft } from 'lucide-react';
import SEO from '../seo/SEO';
import Breadcrumbs from '../components/common/Breadcrumbs';
import { useCartStore } from '../store/useCartStore';
import { useCurrencyStore } from '../store/useCurrencyStore';
import { formatPrice } from '../utils/pricing';

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, getSubtotal } = useCartStore();
  const currency = useCurrencyStore((state) => state.currency);
  const navigate = useNavigate();

  const subtotal = getSubtotal(currency);

  return (
    <>
      <SEO
        title="Shopping Cart"
        description="Review your laboratory research reagents and compounds."
        canonicalPath="/cart"
        noindex={true}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs items={[{ name: 'Cart', url: '/cart' }]} />

        <div className="py-6 border-b border-[var(--border)] mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold text-[var(--ink)]">
              Shopping Cart
            </h1>
            <p className="text-xs text-[var(--ink-muted)] mt-1">
              Review the items in your cart before checkout.
            </p>
          </div>
          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs font-semibold text-[var(--ink-muted)] hover:text-red-500 transition-colors"
            >
              Clear Cart
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="py-24 text-center glass-panel rounded-3xl p-8 border border-[var(--border)] max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-full bg-[var(--surface-subtle)] flex items-center justify-center text-[var(--chrome)] mx-auto mb-4">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h2 className="font-heading font-semibold text-lg text-[var(--ink)] mb-2">
              Your Cart is Empty
            </h2>
            <p className="text-xs text-[var(--ink-muted)] mb-6">
              Choose products from our shop to add them to your cart.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 py-3 px-6 rounded-xl bg-[var(--ink)] text-[var(--bg)] font-semibold text-xs shadow-md hover:opacity-90 transition-opacity"
            >
              <span>Browse Products</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Items Table */}
            <div className="lg:col-span-8 space-y-4">
              <div className="rounded-2xl glass-panel bg-white/70 dark:bg-[#141517]/70 border border-[var(--border)] overflow-hidden">
                <div className="divide-y divide-[var(--border)]">
                  {items.map((item) => (
                    <div key={item.key} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <Link
                          to={`/product/${item.productSlug}`}
                          className="font-heading font-bold text-base text-[var(--ink)] hover:text-[var(--chrome)] transition-colors"
                        >
                          {item.productName}
                        </Link>
                        <div className="text-xs text-[var(--ink-muted)] flex items-center gap-2 mt-1">
                          <span className="font-mono">{item.sku}</span>
                          <span>•</span>
                          <span>{item.variantLabel}</span>
                          {item.batchNumber && (
                            <>
                              <span>•</span>
                              <span className="font-mono">Lot: {item.batchNumber}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-6">
                        {/* Quantity Stepper */}
                        <div className="flex items-center rounded-xl border border-[var(--border)] bg-[var(--surface)]">
                          <button
                            onClick={() => updateQuantity(item.key, item.quantity - 1)}
                            className="p-2 hover:bg-[var(--surface-subtle)] text-[var(--ink-muted)] transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-3 text-xs font-mono font-bold">{item.quantity} {item.quantity === 1 ? 'vial' : 'vials'}</span>
                          <button
                            onClick={() => updateQuantity(item.key, item.quantity + 1)}
                            className="p-2 hover:bg-[var(--surface-subtle)] text-[var(--ink-muted)] transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right min-w-28">
                          <span className="font-heading font-bold text-base text-[var(--ink)] block">
                            {formatPrice(
                              (currency === 'INR' ? (item.unitPriceInr ?? item.unitPrice) : (item.unitPriceUsd ?? item.unitPrice)) * item.quantity,
                              currency
                            )}
                          </span>
                          <span className="text-[10px] text-[var(--ink-muted)] font-mono">
                            {formatPrice(
                              currency === 'INR' ? (item.unitPriceInr ?? item.unitPrice) : (item.unitPriceUsd ?? item.unitPrice),
                              currency,
                              { perVial: true }
                            )}
                          </span>
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() => removeItem(item.key)}
                          className="p-2 rounded-lg text-[var(--chrome)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Link
                to="/shop"
                className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--ink)] hover:text-[var(--chrome)] transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Continue Shopping</span>
              </Link>
            </div>

            {/* Order Summary & Compliance */}
            <div className="lg:col-span-4">
              <div className="rounded-2xl glass-panel bg-white/70 dark:bg-[#141517]/70 border border-[var(--border)] p-6 space-y-4">
                <h2 className="font-heading font-bold text-base text-[var(--ink)] border-b border-[var(--border)] pb-3">
                  Order Summary
                </h2>

                <div className="space-y-2 text-xs text-[var(--ink-muted)]">
                  <div className="flex items-center justify-between">
                    <span>Subtotal:</span>
                    <span className="font-mono font-bold text-sm text-[var(--ink)]">
                      {formatPrice(subtotal, currency)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Packaging:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">Included</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Shipping:</span>
                    <span>Calculated next step</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between">
                  <span className="font-semibold text-sm text-[var(--ink)]">Total:</span>
                  <span className="font-heading font-extrabold text-xl text-[var(--ink)]">
                    {formatPrice(subtotal, currency)}
                  </span>
                </div>

                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full py-3.5 px-6 rounded-xl bg-[var(--ink)] text-[var(--bg)] font-semibold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
