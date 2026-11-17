const { getCustomers, getOrders, saveCustomer, saveOrder } = require('./utils/blobStore');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-Requested-With, Accept',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  // Handle POST (Sync from client or admin)
  if (event.httpMethod === 'POST') {
    let body = {};
    try {
      body = event.body ? JSON.parse(event.body) : {};
    } catch (_) {}

    const users = Array.isArray(body.users) ? body.users : [];
    const orders = Array.isArray(body.orders) ? body.orders : [];

    for (const u of users) {
      if (u && u.email) {
        await saveCustomer({
          id: u.id || ('usr_' + Date.now()),
          name: u.name || u.email.split('@')[0],
          email: u.email.toLowerCase(),
          phone: u.phone || null,
          role: u.role || 'customer',
          emailVerified: !!u.email_verified || !!u.emailVerified,
          disabled: false,
          orderCount: u.orderCount || 0,
          totalSpentInr: u.totalSpentInr || 0,
          createdAt: u.created_at || u.createdAt || new Date().toISOString()
        });
      }
    }

    for (const o of orders) {
      if (o) {
        await saveOrder(o);
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, syncedUsers: users.length, syncedOrders: orders.length })
    };
  }

  // Handle GET (Fetch all activity feed)
  const customers = await getCustomers();
  const orders = await getOrders();

  const totalCustomers = customers.length;
  const totalOrders = orders.length;
  const totalRevenueInr = orders.reduce((sum, o) => sum + (Number(o.totalInr || o.total_inr || o.total) || 0), 0);
  const pendingOrders = orders.filter((o) => (o.status || 'Pending') === 'Pending').length;

  const feed = [];
  for (const c of customers) {
    feed.push({
      type: 'registration',
      id: 'reg_' + (c.id || c.email),
      timestamp: c.createdAt || new Date().toISOString(),
      customer: c
    });
  }
  for (const o of orders) {
    feed.push({
      type: 'order',
      id: 'ord_' + (o.orderNumber || o.order_number || o.id),
      timestamp: o.createdAt || o.created_at || new Date().toISOString(),
      order: o
    });
  }
  feed.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      metrics: {
        totalCustomers,
        totalOrders,
        totalRevenueInr,
        pendingOrders
      },
      customers,
      orders,
      feed
    })
  };
};