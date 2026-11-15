const MARKUP_MULTIPLIER = parseFloat(import.meta.env.VITE_MARKUP_MULTIPLIER || '1.0');
const INR_RATE = parseFloat(import.meta.env.VITE_CURRENCY_RATE_INR || '86.5');

export function calculatePrice(supplierPrice) {
  const numericPrice = typeof supplierPrice === 'number' ? supplierPrice : parseFloat(supplierPrice) || 0;
  return Math.round(numericPrice * MARKUP_MULTIPLIER * 100) / 100;
}

export function formatPrice(amountOrItem, currency = 'INR', options = {}) {
  const { perVial = false } = typeof options === 'boolean' ? { perVial: options } : options;
  const suffix = perVial ? ' / vial' : '';

  let numeric = 0;
  if (amountOrItem && typeof amountOrItem === 'object') {
    if (currency === 'INR') {
      numeric = amountOrItem.priceInr ?? amountOrItem.unitPriceInr ?? amountOrItem.price ?? 0;
    } else {
      numeric = amountOrItem.priceUsd ?? amountOrItem.unitPriceUsd ?? (amountOrItem.priceInr ? (amountOrItem.priceInr / INR_RATE) : (amountOrItem.price ?? 0));
    }
  } else {
    numeric = typeof amountOrItem === 'number' ? amountOrItem : parseFloat(amountOrItem) || 0;
  }

  if (currency === 'INR') {
    return `₹${Math.round(numeric).toLocaleString('en-IN')}${suffix}`;
  }
  return `$${Number(numeric).toFixed(2)}${suffix}`;
}

