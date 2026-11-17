import React, { useState, useEffect, useMemo } from 'react';
import {
  Activity,
  Users,
  ShoppingBag,
  CreditCard,
  Clock,
  Search,
  Filter,
  RefreshCw,
  Download,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Phone,
  Mail,
  Building2,
  Calendar,
  ExternalLink,
  ChevronRight,
  X,
  Package,
  Layers,
  Sparkles,
  ShieldCheck,
  Radio
} from 'lucide-react';
import { safeApiFetch } from '../utils/api';

export default function AdminActivity() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState({
    metrics: { totalCustomers: 0, totalOrders: 0, totalRevenueInr: 0, pendingOrders: 0 },
    customers: [],
    orders: [],
    feed: []
  });

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'orders' | 'registrations'
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [syncStatus, setSyncStatus] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);

  // Inspector Modal State
  const [selectedItem, setSelectedItem] = useState(null); // { type, item }
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Copy helper
  const handleCopy = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(String(text));
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Fetch activity feed
  const loadActivityData = async (showRefreshSpinner = false) => {
    if (showRefreshSpinner) setRefreshing(true);
    try {
      // 1. Collect any client-side registrations/orders stored on this browser
      let clientUsers = [];
      let clientOrders = [];
      try {
        const clientUsersRaw = localStorage.getItem('mogwrld_client_users');
        const clientOrdersRaw = localStorage.getItem('mogwrld_client_orders');
        clientUsers = clientUsersRaw ? JSON.parse(clientUsersRaw) : [];
        clientOrders = clientOrdersRaw ? JSON.parse(clientOrdersRaw) : [];
      } catch (_) {}

      // 2. Automatically push client-stored records to server database/blobs
      if (clientUsers.length > 0 || clientOrders.length > 0) {
        try {
          await fetch('/api/admin/activity/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ users: clientUsers, orders: clientOrders })
          });
        } catch (_) {}
      }

      // 3. Fetch server records
      let json = null;
      try {
        const res = await fetch('/api/admin/activity');
        if (res.ok) {
          json = await res.json();
        }
      } catch (_) {}

      if (!json || !Array.isArray(json.customers)) {
        json = { metrics: { totalCustomers: 0, totalOrders: 0, totalRevenueInr: 0, pendingOrders: 0 }, customers: [], orders: [], feed: [] };
      }

      // 4. Guarantee any client users/orders stored in this browser are merged into view
      const mergedCustomers = [...(json.customers || [])];
      for (const cu of clientUsers) {
        if (cu && cu.email && !mergedCustomers.some((ec) => ec.email?.toLowerCase() === cu.email.toLowerCase())) {
          mergedCustomers.unshift({
            id: cu.id || ('usr_' + Date.now()),
            name: cu.name || cu.email.split('@')[0],
            email: cu.email,
            phone: cu.phone || null,
            role: cu.role || 'customer',
            emailVerified: true,
            disabled: false,
            orderCount: 0,
            totalSpentInr: 0,
            createdAt: cu.created_at || new Date().toISOString()
          });
        }
      }

      const mergedOrders = [...(json.orders || [])];
      for (const co of clientOrders) {
        const coId = co.orderId || co.orderNumber || co.id;
        if (coId && !mergedOrders.some((eo) => (eo.orderNumber || eo.id) === coId)) {
          mergedOrders.unshift(co);
        }
      }

      // 5. Reconstruct combined chronological feed
      const feed = [];
      for (const c of mergedCustomers) {
        feed.push({
          type: 'registration',
          id: 'reg_' + (c.id || c.email),
          timestamp: c.createdAt || c.created_at || new Date().toISOString(),
          customer: c
        });
      }
      for (const o of mergedOrders) {
        feed.push({
          type: 'order',
          id: 'ord_' + (o.orderNumber || o.order_number || o.id),
          timestamp: o.createdAt || o.created_at || new Date().toISOString(),
          order: o
        });
      }
      feed.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setData({
        metrics: {
          totalCustomers: mergedCustomers.length,
          totalOrders: mergedOrders.length,
          totalRevenueInr: mergedOrders.reduce((sum, o) => sum + (Number(o.totalInr || o.total_inr || o.total) || 0), 0),
          pendingOrders: mergedOrders.filter((o) => (o.status || 'Pending') === 'Pending').length
        },
        customers: mergedCustomers,
        orders: mergedOrders,
        feed
      });
    } catch (err) {
      console.error('[Admin Activity] Load error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadActivityData();
  }, []);

  // Real-time polling every 12 seconds when autoRefresh is enabled
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      loadActivityData(false);
    }, 12000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Sync client/remote records manually
  const handleManualSync = async () => {
    setRefreshing(true);
    setSyncStatus('Synchronizing all remote & client records...');
    try {
      const clientUsersRaw = localStorage.getItem('mogwrld_client_users');
      const clientOrdersRaw = localStorage.getItem('mogwrld_client_orders');
      const clientUsers = clientUsersRaw ? JSON.parse(clientUsersRaw) : [];
      const clientOrders = clientOrdersRaw ? JSON.parse(clientOrdersRaw) : [];

      const syncRes = await fetch('/api/admin/activity/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ users: clientUsers, orders: clientOrders })
      });

      if (syncRes.ok) {
        const result = await syncRes.json();
        setSyncStatus(`Sync complete: ${result.addedUsers || 0} user(s) and ${result.addedOrders || 0} order(s) processed.`);
        if (result.feed) {
          setData(result.feed);
        } else {
          loadActivityData(false);
        }
      }
    } catch (err) {
      setSyncStatus('Sync encountered an error: ' + err.message);
    } finally {
      setRefreshing(false);
      setTimeout(() => setSyncStatus(null), 4000);
    }
  };

  // Update order status directly from inspector
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/orders/admin/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        // Update local state
        setData((prev) => {
          const updatedOrders = prev.orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o));
          const updatedFeed = prev.feed.map((f) => {
            if (f.type === 'order' && f.order?.id === orderId) {
              return { ...f, order: { ...f.order, status: newStatus } };
            }
            return f;
          });
          return { ...prev, orders: updatedOrders, feed: updatedFeed };
        });

        if (selectedItem && selectedItem.type === 'order') {
          setSelectedItem((prev) => ({
            ...prev,
            item: { ...prev.item, status: newStatus }
          }));
        }
      }
    } catch (err) {
      alert('Failed to update order status: ' + err.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (activeTab === 'orders' || activeTab === 'all') {
      const headers = ['Order Number', 'Date', 'Customer Name', 'Email', 'Phone', 'Institution', 'Address', 'City', 'Postal Code', 'Total INR', 'Status', 'Payment ID'];
      const rows = data.orders.map((o) => [
        `"${o.order_number || o.id}"`,
        `"${new Date(o.created_at).toISOString()}"`,
        `"${(o.customer_name || '').replace(/"/g, '""')}"`,
        `"${(o.email || '').replace(/"/g, '""')}"`,
        `"${(o.phone || '').replace(/"/g, '""')}"`,
        `"${(o.institution || '').replace(/"/g, '""')}"`,
        `"${(o.address || '').replace(/"/g, '""')}"`,
        `"${(o.city || '').replace(/"/g, '""')}"`,
        `"${(o.postal_code || '').replace(/"/g, '""')}"`,
        o.total_inr || 0,
        `"${o.status}"`,
        `"${o.payment_id || ''}"`
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `mogwrld_orders_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const headers = ['Customer Name', 'Email', 'Phone', 'Registered Date', 'Order Count', 'Total Spent INR', 'Verified'];
      const rows = data.customers.map((c) => [
        `"${(c.name || '').replace(/"/g, '""')}"`,
        `"${(c.email || '').replace(/"/g, '""')}"`,
        `"${(c.phone || '').replace(/"/g, '""')}"`,
        `"${new Date(c.createdAt).toISOString()}"`,
        c.orderCount || 0,
        c.totalSpentInr || 0,
        c.emailVerified ? 'Yes' : 'No'
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `mogwrld_customers_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Filtered feed
  const filteredFeed = useMemo(() => {
    return data.feed.filter((item) => {
      // Tab filter
      if (activeTab === 'orders' && item.type !== 'order') return false;
      if (activeTab === 'registrations' && item.type !== 'registration') return false;

      // Status filter
      if (statusFilter !== 'all') {
        if (item.type === 'order') {
          if ((item.order?.status || '').toLowerCase() !== statusFilter.toLowerCase()) return false;
        } else if (item.type === 'registration') {
          if (statusFilter === 'Paid' || statusFilter === 'Pending') return false;
        }
      }

      // Search query
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        if (item.type === 'order') {
          const o = item.order || {};
          const matchOrder =
            (o.orderNumber || '').toLowerCase().includes(q) ||
            (o.customerName || '').toLowerCase().includes(q) ||
            (o.email || '').toLowerCase().includes(q) ||
            (o.phone || '').toLowerCase().includes(q) ||
            (o.city || '').toLowerCase().includes(q) ||
            (o.address || '').toLowerCase().includes(q) ||
            (o.paymentId || '').toLowerCase().includes(q) ||
            o.items?.some((it) => (it.name || '').toLowerCase().includes(q) || (it.sku || '').toLowerCase().includes(q));
          if (!matchOrder) return false;
        } else if (item.type === 'registration') {
          const c = item.customer || {};
          const matchCust =
            (c.name || '').toLowerCase().includes(q) ||
            (c.email || '').toLowerCase().includes(q) ||
            (c.phone || '').toLowerCase().includes(q) ||
            (c.defaultAddress?.city || '').toLowerCase().includes(q);
          if (!matchCust) return false;
        }
      }

      return true;
    });
  }, [data.feed, activeTab, statusFilter, searchTerm]);

  // Relative time helper
  const getRelativeTime = (isoString) => {
    if (!isoString) return 'Just now';
    const diff = Date.now() - new Date(isoString).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(isoString).toLocaleDateString();
  };

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'paid':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'delivered':
        return 'bg-teal-500/10 text-teal-400 border-teal-500/30';
      case 'shipped':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'processing':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'cancelled':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      default:
        return 'bg-zinc-800 text-zinc-400 border-zinc-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold font-mono tracking-tight text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              <span>Live Submissions & Activity Center</span>
            </h1>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>LIVE FEED</span>
            </div>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time notifications and complete records of customer registrations, checkout details, and incoming orders.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Auto Refresh Toggle */}
          <button
            type="button"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
              autoRefresh
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
            title="Auto-refresh every 12 seconds"
          >
            <Radio className={`w-3.5 h-3.5 ${autoRefresh ? 'animate-pulse text-emerald-400' : ''}`} />
            <span>{autoRefresh ? 'Auto-Sync: On' : 'Auto-Sync: Off'}</span>
          </button>

          {/* Sync Remote Records */}
          <button
            type="button"
            onClick={handleManualSync}
            disabled={refreshing}
            className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            title="Synchronize offline or Netlify records to SQLite"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-emerald-400' : ''}`} />
            <span className="hidden sm:inline">Sync Records</span>
          </button>

          {/* Export CSV */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer"
            title="Download CSV spreadsheet"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Sync Status Alert */}
      {syncStatus && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2 animate-fade-in font-mono">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{syncStatus}</span>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 hover:border-zinc-700/80 transition-all">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-mono uppercase tracking-wider">Registered Accounts</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-2">
            {data.metrics.totalCustomers}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1 flex items-center gap-1.5">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Active registered buyers</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 hover:border-zinc-700/80 transition-all">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-mono uppercase tracking-wider">Total Requisitions</span>
            <ShoppingBag className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-2">
            {data.metrics.totalOrders}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1 flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>{data.metrics.pendingOrders} pending fulfillment</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 hover:border-zinc-700/80 transition-all">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-mono uppercase tracking-wider">Collected Revenue</span>
            <CreditCard className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-2">
            ₹{data.metrics.totalRevenueInr.toLocaleString()}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">
            Settled via Razorpay
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 hover:border-zinc-700/80 transition-all">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-mono uppercase tracking-wider">Fulfillment Status</span>
            <Package className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-2">
            {data.metrics.pendingOrders > 0 ? `${data.metrics.pendingOrders} Pending` : 'All Clear'}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">
            Cold-chain dispatch queue
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 bg-zinc-950/80 p-1 rounded-xl border border-zinc-800 text-xs w-full md:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex-1 md:flex-initial text-center ${
              activeTab === 'all'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            All Submissions ({data.feed.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex-1 md:flex-initial text-center ${
              activeTab === 'orders'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Orders ({data.orders.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('registrations')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex-1 md:flex-initial text-center ${
              activeTab === 'registrations'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Customer Signups ({data.customers.length})
          </button>
        </div>

        {/* Search & Status Filters */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search name, phone, email, order #..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 font-mono focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Main Feed List */}
      <div className="rounded-2xl border border-zinc-800 overflow-hidden bg-zinc-950/40 divide-y divide-zinc-800/60">
        {loading ? (
          <div className="py-20 text-center text-zinc-500 flex flex-col items-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
            <span className="text-xs font-mono">Loading real-time submissions...</span>
          </div>
        ) : filteredFeed.length === 0 ? (
          <div className="py-16 text-center text-zinc-500 text-xs flex flex-col items-center gap-2">
            <InboxEmptyIcon className="w-8 h-8 text-zinc-600" />
            <span>No activity records match your current filter.</span>
          </div>
        ) : (
          filteredFeed.map((item) => {
            const isOrder = item.type === 'order';
            const o = item.order || {};
            const c = item.customer || {};

            return (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="p-4 hover:bg-zinc-900/50 transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 group"
              >
                {/* Left Side Info */}
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                      isOrder
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500/20'
                        : 'bg-purple-500/10 border-purple-500/20 text-purple-400 group-hover:bg-purple-500/20'
                    } transition-colors`}
                  >
                    {isOrder ? <ShoppingBag className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-semibold tracking-wide ${
                          isOrder
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                        }`}
                      >
                        {isOrder ? `ORDER #${o.orderNumber || o.id}` : 'NEW REGISTRATION'}
                      </span>

                      <span className="text-xs font-semibold text-zinc-100 group-hover:text-emerald-400 transition-colors">
                        {isOrder ? o.customerName : c.name}
                      </span>

                      <span className="text-[11px] text-zinc-500 font-mono">
                        • {getRelativeTime(item.timestamp)}
                      </span>
                    </div>

                    {/* Contact & Meta Sub-row */}
                    <div className="flex items-center gap-3 text-xs text-zinc-400 flex-wrap">
                      <span className="flex items-center gap-1 font-mono text-zinc-300">
                        <Mail className="w-3 h-3 text-zinc-500" />
                        <span>{isOrder ? o.email : c.email}</span>
                      </span>

                      {(isOrder ? o.phone : c.phone) && (
                        <span className="flex items-center gap-1 font-mono text-emerald-400/90">
                          <Phone className="w-3 h-3 text-emerald-500" />
                          <span>{isOrder ? o.phone : c.phone}</span>
                        </span>
                      )}

                      {isOrder && o.city && (
                        <span className="flex items-center gap-1 text-zinc-400">
                          <MapPin className="w-3 h-3 text-zinc-500" />
                          <span>
                            {o.city}
                            {o.postalCode ? `, ${o.postalCode}` : ''}
                          </span>
                        </span>
                      )}

                      {!isOrder && c.orderCount !== undefined && (
                        <span className="text-[11px] font-mono text-zinc-500">
                          {c.orderCount} order(s) placed
                        </span>
                      )}
                    </div>

                    {/* Order Items Preview (If Order) */}
                    {isOrder && Array.isArray(o.items) && o.items.length > 0 && (
                      <div className="text-[11px] text-zinc-500 pt-0.5 line-clamp-1">
                        <span className="text-zinc-400">Items: </span>
                        {o.items.map((it, idx) => (
                          <span key={idx}>
                            {it.quantity}x {it.name || it.productName || 'Compound'}
                            {it.strength ? ` (${it.strength})` : ''}
                            {idx < o.items.length - 1 ? ', ' : ''}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Side Stats & Actions */}
                <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
                  {isOrder ? (
                    <div className="text-right">
                      <div className="text-sm font-bold font-mono text-white">
                        ₹{(o.totalInr || 0).toLocaleString()}
                      </div>
                      <div className="mt-1 flex items-center gap-1.5 justify-end">
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded border ${getStatusBadge(
                            o.status
                          )}`}
                        >
                          {o.status || 'Pending'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-right">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {c.emailVerified ? 'VERIFIED BUYER' : 'REGISTERED'}
                      </span>
                      <div className="text-[10px] text-zinc-500 font-mono mt-1">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  )}

                  <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-white group-hover:border-zinc-700 transition-all">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Detail Slide-over / Modal Inspector */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-5 border-b border-zinc-800/80 bg-zinc-900/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                    selectedItem.type === 'order'
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                      : 'bg-purple-500/10 border-purple-500/20 text-purple-400'
                  }`}
                >
                  {selectedItem.type === 'order' ? (
                    <ShoppingBag className="w-5 h-5" />
                  ) : (
                    <Users className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
                    <span>
                      {selectedItem.type === 'order'
                        ? `Order Details: #${selectedItem.item.orderNumber || selectedItem.item.id}`
                        : `Customer Record: ${selectedItem.item.name}`}
                    </span>
                  </h3>
                  <p className="text-[11px] text-zinc-400 font-mono">
                    Received on {new Date(selectedItem.item.createdAt || selectedItem.item.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs">
              {/* Order Inspector View */}
              {selectedItem.type === 'order' ? (
                <>
                  {/* Status & Payment Card */}
                  <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-zinc-500">Payment & Status</span>
                      <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">
                        ₹{(selectedItem.item.totalInr || 0).toLocaleString()} {selectedItem.item.currency || 'INR'}
                      </div>
                      <div className="text-[11px] text-zinc-400 font-mono mt-1">
                        Gateway: Razorpay Standard Web Checkout
                      </div>
                    </div>

                    <div className="space-y-1.5 sm:text-right">
                      <span className="text-[10px] font-mono text-zinc-500">Update Order Status:</span>
                      <div>
                        <select
                          disabled={updatingStatus}
                          value={selectedItem.item.status || 'Pending'}
                          onChange={(e) =>
                            handleUpdateOrderStatus(
                              selectedItem.item.id || selectedItem.item.orderNumber,
                              e.target.value
                            )
                          }
                          className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs font-mono text-white focus:outline-none cursor-pointer"
                        >
                          <option value="Paid">Paid</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Pending">Pending</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Customer Information Card */}
                  <div className="p-4 rounded-2xl bg-zinc-900/30 border border-zinc-800/60 space-y-3">
                    <h4 className="font-mono font-semibold text-zinc-200 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-emerald-400" />
                        <span>Customer Contact Details</span>
                      </span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <span className="text-[10px] font-mono text-zinc-500">Full Name</span>
                        <div className="font-semibold text-zinc-200 text-sm">
                          {selectedItem.item.customerName || 'Customer'}
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-mono text-zinc-500">Email Address</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-zinc-300">{selectedItem.item.email}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(selectedItem.item.email, 'email')}
                            className="text-zinc-500 hover:text-white"
                            title="Copy email"
                          >
                            {copiedKey === 'email' ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-mono text-zinc-500">Phone Number</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-emerald-400 font-medium">
                            {selectedItem.item.phone || 'Not provided'}
                          </span>
                          {selectedItem.item.phone && (
                            <button
                              type="button"
                              onClick={() => handleCopy(selectedItem.item.phone, 'phone')}
                              className="text-zinc-500 hover:text-white"
                              title="Copy phone"
                            >
                              {copiedKey === 'phone' ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-mono text-zinc-500">Institution / Facility</span>
                        <div className="text-zinc-300">
                          {selectedItem.item.institution || 'Independent Research Laboratory'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Delivery / Shipping Address Card */}
                  <div className="p-4 rounded-2xl bg-zinc-900/30 border border-zinc-800/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-mono font-semibold text-zinc-200 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-emerald-400" />
                        <span>Laboratory Delivery Address</span>
                      </h4>

                      <button
                        type="button"
                        onClick={() =>
                          handleCopy(
                            `${selectedItem.item.customerName}\n${selectedItem.item.address}\n${selectedItem.item.city || ''} ${selectedItem.item.postalCode || ''}\n${selectedItem.item.country || 'India'}\nPhone: ${selectedItem.item.phone || ''}`,
                            'address'
                          )
                        }
                        className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-mono flex items-center gap-1 transition-colors"
                      >
                        {copiedKey === 'address' ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>Copied Label!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Shipping Label</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 font-mono text-zinc-300 space-y-1">
                      <div className="font-bold text-white">{selectedItem.item.customerName}</div>
                      <div>{selectedItem.item.address || 'Address line missing'}</div>
                      <div>
                        {selectedItem.item.city}
                        {selectedItem.item.postalCode ? `, ${selectedItem.item.postalCode}` : ''}
                      </div>
                      <div>{selectedItem.item.country || 'India'}</div>
                      {selectedItem.item.phone && (
                        <div className="text-emerald-400 pt-1">Tel: {selectedItem.item.phone}</div>
                      )}
                    </div>
                  </div>

                  {/* Items Ordered Table */}
                  <div className="p-4 rounded-2xl bg-zinc-900/30 border border-zinc-800/60 space-y-3">
                    <h4 className="font-mono font-semibold text-zinc-200 flex items-center gap-1.5">
                      <Package className="w-4 h-4 text-emerald-400" />
                      <span>Order Items ({selectedItem.item.items?.length || 0})</span>
                    </h4>

                    <div className="rounded-xl border border-zinc-800 overflow-hidden bg-zinc-950">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-zinc-800 bg-zinc-900/60 font-mono text-zinc-400 text-[11px]">
                            <th className="p-2.5">Item</th>
                            <th className="p-2.5 text-center">Qty</th>
                            <th className="p-2.5 text-right">Price</th>
                            <th className="p-2.5 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/60">
                          {selectedItem.item.items?.map((it, idx) => (
                            <tr key={idx}>
                              <td className="p-2.5">
                                <div className="font-semibold text-zinc-200">
                                  {it.name || it.productName || 'Research Reagent'}
                                </div>
                                <div className="text-[10px] font-mono text-zinc-500">
                                  {it.strength || it.selectedStrength || it.variantLabel || 'Standard'} • SKU: {it.sku || 'N/A'}
                                </div>
                              </td>
                              <td className="p-2.5 text-center font-mono text-zinc-300">
                                {it.quantity || 1}
                              </td>
                              <td className="p-2.5 text-right font-mono text-zinc-400">
                                ₹{(it.unitPriceInr || it.priceInr || it.price || 0).toLocaleString()}
                              </td>
                              <td className="p-2.5 text-right font-mono font-bold text-white">
                                ₹{((it.unitPriceInr || it.priceInr || it.price || 0) * (it.quantity || 1)).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Payment Gateway Trace */}
                  {(selectedItem.item.paymentId || selectedItem.item.razorpayOrderId) && (
                    <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80 font-mono text-[11px] space-y-1">
                      <span className="text-zinc-500 block uppercase font-bold">Razorpay Transaction Verification:</span>
                      {selectedItem.item.paymentId && (
                        <div className="flex items-center justify-between text-zinc-300">
                          <span>Payment ID:</span>
                          <span className="text-emerald-400">{selectedItem.item.paymentId}</span>
                        </div>
                      )}
                      {selectedItem.item.razorpayOrderId && (
                        <div className="flex items-center justify-between text-zinc-300">
                          <span>Razorpay Order ID:</span>
                          <span>{selectedItem.item.razorpayOrderId}</span>
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                /* Registration Inspector View */
                <>
                  <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-3">
                    <span className="text-[10px] font-mono uppercase text-zinc-500">Account Summary</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <span className="text-[10px] font-mono text-zinc-500">Full Name</span>
                        <div className="text-base font-bold text-white">{selectedItem.item.name}</div>
                      </div>

                      <div>
                        <span className="text-[10px] font-mono text-zinc-500">Email Address</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-zinc-300">{selectedItem.item.email}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(selectedItem.item.email, 'cust_email')}
                            className="text-zinc-500 hover:text-white"
                          >
                            {copiedKey === 'cust_email' ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-mono text-zinc-500">Mobile Phone</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-emerald-400 font-semibold">
                            {selectedItem.item.phone || 'No phone registered'}
                          </span>
                          {selectedItem.item.phone && (
                            <button
                              type="button"
                              onClick={() => handleCopy(selectedItem.item.phone, 'cust_phone')}
                              className="text-zinc-500 hover:text-white"
                            >
                              {copiedKey === 'cust_phone' ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-mono text-zinc-500">Account Status</span>
                        <div className="mt-0.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                              selectedItem.item.disabled
                                ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            }`}
                          >
                            {selectedItem.item.disabled ? 'DISABLED' : 'ACTIVE BUYER'}
                          </span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-mono text-zinc-500">Registered Date</span>
                        <div className="font-mono text-zinc-300">
                          {new Date(selectedItem.item.createdAt).toLocaleString()}
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-mono text-zinc-500">Lifetime Orders & Spend</span>
                        <div className="font-mono text-white font-bold">
                          {selectedItem.item.orderCount || 0} order(s) • ₹{(selectedItem.item.totalSpentInr || 0).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Default Address (if saved) */}
                  {selectedItem.item.defaultAddress ? (
                    <div className="p-4 rounded-2xl bg-zinc-900/30 border border-zinc-800/60 space-y-2">
                      <span className="text-[10px] font-mono uppercase text-zinc-500">Saved Primary Address</span>
                      <div className="p-3 rounded-xl bg-zinc-950 font-mono text-zinc-300 text-xs">
                        <div>{selectedItem.item.defaultAddress.addressLine1}</div>
                        {selectedItem.item.defaultAddress.addressLine2 && (
                          <div>{selectedItem.item.defaultAddress.addressLine2}</div>
                        )}
                        <div>
                          {selectedItem.item.defaultAddress.city}, {selectedItem.item.defaultAddress.postalCode}
                        </div>
                        <div>{selectedItem.item.defaultAddress.country}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-zinc-900/20 border border-zinc-800/40 text-center text-zinc-500 text-xs font-mono">
                      No standalone address saved in profile yet (address will appear upon their first checkout).
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-mono transition-colors cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InboxEmptyIcon(props) {
  return (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </svg>
  );
}
