import React from 'react';
import { Award, FileCheck2, PackageCheck, HelpCircle } from 'lucide-react';

export default function TrustStrip() {
  const items = [
    {
      icon: Award,
      title: 'Consistent Quality',
      desc: 'Carefully prepared and batch tested for dependable consistency.',
    },
    {
      icon: FileCheck2,
      title: 'Clear Prices',
      desc: 'Straightforward pricing per vial with no hidden charges.',
    },
    {
      icon: PackageCheck,
      title: 'Careful Packaging',
      desc: 'Packed securely with protective materials for safe transit.',
    },
    {
      icon: HelpCircle,
      title: 'Direct Support',
      desc: 'Here to help if you have questions about products or your order.',
    },
  ];

  return (
    <section aria-label="Why order from MOG WRLD" className="w-full py-8 border-y border-[var(--border)] bg-[var(--surface-subtle)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="flex items-start gap-3.5 p-4 rounded-xl glass-panel bg-white/70 dark:bg-[#141517]/70 border border-[var(--border)]"
              >
                <div className="p-2.5 rounded-lg bg-[var(--surface)] text-[var(--chrome)] border border-[var(--border)] shrink-0 shadow-sm">
                  <Icon className="w-5 h-5 text-[var(--ink)]" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-xs sm:text-sm text-[var(--ink)] mb-0.5">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[var(--ink-muted)] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
