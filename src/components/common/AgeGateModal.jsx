import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle2 } from 'lucide-react';

const AGE_GATE_KEY = 'mogwrld_age_verified_v1';

export default function AgeGateModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const verified = localStorage.getItem(AGE_GATE_KEY);
    if (!verified) {
      setIsOpen(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(AGE_GATE_KEY, 'true');
    setIsOpen(false);
  };

  const handleDecline = () => {
    window.location.href = 'https://www.google.com';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="age-gate-title">
      <div className="w-full max-w-lg p-6 sm:p-8 rounded-2xl glass-panel bg-white/95 dark:bg-[#141517]/95 border border-[var(--chrome)] shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-mono font-semibold text-[var(--chrome)] tracking-wider uppercase">Compliance Verification</span>
            <h2 id="age-gate-title" className="text-xl sm:text-2xl font-bold font-heading text-[var(--ink)]">
              Laboratory Research Only
            </h2>
          </div>
        </div>

        <div className="space-y-3.5 text-sm text-[var(--ink-muted)] mb-6 leading-relaxed">
          <p className="font-semibold text-[var(--ink)]">
            Welcome to <span className="font-heading">MOG WRLD</span>. Before proceeding to access our laboratory chemical catalogue, you must affirm the following statements:
          </p>
          <ul className="space-y-2 border-l-2 border-[var(--silver)] pl-3 text-xs sm:text-sm">
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
              <span>I confirm that I am at least <strong>18 years of age</strong> (or age of majority).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
              <span>All products supplied are solely for <strong>in vitro laboratory research</strong>, analytical testing, or scientific experimentation.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
              <span>These compounds are <strong>NOT for human or veterinary consumption</strong>, clinical treatment, food, or cosmetics.</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleAccept}
            className="flex-1 py-3 px-5 rounded-xl bg-[var(--ink)] text-[var(--bg)] font-semibold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            <CheckCircle2 className="w-4 h-4" />
            I Agree & Enter Site
          </button>
          <button
            onClick={handleDecline}
            className="py-3 px-5 rounded-xl border border-[var(--border)] text-[var(--ink-muted)] hover:text-[var(--ink)] text-sm font-medium transition-colors"
          >
            Exit Site
          </button>
        </div>
      </div>
    </div>
  );
}
