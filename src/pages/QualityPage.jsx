import React from 'react';
import { Link } from 'react-router-dom';
import { FileCheck2, Award, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';
import SEO from '../seo/SEO';
import Breadcrumbs from '../components/common/Breadcrumbs';

export default function QualityPage() {
  return (
    <>
      <SEO
        title="Quality & Analytical Verification Protocols"
        description="Detailed guide to HPLC purity testing, LC-MS mass confirmation, and lot-specific COA verification for MOG WRLD research compounds."
        canonicalPath="/quality"
        breadcrumbs={[{ name: 'Quality Verification', url: '/quality' }]}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs items={[{ name: 'Quality Verification', url: '/quality' }]} />

        <div className="py-8 border-b border-[var(--border)] mb-10">
          <span className="badge-ruo mb-2 inline-block">Analytical Integrity</span>
          <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-[var(--ink)] mb-4">
            HPLC & Mass Spectrometry Verification
          </h1>
          <p className="text-sm sm:text-base text-[var(--ink-muted)] leading-relaxed">
            Analytical transparency is non-negotiable in scientific research. Discover the rigorous three-stage verification process applied to every production batch.
          </p>
        </div>

        <div className="space-y-12 text-xs sm:text-sm text-[var(--ink-muted)] leading-relaxed">
          {/* Stage 1 */}
          <div className="p-6 sm:p-8 rounded-2xl glass-panel bg-white/70 dark:bg-[#141517]/70 border border-[var(--border)] space-y-3">
            <span className="text-xs font-mono font-bold text-[var(--chrome)]">PROTOCOL 01</span>
            <h2 className="text-xl font-heading font-bold text-[var(--ink)]">
              Analytical Reversed-Phase HPLC
            </h2>
            <p>
              High-performance liquid chromatography separates peptide molecules based on hydrophobicity across a C18 stationary phase column. Using precision acetonitrile/water gradients containing 0.1% trifluoroacetic acid (TFA), chromatograms monitor optical absorption at 214nm and 254nm. Total purity is calculated via mathematical peak area integration, with a mandatory minimum release threshold of <strong>≥98.0%</strong>.
            </p>
          </div>

          {/* Stage 2 */}
          <div className="p-6 sm:p-8 rounded-2xl glass-panel bg-white/70 dark:bg-[#141517]/70 border border-[var(--border)] space-y-3">
            <span className="text-xs font-mono font-bold text-[var(--chrome)]">PROTOCOL 02</span>
            <h2 className="text-xl font-heading font-bold text-[var(--ink)]">
              Electrospray Ionization Mass Spectrometry (ESI-MS)
            </h2>
            <p>
              HPLC alone confirms chromatographic homogeneity, but mass spectrometry confirms definitive chemical identity. Electrospray ionization produces multiply charged molecular ions that are analyzed with quadrupole time-of-flight (Q-TOF) analyzers to determine experimental mass within ±0.5 Da of theoretical calculated mass.
            </p>
          </div>

          {/* Stage 3 */}
          <div className="p-6 sm:p-8 rounded-2xl glass-panel bg-white/70 dark:bg-[#141517]/70 border border-[var(--border)] space-y-3">
            <span className="text-xs font-mono font-bold text-[var(--chrome)]">PROTOCOL 03</span>
            <h2 className="text-xl font-heading font-bold text-[var(--ink)]">
              Lyophilization Purity & Residual Water Control
            </h2>
            <p>
              Purified peptide solutions undergo specialized low-temperature freeze-drying cycles (lyophilization) under high vacuum (&lt;0.1 mbar). This yields sterile, crystalline cakes with residual moisture levels strictly below 3.0%, ensuring extended room-temperature stability during cold-pack shipment.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 text-amber-900 dark:text-amber-200 space-y-2">
            <strong className="block font-heading text-sm uppercase tracking-wide">
              Compliance Reminder
            </strong>
            <p className="text-xs">
              Third-party analytical verification validates compound identity and purity for academic and laboratory evaluation only. It does not certify compounds for clinical efficacy, human consumption, or veterinary use.
            </p>
          </div>

          <div className="text-center pt-4">
            <Link
              to="/coa"
              className="inline-flex items-center gap-2 py-3 px-8 rounded-xl bg-[var(--ink)] text-[var(--bg)] font-semibold text-xs shadow-md hover:opacity-90 transition-opacity"
            >
              <span>Search COA Batch Library</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
