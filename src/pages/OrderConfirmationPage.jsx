import React, { useState } from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { CheckCircle2, Copy, Check, ExternalLink, ThermometerSnowflake, FileCheck2 } from 'lucide-react';
import SEO from '../seo/SEO';
import { formatPrice } from '../utils/pricing';
import { getWhatsAppOrderUrl, formatWhatsAppOrderMessage } from '../config/whatsapp';

function WhatsAppIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
    </svg>
  );
}

export default function OrderConfirmationPage() {
  const location = useLocation();
  const order = location.state?.order;
  const [copied, setCopied] = useState(false);

  if (!order) {
    return <Navigate to="/shop" replace />;
  }

  const orderId = order.orderId || order.orderNumber || 'MW-000000';
  const whatsappUrl = order.whatsappUrl || getWhatsAppOrderUrl(order);
  const whatsappMessage = order.whatsappMessage || formatWhatsAppOrderMessage(order);

  const handleCopyMessage = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(whatsappMessage);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = whatsappMessage;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.warn('Failed to copy order message:', err);
    }
  };

  const handleOpenWhatsApp = () => {
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <SEO
        title="Order Request Saved"
        description="Your order request has been saved. Complete confirmation via WhatsApp."
        canonicalPath="/order-confirmation"
        noindex={true}
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="p-8 sm:p-12 rounded-3xl glass-panel bg-white/80 dark:bg-[#141517]/85 border border-[var(--border)] shadow-xl text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <span className="badge-ruo mb-2 inline-block">Order Request Saved</span>
          <h1 className="text-2xl sm:text-4xl font-heading font-extrabold text-[var(--ink)] mb-3">
            Requisition Saved
          </h1>
          <p className="text-xs sm:text-sm text-[var(--ink-muted)] max-w-lg mx-auto mb-6 leading-relaxed">
            Your order request <strong className="text-[var(--ink)] font-mono">{orderId}</strong> is saved. If WhatsApp did not open, tap the button below.
          </p>

          {/* WhatsApp Action Box */}
          <div className="p-6 rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 max-w-lg mx-auto mb-8 text-left space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-md">
                <WhatsAppIcon className="w-5 h-5 text-white" />
              </div>
              <div className="text-xs leading-relaxed">
                <strong className="block text-[var(--ink)] text-sm mb-0.5">Send Order on WhatsApp</strong>
                <p className="text-[var(--ink-muted)]">
                  Please press <strong>Send</strong> in WhatsApp to share your requisition with our team. We will reply with confirmation and payment instructions.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={handleOpenWhatsApp}
                className="flex-1 py-3 px-5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.99] text-white font-heading font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/20 transition-all cursor-pointer"
              >
                <WhatsAppIcon className="w-4 h-4 text-white" />
                <span>Open WhatsApp</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </button>

              <button
                type="button"
                onClick={handleCopyMessage}
                className="py-3 px-5 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-subtle)] text-[var(--ink)] font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-[var(--ink-muted)]" />
                    <span>Copy order message</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Order Details Summary */}
          <div className="p-4 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border)] max-w-md mx-auto mb-8 text-left text-xs font-mono space-y-2">
            <div className="flex justify-between">
              <span className="text-[var(--chrome)]">Requisition ID:</span>
              <strong className="text-[var(--ink)]">{orderId}</strong>
            </div>
            {order.customer?.name && (
              <div className="flex justify-between">
                <span className="text-[var(--chrome)]">Customer:</span>
                <span className="text-[var(--ink)]">{order.customer.name}</span>
              </div>
            )}
            {order.customer?.institution && (
              <div className="flex justify-between">
                <span className="text-[var(--chrome)]">Institution:</span>
                <span className="text-[var(--ink)]">{order.customer.institution}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-[var(--chrome)]">Total Amount:</span>
              <strong className="text-[var(--ink)]">{formatPrice(order.totalInr || order.total, 'INR')}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--chrome)]">Status:</span>
              <span className="text-amber-600 dark:text-amber-400 font-semibold">{order.status || 'New - awaiting WhatsApp confirmation'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--chrome)]">Cold-Chain Packaging:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Free / Included</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--chrome)]">Shipping:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Free</span>
            </div>
          </div>

          {/* Logistics advisory */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left text-xs text-[var(--ink-muted)] mb-8 max-w-lg mx-auto">
            <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] flex items-start gap-2.5">
              <ThermometerSnowflake className="w-4 h-4 text-[var(--chrome)] shrink-0 mt-0.5" />
              <div>
                <strong className="block text-[var(--ink)]">Cold-Pack Despatch</strong>
                <span>Compounds packaged in thermal insulation to maintain solid state.</span>
              </div>
            </div>
            <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] flex items-start gap-2.5">
              <FileCheck2 className="w-4 h-4 text-[var(--chrome)] shrink-0 mt-0.5" />
              <div>
                <strong className="block text-[var(--ink)]">Batch COA Documents</strong>
                <span>Physical copies included inside shipping package.</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/shop"
              className="w-full sm:w-auto py-3 px-6 rounded-xl bg-[var(--ink)] text-[var(--bg)] font-semibold text-xs hover:opacity-90 transition-opacity"
            >
              Return to Reagent Catalogue
            </Link>
            <Link
              to="/coa"
              className="w-full sm:w-auto py-3 px-6 rounded-xl border border-[var(--border)] text-xs font-semibold hover:bg-[var(--surface-subtle)] text-[var(--ink)] transition-colors"
            >
              Browse Batch COA Library
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

