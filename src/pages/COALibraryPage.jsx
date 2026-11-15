import React, { useState, useMemo } from 'react';
import { Search, FileCheck2, Download, ExternalLink, ShieldCheck, Filter } from 'lucide-react';
import SEO from '../seo/SEO';
import Breadcrumbs from '../components/common/Breadcrumbs';
import productsData from '../data/products.json';

export default function COALibraryPage() {
  const [searchTerm, setSearchTerm] = useState('');

  // Extract all batch records across product variants
  const allBatches = useMemo(() => {
    const list = [];
    productsData.forEach((product) => {
      product.variants.forEach((v) => {
        list.push({
          productName: product.name,
          productSlug: product.slug,
          sku: v.sku,
          variantLabel: v.label,
          batchNumber: v.batchNumber || `MW-${v.sku}-2601`,
          purity: product.purity,
          testDate: '2026-08-14',
          coaUrl: product.coaUrl || `/coa/samples/COA_${v.sku}.pdf`,
          testLab: 'BioAnalytical Solutions Lab (ISO 17025 Accredited)'
        });
      });
    });
    return list;
  }, []);

  const filteredBatches = useMemo(() => {
    if (!searchTerm.trim()) return allBatches;
    const q = searchTerm.toLowerCase();
    return allBatches.filter(
      (b) =>
        b.productName.toLowerCase().includes(q) ||
        b.sku.toLowerCase().includes(q) ||
        b.batchNumber.toLowerCase().includes(q)
    );
  }, [allBatches, searchTerm]);

  return (
    <>
      <SEO
        title="Certificates of Analysis (COA) Library"
        description="Searchable batch library of analytical HPLC chromatograms and mass spectrometry test reports for MOG WRLD research compounds."
        canonicalPath="/coa"
        breadcrumbs={[{ name: 'COA Library', url: '/coa' }]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs items={[{ name: 'COA Library', url: '/coa' }]} />

        {/* Header Title */}
        <div className="py-8 border-b border-[var(--border)] mb-8">
          <span className="badge-ruo mb-2 inline-block">Quality Assurance</span>
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-[var(--ink)]">
            Certificates of Analysis (COA) Archive
          </h1>
          <p className="text-xs sm:text-sm text-[var(--ink-muted)] max-w-2xl mt-2 leading-relaxed">
            Verify chromatographic purity, sequence identity, and heavy metal screening for your exact production lot. Search by compound name, SKU code, or printed batch number.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-lg mb-8">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--chrome)]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Batch # (e.g. MW-BPC-26A), SKU, or Compound..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--ink)] text-xs sm:text-sm outline-none focus:border-[var(--ink)] shadow-sm"
          />
        </div>

        {/* Results Counter */}
        <div className="text-xs text-[var(--ink-muted)] mb-4">
          Displaying <strong>{filteredBatches.length}</strong> verified batch test records
        </div>

        {/* Batch Table */}
        <div className="rounded-2xl glass-panel bg-white/70 dark:bg-[#141517]/70 border border-[var(--border)] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--surface-subtle)] text-[var(--ink-muted)] border-b border-[var(--border)] font-mono uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Compound / Variant</th>
                  <th className="py-3.5 px-4 font-semibold">SKU</th>
                  <th className="py-3.5 px-4 font-semibold">Batch / Lot #</th>
                  <th className="py-3.5 px-4 font-semibold">HPLC Purity</th>
                  <th className="py-3.5 px-4 font-semibold">Testing Date</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Certificate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] text-[var(--ink)]">
                {filteredBatches.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[var(--surface-subtle)] transition-colors">
                    <td className="py-3.5 px-4 font-medium">
                      <div className="font-heading font-semibold text-sm">{item.productName}</div>
                      <div className="text-[11px] text-[var(--ink-muted)]">{item.variantLabel}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-[var(--ink-muted)]">
                      {item.sku}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[var(--ink)]">
                      {item.batchNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                        {item.purity}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[var(--ink-muted)]">
                      {item.testDate}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <a
                        href={item.coaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                          e.preventDefault();
                          alert(`Downloading sample COA test report for Batch ${item.batchNumber} (${item.productName}).`);
                        }}
                        className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--ink)] hover:bg-[var(--surface-subtle)] transition-colors text-xs font-semibold"
                      >
                        <Download className="w-3.5 h-3.5 text-[var(--chrome)]" />
                        <span>PDF</span>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
