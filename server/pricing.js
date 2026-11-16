const path = require('path');
const fs = require('fs');

// Load products catalog
let products = [];
try {
  const catalogPath = path.join(__dirname, '..', 'src', 'data', 'products.json');
  if (fs.existsSync(catalogPath)) {
    products = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
  }
} catch (err) {
  console.error('[Pricing] Failed to load catalog from JSON:', err);
}

/**
 * Calculates the authoritative order total on the server using product SKUs and quantities.
 * NEVER trusts any price or total sent from the client browser.
 *
 * @param {Array} items - Array of cart items { sku, productSlug, quantity }
 * @returns {{ totalInr: number, amountPaise: number, verifiedItems: Array }}
 */
function calculateServerOrderTotal(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Cart items array is required to calculate order total');
  }

  let totalInr = 0;
  const verifiedItems = [];

  for (const item of items) {
    const qty = parseInt(item.quantity, 10);
    if (isNaN(qty) || qty <= 0) continue;

    const sku = (item.sku || '').trim().toUpperCase();
    const slug = (item.productSlug || item.slug || item.productId || item.id || '').trim().toLowerCase();

    let matchedPrice = null;
    let matchedName = item.productName || item.name || 'Research Compound';
    let matchedSku = sku || 'SKU-GEN';

    // 1. Match by variant SKU in catalog
    if (sku) {
      for (const prod of products) {
        if (Array.isArray(prod.variants)) {
          const v = prod.variants.find((variant) => (variant.sku || '').toUpperCase() === sku);
          if (v) {
            matchedPrice = typeof v.priceInr === 'number' ? v.priceInr : v.price;
            matchedName = `${prod.name} (${v.label || v.strength || ''})`;
            matchedSku = v.sku;
            break;
          }
        }
      }
    }

    // 2. If SKU didn't match, match by product slug
    if (matchedPrice === null && slug) {
      const prod = products.find((p) => p.slug === slug || p.id === slug);
      if (prod) {
        matchedPrice = typeof prod.priceInr === 'number' ? prod.priceInr : prod.price;
        matchedName = prod.name;
        matchedSku = prod.primarySku || prod.id;
      }
    }

    // 3. Fallback to item unitPrice if catalog missing item, but validate positive number
    if (matchedPrice === null || typeof matchedPrice !== 'number' || isNaN(matchedPrice)) {
      matchedPrice = typeof item.unitPriceInr === 'number'
        ? item.unitPriceInr
        : (typeof item.unitPrice === 'number' ? item.unitPrice : 0);
    }

    const itemTotalInr = matchedPrice * qty;
    totalInr += itemTotalInr;

    verifiedItems.push({
      sku: matchedSku,
      name: matchedName,
      unitPriceInr: matchedPrice,
      quantity: qty,
      totalInr: itemTotalInr
    });
  }

  const amountPaise = Math.round(totalInr * 100);

  return {
    totalInr,
    amountPaise,
    verifiedItems
  };
}

module.exports = {
  calculateServerOrderTotal
};
