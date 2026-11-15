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
            <h2 className="text-lg font-heading font-bold text-[var(--ink)]">1. Purchaser Eligibility & Representations</h2>
            <p>
              By accessing this site or requisitioning materials, you confirm you are at least 18 years old and represent an authorized laboratory, institution, or academic research department. You warrant that all materials will be handled strictly in compliance with applicable chemical safety regulations.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-heading font-bold text-[var(--ink)]">2. Research Use Only Limitation</h2>
            <p>
              Materials sold by MOG WRLD are for laboratory chemical research only. They are not approved for food, drug, device, or cosmetic purposes. Purchaser assumes all responsibility and liability for laboratory hazards, handling, storage, and disposal.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-heading font-bold text-[var(--ink)]">3. Orders, Pricing & Modifications</h2>
            <p>
              All prices are quoted in USD (with optional INR preview). MOG WRLD reserves the right to reject orders, alter product specifications, or correct pricing discrepancies prior to fulfillment.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-heading font-bold text-[var(--ink)]">4. Limitation of Liability</h2>
            <p>
              In no event shall MOG WRLD, its officers, or manufacturing partners be liable for incidental, indirect, or consequential damages resulting from chemical handling, unauthorized usage, or regulatory non-compliance by the purchaser.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
