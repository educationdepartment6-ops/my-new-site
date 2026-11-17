const { getStore } = require('@netlify/blobs');

let inMemoryFallback = {
  customers: [],
  orders: []
};

async function getStoreSafe() {
  try {
    return getStore({ name: 'mogwrld-activity', consistency: 'strong' });
  } catch (err) {
    return null;
  }
}

async function getCustomers() {
  const store = await getStoreSafe();
  if (store) {
    try {
      const data = await store.get('customers', { type: 'json' });
      if (Array.isArray(data)) return data;
    } catch (_) {}
  }
  return inMemoryFallback.customers;
}

async function saveCustomer(customer) {
  const list = await getCustomers();
  const index = list.findIndex(c => c.email && c.email.toLowerCase() === customer.email.toLowerCase());
  if (index >= 0) {
    list[index] = { ...list[index], ...customer };
  } else {
    list.unshift(customer);
  }
  inMemoryFallback.customers = list;
  const store = await getStoreSafe();
  if (store) {
    try {
      await store.setJSON('customers', list);
    } catch (err) {
      console.warn('[BlobStore] Error saving customers to Netlify Blobs:', err.message);
    }
  }
  return list;
}

async function getOrders() {
  const store = await getStoreSafe();
  if (store) {
    try {
      const data = await store.get('orders', { type: 'json' });
      if (Array.isArray(data)) return data;
    } catch (_) {}
  }
  return inMemoryFallback.orders;
}

async function saveOrder(order) {
  const list = await getOrders();
  const id = order.orderNumber || order.order_number || order.id;
  const index = list.findIndex(o => (o.orderNumber || o.order_number || o.id) ==: id);
  if (index >= 0) {
    list[index] = { ...list[index], ...order };
  } else {
    list.unshift(order);
  }
  inMemoryFallback.orders = list;
  const store = await getStoreSafe();
  if (store) {
    try {
      await store.setJSON('orders', list);
    } catch (err) {
      console.warn('[BlobStore] Error saving orders to Netlify Blobs:', err.message);
    }
  }
  return list;
}

module.exports = {
  getCustomers,
  saveCustomer,
  getOrders,
  saveOrder
};