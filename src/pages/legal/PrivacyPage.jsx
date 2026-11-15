import React from 'react';
import SEO from '../../seo/SEO';
import Breadcrumbs from '../../components/common/Breadcrumbs';

export default function PrivacyPage() {
  return (
    <>
      <SEO
        title="Privacy & Data Protection Policy"
        description="Data retention and institutional privacy safeguards at MOG WRLD."
        canonicalPath="/legal/privacy"
        noindex={true}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs items={[{ name: 'Privacy Policy', url: '/legal/privacy' }]} />

        <div className="py-8 border-b border-[var(--border)] mb-10">
          <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-[var(--ink)] mb-4">
            Privacy & Data Security Policy
          </h1>
          <p className="text-sm text-[var(--ink-muted)]">
            How MOG WRLD safeguards institutional contact information, order details, and browsing telemetry.
          </p>
        </div>

        <div className="space-y-8 text-xs sm:text-sm text-[var(--ink-muted)] leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-heading font-bold text-[var(--ink)]">1. Information We Collect</h2>
            <p>
              We collect details necessary to process institutional requisitions, including full name, laboratory affiliation, institutional email, delivery address, and contact numbers. We do not store sensitive payment card details on our infrastructure.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-heading font-bold text-[var(--ink)]">2. Purpose of Processing</h2>
            <p>
              Collected data is utilized strictly for order verification, cold-chain shipment dispatch, statutory compliance archiving, and customer service communications. We never sell or license customer lists to third-party commercial marketing entities.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-heading font-bold text-[var(--ink)]">3. Data Security Measures</h2>
            <p>
              All data transmissions are encrypted using Transport Layer Security (TLS 1.3) protocols. Access to customer orders is restricted to authorized logistics and compliance personnel.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
