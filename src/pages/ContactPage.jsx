import React, { useState } from 'react';
import { Mail, Building2, CheckCircle2 } from 'lucide-react';
import SEO from '../seo/SEO';
import Breadcrumbs from '../components/common/Breadcrumbs';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <>
      <SEO
        title="Contact Us"
        description="Get in touch with the MOG WRLD team for questions about your order or our products."
        canonicalPath="/contact"
        breadcrumbs={[{ name: 'Contact', url: '/contact' }]}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs items={[{ name: 'Contact', url: '/contact' }]} />

        <div className="py-8 border-b border-[var(--border)] mb-10">
          <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-[var(--ink)] mb-4">
            Contact Us
          </h1>
          <p className="text-sm sm:text-base text-[var(--ink-muted)] leading-relaxed">
            Have a question about a product or your order? We are here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="md:col-span-5 space-y-6 text-xs text-[var(--ink-muted)]">
            <div className="p-6 rounded-2xl glass-panel bg-white/70 dark:bg-[#141517]/70 border border-[var(--border)] space-y-3">
              <h3 className="font-heading font-bold text-sm text-[var(--ink)] flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[var(--chrome)]" />
                <span>Contact Details</span>
              </h3>
              <p><strong>Email:</strong> [FILL IN: support email address]</p>
              <p><strong>Phone:</strong> [FILL IN: support phone number]</p>
              <p><strong>Address:</strong> [FILL IN: registered company address]</p>
            </div>
          </div>

          <div className="md:col-span-7">
            {submitted ? (
              <div className="p-8 rounded-2xl glass-panel bg-white/80 dark:bg-[#141517]/80 border border-[var(--border)] text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                <h3 className="font-heading font-bold text-lg text-[var(--ink)] mb-1">Message Sent</h3>
                <p className="text-xs text-[var(--ink-muted)]">
                  Thank you for reaching out. We will respond to your message promptly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-2xl glass-panel bg-white/70 dark:bg-[#141517]/70 border border-[var(--border)] space-y-4 text-xs">
                <div>
                  <label className="block text-[var(--ink-muted)] font-medium mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Full name"
                    className="w-full p-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--ink)] outline-none focus:border-[var(--ink)]"
                  />
                </div>

                <div>
                  <label className="block text-[var(--ink-muted)] font-medium mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    className="w-full p-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--ink)] outline-none focus:border-[var(--ink)]"
                  />
                </div>

                <div>
                  <label className="block text-[var(--ink-muted)] font-medium mb-1">Subject *</label>
                  <input
                    type="text"
                    required
                    placeholder="How can we help?"
                    className="w-full p-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--ink)] outline-none focus:border-[var(--ink)]"
                  />
                </div>

                <div>
                  <label className="block text-[var(--ink-muted)] font-medium mb-1">Message *</label>
                  <textarea
                    required
                    rows="4"
                    placeholder="Write your message here..."
                    className="w-full p-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--ink)] outline-none focus:border-[var(--ink)]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-6 rounded-xl bg-[var(--ink)] text-[var(--bg)] font-semibold text-xs hover:opacity-90 transition-opacity"
                >
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
