import React from 'react';
import { Helmet } from 'react-helmet-async';

const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://mogwrld.com').replace(/\/$/, '');
const DEFAULT_TITLE = 'mog wrld | Research Compounds & Biochemicals';
const DEFAULT_DESCRIPTION = 'High-purity laboratory research compounds and biochemicals. Third-party verified with batch-specific COAs. For laboratory research use only.';
const OG_IMAGE = `${SITE_URL}/og-image.png`;

export default function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  canonicalPath = '',
  noindex = false,
  structuredData = null,
  ogType = 'website',
  productData = null,
  faqItems = null,
  breadcrumbs = null,
}) {
  const fullTitle = title
    ? (title.includes('mog wrld') ? title : `${title} | mog wrld`)
    : DEFAULT_TITLE;

  // Trim meta description to <= 155 chars
  const trimmedDescription = description.length > 155
    ? `${description.substring(0, 152).trim()}...`
    : description;

  const canonicalUrl = `${SITE_URL}${canonicalPath ? (canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`) : ''}`;

  // Organization Schema
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'MOG WRLD',
    url: SITE_URL,
    logo: `${SITE_URL}/brand/logo.png`,
    description: 'Supplier of analytical and laboratory research compounds.',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Institutional Customer Service',
      url: `${SITE_URL}/contact`,
    },
  };

  // WebSite with SearchAction
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'MOG WRLD Research Compounds',
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/shop?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  // Breadcrumbs Schema
  let breadcrumbSchema = null;
  if (breadcrumbs && breadcrumbs.length > 0) {
    breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((crumb, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: crumb.name,
        item: crumb.url.startsWith('http') ? crumb.url : `${SITE_URL}${crumb.url}`,
      })),
    };
  }

  // Product + Offer Schema (Strictly compliant: NO Drug, NO medical, NO fake reviews)
  let productSchema = null;
  if (productData) {
    productSchema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: productData.name,
      description: productData.shortDescription || trimmedDescription,
      sku: productData.primarySku,
      image: `${SITE_URL}/brand/logo.png`,
      category: 'Scientific & Laboratory Reagents',
      offers: {
        '@type': 'Offer',
        price: productData.price,
        priceCurrency: 'USD',
        availability: productData.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        itemCondition: 'https://schema.org/NewCondition',
        url: canonicalUrl,
      },
    };
  }

  // FAQPage Schema
  let faqSchema = null;
  if (faqItems && faqItems.length > 0) {
    faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqItems.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.a,
        },
      })),
    };
  }

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={trimmedDescription} />
      <link rel="canonical" href={canonicalUrl} />
      <link rel="alternate" hrefLang="en" href={canonicalUrl} />

      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
      )}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={trimmedDescription} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content="MOG WRLD" />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={OG_IMAGE} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={trimmedDescription} />
      <meta name="twitter:image" content={OG_IMAGE} />

      {/* Structured Data */}
      <script type="application/ld+json">{JSON.stringify(organizationSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(websiteSchema)}</script>
      {breadcrumbSchema && (
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      )}
      {productSchema && (
        <script type="application/ld+json">{JSON.stringify(productSchema)}</script>
      )}
      {faqSchema && (
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      )}
      {structuredData && (
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      )}
    </Helmet>
  );
}
