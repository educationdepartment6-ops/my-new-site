import React from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Download, PackageCheck, ThermometerSnowflake, FileCheck2 } from 'lucide-react';
import SEO from '../seo/SEO';
import { formatPrice } from '../utils/pricing';

export default function OrderConfirmationPage() {
  const location = useLocation();
  const order = location.state?.order;

  if (!order) {
    return <Navigate to="/shop" replace />;
  }

  return (
    <>
      <SEO
        title="Requisition Confirmed"
        description="Order receipt and laboratory fulfillment instructions."
        canonicalPath="/order-confirmation"
        noindex={true}
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="p-8 sm:p-12 rounded-3xl glass-panel bg-white/80 dark:bg-[#141517]/85 border border-[var(--border)] shadow-xl text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <span className="badge-ruo mb-2 inline-block">Order Placed</span>
          <h1 className="text-2xl sm:text-4xl font-heading font-extrabold text-[var(--ink)] mb-3">
            Requisition Authorized
          </h1>
          <p className="text-xs sm:text-sm text-[var(--ink-muted)] max-w-lg mx-auto mb-6 leading-relaxed">
            Thank you, {order.customer.fullName}. Your laboratory research order has been recorded. A confirmation receipt and tracking dossier have been dispatched to <strong>{order.customer.email}</strong>.
          </p>

          <div className="p-4 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border)] max-w-md mx-auto mb-8 text-left text-xs font-mono space-y-2">
            <div className="flex justify-between">
              <span className="text-[var(--chrome)]">Requisition ID:</span>
              <strong className="text-[var(--ink)]">{order.orderId}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--chrome)]">Institution:</span>
              <span className="text-[var(--ink)]">{order.customer.institution}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--chrome)]">Total Amount:</span>
              <strong className="text-[var(--ink)]">{formatPrice(order.total, order.currency)}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--chrome)]">Fulfillment:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Cold-Chain Prep</span>
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
