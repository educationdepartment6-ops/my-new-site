/**
 * Centralized WhatsApp Business Configuration
 * Business WhatsApp: +91 9270465829
 * International format without symbols: 919270465829
 */

export const WHATSAPP_NUMBER = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_WHATSAPP_NUMBER)
  || '919270465829';

export const WHATSAPP_DISPLAY = '+91 9270465829';

/**
 * Builds the plain text WhatsApp message for an order request.
 * Strictly adheres to plain text with \n line breaks.
 */
export function formatWhatsAppOrderMessage(order) {
  const {
    orderNumber = order.orderId || 'MW-000000',
    customer = {},
    items = [],
    totalInr = order.total || 0
  } = order;

  const name = customer.fullName || customer.name || order.customer_name || 'Customer';
  const phone = customer.phone || order.phone || '';
  const email = customer.email || order.email || '';

  const addressParts = [
    customer.address || order.address || '',
    customer.city || order.city || '',
    customer.postalCode || customer.postal_code || order.postal_code || '',
    customer.state || order.state || '',
    customer.country || order.country || 'India'
  ].filter(Boolean);
  const formattedAddress = addressParts.join(', ');

  // Format line items compactly
  const itemsText = items.map((it, idx) => {
    const prodName = it.productName || it.name || 'Compound';
    const strength = it.variantLabel || it.strength || it.selectedStrength || 'Standard';
    const code = it.sku || it.productCode || it.code || 'SKU';
    const qty = it.quantity || 1;
    const unitPrice = Number(it.unitPriceInr ?? it.unitPrice ?? it.price ?? 0);
    const lineTotal = Number(it.totalInr ?? (unitPrice * qty));
    return `${idx + 1}. ${prodName} - ${strength} (${code}) x ${qty} - Rs ${lineTotal.toLocaleString('en-IN')}`;
  }).join('\n');

  const formattedTotal = Number(totalInr).toLocaleString('en-IN');

  const message = [
    `New order request: ${orderNumber}`,
    `Name: ${name}`,
    `Phone: ${phone}`,
    `Email: ${email}`,
    `Address: ${formattedAddress}`,
    '',
    'Items:',
    itemsText,
    '',
    `Total: Rs ${formattedTotal}`,
    '',
    'Please confirm availability, final total, shipping and payment details.'
  ].join('\n');

  return message;
}

/**
 * Builds the wa.me URL for the business WhatsApp with pre-filled message.
 */
export function getWhatsAppOrderUrl(order) {
  const message = formatWhatsAppOrderMessage(order);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/**
 * Builds the wa.me URL to chat with a customer or general support.
 */
export function getWhatsAppChatUrl(phone = WHATSAPP_NUMBER, customText = '') {
  const cleanPhone = String(phone).replace(/[^0-9]/g, '');
  const url = `https://wa.me/${cleanPhone}`;
  return customText ? `${url}?text=${encodeURIComponent(customText)}` : url;
}