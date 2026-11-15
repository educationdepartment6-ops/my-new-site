const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://mogwrld.com';
const distDir = path.join(__dirname, '..', 'dist');
const templateHtml = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8');

const products = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'products.json'), 'utf8'));
const categories = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'categories.json'), 'utf8'));

// All routes
const staticRoutes = [
  { path: '/', title: 'MOG WRLD — Research Compounds & Biochemicals', description: 'High-purity laboratory research compounds and biochemicals. Third-party verified with batch-specific COAs. For laboratory research use only.', priority: '1.0' },
  { path: '/shop', title: 'All Research Compounds & Biochemicals | mog wrld', description: 'Comprehensive catalogue of high-purity laboratory research compounds. HPLC purity ≥98%, third-party batch verified.', priority: '0.9' },
  { path: '/coa', title: 'Certificates of Analysis (COA) Library | mog wrld', description: 'Searchable batch library of analytical HPLC chromatograms and mass spectrometry test reports for MOG WRLD research compounds.', priority: '0.8' },
  { path: '/quality', title: 'Quality & Analytical Verification Protocols | mog wrld', description: 'Detailed guide to HPLC purity testing, LC-MS mass confirmation, and lot-specific COA verification for MOG WRLD research compounds.', priority: '0.7' },
  { path: '/about', title: 'About Our Laboratory Standards | mog wrld', description: 'MOG WRLD provides analytical-grade laboratory biochemicals and research compounds. Learn about our synthesis purity and verification protocols.', priority: '0.6' },
  { path: '/faq', title: 'Frequently Asked Questions (FAQ) | mog wrld', description: 'Common questions regarding research peptide purity, storage protocols, compliance verification, and shipping procedures.', priority: '0.7' },
  { path: '/contact', title: 'Institutional & Laboratory Inquiries | mog wrld', description: 'Contact MOG WRLD for institutional bulk orders, customized peptide synthesis inquiries, and analytical documentation.', priority: '0.5' },
  { path: '/shipping-returns', title: 'Cold-Chain Logistics & Return Guidelines | mog wrld', description: 'Preservation standards, insulated thermal packaging, and laboratory shipment dispatch guidelines.', priority: '0.5' },
  { path: '/legal/terms', title: 'Terms of Supply & Laboratory Service | mog wrld', description: 'Standard terms and conditions governing laboratory reagent sales and institutional requisitions.', priority: '0.3', noindex: true },
  { path: '/legal/privacy', title: 'Privacy & Data Protection Policy | mog wrld', description: 'Data retention and institutional privacy safeguards at MOG WRLD.', priority: '0.3', noindex: true },
  { path: '/legal/research-use-policy', title: 'Research Use Only (RUO) Compliance Policy | mog wrld', description: 'Statutory policy governing laboratory chemical supply. Materials are strictly for in vitro research, not for human or veterinary administration.', priority: '0.5' },
  { path: '/legal/refund-policy', title: 'Refund & Damaged Reagent Policy | mog wrld', description: 'Guidelines on damaged vial replacement and non-returnable chemical reagents.', priority: '0.3', noindex: true },
];

const categoryRoutes = Object.values(categories).map(cat => ({
  path: `/category/${cat.slug}`,
  title: `${cat.name} Research Compounds | mog wrld`,
  description: `Explore high-purity ${cat.name} for laboratory research. HPLC verified purity ≥98%, batch-specific COAs. For in vitro research use only.`,
  priority: '0.8',
  category: cat
}));

const productRoutes = products.map(prod => ({
  path: `/product/${prod.slug}`,
  title: `${prod.name} Research Compound | mog wrld`,
  description: prod.shortDescription.length > 155 ? `${prod.shortDescription.slice(0, 152)}...` : prod.shortDescription,
  priority: '0.9',
  product: prod
}));

const allPages = [...staticRoutes, ...categoryRoutes, ...productRoutes];

console.log(`Pre-rendering ${allPages.length} routes for crawler-ready static HTML...`);

// Render each route
allPages.forEach(page => {
  const canonicalUrl = `${SITE_URL}${page.path === '/' ? '' : page.path}`;
  let html = templateHtml;

  // Title & description replacement
  html = html.replace(/<title>.*?<\/title>/i, `<title>${page.title}</title>`);
  html = html.replace(/<meta name="description" content=".*?" \/>/i, `<meta name="description" content="${escapeHtml(page.description)}" />`);

  // Canonical tag & open graph
  const headAdditions = [
    `<link rel="canonical" href="${canonicalUrl}" />`,
    `<link rel="alternate" hrefLang="en" href="${canonicalUrl}" />`,
    page.noindex ? `<meta name="robots" content="noindex, nofollow" />` : `<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />`,
    `<meta property="og:title" content="${page.title}" />`,
    `<meta property="og:description" content="${escapeHtml(page.description)}" />`,
    `<meta property="og:url" content="${canonicalUrl}" />`,
    `<meta property="og:site_name" content="MOG WRLD" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:image" content="${SITE_URL}/og-image.png" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${page.title}" />`,
    `<meta name="twitter:description" content="${escapeHtml(page.description)}" />`,
    `<meta name="twitter:image" content="${SITE_URL}/og-image.png" />`
  ];

  // Structured Data injection
  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'MOG WRLD',
    url: SITE_URL,
    logo: `${SITE_URL}/brand/logo.png`,
    description: 'Supplier of analytical and laboratory research compounds.'
  };
  headAdditions.push(`<script type="application/ld+json">${JSON.stringify(orgSchema)}</script>`);

  if (page.product) {
    const prod = page.product;
    const lowestPrice = Math.min(...prod.variants.map(v => v.price));
    const prodSchema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: prod.name,
      description: prod.shortDescription,
      sku: prod.primarySku,
      image: `${SITE_URL}/brand/logo.png`,
      category: 'Scientific & Laboratory Reagents',
      offers: {
        '@type': 'Offer',
        price: lowestPrice,
        priceCurrency: 'USD',
        availability: prod.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        itemCondition: 'https://schema.org/NewCondition',
        url: canonicalUrl
      }
    };
    headAdditions.push(`<script type="application/ld+json">${JSON.stringify(prodSchema)}</script>`);
  }

  if (page.category && page.category.faq) {
    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: page.category.faq.map(item => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.a
        }
      }))
    };
    headAdditions.push(`<script type="application/ld+json">${JSON.stringify(faqSchema)}</script>`);
  }

  // Pre-rendered semantic crawler content inside root
  const preContent = generateSemanticContent(page);
  html = html.replace('<div id="root"></div>', `<div id="root">${preContent}</div>`);
  html = html.replace('</head>', `${headAdditions.join('\n    ')}\n  </head>`);

  // Determine output filepath
  if (page.path === '/') {
    fs.writeFileSync(path.join(distDir, 'index.html'), html);
  } else {
    const routeDir = path.join(distDir, page.path.replace(/^\//, ''));
    fs.mkdirSync(routeDir, { recursive: true });
    fs.writeFileSync(path.join(routeDir, 'index.html'), html);
  }
});

// Generate static redirect HTML files for legacy URLs
const legacyRedirects = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'legacy_redirects.json'), 'utf8'));
let redirectCount = 0;
for (const [oldSlug, target] of Object.entries(legacyRedirects)) {
  const targetUrl = `/product/${target.compoundSlug}?strength=${encodeURIComponent(target.strength)}`;
  const redirectHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Redirecting to ${escapeHtml(target.compoundSlug)}...</title>
  <meta http-equiv="refresh" content="0; url=${targetUrl}">
  <link rel="canonical" href="${SITE_URL}${targetUrl}">
  <script>window.location.replace('${targetUrl}');</script>
</head>
<body>
  <p>Redirecting to <a href="${targetUrl}">${escapeHtml(target.compoundSlug)} (${escapeHtml(target.strength)})</a>...</p>
</body>
</html>`;

  const oldRouteDir = path.join(distDir, 'product', oldSlug);
  fs.mkdirSync(oldRouteDir, { recursive: true });
  fs.writeFileSync(path.join(oldRouteDir, 'index.html'), redirectHtml);
  redirectCount++;
}
console.log(`Generated ${redirectCount} static redirect pages for legacy URLs.`);

// Generate sitemap.xml
const indexablePages = allPages.filter(p => !p.noindex);
const today = new Date().toISOString().split('T')[0];

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${indexablePages.map(p => `  <url>
    <loc>${SITE_URL}${p.path === '/' ? '' : p.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.path === '/' || p.path === '/shop' ? 'daily' : 'weekly'}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

// Copy public assets to dist
function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}
const publicDir = path.join(__dirname, '..', 'public');
copyDir(publicDir, distDir);

fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemapXml);
console.log(`Generated dist/sitemap.xml with ${indexablePages.length} indexable URLs.`);

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function generateSemanticContent(page) {
  if (page.product) {
    const p = page.product;
    return `
      <main class="static-content" style="padding: 2rem; max-width: 1200px; margin: 0 auto; font-family: sans-serif;">
        <nav aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/shop">Shop</a> / <a href="/category/${p.category}">${p.categoryName}</a> / <span>${escapeHtml(p.name)}</span></nav>
        <span style="font-size: 0.75rem; text-transform: uppercase; font-weight: bold; color: #8E9298;">For Laboratory Research Use Only</span>
        <h1>${escapeHtml(p.name)} — Research Compound</h1>
        <p><strong>Primary SKU:</strong> ${p.primarySku} | <strong>Purity:</strong> ${p.purity} | <strong>CAS:</strong> ${p.casNumber || 'N/A'}</p>
        <p>${escapeHtml(p.shortDescription)}</p>
        <h2>Available Specifications</h2>
        <ul>${p.variants.map(v => `<li><strong>${escapeHtml(v.strength)}</strong> (SKU: ${v.sku}) — ₹${(v.priceInr ?? v.price).toLocaleString()} [In Stock]</li>`).join('')}</ul>
      </main>
    `;
  }
  if (page.category) {
    const c = page.category;
    return `
      <main class="static-content" style="padding: 2rem; max-width: 1200px; margin: 0 auto; font-family: sans-serif;">
        <nav aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/shop">Shop</a> / <span>${escapeHtml(c.name)}</span></nav>
        <span style="font-size: 0.75rem; text-transform: uppercase; font-weight: bold; color: #8E9298;">Laboratory Research Catalogue</span>
        <h1>${escapeHtml(c.name)} Research Compounds</h1>
        <p>${escapeHtml(c.description)}</p>
      </main>
    `;
  }
  return `
    <main class="static-content" style="padding: 2rem; max-width: 1200px; margin: 0 auto; font-family: sans-serif;">
      <h1>${escapeHtml(page.title)}</h1>
      <p>${escapeHtml(page.description)}</p>
    </main>
  `;
}
