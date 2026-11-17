import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  CheckCircle,
  Clock,
  Truck,
  Check,
  Loader2,
  Eye,
  X,
  Copy,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Building,
  ExternalLink
} from 'lucide-react';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders/admin');
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const copyToClipboard = (text, key) => {
    if (!text) return;
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/orders/admin/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
        }
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const filtered = orders.filter((o) => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchNum = o.order_number?.toLowerCase().includes(q);
      const matchName = o.customer_name?.toLowerCase().includes(q);
      const matchEmail = o.email?.toLowerCase().includes(q);
      const matchPhone = o.phone?.toLowerCase().includes(q);
      const matchCity = o.city?.toLowerCase().includes(q);
      const matchZip = o.postal_code?.toLowerCase().includes(q);
      if (!matchNum && !matchName && !matchEmail && !matchPhone && !matchCity && !matchZip) return false;
    }
    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Shipped':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Processing':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default:
        return 'bg-zinc-800 text-zinc-400 border-zinc-700';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold font-mono tracking-tight text-white flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-emerald-400" />
          <span>Laboratory Requisitions & Orders ({orders.length})</span>
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Review customer research requisitions, fulfillment statuses, full addresses, phone numbers, and Razorpay payment details.
        </p>
      </div>

      {/* Filter bar */}
      <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by order #, name, email, phone, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-950/70 border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-700"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-zinc-500 font-mono">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-zinc-800 overflow-hidden bg-zinc-950/40">
        {loading ? (
          <div className="py-20 text-center text-zinc-500 flex flex-col items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
            <span className="text-xs font-mono">Loading Orders...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-zinc-500 text-xs">No orders found matching criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/80 text-zinc-400 font-mono">
                  <th className="py-3 px-4 font-medium">Requisition #</th>
                  <th className="py-3 px-4 font-medium">Customer & Contact</th>
                  <th className="py-3 px-4 font-medium">Shipping Destination</th>
                  <th className="py-3 px-4 font-medium">Items</th>
                  <th className="py-3 px-4 font-medium">Total</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-sans">
                {filtered.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-zinc-900/40 transition-colors group cursor-pointer"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="py-3.5 px-4 font-mono font-medium text-emerald-400">
                      <div>{order.order_number}</div>
                      <div className="text-[10px] text-zinc-500">
                        {new Date(order.created_at).toLocaleString()}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-zinc-200">{order.customer_name}</div>
                      <div className="text-[11px] text-zinc-400 font-mono">{order.email}</div>
                      {order.phone && (
                        <div className="text-[11px] text-zinc-300 font-mono">{order.phone}</div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-zinc-300 max-w-xs truncate">
                        {order.address || order.shipping_address || '—'}
                      </div>
                      <div className="text-[10px] text-zinc-500">
                        {[order.city, order.postal_code, order.country || 'India'].filter(Boolean).join(', ')}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5 max-w-xs">
                        {order.items?.map((it, i) => (
                          <div key={i} className="text-[11px] text-zinc-300">
                            {it.quantity}x {it.name} ({it.strength || it.selectedStrength || 'Standard'})
                          </div>
                        ))}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-semibold text-zinc-100">
                      ₹{order.total_inr?.toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                      <span
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border ${getStatusBadge(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono flex items-center gap-1 transition-all"
                          title="View Full Order & Customer Details"
                        >
                          <Eye className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Details</span>
                        </button>
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                          className="px-2 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs font-mono cursor-pointer focus:outline-none"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Slide-over / Modal for Full Order Inspector */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div
            className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl text-zinc-200 max-h-[90vh] overflow-y-auto space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-lg text-white">
                      {selectedOrder.order_number}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${getStatusBadge(selectedOrder.status)}`}>
                      {selectedOrder.status}
                    </span>
                  </div>
                  <div className="text-xs text-zinc-400 font-mono">
                    Requisition Placed: {new Date(selectedOrder.created_at).toLocaleString()}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Actions & Status Update */}
            <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono text-zinc-400">Fulfillment Pipeline Status:</span>
                <div className="text-sm font-semibold text-white">Current: {selectedOrder.status}</div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={selectedOrder.status}
                  onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value)}
                  className="px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-zinc-100 text-xs font-mono cursor-pointer focus:outline-none"
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>

                <button
                  onClick={() => {
                    const label = `SHIP TO:
${selectedOrder.customer_name}
${selectedOrder.institution ? selectedOrder.institution + '\n' : ''}${selectedOrder.address || selectedOrder.shipping_address || ''}
${selectedOrder.city || ''}, ${selectedOrder.postal_code || ''}
${selectedOrder.country || 'India'}
Phone: ${selectedOrder.phone || 'N/A'}
Email: ${selectedOrder.email || 'N/A'}
Ref: ${selectedOrder.order_number}`;
                    copyToClipboard(label, 'shipping-label');
                  }}
                  className="px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {copiedKey === 'shipping-label' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Shipping Label</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Customer Details & Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-3">
                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Customer Contact Details</span>
                </span>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-zinc-500 block text-[10px]">FULL NAME</span>
                    <span className="font-semibold text-white text-sm">{selectedOrder.customer_name || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px]">EMAIL ADDRESS</span>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-zinc-200">{selectedOrder.email || 'N/A'}</span>
                      {selectedOrder.email && (
                        <button
                          onClick={() => copyToClipboard(selectedOrder.email, 'email')}
                          className="text-[10px] text-zinc-400 hover:text-white"
                        >
                          {copiedKey === 'email' ? 'Copied' : 'Copy'}
                        </button>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px]">PHONE NUMBER</span>
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-medium text-emerald-400">{selectedOrder.phone || 'None provided'}</span>
                      {selectedOrder.phone && (
                        <button
                          onClick={() => copyToClipboard(selectedOrder.phone, 'phone')}
                          className="text-[10px] text-zinc-400 hover:text-white"
                        >
                          {copiedKey === 'phone' ? 'Copied' : 'Copy'}
                        </button>
                      )}
                    </div>
                  </div>
                  {selectedOrder.institution && (
                    <div>
                      <span className="text-zinc-500 block text-[10px]">RESEARCH INSTITUTION / LAB</span>
                      <span className="text-zinc-300">{selectedOrder.institution}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Delivery Address */}
              <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-3">
                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Delivery Destination</span>
                </span>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-zinc-500 block text-[10px]">STREET / FACILITY ADDRESS</span>
                    <p className="text-zinc-200 font-medium whitespace-pre-line">
                      {selectedOrder.address || selectedOrder.shipping_address || 'No street address registered'}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-zinc-500 block text-[10px]">CITY</span>
                      <span className="text-zinc-300 font-mono">{selectedOrder.city || '—'}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[10px]">PIN / POSTAL CODE</span>
                      <span className="text-zinc-300 font-mono">{selectedOrder.postal_code || '—'}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px]">COUNTRY / REGION</span>
                    <span className="text-zinc-300 font-mono">{selectedOrder.country || 'India'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment & Audit Verification */}
            <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-3">
              <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                <span>Razorpay Gateway Payment Audit</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80">
                  <span className="text-zinc-500 text-[10px] block font-mono">PAYMENT ID</span>
                  <div className="font-mono text-zinc-200 truncate mt-0.5" title={selectedOrder.payment_id}>
                    {selectedOrder.payment_id || 'Cash on Delivery / Direct'}
                  </div>
                  {selectedOrder.payment_id && (
                    <button
                      onClick={() => copyToClipboard(selectedOrder.payment_id, 'pid')}
                      className="text-[10px] text-zinc-500 hover:text-emerald-400 mt-1 block"
                    >
                      {copiedKey === 'pid' ? 'Copied' : 'Copy ID'}
                    </button>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80">
                  <span className="text-zinc-500 text-[10px] block font-mono">RAZORPAY ORDER ID</span>
                  <div className="font-mono text-zinc-200 truncate mt-0.5" title={selectedOrder.razorpay_order_id}>
                    {selectedOrder.razorpay_order_id || 'N/A'}
                  </div>
                  {selectedOrder.razorpay_order_id && (
                    <button
                      onClick={() => copyToClipboard(selectedOrder.razorpay_order_id, 'roid')}
                      className="text-[10px] text-zinc-500 hover:text-emerald-400 mt-1 block"
                    >
                      {copiedKey === 'roid' ? 'Copied' : 'Copy ID'}
                    </button>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80">
                  <span className="text-zinc-500 text-[10px] block font-mono">SETTLED AMOUNT</span>
                  <div className="font-mono text-base font-bold text-emerald-400 mt-0.5">
                    ₹{selectedOrder.total_inr?.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono">Paid in Full</span>
                </div>
              </div>
            </div>

            {/* Requisition Line Items */}
            <div className="space-y-3">
              <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider font-semibold">
                Ordered Products & Formulations ({selectedOrder.items?.length || 0})
              </span>
              <div className="border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-950">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-900/60 border-b border-zinc-800 text-zinc-400 font-mono">
                    <tr>
                      <th className="py-2.5 px-4 font-medium">Product / Reagent</th>
                      <th className="py-2.5 px-4 font-medium">Variant / Strength</th>
                      <th className="py-2.5 px-4 font-medium text-center">Qty</th>
                      <th className="py-2.5 px-4 font-medium text-right">Unit Price</th>
                      <th className="py-2.5 px-4 font-medium text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {selectedOrder.items?.map((item, idx) => (
                      <tr key={idx} className="hover:bg-zinc-900/30">
                        <td className="py-2.5 px-4 font-medium text-white">{item.name}</td>
                        <td className="py-2.5 px-4 font-mono text-zinc-400">
                          {item.strength || item.selectedStrength || 'Standard Spec'}
                        </td>
                        <td className="py-2.5 px-4 font-mono text-center text-zinc-200">
                          {item.quantity}
                        </td>
                        <td className="py-2.5 px-4 font-mono text-right text-zinc-400">
                          ₹{(item.price || item.unit_price || 0).toLocaleString()}
                        </td>
                        <td className="py-2.5 px-4 font-mono font-semibold text-right text-zinc-100">
                          ₹{((item.price || item.unit_price || 0) * (item.quantity || 1)).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t border-zinc-800 bg-zinc-900/30 font-mono">
                    <tr>
                      <td colSpan={4} className="py-3 px-4 text-right text-zinc-400">
                        Total Amount Charged:
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-sm text-emerald-400">
                        ₹{selectedOrder.total_inr?.toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
