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
            <h2 className="text-lg font-heading font-bold text-[var(--ink)]">1. Data Controller & Entity</h2>
            <p>
              This website is controlled and operated by [FILL IN: Your registered business entity name], having its registered office at [FILL IN: Registered physical business address, City, State, PIN, India] ("MOG WRLD"). For privacy inquiries, contact our Data Protection representative at [FILL IN: Privacy / DPO email address].
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-heading font-bold text-[var(--ink)]">2. Information We Collect</h2>
            <p>
              We collect details necessary to process research requisitions, including your full name, institutional / laboratory affiliation, email address, mobile phone number, and physical delivery address (street, city, state, postal code, and country).
            </p>
            <p>
              We do not process or store credit/debit card numbers or net banking credentials on our web servers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-heading font-bold text-[var(--ink)]">3. Order Processing via WhatsApp</h2>
            <p>
              When you submit an order request on our website, your requisition details (Order Request ID, customer name, phone number, email address, delivery destination, and list of compound quantities) are saved on our secure server and pre-formatted into a plain-text WhatsApp message.
            </p>
            <p>
              This message is transmitted via your own WhatsApp application / web client directly to our business WhatsApp number (+91 9270465829). Subsequent communications regarding order availability, delivery coordination, invoices, and payments (via UPI, bank transfer, or mutually agreed terms) are handled over WhatsApp in accordance with WhatsApp’s end-to-end encryption and privacy standards.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-heading font-bold text-[var(--ink)]">4. Purpose of Processing & Third Parties</h2>
            <p>
              Your data is utilized strictly for order verification, cold-chain courier dispatch, laboratory compliance records, and direct customer support. We never sell, lease, or monetize customer contact information to commercial marketing aggregators. Courier partners receive delivery address and recipient telephone details solely for physical transit fulfillment.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-heading font-bold text-[var(--ink)]">5. Data Retention & Your Rights</h2>
            <p>
              Order records are retained in compliance with statutory chemical recordkeeping and commercial tax regulations. You may request verification, correction, or deletion of your account details by emailing [FILL IN: Privacy / DPO email address] or contacting our team on WhatsApp at +91 9270465829.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
