# MOG WRLD — SEO & Crawler Optimization Dossier

## 1. Technical SEO Architecture Implemented

| Requirement | Implementation Detail | Status |
|---|---|---|
| **Static Pre-Rendering (SSG)** | Real, crawler-ready HTML generated at build time for all 68 routes (homepage, categories, compounds, COA archive, information, and legal policies). | Passed |
| **Title Tags** | Custom, distinct `<title>` per page adhering to `{Compound} Research Compound \| mog wrld` (≤ 60 characters). | Passed |
| **Meta Descriptions** | Unique, factual mechanism summaries (≤ 155 characters) without therapeutic assertions or keyword stuffing. | Passed |
| **Canonical Links** | Explicit `<link rel="canonical" href="https://mogwrld.com/..." />` configured on all indexable URLs. | Passed |
| **Robots Directives** | `index, follow` across catalogue and informative pages. `noindex, nofollow` on `/cart`, `/checkout`, `/order-confirmation`, and 404. | Passed |
| **Open Graph & Twitter Cards** | 1200×630 OG image, summary card tags, clean title and description metadata on every route. | Passed |
| **JSON-LD Schema** | - `Organization` with logo, URL, and laboratory entity descriptors.<br>- `WebSite` with `SearchAction` (`/shop?q={search_term_string}`).<br>- `BreadcrumbList` on all sub-pages.<br>- `Product` + `Offer` on all product routes (price, currency, sku, availability). Strictly **NO** `Drug`, medical, or unverified review markup.<br>- `FAQPage` on Homepage, Category pages, and `/faq`. | Passed |
| **Heading Structure** | Strict semantic hierarchy: exactly one `<h1>` per page, followed by logical `<h2>` and `<h3>` landmarks. | Passed |
| **Sitemap & Robots** | Automated build generation of `/sitemap.xml` (65 verified URLs) and `/robots.txt` specifying sitemap location and crawl rules. | Passed |
| **Multilingual & Localization** | `hreflang="en"` tags declared, configurable `SITE_URL` and `MARKUP_MULTIPLIER` in `.env`. | Passed |
| **Performance & Core Web Vitals** | Route-level lazy loading, Google Fonts preconnect with `font-display: swap`, responsive WebP/SVG vector graphics, sub-millisecond static loads. | Passed |

---

## 2. Sitemap Submission Instructions

### Google Search Console (GSC)
1. Log in to [Google Search Console](https://search.google.com/search-console).
2. Add your domain property (e.g. `mogwrld.com`) using DNS TXT record verification.
3. In the left navigation menu, navigate to **Indexing > Sitemaps**.
4. Under **"Add a new sitemap"**, enter `sitemap.xml` (full URL: `https://mogwrld.com/sitemap.xml`).
5. Click **Submit**. Verify that the status reports **"Success"** and all 65 URLs are discovered.

### Bing Webmaster Tools
1. Log in to [Bing Webmaster Tools](https://www.bing.com/webmasters).
2. Import verified site from Google Search Console, or verify via DNS/HTML tag.
3. In the sidebar, select **Sitemaps > Submit sitemap**.
4. Input `https://mogwrld.com/sitemap.xml` and click **Submit**.

---

## 3. Crawl Verification Verification Command
To verify that real HTML is served to search engines without requiring client JavaScript:
```bash
curl -A "Googlebot" https://mogwrld.com/product/bpc-157
```
Check that the response contains:
- `<title>BPC-157 Research Compound | mog wrld</title>`
- `<script type="application/ld+json">{"@context":"https://schema.org","@type":"Product"...`
- `<h1>BPC-157 — Research Compound</h1>`
