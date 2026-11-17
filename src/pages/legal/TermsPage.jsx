import React from 'react';
import SEO from '../../seo/SEO';
import Breadcrumbs from '../../components/common/Breadcrumbs';

export default function TermsPage() {
  return (
    <>
      <SEO
        title="Terms of Supply & Laboratory Service"
        description="Standard terms and conditions governing laboratory reagent sales and institutional requisitions."
        canonicalPath="/legal/terms"
        noindex={true}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs items={[{ name: 'Terms of Supply', url: '/legal/terms' }]} />

        <div className="py-8 border-b border-[var(--border)] mb-10">
          <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-[var(--ink)] mb-4">
            Terms & Conditions of Supply
          </h1>
          <p className="text-sm text-[var(--ink-muted)]">
            Last Updated: November 2026. Please review our legal conditions of contract before requisitioning research materials.
          </p>
        </div>

        <div className="space-y-8 text-xs sm:text-sm text-[var(--ink-muted)] leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-heading font-bold text-[var(--ink)]">1. Legal Entity & Eligibility</h2>
            <p>
              This website is operated by [FILL IN: Your registered business entity name], a company organized and existing under the laws of [FILL IN: Registered business jurisdiction, e.g. Maharashtra, India] ("MOG WRLD"). By accessing this site or submitting an order request, you confirm you are at least 18 years old and represent an authorized laboratory, institution, or academic research department.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-heading font-bold text-[var(--ink)]">2. Research Use Only Limitation</h2>
            <p>
              Materials sold by MOG WRLD are strictly for laboratory in vitro chemical research only. They are not approved for human, clinical, food, drug, device, or veterinary usage. The purchaser assumes all responsibility and liability for laboratory handling, protective equipment, storage, and chemical disposal.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-heading font-bold text-[var(--ink)]">3. Order Requests, WhatsApp Confirmation & Payment</h2>
            <p>
              Submitting an order on this website constitutes a purchase requisition / request. Online automated payment is not taken through this website. Order requests are reviewed by our team and confirmed directly with you on WhatsApp at +91 9270465829.
            </p>
            <p>
              Final availability, verified totals, shipping details, and payment arrangements (including bank transfer, UPI, or manual invoice as mutually agreed) will be communicated directly on WhatsApp. An order is binding only once confirmed by our team and payment has been received and acknowledged.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-heading font-bold text-[var(--ink)]">4. Pricing & Catalogue Specifications</h2>
            <p>
              Prices listed on the website are displayed per vial in Indian Rupees (INR). MOG WRLD reserves the right to correct typographical or calculation errors, adjust compound specifications, or decline order requests prior to manual confirmation.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-heading font-bold text-[var(--ink)]">5. Limitation of Liability</h2>
            <p>
              In no event shall MOG WRLD, [FILL IN: Your registered business entity name], its officers, or laboratory partners be liable for incidental, indirect, or consequential damages resulting from chemical handling, unauthorized usage, or regulatory non-compliance by the purchaser.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-heading font-bold text-[var(--ink)]">6. Contact & Inquiries</h2>
            <p>
              For legal inquiries, contact [FILL IN: Legal inquiry email address] or reach our representative on WhatsApp at +91 9270465829.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
