import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Fuse from 'fuse.js';
import { Search, X, ArrowRight, FlaskConical } from 'lucide-react';
import productsData from '../../data/products.json';
import { formatPrice } from '../../utils/pricing';
import { useCurrencyStore } from '../../store/useCurrencyStore';

export default function SearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const currency = useCurrencyStore((state) => state.currency);

  const fuse = useRef(
    new Fuse(productsData, {
      keys: ['name', 'categoryName', 'primarySku', 'shortDescription', 'variants.sku', 'variants.strength'],
      threshold: 0.35,
      minMatchCharLength: 2,
    })
  ).current;

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setResults(productsData.slice(0, 5)); // Initial recommendations
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults(productsData.slice(0, 5));
      return;
    }
    const searchRes = fuse.search(query).map((res) => res.item);
    setResults(searchRes.slice(0, 8));
  }, [query, fuse]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl glass-panel bg-white/95 dark:bg-[#141517]/95 shadow-2xl border border-[var(--chrome)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--border)]">
          <Search className="w-5 h-5 text-[var(--chrome)]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products by name or code (e.g. Tirzepatide, BPC-157)..."
            className="flex-1 bg-transparent border-none outline-none text-[var(--ink)] placeholder:text-[var(--chrome)] text-sm sm:text-base font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-lg text-[var(--chrome)] hover:text-[var(--ink)] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs font-mono font-medium py-1 px-2 rounded-md bg-[var(--surface-subtle)] text-[var(--ink-muted)] hover:text-[var(--ink)]"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-2 divide-y divide-[var(--border)]">
          {results.length > 0 ? (
            results.map((product) => {
              const lowestPrice = Math.min(...product.variants.map((v) => currency === 'INR' ? (v.priceInr ?? v.price) : (v.priceUsd ?? v.price)));
              return (
                <div
                  key={product.slug}
                  onClick={() => {
                    navigate(`/product/${product.slug}`);
                    onClose();
                  }}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-[var(--surface-subtle)] cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-[var(--chrome)] group-hover:text-[var(--ink)] transition-colors overflow-hidden">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt="" className="w-full h-full object-contain p-0.5" />
                      ) : (
                        <FlaskConical className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-heading font-semibold text-sm text-[var(--ink)]">
                          {product.name}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--border)] text-[var(--ink-muted)]">
                          {product.primarySku}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--ink-muted)] line-clamp-1">
                        {product.categoryName} • Purity: {product.purity}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pl-3">
                    <span className="text-sm font-semibold text-[var(--ink)]">
                      from {formatPrice(lowestPrice, currency, { perVial: true })}
                    </span>
                    <ArrowRight className="w-4 h-4 text-[var(--chrome)] opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-sm text-[var(--ink-muted)]">
              No laboratory research compounds found matching "{query}".
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-[var(--surface-subtle)] border-t border-[var(--border)] flex items-center justify-between text-xs text-[var(--ink-muted)]">
          <span>All listed items are for laboratory research use only</span>
          <span>{results.length} matches</span>
        </div>
      </div>
    </div>
  );
}
