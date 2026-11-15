import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Download, ExternalLink, FileText, CheckCircle2, ShieldCheck } from 'lucide-react';
import SEO from '../seo/SEO';
import Breadcrumbs from '../components/common/Breadcrumbs';
import coaData from '../data/coa_records.json';
import categoriesData from '../data/categories.json';

export default function COALibraryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Filter only published in-catalog records
  const publishedRecords = useMemo(() => {
    return coaData.filter((r) => r.inCatalog !== false && r.isVisible !== false);
  }, []);

  const filteredRecords = useMemo(() => {
    return publishedRecords.filter((item) => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase();
      return (
        item.productName.toLowerCase().includes(q) ||
        item.batchNumber.toLowerCase().includes(q) ||
        item.strength.toLowerCase().includes(q) ||
        item.lab.toLowerCase().includes(q)
      );
    });
  }, [publishedRecords, selectedCategory, searchTerm]);

  // Group records by category
  const groupedByCategory = useMemo(() => {
    const groups = {};
    filteredRecords.forEach((rec) => {
      const catKey = rec.category || 'other';
      if (!groups[catKey]) {
        groups[catKey] = {
          name: categoriesData[catKey]?.name || 'General Compounds',
          records: []
        };
      }
      groups[catKey].records.push(rec);
    });
    return groups;
  }, [filteredRecords]);

  const categoryKeys = Object.keys(categoriesData);

  return (
    <>
      <SEO
        title="Lab Reports & Certificates of Analysis (COA)"
        description="Searchable library of verified third-party Certificates of Analysis (COA) for MOG WRLD research compounds."
        canonicalPath="/coa"
        breadcrumbs={[{ name: 'Lab Reports (COA)', url: '/coa' }]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <Breadcrumbs items={[{ name: 'Lab Reports (COA)', url: '/coa' }]} />

        {/* Page Header */}
        <div className="py-6 border-b border-[var(--border)]">
          <span className="badge-ruo mb-2 inline-block">Quality Assurance</span>
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-[var(--ink)]">
            Certificates of Analysis (COA)
          </h1>
          <p className="text-xs sm:text-sm text-[var(--ink-muted)] max-w-2xl mt-2 leading-relaxed">
            Verify third-party analytical testing reports for confirmed production batches. View complete analytical packets including HPLC chromatograms, mass spectrometry, and Eurofins microbial test certificates.
          </p>
        </div>

        {/* Controls: Search and Category Pills */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--chrome)]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Compound Name or Batch #..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--ink)] text-xs sm:text-sm outline-none focus:border-[var(--ink)] shadow-sm"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg border font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === 'all'
                  ? 'border-[var(--ink)] bg-[var(--ink)] text-[var(--surface)]'
                  : 'border-[var(--border)] bg-[var(--surface)] text-[var(--ink-muted)] hover:text-[var(--ink)]'
              }`}
            >
              All Categories
            </button>
            {categoryKeys.map((catKey) => {
              const cat = categoriesData[catKey];
              const isSelected = selectedCategory === catKey;
              return (
                <button
                  key={catKey}
                  onClick={() => setSelectedCategory(catKey)}
                  className={`px-3 py-1.5 rounded-lg border font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    isSelected
                      ? 'border-[var(--ink)] bg-[var(--ink)] text-[var(--surface)]'
                      : 'border-[var(--border)] bg-[var(--surface)] text-[var(--ink-muted)] hover:text-[var(--ink)]'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Counter */}
        <div className="text-xs text-[var(--ink-muted)]">
          Showing <strong>{filteredRecords.length}</strong> verified batch reports
        </div>

        {/* Grouped Table Displays */}
        {Object.keys(groupedByCategory).length === 0 ? (
          <div className="py-16 text-center text-xs text-[var(--ink-muted)] border border-dashed border-[var(--border)] rounded-2xl">
            No certificates found matching your search.
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedByCategory).map(([catKey, group]) => (
              <div key={catKey} className="space-y-3">
                <div className="flex items-center gap-2">
                  <h2 className="font-heading font-bold text-base text-[var(--ink)]">
                    {group.name}
                  </h2>
                  <span className="text-xs font-mono text-[var(--ink-muted)]">
                    ({group.records.length})
                  </span>
                </div>

                <div className="rounded-2xl glass-panel bg-white/70 dark:bg-[#141517]/70 border border-[var(--border)] overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[var(--surface-subtle)] text-[var(--ink-muted)] border-b border-[var(--border)] font-mono uppercase tracking-wider text-[11px]">
                        <tr>
                          <th className="py-3 px-4 font-semibold">Compound</th>
                          <th className="py-3 px-4 font-semibold">Strength</th>
                          <th className="py-3 px-4 font-semibold">Batch / Lot #</th>
                          <th className="py-3 px-4 font-semibold">Testing Date</th>
                          <th className="py-3 px-4 font-semibold">Laboratory</th>
                          <th className="py-3 px-4 font-semibold text-right">Certificate</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border)] text-[var(--ink)]">
                        {group.records.map((item) => (
                          <tr key={item.id} className="hover:bg-[var(--surface-subtle)] transition-colors">
                            <td className="py-3 px-4 font-medium">
                              {item.productId ? (
                                <Link
                                  to={`/product/${item.productId}`}
                                  className="font-heading font-semibold text-sm hover:underline flex items-center gap-1.5"
                                >
                                  <span>{item.productName}</span>
                                </Link>
                              ) : (
                                <span className="font-heading font-semibold text-sm">{item.productName}</span>
                              )}
                            </td>

                            <td className="py-3 px-4 font-mono font-medium text-[var(--ink)]">
                              {item.strength}
                            </td>

                            <td className="py-3 px-4 font-mono font-bold text-[var(--ink)]">
                              {item.batchNumber}
                            </td>

                            <td className="py-3 px-4 font-mono text-[var(--ink-muted)]">
                              {item.testDate}
                            </td>

                            <td className="py-3 px-4 text-[var(--ink-muted)] max-w-xs truncate" title={item.lab}>
                              {item.lab}
                            </td>

                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <a
                                  href={item.pdfUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 py-1 px-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--ink)] hover:bg-[var(--surface-subtle)] transition-colors text-xs font-semibold"
                                  title="Open PDF in new tab"
                                >
                                  <ExternalLink className="w-3.5 h-3.5 text-[var(--chrome)]" />
                                  <span>View PDF</span>
                                </a>
                                <a
                                  href={item.pdfUrl}
                                  download
                                  className="inline-flex items-center gap-1 py-1 px-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--ink)] hover:bg-[var(--surface-subtle)] transition-colors text-xs font-semibold"
                                  title={`Download ${item.fileSize}`}
                                >
                                  <Download className="w-3.5 h-3.5 text-[var(--chrome)]" />
                                  <span>Download</span>
                                </a>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Required Single Research Notice */}
        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] text-xs text-[var(--ink-muted)] text-center leading-relaxed mt-12">
          These products are sold for research purposes only. Not for human or veterinary use. Not medical advice.
        </div>
      </div>
    </>
  );
}
