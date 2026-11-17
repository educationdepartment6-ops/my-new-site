import React from 'react';
import SEO from '../seo/SEO';
import Breadcrumbs from '../components/common/Breadcrumbs';
import FAQAccordion from '../components/common/FAQAccordion';

export default function FAQPage() {
  const faqList = [
    {
      q: 'How do I place an order?',
      a: 'Ordering takes 4 simple steps: 1. Select your research compounds and quantities from our catalogue. 2. Fill the compliance checkout form with your delivery address. 3. Click "Send order on WhatsApp" to open WhatsApp with your pre-filled requisition. 4. Our team confirms availability, final total, shipping and payment details with you directly on WhatsApp.'
    },
    {
      q: 'What does "per vial" mean?',
      a: 'Every price shown is for one single sealed vial containing the strength listed on the card.'
    },
    {
      q: 'How long does shipping take?',
      a: 'Orders are packed promptly after order confirmation. [FILL IN: typical delivery timeframe, e.g. 2 to 5 business days].'
    },
    {
      q: 'How are products packaged?',
      a: 'All vials are shipped in protective, insulated packaging to ensure they arrive safely at your address.'
    },
    {
      q: 'How do I contact customer support?',
      a: 'You can email us at [FILL IN: support email address] or call [FILL IN: support phone number]. We are here to help.'
    }
  ];

  return (
    <>
      <SEO
        title="Frequently Asked Questions"
        description="Helpful answers to common questions about products, ordering, and delivery at MOG WRLD."
        canonicalPath="/faq"
        faqItems={faqList}
        breadcrumbs={[{ name: 'FAQ', url: '/faq' }]}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs items={[{ name: 'FAQ', url: '/faq' }]} />

        <div className="py-8 border-b border-[var(--border)] mb-10">
          <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-[var(--ink)] mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-sm sm:text-base text-[var(--ink-muted)] leading-relaxed">
            Quick, simple answers to common questions about ordering and delivery.
          </p>
        </div>

        <div className="space-y-6">
          <FAQAccordion items={faqList} />
        </div>
      </div>
    </>
  );
}
