import React from 'react';
import SEO from '../../seo/SEO';
import Breadcrumbs from '../../components/common/Breadcrumbs';

export default function RefundPolicyPage() {
  return (
    <>
      <SEO
        title="Refund & Damaged Reagent Policy"
        description="Guidelines on damaged vial replacement and non-returnable chemical reagents."
        canonicalPath="/legal/refund-policy"
        noindex={true}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs items={[{ name: 'Refund Policy', url: '/legal/refund-policy' }]} />

        <div className="py-8 border-b border-[var(--border)] mb-10">
          <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-[var(--ink)] mb-4">
            Refund & Replacement Policy
          </h1>
          <p className="text-sm text-[var(--ink-muted)]">
            Guidelines governing laboratory reagent integrity, transit damage claims, and return restrictions.
          </p>
        </div>

        <div className="space-y-8 text-xs sm:text-sm text-[var(--ink-muted)] leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-heading font-bold text-[var(--ink)]">1. Non-Returnable Reagent Nature</h2>
            <p>
              Due to chemical safety standards, temperature sensitivity, and risk of laboratory cross-contamination, chemical reagents and lyophilized peptides cannot be returned once custody has transferred to the recipient laboratory.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-heading font-bold text-[var(--ink)]">2. Damaged or Compromised Shipments</h2>
            <p>
              If vials arrive shattered, seals are broken, or thermal cold-chain insulation has suffered gross packaging failure, notify institutional support within <strong>48 hours</strong> of courier delivery. Submit high-resolution photographs of the damaged shipping carton and affected vials with batch numbers visible.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-heading font-bold text-[var(--ink)]">3. Replacement Dispatch or Credit</h2>
            <p>
              Upon verification, MOG WRLD will immediately prepare and dispatch an identical replacement batch via priority cold-pack courier at no additional charge, or issue an institutional credit note for subsequent requisitions.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
