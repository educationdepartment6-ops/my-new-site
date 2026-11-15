import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function FAQAccordion({ items = [] }) {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleItem = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="divide-y divide-[var(--border)] border-y border-[var(--border)]">
      {items.map((item, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div key={idx} className="py-4">
            <button
              onClick={() => toggleItem(idx)}
              className="w-full flex items-center justify-between text-left font-heading font-semibold text-sm sm:text-base text-[var(--ink)] hover:text-[var(--chrome)] transition-colors gap-4"
              aria-expanded={isOpen}
            >
              <span>{item.q}</span>
              <ChevronDown
                className={`w-4 h-4 text-[var(--chrome)] transition-transform duration-200 shrink-0 ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
            {isOpen && (
              <div className="mt-2.5 text-xs sm:text-sm text-[var(--ink-muted)] leading-relaxed pr-6 animate-fade-in">
                {item.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
