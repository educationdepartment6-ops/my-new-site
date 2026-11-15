import React from 'react';
import SEO from '../../seo/SEO';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import { ShieldAlert, AlertTriangle } from 'lucide-react';

export default function ResearchUsePolicyPage() {
  return (
    <>
      <SEO
        title="Research Use Only (RUO) Compliance Policy"
        description="Statutory policy governing laboratory chemical supply. Materials are strictly for in vitro research, not for human or veterinary administration."
        canonicalPath="/legal/research-use-policy"
        breadcrumbs={[{ name: 'Research Use Policy', url: '/legal/research-use-policy' }]}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs items={[{ name: 'Research Use Policy', url: '/legal/research-use-policy' }]} />

        <div className="py-8 border-b border-[var(--border)] mb-10">
          <span className="badge-ruo mb-2 inline-block">Mandatory Statutory Declaration</span>
          <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-[var(--ink)] mb-4">
            Research Use Only (RUO) Policy
          </h1>
          <p className="text-sm sm:text-base text-[var(--ink-muted)] leading-relaxed">
            Statutory notice regarding legal classifications, handling obligations, and restrictions on the use of compounds supplied by MOG WRLD.
          </p>
        </div>

        {/* Highlighted Warning Alert */}
        <div className="p-6 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border-2 border-amber-500/30 text-amber-950 dark:text-amber-100 mb-10 space-y-3">
          <div className="flex items-center gap-2 font-heading font-bold text-base uppercase tracking-wider">
            <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <span>Core Statutory Restriction</span>
          </div>
          <p className="text-xs sm:text-sm leading-relaxed font-medium">
            ALL PRODUCTS SUPPLIED BY MOG WRLD ARE INTENDED EXCLUSIVELY FOR IN VITRO LABORATORY RESEARCH, ANALYTICAL ASSAYS, AND SCIENTIFIC EXPERIMENTATION. THEY ARE NOT DRUGS, MEDICINES, COSMETICS, FOOD PRODUCTS, OR MEDICAL DEVICES. THEY MUST NEVER BE ADMINISTERED TO HUMANS OR ANIMALS.
          </p>
        </div>

        <div className="space-y-8 text-xs sm:text-sm text-[var(--ink-muted)] leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-heading font-bold text-[var(--ink)]">1. Scope of Intended Use</h2>
            <p>
              Compounds provided by MOG WRLD are biological chemicals synthesized for testing chemical affinity, receptor kinetics, enzyme inhibition, and in vitro cellular pathways. Purchasers explicitly warrant that all handling will occur inside properly equipped scientific laboratories under the supervision of qualified researchers trained in good laboratory practices (GLP).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-heading font-bold text-[var(--ink)]">2. Absolute Prohibition of Human & Animal Consumption</h2>
            <p>
              None of our products have been authorized by the United States Food and Drug Administration (FDA), the Central Drugs Standard Control Organization (CDSCO) of India, the European Medicines Agency (EMA), or any other medical regulatory authority for diagnostic, therapeutic, or preventative purposes. Any use involving human or animal administration, ingestion, injection, or clinical experimentation is strictly prohibited and constitutes a material breach of supply terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-heading font-bold text-[var(--ink)]">3. Refusal of Supply & Misuse Enforcement</h2>
            <p>
              MOG WRLD reserves the absolute right to cancel and refund any order, or terminate accounts, if there is reasonable cause to believe that compounds are being acquired for personal consumption, resale as unregulated wellness formulations, or unauthorized non-laboratory handling.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-heading font-bold text-[var(--ink)]">4. Statutory Regulatory Compliance in India & Abroad</h2>
            <p>
              Purchasers are responsible for confirming compliance with local laws before importation or possession. In India, laboratory chemicals are governed under applicable provisions of the Drugs and Cosmetics Act, 1940 and rules thereunder, alongside state chemical licensing frameworks.
            </p>
          </section>

          {/* Institutional Placeholders */}
          <div className="p-6 rounded-2xl glass-panel bg-white/70 dark:bg-[#141517]/70 border border-[var(--border)] font-mono text-xs space-y-2">
            <h3 className="font-heading font-bold text-[var(--ink)] uppercase">Official Company Identification Placeholders</h3>
            <div><strong>Corporate Name:</strong> MOG WRLD BioSciences Private Limited (Placeholder)</div>
            <div><strong>Registered Address:</strong> Technology Park, Phase II, Bengaluru, Karnataka, 560100 (Placeholder)</div>
            <div><strong>Corporate Identification Number (CIN):</strong> U24230KA2026PTC099182 (Placeholder)</div>
            <div><strong>CDSCO State License Reference:</strong> DL-LAB-BIO-2026-IND (Placeholder)</div>
            <div><strong>Statutory Liaison:</strong> legal@mogwrld.com</div>
          </div>
        </div>
      </div>
    </>
  );
}
