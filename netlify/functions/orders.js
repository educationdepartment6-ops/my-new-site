const { getOrders, saveOrder } = require('./utils/blobStore');
const productsCatalog = require('../../src/data/products.json');

function calculateServerOrderTotal(items) {
  let totalInr = 0;
  const verifiedItems = [];

  for (const item of (items || [])) {
    const qty = parseInt(item.quantity, 10);
    if (isNaN(qty) || qty <= 0) continue;

    const sku = (item.sku || '').trim().toUpperCase();
    const slug = (item.productSlug || item.slug || item.productId || item.id || '').trim().toLowerCase();

    let matchedPrice = null;
    let matchedName = item.productName || item.name || 'Research Compound';
    let matchedSku = sku || 'SKU-GEN';

    if (sku) {
      for (const prod of productsCatalog) {
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

    if (matchedPrice === null && slug) {
      const prod = productsCatalog.find((p) => p.slug === slug || p.id === slug);
      if (prod) {
        matchedPrice = typeof prod.priceInr === 'number' ? prod.priceInr : prod.price;
        matchedName = prod.name;
        matchedSku = prod.primarySku || prod.id;
      }
    }

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

  return { totalInr, verifiedItems };
}

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-Requested-With, Accept, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  try {
    if (event.httpMethod === 'GET') {
      const orders = await getOrders();
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(orders)
      };
    }

    if (event.httpMethod === 'POST') {
      const body = event.body ? JSON.parse(event.body) : {};
      const { customer, items } = body;

      if (!customer) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Customer details are required' })
        };
      }

      const name = customer.fullName || customer.name || '';
      const email = (customer.email || '').trim().toLowerCase();
      const phone = customer.phone || '';
      const address = customer.address || '';
      const city = customer.city || '';
      const state = customer.state || '';
      const postalCode = customer.postalCode || customer.postal_code || '';

      if (!name.trim()) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Customer name is required' }) };
      }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'A valid email address is required' }) };
      }
      if (!phone.trim()) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'A valid phone number is required' }) };
      }
      if (!address.trim() || !city.trim() || !state.trim() || !postalCode.trim()) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Full delivery address (street, city, state, postal code) is required' }) };
      }
      if (!Array.isArray(items) || items.length === 0) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'At least one item is required' }) };
      }

      const { totalInr, verifiedItems } = calculateServerOrderTotal(items);

      const existingOrders = await getOrders();
      const nextNum = (existingOrders.length || 0) + 1;
      const orderId = body.orderId || body.order_number || `MW-${String(nextNum).padStart(6, '0')}`;
      const now = new Date().toISOString();

      const newOrder = {
        id: orderId,
        orderNumber: orderId,
        customerName: name.trim(),
        email,
        phone: phone.trim(),
        institution: customer.institution || '',
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        postalCode: postalCode.trim(),
        country: customer.country || 'India',
        items: verifiedItems,
        totalInr,
        currency: 'INR',
        status: 'New - awaiting WhatsApp confirmation',
        notes: body.notes || '',
        trackingNumber: body.trackingNumber || '',
        createdAt: now
      };

      await saveOrder(newOrder);

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({
          success: true,
          orderId,
          orderNumber: orderId,
          status: newOrder.status,
          totalInr,
          currency: 'INR',
          items: verifiedItems,
          createdAt: now
        })
      };
    }

    if (event.httpMethod === 'PUT') {
      const body = event.body ? JSON.parse(event.body) : {};
      const { status, notes, trackingNumber } = body;
      const orders = await getOrders();
      const parts = (event.path || '').split('/');
      const orderId = parts[parts.length - 1];
      const found = orders.find(o => (o.orderNumber || o.id) === orderId);

      if (found) {
        if (status) found.status = status;
        if (notes !== undefined) found.notes = notes;
        if (trackingNumber !== undefined) found.trackingNumber = trackingNumber;
        await saveOrder(found);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, order: found })
        };
      }

      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Order not found' })
      };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message || 'Server error' })
    };
  }
};
