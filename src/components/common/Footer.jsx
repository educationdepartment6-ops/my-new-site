import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Award, FileCheck2, Truck, Mail } from 'lucide-react';
import categoriesData from '../../data/categories.json';

export default function Footer() {
  return (
    <footer className="bg-[var(--surface-subtle)] text-[var(--ink)] border-t border-[var(--border)] mt-24">
      {/* Single Clear Research Notice */}
      <div className="py-4 border-b border-[var(--border)] text-xs text-[var(--ink-muted)] text-center px-4">
        These products are sold for research purposes only. Not for human or veterinary use. Not medical advice.
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand & Identification */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-block" aria-label="MOG WRLD Home">
              <img
                src="/brand/logo.png"
                alt="mog wrld - Research Compounds"
                className="h-8 w-auto dark:invert drop-shadow-sm"
                width="200"
                height="38"
              />
            </Link>
            <p className="text-xs text-[var(--ink-muted)] leading-relaxed max-w-sm">
              MOG WRLD supplies quality research peptides with clear pricing per vial and straightforward ordering.
            </p>
            {/* Contact Placeholders */}
            <div className="pt-2 text-[11px] text-[var(--ink-muted)] space-y-1 border-t border-[var(--border)]">
              <div><strong>Email:</strong> [FILL IN: support email address]</div>
              <div><strong>Phone:</strong> [FILL IN: support phone number]</div>
              <div><strong>Address:</strong> [FILL IN: registered company address]</div>
            </div>
          </div>

          {/* Research Categories */}
          <div className="space-y-3">
            <h3 className="font-heading font-semibold text-xs uppercase tracking-wider text-[var(--chrome)]">
              Compound Categories
            </h3>
            <ul className="space-y-2 text-xs">
              {Object.values(categoriesData).slice(0, 6).map((cat) => (
                <li key={cat.slug}>
                  <Link
                    to={`/category/${cat.slug}`}
                    className="text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help & Support */}
          <div className="space-y-3">
            <h3 className="font-heading font-semibold text-xs uppercase tracking-wider text-[var(--chrome)]">
              Help & Support
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/coa" className="text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors font-medium">
                  Lab Reports (COA)
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link to="/shipping-returns" className="text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors">
                  Shipping & Delivery
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Statutory & Legal */}
          <div className="space-y-3">
            <h3 className="font-heading font-semibold text-xs uppercase tracking-wider text-[var(--chrome)]">
              Regulatory & Legal
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/legal/research-use-policy" className="text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors font-medium">
                  Research Use Policy (RUO)
                </Link>
              </li>
              <li>
                <Link to="/legal/terms" className="text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors">
                  Terms of Supply
                </Link>
              </li>
              <li>
                <Link to="/legal/privacy" className="text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/legal/refund-policy" className="text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors">
                  Refund & Replacement
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & disclaimer */}
        <div className="mt-12 pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between text-[11px] text-[var(--ink-muted)] gap-4">
          <p>© {new Date().getFullYear()} MOG WRLD. All rights reserved.</p>
          
        </div>
      </div>
    </footer>
  );
}
