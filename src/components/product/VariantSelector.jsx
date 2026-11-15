import React from 'react';
import { Check, ShieldCheck } from 'lucide-react';
import { formatPrice } from '../../utils/pricing';
import { useCurrencyStore } from '../../store/useCurrencyStore';

export default function VariantSelector({ variants, selectedVariant, onSelect }) {
  const currency = useCurrencyStore((state) => state.currency);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-[var(--ink)] uppercase font-mono tracking-wider">
          Select Strength
        </span>
        <span className="text-[var(--ink-muted)]">
          Product code: <strong className="font-mono text-[var(--ink)]">{selectedVariant.sku}</strong>
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {variants.map((v) => {
          const isSelected = selectedVariant.sku === v.sku && selectedVariant.strength === v.strength;
          return (
            <button
              key={v.sku + v.strength}
              type="button"
              onClick={() => onSelect(v)}
              className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                isSelected
                  ? 'border-[var(--ink)] bg-[var(--surface-subtle)] ring-1 ring-[var(--ink)]'
                  : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--chrome)]'
              }`}
            >
              <div>
                <div className="font-heading font-semibold text-xs text-[var(--ink)] flex items-center gap-2">
                  <span>{v.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                </div>
                <div className="text-[11px] font-mono text-[var(--ink-muted)] mt-0.5">
                  Code: <strong className="text-[var(--ink)]">{v.sku}</strong>
                </div>
              </div>

              <div className="text-right">
                <span className="font-mono font-bold text-sm text-[var(--ink)]">
                  {currency === 'INR' ? v.priceFormattedInr : formatPrice(v, currency, { perVial: true })}
                </span>
                <span className="block text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                  In Stock
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
