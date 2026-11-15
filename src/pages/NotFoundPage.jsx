import React from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowRight, Home, FlaskConical } from 'lucide-react';
import SEO from '../seo/SEO';

export default function NotFoundPage() {
  return (
    <>
      <SEO
        title="404 — Compound Not Located"
        description="The requested laboratory research URL could not be resolved."
        noindex={true}
      />

      <div className="max-w-xl mx-auto px-4 py-24 sm:py-32 text-center">
        <div className="w-20 h-20 rounded-3xl glass-panel bg-white/70 dark:bg-[#141517]/70 border border-[var(--border)] flex items-center justify-center text-[var(--chrome)] mx-auto mb-6 shadow-xl">
          <FlaskConical className="w-10 h-10 stroke-[1.25]" />
        </div>

        <span className="badge-ruo mb-2 inline-block">Error 404 • Resource Missing</span>
        <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-[var(--ink)] mb-4">
          Compound Not Located
        </h1>
        <p className="text-xs sm:text-sm text-[var(--ink-muted)] mb-8 leading-relaxed max-w-md mx-auto">
          The requested page, SKU, or chemical monograph does not exist in our active research index. It may have been archived or relocated.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/shop"
            className="w-full sm:w-auto py-3 px-6 rounded-xl bg-[var(--ink)] text-[var(--bg)] font-semibold text-xs flex items-center justify-center gap-2 hover:opacity-90 shadow-md"
          >
            <span>Explore Research Catalogue</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/"
            className="w-full sm:w-auto py-3 px-6 rounded-xl border border-[var(--border)] text-[var(--ink)] font-semibold text-xs hover:bg-[var(--surface-subtle)] flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Return to Homepage</span>
          </Link>
        </div>
      </div>
    </>
  );
}
