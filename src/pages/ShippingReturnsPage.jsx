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

        <div className="space-y-8 text-xs sm:text-sm text-[var(--ink-muted)] leading-relaxed">
          <section className="p-6 rounded-2xl glass-panel bg-white/70 dark:bg-[#141517]/70 border border-[var(--border)] space-y-3">
            <h2 className="text-lg font-heading font-bold text-[var(--ink)] flex items-center gap-2">
              <PackageCheck className="w-5 h-5 text-emerald-500" />
              <span>Cold-Chain Protective Packaging (Free / Included)</span>
            </h2>
            <p>
              Cold-chain packaging is included with every research requisition at no extra cost. Every vial is secured with thermal protective wrap and cold-pack insulation to ensure solid chemical stability during transit.
            </p>
          </section>

          <section className="p-6 rounded-2xl glass-panel bg-white/70 dark:bg-[#141517]/70 border border-[var(--border)] space-y-3">
            <h2 className="text-lg font-heading font-bold text-[var(--ink)] flex items-center gap-2">
              <Truck className="w-5 h-5 text-emerald-500" />
              <span>Domestic Shipping (Free)</span>
            </h2>
            <p>
              Standard courier shipping is Free across India. Once your order request is confirmed and payment is received on WhatsApp, your order enters dispatch preparation.
            </p>
          </section>

          <section className="p-6 rounded-2xl glass-panel bg-white/70 dark:bg-[#141517]/70 border border-[var(--border)] space-y-3">
            <h2 className="text-lg font-heading font-bold text-[var(--ink)] flex items-center gap-2">
              <Clock className="w-5 h-5 text-[var(--chrome)]" />
              <span>Delivery Timeframe & Tracking Updates</span>
            </h2>
            <p>
              Orders are dispatched promptly via reputed express couriers. [FILL IN: typical delivery timeframe, e.g. 2 to 5 business days depending on destination pincode].
            </p>
            <p>
              As soon as your package is dispatched, your courier tracking number will be shared with you directly on WhatsApp (+91 9270465829) and will also be visible under <strong>My Account &rarr; My Orders</strong> on our website.
            </p>
          </section>

          <section className="p-6 rounded-2xl glass-panel bg-white/70 dark:bg-[#141517]/70 border border-[var(--border)] space-y-3">
            <h2 className="text-lg font-heading font-bold text-[var(--ink)] flex items-center gap-2">
              <Truck className="w-5 h-5 text-[var(--chrome)]" />
              <span>Shipment Support & Return Facility</span>
            </h2>
            <p>
              If you have any questions about tracking your package or need urgent delivery coordination, reach our logistics team on WhatsApp at +91 9270465829 or email us at [FILL IN: support email address].
            </p>
            <p>
              Authorized laboratory inspection returns must be dispatched to our facility at [FILL IN: Courier receiving return address] with prior written authorization.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
