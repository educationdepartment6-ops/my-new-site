import React from 'react';
import { PackageCheck, Truck, Clock } from 'lucide-react';
import SEO from '../seo/SEO';
import Breadcrumbs from '../components/common/Breadcrumbs';

export default function ShippingReturnsPage() {
  return (
    <>
      <SEO
        title="Shipping & Delivery"
        description="Clear information on packaging, shipping times, and delivery for orders from MOG WRLD."
        canonicalPath="/shipping-returns"
        breadcrumbs={[{ name: 'Shipping', url: '/shipping-returns' }]}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs items={[{ name: 'Shipping & Delivery', url: '/shipping-returns' }]} />

        <div className="py-8 border-b border-[var(--border)] mb-10">
          <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-[var(--ink)] mb-4">
            Shipping & Delivery
          </h1>
          <p className="text-sm sm:text-base text-[var(--ink-muted)] leading-relaxed">
            Simple and clear information on how your order is packed and delivered.
          </p>
        </div>

        <div className="space-y-10 text-xs sm:text-sm text-[var(--ink-muted)] leading-relaxed">
          <section className="p-6 rounded-2xl glass-panel bg-white/70 dark:bg-[#141517]/70 border border-[var(--border)] space-y-3">
            <h2 className="text-lg font-heading font-bold text-[var(--ink)] flex items-center gap-2">
              <PackageCheck className="w-5 h-5 text-[var(--chrome)]" />
              <span>Protective Packaging</span>
            </h2>
            <p>
              Every vial is packed with protective materials to ensure it arrives safely at your doorstep without damage.
            </p>
          </section>

          <section className="p-6 rounded-2xl glass-panel bg-white/70 dark:bg-[#141517]/70 border border-[var(--border)] space-y-3">
            <h2 className="text-lg font-heading font-bold text-[var(--ink)] flex items-center gap-2">
              <Clock className="w-5 h-5 text-[var(--chrome)]" />
              <span>Delivery Timeframe</span>
            </h2>
            <p>
              Orders are packed and dispatched promptly. [FILL IN: typical delivery timeframe, e.g. 2 to 5 business days depending on location].
            </p>
          </section>

          <section className="p-6 rounded-2xl glass-panel bg-white/70 dark:bg-[#141517]/70 border border-[var(--border)] space-y-3">
            <h2 className="text-lg font-heading font-bold text-[var(--ink)] flex items-center gap-2">
              <Truck className="w-5 h-5 text-[var(--chrome)]" />
              <span>Questions About Your Shipment</span>
            </h2>
            <p>
              If you have any questions about tracking your package or need help with a delivery, contact us at [FILL IN: support email address].
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
