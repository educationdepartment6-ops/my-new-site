import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link, Navigate } from 'react-router-dom';
import { FlaskConical, FileText, Download, ShieldAlert, Check, ShoppingBag, Plus, Minus, Info, ThermometerSnowflake, FileCheck2, ArrowRight } from 'lucide-react';
import SEO from '../seo/SEO';
import Breadcrumbs from '../components/common/Breadcrumbs';
import VariantSelector from '../components/product/VariantSelector';
import ProductCard from '../components/product/ProductCard';
import productsData from '../data/products.json';
import legacyRedirects from '../data/legacy_redirects.json';
import coaRecords from '../data/coa_records.json';
import { useCartStore } from '../store/useCartStore';
import { useCurrencyStore } from '../store/useCurrencyStore';
import { formatPrice } from '../utils/pricing';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  // 1. Check legacy redirects
  const redirectInfo = legacyRedirects[slug?.toLowerCase()];
  if (redirectInfo) {
    return (
      <Navigate
        to={`/product/${redirectInfo.compoundSlug}?strength=${encodeURIComponent(redirectInfo.strength)}`}
        replace
      />
    );
  }

  // 2. Find product compound
  const product = productsData.find(
    (p) =>
      p.slug === slug ||
      p.id === slug ||
      p.primarySku.toLowerCase() === (slug || '').toLowerCase()
  );

  if (!product) {
    return <Navigate to="/shop" replace />;
  }

  // 3. Resolve selected variant based on query parameter ?strength=...
  const strengthQuery = searchParams.get('strength');
  const initialVariant = product.variants.find(
    (v) =>
      v.strength.toLowerCase() === strengthQuery?.toLowerCase() ||
      v.sku.toLowerCase() === strengthQuery?.toLowerCase()
  ) || product.variants[0];

  const [selectedVariant, setSelectedVariant] = useState(initialVariant);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [isAdded, setIsAdded] = useState(false);

  // Find matching verified COA for this product and selected variant
  const matchedCoa = React.useMemo(() => {
    if (!product || !selectedVariant) return null;
    return coaRecords.find((c) => {
      if (c.productId !== product.id || !c.isVisible || c.inCatalog === false) return false;
      const cleanCoaStr = c.strength.toLowerCase().replace(/\s+/g, '');
      const cleanVarLabel = (selectedVariant.label || '').toLowerCase().replace(/\s+/g, '');
      const cleanVarStr = (selectedVariant.strength || '').toLowerCase().replace(/\s+/g, '');
      return cleanVarLabel.includes(cleanCoaStr.split('/')[0]) || cleanVarStr.includes(cleanCoaStr.split('/')[0]);
    });
  }, [product, selectedVariant]);

  // Sync state if URL query param changes
  useEffect(() => {
    if (strengthQuery) {
      const matched = product.variants.find(
        (v) =>
          v.strength.toLowerCase() === strengthQuery.toLowerCase() ||
          v.sku.toLowerCase() === strengthQuery.toLowerCase()
      );
      if (matched && matched.sku !== selectedVariant.sku) {
        setSelectedVariant(matched);
      }
    }
  }, [strengthQuery, product.variants, selectedVariant.sku]);

  const handleSelectVariant = (variant) => {
    setSelectedVariant(variant);
    setSearchParams({ strength: variant.strength }, { replace: true });
  };

  const addItem = useCartStore((state) => state.addItem);
  const currency = useCurrencyStore((state) => state.currency);

  const relatedProducts = productsData
    .filter((p) => p.category === product.category && p.slug !== product.slug)
    .slice(0, 4);

  const handleAddToCart = () => {
    addItem(product, selectedVariant, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  // SEO Title pattern: {Product} Research Compound | mog wrld (<=60 chars)
  const seoTitle = `${product.name} Research Compound`;

  return (
    <>
      <SEO
        title={seoTitle}
        description={product.shortDescription}
        canonicalPath={`/product/${product.slug}`}
        productData={{
          name: product.name,
          primarySku: selectedVariant.sku,
          price: selectedVariant.price,
          inStock: product.inStock,
          shortDescription: product.shortDescription,
        }}
        breadcrumbs={[
          { name: 'Shop Catalogue', url: '/shop' },
          { name: product.categoryName, url: `/category/${product.category}` },
          { name: product.name, url: `/product/${product.slug}` },
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs
          items={[
            { name: 'Shop', url: '/shop' },
            { name: product.categoryName, url: `/category/${product.category}` },
            { name: product.name, url: `/product/${product.slug}` },
          ]}
        />

        {/* Main Product Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mt-6 mb-16">
          {/* Left Column: Visual Compound Render */}
          <div className="lg:col-span-5">
            <div className="sticky top-28 rounded-3xl glass-panel bg-white/80 dark:bg-[#141517]/85 border border-[var(--border)] p-8 flex flex-col items-center justify-center min-h-[380px] overflow-hidden">
              {/* Subtle Hexagonal Background Matrix */}
              <div className="absolute inset-0 opacity-10 dark:opacity-20 flex items-center justify-center pointer-events-none">
                <svg viewBox="0 0 200 200" className="w-80 h-80 stroke-current text-[var(--chrome)] fill-none">
                  <polygon points="100,10 180,50 180,150 100,190 20,150 20,50" strokeWidth="1.5" />
                  <polygon points="100,35 160,65 160,135 100,165 40,135 40,65" strokeWidth="1" strokeDasharray="4 4" />
                </svg>
              </div>

              {/* Product Vial Image or Lab Flask Graphic */}
              {selectedVariant.imageUrl || product.imageUrl ? (
                <div className="relative z-10 w-full max-w-[280px] aspect-square flex items-center justify-center mb-4">
                  <img
                    src={selectedVariant.imageUrl || product.imageUrl}
                    alt={`${product.name} ${selectedVariant.sku} (${selectedVariant.strength})`}
                    className="max-h-full max-w-full object-contain drop-shadow-xl"
                  />
                </div>
              ) : (
                <div className="relative z-10 w-28 h-28 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-xl flex items-center justify-center text-[var(--chrome)] mb-4">
                  <FlaskConical className="w-14 h-14 stroke-[1.25] text-[var(--ink)]" />
                </div>
              )}

              <div className="relative z-10 text-center">
                <span className="badge-ruo mb-1.5 inline-block" title="Sold for research purposes only.">Research Use</span>
                {matchedCoa && (
                  <div className="text-xs font-mono text-[var(--ink-muted)]">
                    Batch: <span className="text-[var(--ink)] font-semibold">{matchedCoa.batchNumber}</span>
                  </div>
                )}
              </div>

              {/* Batch COA Action - Strictly displayed ONLY when exact verified COA match exists */}
              {matchedCoa && (
                <div className="relative z-10 mt-6 w-full">
                  <a
                    href={matchedCoa.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-xs font-semibold text-[var(--ink)] hover:bg-[var(--surface-subtle)] transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <FileText className="w-3.5 h-3.5 text-emerald-500" />
                    <span>View Lab Report (Batch #{matchedCoa.batchNumber})</span>
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Specifications, Variants & Purchase Actions */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              {/* Category & Status Strip */}
              <div className="flex items-center justify-between text-xs mb-2">
                <Link
                  to={`/category/${product.category}`}
                  className="text-xs font-mono font-medium text-[var(--chrome)] uppercase tracking-wider hover:underline"
                >
                  {product.categoryName}
                </Link>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold font-mono text-xs">
                    In Stock (Ready to Ship)
                  </span>
                </div>
              </div>

              {/* Compound Title */}
              <h1 className="text-2xl sm:text-4xl font-heading font-extrabold text-[var(--ink)] mb-3">
                {product.name}
              </h1>

              {/* Product identifiers */}
              <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-[var(--ink-muted)] pb-4 border-b border-[var(--border)] mb-5">
                <span>Product code: <strong className="text-[var(--ink)]">{selectedVariant.sku}</strong></span>
                {product.casNumber && (
                  <>
                    <span>•</span>
                    <span>CAS: <strong className="text-[var(--ink)]">{product.casNumber}</strong></span>
                  </>
                )}
              </div>

              {/* Short summary */}
              <p className="text-xs sm:text-sm text-[var(--ink-muted)] leading-relaxed mb-6">
                {selectedVariant.strength.includes('ml')
                  ? `${product.name} - ${selectedVariant.strength}. Sealed and packaged securely.`
                  : `${product.name} - ${selectedVariant.strength} per vial. Sealed and packaged securely.`}
              </p>

              {/* Variant Selector */}
              <div className="mb-6">
                <VariantSelector
                  variants={product.variants}
                  selectedVariant={selectedVariant}
                  onSelect={handleSelectVariant}
                />
              </div>

              {/* Price & Quantity Bar */}
              <div className="p-5 rounded-2xl glass-panel bg-white/70 dark:bg-[#141517]/70 border border-[var(--border)] mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-[11px] text-[var(--ink-muted)] block uppercase font-mono">
                      {selectedVariant.strength.includes('ml') ? `Price per ${selectedVariant.strength}` : 'Price per vial'}
                    </span>
                    <span className="text-2xl sm:text-3xl font-heading font-extrabold text-[var(--ink)]">
                      {formatPrice(
                        {
                          priceInr: (selectedVariant.priceInr ?? selectedVariant.price) * quantity,
                          priceUsd: (selectedVariant.priceUsd ?? selectedVariant.price) * quantity,
                        },
                        currency
                      )}
                    </span>
                    <span className="text-[11px] text-[var(--ink-muted)] block font-mono mt-0.5">
                      {currency === 'INR' ? selectedVariant.priceFormattedInr : formatPrice(selectedVariant, currency, { perVial: true })}
                      {quantity > 1 && ` • ${quantity} ${selectedVariant.strength.includes('ml') ? 'containers' : 'vials'} total`}
                    </span>
                  </div>

                  {/* Quantity Stepper (Vials/Containers) */}
                  <div>
                    <span className="text-[10px] text-[var(--ink-muted)] font-mono block text-right mb-1">
                      Quantity ({selectedVariant.strength.includes('ml') ? 'containers' : 'vials'}):
                    </span>
                    <div className="flex items-center rounded-xl border border-[var(--border)] bg-[var(--surface)]">
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="p-2.5 hover:bg-[var(--surface-subtle)] text-[var(--ink-muted)] transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-4 text-sm font-mono font-bold">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity(quantity + 1)}
                        className="p-2.5 hover:bg-[var(--surface-subtle)] text-[var(--ink-muted)] transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Add to Cart CTA */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className={`w-full py-3.5 px-6 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
                    isAdded
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[var(--ink)] text-[var(--bg)] hover:opacity-90'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added to cart!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add to cart</span>
                    </>
                  )}
                </button>

                {/* Single Clear Research Notice */}
                <p className="text-xs text-[var(--ink-muted)] text-center mt-3 leading-relaxed">
                  These products are sold for research purposes only. Not for human or veterinary use. Not medical advice.
                </p>
              </div>
            </div>

            {/* Quick Guarantees */}
            <div className="grid grid-cols-2 gap-3 text-xs text-[var(--ink-muted)] pt-2 border-t border-[var(--border)]">
              <div className="flex items-center gap-2">
                <ThermometerSnowflake className="w-4 h-4 text-[var(--chrome)]" />
                <span>Cold-Chain Packaging Included</span>
              </div>
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-[var(--chrome)]" />
                <span>Batch HPLC Chromatogram</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Technical Accordion / Specifications */}
        <div className="rounded-2xl glass-panel bg-white/70 dark:bg-[#141517]/70 border border-[var(--border)] overflow-hidden mb-16">
          <div className="flex border-b border-[var(--border)] overflow-x-auto">
            <button
              onClick={() => setActiveTab('description')}
              className={`py-3.5 px-6 text-xs sm:text-sm font-heading font-semibold transition-colors shrink-0 ${
                activeTab === 'description'
                  ? 'border-b-2 border-[var(--ink)] text-[var(--ink)]'
                  : 'text-[var(--ink-muted)] hover:text-[var(--ink)]'
              }`}
            >
              Scientific Overview & Targets
            </button>
            <button
              onClick={() => setActiveTab('storage')}
              className={`py-3.5 px-6 text-xs sm:text-sm font-heading font-semibold transition-colors shrink-0 ${
                activeTab === 'storage'
                  ? 'border-b-2 border-[var(--ink)] text-[var(--ink)]'
                  : 'text-[var(--ink-muted)] hover:text-[var(--ink)]'
              }`}
            >
              Handling & Storage Protocols
            </button>
            <button
              onClick={() => setActiveTab('specifications')}
              className={`py-3.5 px-6 text-xs sm:text-sm font-heading font-semibold transition-colors shrink-0 ${
                activeTab === 'specifications'
                  ? 'border-b-2 border-[var(--ink)] text-[var(--ink)]'
                  : 'text-[var(--ink-muted)] hover:text-[var(--ink)]'
              }`}
            >
              Analytical Specifications
            </button>
            {matchedCoa && (
              <button
                onClick={() => setActiveTab('coa')}
                className={`py-3.5 px-6 text-xs sm:text-sm font-heading font-semibold transition-colors shrink-0 ${
                  activeTab === 'coa'
                    ? 'border-b-2 border-[var(--ink)] text-[var(--ink)]'
                    : 'text-[var(--ink-muted)] hover:text-[var(--ink)]'
                }`}
              >
                Lab Report (COA)
              </button>
            )}
          </div>

          <div className="p-6 sm:p-8 text-xs sm:text-sm leading-relaxed text-[var(--ink-muted)]">
            {activeTab === 'description' && (
              <div className="space-y-4 max-w-4xl">
                <h3 className="font-heading font-bold text-base text-[var(--ink)]">
                  Research Summary & Biochemical Profile
                </h3>
                <p>{product.researchSummary}</p>
                <div className="p-4 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)] text-xs font-mono text-[var(--ink-muted)]">
                  <strong>Notice:</strong> Information provided is compiled from peer-reviewed scientific literature and catalogue monographs for analytical reference. It does not constitute medical advice, prescribing guidance, or endorsement for clinical application.
                </div>
              </div>
            )}

            {activeTab === 'storage' && (
              <div className="space-y-4 max-w-3xl">
                <h3 className="font-heading font-bold text-base text-[var(--ink)]">
                  Lyophilized Solid Storage & Reconstitution Guidelines
                </h3>
                <ul className="space-y-2 list-disc pl-5">
                  <li><strong>Unopened Vials:</strong> Store desiccated at -20°C. Protect from ultraviolet and fluorescent light exposure. Shelf life: 24 months.</li>
                  <li><strong>Reconstitution Diluent:</strong> Reconstitute using sterile laboratory 0.9% Bacteriostatic Water or sterile deionized H2O under a laminar flow hood.</li>
                  <li><strong>Post-Reconstitution Handling:</strong> After reconstitution, maintain solution at 2°C to 8°C. Avoid repeated freeze-thaw cycles. Recommend aliquoting into single-use cryogenic cryovials for extended experimental timelines.</li>
                </ul>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="max-w-2xl">
                <h3 className="font-heading font-bold text-base text-[var(--ink)] mb-4">
                  Chemical & Analytical Constants
                </h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                  <div className="p-3 rounded-lg bg-[var(--surface-subtle)] border border-[var(--border)]">
                    <dt className="text-[var(--chrome)] uppercase mb-1">Sequence</dt>
                    <dd className="text-[var(--ink)] font-semibold break-all">{product.specifications.sequence || 'N/A (Standard Molecule)'}</dd>
                  </div>
                  <div className="p-3 rounded-lg bg-[var(--surface-subtle)] border border-[var(--border)]">
                    <dt className="text-[var(--chrome)] uppercase mb-1">Physical Form</dt>
                    <dd className="text-[var(--ink)] font-semibold">{product.specifications.form}</dd>
                  </div>
                  <div className="p-3 rounded-lg bg-[var(--surface-subtle)] border border-[var(--border)]">
                    <dt className="text-[var(--chrome)] uppercase mb-1">Purity (HPLC)</dt>
                    <dd className="text-emerald-600 dark:text-emerald-400 font-bold">{product.purity}</dd>
                  </div>
                  <div className="p-3 rounded-lg bg-[var(--surface-subtle)] border border-[var(--border)]">
                    <dt className="text-[var(--chrome)] uppercase mb-1">CAS Registry Number</dt>
                    <dd className="text-[var(--ink)] font-semibold">{product.casNumber || 'Investigational (N/A)'}</dd>
                  </div>
                </dl>
              </div>
            )}

            {activeTab === 'coa' && matchedCoa && (
              <div className="space-y-4 max-w-2xl">
                <h3 className="font-heading font-bold text-base text-[var(--ink)]">
                  Certificate of Analysis — Batch #{matchedCoa.batchNumber}
                </h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                  <div className="p-3 rounded-lg bg-[var(--surface-subtle)] border border-[var(--border)]">
                    <dt className="text-[var(--chrome)] uppercase mb-1">Compound & Strength</dt>
                    <dd className="text-[var(--ink)] font-semibold">{matchedCoa.productName} ({matchedCoa.strength})</dd>
                  </div>
                  <div className="p-3 rounded-lg bg-[var(--surface-subtle)] border border-[var(--border)]">
                    <dt className="text-[var(--chrome)] uppercase mb-1">Batch / Lot #</dt>
                    <dd className="text-[var(--ink)] font-semibold">{matchedCoa.batchNumber}</dd>
                  </div>
                  <div className="p-3 rounded-lg bg-[var(--surface-subtle)] border border-[var(--border)]">
                    <dt className="text-[var(--chrome)] uppercase mb-1">Testing Date</dt>
                    <dd className="text-[var(--ink)] font-semibold">{matchedCoa.testDate}</dd>
                  </div>
                  <div className="p-3 rounded-lg bg-[var(--surface-subtle)] border border-[var(--border)]">
                    <dt className="text-[var(--chrome)] uppercase mb-1">Accredited Laboratory</dt>
                    <dd className="text-[var(--ink)] font-semibold">{matchedCoa.lab}</dd>
                  </div>
                </dl>
                <div className="flex items-center gap-3 pt-2">
                  <a
                    href={matchedCoa.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 py-2 px-4 rounded-xl border border-[var(--border)] bg-[var(--ink)] text-[var(--surface)] text-xs font-semibold"
                  >
                    <FileText className="w-4 h-4" />
                    <span>View Full Report (PDF)</span>
                  </a>
                  <a
                    href={matchedCoa.pdfUrl}
                    download
                    className="inline-flex items-center gap-1.5 py-2 px-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--ink)] hover:bg-[var(--surface-subtle)] text-xs font-semibold"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PDF ({matchedCoa.fileSize})</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Compounds Section */}
        {relatedProducts.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-[var(--chrome)] block mb-1">
                  Cross-Referenced Targets
                </span>
                <h2 className="text-xl sm:text-2xl font-heading font-bold text-[var(--ink)]">
                  Related Research Compounds
                </h2>
              </div>
              <Link
                to={`/category/${product.category}`}
                className="text-xs font-semibold text-[var(--ink)] hover:text-[var(--chrome)] flex items-center gap-1"
              >
                <span>View {product.categoryName}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
