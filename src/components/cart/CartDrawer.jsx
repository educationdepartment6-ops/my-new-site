import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ShoppingBag, ShieldCheck, ArrowRight } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { useCurrencyStore } from '../../store/useCurrencyStore';
import { formatPrice } from '../../utils/pricing';

export default function CartDrawer() {
  const { items, isDrawerOpen, closeDrawer, updateQuantity, removeItem, getSubtotal } = useCartStore();
  const currency = useCurrencyStore((state) => state.currency);
  const navigate = useNavigate();

  if (!isDrawerOpen) return null;

  const subtotal = getSubtotal(currency);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true" aria-labelledby="cart-title">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={closeDrawer}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[var(--surface)] text-[var(--ink)] shadow-2xl flex flex-col border-l border-[var(--border)] animate-slide-left">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[var(--border)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[var(--chrome)]" />
              <h2 id="cart-title" className="text-lg font-heading font-bold">
                Cart ({items.length})
              </h2>
            </div>
            <button
              onClick={closeDrawer}
              className="p-1.5 rounded-lg text-[var(--chrome)] hover:text-[var(--ink)] hover:bg-[var(--surface-subtle)] transition-colors"
              aria-label="Close cart drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {items.length === 0 ? (
              <div className="py-20 text-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-[var(--surface-subtle)] flex items-center justify-center text-[var(--chrome)] mb-4">
                  <ShoppingBag className="w-8 h-8 stroke-1" />
                </div>
                <h3 className="font-heading font-semibold text-base mb-1">Your cart is empty</h3>
                <p className="text-xs text-[var(--ink-muted)] max-w-xs mb-6">
                  Choose products from our shop to add them to your cart.
                </p>
                <button
                  onClick={() => {
                    closeDrawer();
                    navigate('/shop');
                  }}
                  className="py-2.5 px-5 rounded-xl bg-[var(--ink)] text-[var(--bg)] text-xs font-semibold hover:opacity-90 transition-opacity"
                >
                  Browse Products
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.key}
                  className="p-3.5 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)] flex flex-col gap-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link
                        to={`/product/${item.productSlug}`}
                        onClick={closeDrawer}
                        className="font-heading font-semibold text-sm hover:underline text-[var(--ink)]"
                      >
                        {item.productName}
                      </Link>
                      <div className="text-xs text-[var(--ink-muted)] flex items-center gap-2 mt-0.5">
                        <span className="font-mono">{item.sku}</span>
                        <span>•</span>
                        <span>{item.variantLabel}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item.key)}
                      className="text-[var(--chrome)] hover:text-red-500 p-1 transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    {/* Quantity Stepper (Vials) */}
                    <div className="flex items-center rounded-lg border border-[var(--border)] bg-[var(--surface)]">
                      <button
                        onClick={() => updateQuantity(item.key, item.quantity - 1)}
                        className="p-1.5 hover:bg-[var(--surface-subtle)] text-[var(--ink-muted)] transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-2.5 text-xs font-mono font-semibold">
                        {item.quantity} {item.quantity === 1 ? 'vial' : 'vials'}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.key, item.quantity + 1)}
                        className="p-1.5 hover:bg-[var(--surface-subtle)] text-[var(--ink-muted)] transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-[var(--ink-muted)] block font-mono">
                        {formatPrice(
                          currency === 'INR' ? (item.unitPriceInr ?? item.unitPrice) : (item.unitPriceUsd ?? item.unitPrice),
                          currency,
                          { perVial: true }
                        )}
                      </span>
                      <span className="text-sm font-semibold font-mono text-[var(--ink)]">
                        {formatPrice(
                          (currency === 'INR' ? (item.unitPriceInr ?? item.unitPrice) : (item.unitPriceUsd ?? item.unitPrice)) * item.quantity,
                          currency
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer with Checkout CTA */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-[var(--border)] bg-[var(--surface)] space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--ink-muted)]">Subtotal:</span>
                <span className="font-heading font-bold text-lg text-[var(--ink)]">
                  {formatPrice(subtotal, currency)}
                </span>
              </div>
              <p className="text-[11px] text-[var(--ink-muted)] leading-tight">
                Shipping calculated at checkout.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    closeDrawer();
                    navigate('/checkout');
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-[var(--ink)] text-[var(--bg)] font-semibold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg"
                >
                  <span>Go to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <Link
                  to="/cart"
                  onClick={closeDrawer}
                  className="py-3 px-4 rounded-xl border border-[var(--border)] text-xs font-semibold hover:bg-[var(--surface-subtle)] text-[var(--ink)] flex items-center"
                >
                  View Cart
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
