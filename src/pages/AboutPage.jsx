import React from 'react';
import SEO from '../seo/SEO';
import Breadcrumbs from '../components/common/Breadcrumbs';
import { Award, PackageCheck } from 'lucide-react';

export default function AboutPage() {
  return (
    <>
      <SEO
        title="About Us"
        description="Learn about MOG WRLD — quality research peptides with clear pricing per vial and straightforward ordering."
        canonicalPath="/about"
        breadcrumbs={[{ name: 'About', url: '/about' }]}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs items={[{ name: 'About', url: '/about' }]} />

        <div className="py-8 border-b border-[var(--border)] mb-10">
          <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-[var(--ink)] mb-4">
            About MOG WRLD
          </h1>
          <p className="text-sm sm:text-base text-[var(--ink-muted)] leading-relaxed">
            Quality peptides, clear prices, and reliable supply.
          </p>
        </div>

        <div className="space-y-10 text-xs sm:text-sm text-[var(--ink-muted)] leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-heading font-bold text-[var(--ink)]">
              Our Goal
            </h2>
            <p>
              MOG WRLD was started to make ordering research peptides simple, transparent, and dependable. We believe customers should have clear prices per vial with no surprises, reliable batch quality, and an easy checkout process.
            </p>
          </section>

          <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl glass-panel bg-white/70 dark:bg-[#141517]/70 border border-[var(--border)]">
              <div className="w-10 h-10 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-[var(--ink)] mb-4">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-base text-[var(--ink)] mb-2">Clear Pricing</h3>
              <p className="text-xs">
                Every price is clearly listed per vial across all available strength options.
              </p>
            </div>

            <div className="p-6 rounded-2xl glass-panel bg-white/70 dark:bg-[#141517]/70 border border-[var(--border)]">
              <div className="w-10 h-10 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-[var(--ink)] mb-4">
                <PackageCheck className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-base text-[var(--ink)] mb-2">Protective Packaging</h3>
              <p className="text-xs">
                All vials are packed securely with insulated protection so they arrive in great condition.
              </p>
            </div>
          </section>

          {/* Placeholders */}
          <div className="p-6 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border)] space-y-2 text-xs">
            <div className="font-bold text-[var(--ink)] font-heading uppercase text-xs mb-2">Company Information</div>
            <div><strong>Company Name:</strong> [FILL IN: registered company name]</div>
            <div><strong>Email:</strong> [FILL IN: support email address]</div>
            <div><strong>Address:</strong> [FILL IN: registered company address]</div>
          </div>
        </div>
      </div>
    </>
  );
}
