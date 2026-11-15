import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FlaskConical, ShoppingBag, Check, ArrowRight } from 'lucide-react';
import { useCurrencyStore } from '../../store/useCurrencyStore';
import { useCartStore } from '../../store/useCartStore';

export default function ProductCard({ product }) {
  const currency = useCurrencyStore((state) => state.currency);
  const addItem = useCartStore((state) => state.addItem);

  // Default to first variant (lowest strength)
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);
  const [isAdded, setIsAdded] = useState(false);

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, selectedVariant, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const productUrl = `/product/${product.slug}?strength=${encodeURIComponent(selectedVariant.strength)}`;

  // Display price depending on currency
  const displayPrice = currency === 'INR' 
    ? (selectedVariant.priceFormattedInr || `₹${(selectedVariant.priceInr ?? selectedVariant.price).toLocaleString()} / vial`)
    : (selectedVariant.priceFormattedUsd || `$${selectedVariant.priceUsd} / vial`);

  const isContainerSize = selectedVariant.strength.includes('ml');

  return (
    <div className="group rounded-2xl glass-panel bg-white/80 dark:bg-[#141517]/85 border border-[var(--border)] overflow-hidden flex flex-col justify-between glass-panel-hover">
      <div>
        {/* Top Visual Box — Full Width Edge-to-Edge Container */}
        <Link
          to={productUrl}
          className="relative block w-full aspect-[4/3] bg-gradient-to-br from-[var(--surface-subtle)] via-[var(--bg)] to-[var(--surface-subtle)] overflow-hidden border-b border-[var(--border)]"
        >
          {/* Subtle Hexagonal Background Motif */}
          <div className="absolute inset-0 opacity-10 dark:opacity-20 flex items-center justify-center pointer-events-none">
            <svg viewBox="0 0 100 100" className="w-56 h-56 stroke-current text-[var(--chrome)] fill-none">
              <polygon points="50,5 90,25 90,75 50,95 10,75 10,25" strokeWidth="1.5" />
              <polygon points="50,20 80,35 80,65 50,80 20,65 20,35" strokeWidth="1" strokeDasharray="3 3" />
            </svg>
          </div>

          {/* Badges — Preserved in Current Positions */}
          <div className="absolute top-3 inset-x-3 z-10 flex items-center justify-between pointer-events-none">
            <span className="badge-ruo" title="Sold for research purposes only.">Research Use</span>
            
          </div>

          {/* Product Vial Image — Scaled to 85-90% frame height, transparent, edge-to-edge */}
          {selectedVariant.imageUrl || product.imageUrl ? (
            <div className="absolute inset-0 z-0 flex items-center justify-center">
              <img
                src={selectedVariant.imageUrl || product.imageUrl}
                alt={`${product.name} ${selectedVariant.sku} (${selectedVariant.strength})`}
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </div>
          ) : (
            <div className="relative z-10 h-full flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-md flex items-center justify-center text-[var(--chrome)] group-hover:text-[var(--ink)] group-hover:scale-105 transition-all">
                <FlaskConical className="w-7 h-7 stroke-[1.5]" />
              </div>
              <span className="text-[10px] font-mono text-[var(--chrome)] mt-2 uppercase tracking-widest">
                {selectedVariant.sku}
              </span>
            </div>
          )}
        </Link>

        {/* Info Content */}
        <div className="p-4 sm:p-5">
          <div className="flex items-center justify-between text-[11px] font-medium text-[var(--chrome)] uppercase tracking-wider mb-1">
            <span>{product.categoryName}</span>
            <span className="font-mono text-[10px] text-[var(--ink-muted)] tracking-normal">{selectedVariant.sku}</span>
          </div>

          <Link to={productUrl} className="block">
            <h3 className="font-heading font-bold text-base sm:text-lg text-[var(--ink)] group-hover:text-[var(--chrome)] transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>

          {/* Single clean description line */}
          <p className="text-xs text-[var(--ink-muted)] line-clamp-2 mt-1 leading-relaxed">
            {`${product.name} - ${selectedVariant.strength} per vial`}
          </p>

          {/* Strength Chips Selector (shown once, only existing strengths) */}
          {product.variants.length > 1 && (
            <div className="mt-3.5 flex flex-wrap gap-1.5">
              {product.variants.map((v) => {
                const isSelected = selectedVariant.sku === v.sku && selectedVariant.strength === v.strength;
                return (
                  <button
                    key={v.sku + v.strength}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedVariant(v);
                    }}
                    className={`text-[10px] font-mono px-2.5 py-1 rounded-md border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[var(--ink)] bg-[var(--ink)] text-[var(--bg)] font-bold shadow-xs'
                        : 'border-[var(--border)] bg-[var(--surface)] text-[var(--ink-muted)] hover:border-[var(--chrome)]'
                    }`}
                    aria-label={`Select ${product.name} ${v.strength}`}
                  >
                    {v.strength}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Pricing & Action Footer */}
      <div className="p-4 sm:p-5 pt-0">
        <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between">
          <div>
            <span className="text-[10px] text-[var(--ink-muted)] block uppercase font-mono">
              {isContainerSize ? `Price per ${selectedVariant.strength}` : 'Price per vial'}
            </span>
            <span className="font-heading font-bold text-base sm:text-lg text-[var(--ink)]">
              {displayPrice}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleQuickAdd}
              disabled={isAdded}
              className={`p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
                isAdded
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[var(--ink)] text-[var(--bg)] hover:opacity-90'
              }`}
              aria-label={`Add ${product.name} (${selectedVariant.strength}) to cart`}
            >
              {isAdded ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Added</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Add</span>
                </>
              )}
            </button>
            <Link
              to={productUrl}
              className="p-2 rounded-xl border border-[var(--border)] text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-subtle)] transition-colors"
              aria-label={`View ${product.name} specifications`}
            >
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
