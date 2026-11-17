# MOG WRLD — Research Compound E-Commerce Platform

A fast, modern, fully responsive e-commerce web platform engineered for **MOG WRLD** laboratory research compounds and biochemicals. Built with React 19, Vite, Tailwind CSS v4, Zustand, and automated Static Site Generation (SSG) for complete SEO optimization.

> [!IMPORTANT]
> **Regulatory Notice:** Confirm with a qualified regulatory professional that your products and marketing comply with Indian (CDSCO / Drugs and Cosmetics Act, 1940) and destination-country laws before launch. Materials are strictly supplied for laboratory research use only.

---

## 1. Features & Architecture

- **Visual Brand Concept**: Premium silver/chrome laboratory aesthetic with metallic swooshes, hexagonal molecular icons, Orbitron display typography, and Inter body text. Full dark mode support via `prefers-color-scheme`.
- **Static Pre-Rendering (SSG)**: 68 routes are automatically pre-rendered to pure HTML at build time (`dist/`), ensuring search engine crawlers (Googlebot, Bingbot) receive 100% semantic content and complete JSON-LD structured data on initial load.
- **Strict Compliance Enforcement**:
  - First-visit **Age & Research Eligibility Gate modal** (18+ acknowledgement stored in `localStorage`).
  - Prominent statutory disclaimers on every product page, cart drawer, and checkout.
  - Zero medical or therapeutic claims anywhere on the site.
  - Required checkout research use declaration checkbox.
  - Separate `products.restricted.json` quarantining 18 pharmaceutical/controlled items away from public routes and sitemaps.
- **E-Commerce & Reagent Management**:
  - Persistent shopping cart drawer (Zustand + `localStorage`).
  - Real-time client-side fuzzy search (Fuse.js).
  - Multi-variant selector (vial sizes, kits, batch numbers).
  - Multi-currency preview (USD and INR toggle).
  - Searchable Certificate of Analysis (COA) batch archive.
  - Validated checkout flow (React Hook Form + Zod) with clean payment gateway abstraction.

---

## 2. Getting Started

### Prerequisites
- Node.js (v18+ or v24+)
- npm

### Installation
```bash
cd react-app
npm.cmd install
```

### Local Development Server
```bash
npm.cmd run dev
```
Open [http://localhost:5173/](http://localhost:5173/) in your browser.

### Production Build & SSG Pre-Rendering
```bash
npm.cmd run build
```
This command compiles client assets via Vite and executes `scripts/prerender.cjs` to generate:
- Static `.html` files for every route in `dist/`.
- Valid XML sitemap in `dist/sitemap.xml` (65 verified URLs).
- `dist/robots.txt`.

### Preview Production Build
```bash
npm.cmd run preview
```

---

## 3. Deployment

### Vercel
1. Import repository into Vercel.
2. Framework Preset: **Vite**.
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Configure Environment Variables in Project Settings.

### Netlify
1. Build command: `npm run build`
2. Publish directory: `dist`
3. Add a `public/_redirects` file if SPA fallback is desired:
   ```
   /*    /index.html   200
   ```

### Cloudflare Pages
1. Build command: `npm run build`
2. Build output directory: `dist`

---

## 4. Product Catalog Management

- **Public Research Catalog**: `/src/data/products.json`
  - 49 verified research molecules (BPC-157, TB-500, GHK-Cu, NAD+, MOTS-c, SS-31, Retatrutide, etc.).
  - To add a compound, append an entry following the schema:
    ```json
    {
      "slug": "new-compound",
      "name": "New Compound",
      "category": "tissue-repair",
      "categoryName": "Tissue Repair & Cellular Integrity",
      "primarySku": "NC5",
      "casNumber": "0000-00-0",
      "purity": "≥98.0% (HPLC)",
      "shortDescription": "Factual non-clinical description...",
      "researchSummary": "Peer-reviewed mechanism summary...",
      "specifications": {
        "sequence": "...",
        "form": "Lyophilized powder",
        "storage": "Store desiccated at -20°C",
        "diluentRequirement": "Sterile Bacteriostatic Water"
      },
      "variants": [
        { "label": "5mg/vial (Pack of 10)", "sku": "NC5", "supplierPrice": 45.00, "price": 45.00, "inStock": true, "batchNumber": "MW-NC-26A" }
      ],
      "coaUrl": "/coa/samples/COA_NC5.pdf",
      "inStock": true,
      "featured": false
    }
    ```
- **Restricted Compounds**: `/src/data/products.restricted.json`
  - Quarantined prescription and controlled substances (Tirzepatide, Semaglutide, HGH 191AA, Botox, etc.).
  - This file is strictly excluded from client routing, search indexing, and sitemaps.

---

## 5. Placeholders to Fill Before Commercial Launch

1. **Logo File Assets**: Replace `/public/brand/logo.png` and `/public/brand/logo.svg` with your finalized high-resolution wordmark assets.
2. **COA PDF Reports**: Upload actual laboratory analytical HPLC/MS test reports into `/public/coa/samples/` matching your batch numbers.
3. **Legal Entity Data**: Update the legal company name, registered laboratory address, CIN, and CDSCO license numbers in:
   - `src/components/common/Footer.jsx`
   - `src/pages/AboutPage.jsx`
   - `src/pages/legal/ResearchUsePolicyPage.jsx`
4. **Order Processing**: Orders are placed via the automated WhatsApp order confirmation flow (+91 9270465829) with manual settlement.
