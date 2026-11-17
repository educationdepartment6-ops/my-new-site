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
  Building,
  ExternalLink,
  MessageSquare,
  FileText
} from 'lucide-react';
import { getWhatsAppChatUrl } from '../config/whatsapp';

const ORDER_STATUSES = [
  'New - awaiting WhatsApp confirmation',
  'Confirmed on WhatsApp',
  'Payment received',
  'Shipped',
  'Delivered',
  'Cancelled'
];

function WhatsAppIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
    </svg>
  );
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);

  // Notes & Tracking editing state
  const [notesInput, setNotesInput] = useState('');
  const [trackingInput, setTrackingInput] = useState('');
  const [savingDetails, setSavingDetails] = useState(false);
  const [detailsSavedMsg, setDetailsSavedMsg] = useState(false);

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

  useEffect(() => {
    if (selectedOrder) {
      setNotesInput(selectedOrder.notes || '');
      setTrackingInput(selectedOrder.tracking_number || selectedOrder.trackingNumber || '');
      setDetailsSavedMsg(false);
    }
  }, [selectedOrder]);

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

  const handleSaveDetails = async () => {
    if (!selectedOrder) return;
    setSavingDetails(true);
    try {
      const res = await fetch(`/api/orders/admin/${selectedOrder.id}/details`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: notesInput, trackingNumber: trackingInput })
      });
      if (res.ok) {
        const result = await res.json();
        setOrders((prev) =>
          prev.map((o) =>
            o.id === selectedOrder.id
              ? { ...o, notes: notesInput, tracking_number: trackingInput, trackingNumber: trackingInput }
              : o
          )
        );
        setSelectedOrder((prev) => ({
          ...prev,
          notes: notesInput,
          tracking_number: trackingInput,
          trackingNumber: trackingInput
        }));
        setDetailsSavedMsg(true);
        setTimeout(() => setDetailsSavedMsg(false), 2500);
      }
    } catch (err) {
      alert('Failed to save details: ' + err.message);
    } finally {
      setSavingDetails(false);
    }
  };

  const filtered = orders.filter((o) => {
    if (statusFilter !== 'all' && (o.status || '').toLowerCase() !== statusFilter.toLowerCase()) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchNum = (o.order_number || o.id)?.toLowerCase().includes(q);
      const matchName = o.customer_name?.toLowerCase().includes(q);
      const matchEmail = o.email?.toLowerCase().includes(q);
      const matchPhone = o.phone?.toLowerCase().includes(q);
      const matchCity = o.city?.toLowerCase().includes(q);
      const matchState = o.state?.toLowerCase().includes(q);
      const matchZip = o.postal_code?.toLowerCase().includes(q);
      if (!matchNum && !matchName && !matchEmail && !matchPhone && !matchCity && !matchState && !matchZip) return false;
    }
    return true;
  });

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('delivered')) {
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    }
    if (s.includes('shipped')) {
      return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    }
    if (s.includes('payment received') || s.includes('paid')) {
      return 'bg-teal-500/10 text-teal-400 border-teal-500/20';
    }
    if (s.includes('confirmed on whatsapp')) {
      return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
    }
    if (s.includes('new') || s.includes('pending') || s.includes('awaiting')) {
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    }
    if (s.includes('cancel')) {
      return 'bg-red-500/10 text-red-400 border-red-500/20';
    }
    return 'bg-zinc-800 text-zinc-400 border-zinc-700';
  };

  const getCustomerWhatsAppUrl = (order) => {
    const phone = order.phone || '';
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const name = order.customer_name || 'Customer';
    const orderNum = order.order_number || order.id || '';
    const greeting = `Hi ${name}, regarding your order request ${orderNum}...`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(greeting)}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold font-mono tracking-tight text-white flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-emerald-400" />
          <span>Laboratory Requisitions & Orders ({orders.length})</span>
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Review WhatsApp order requests, customer contact details, laboratory shipping addresses, and update fulfillment statuses.
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
            {ORDER_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
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
                      <div>{order.order_number || order.id}</div>
                      <div className="text-[10px] text-zinc-500">
                        {new Date(order.created_at).toLocaleString()}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-zinc-200">{order.customer_name}</div>
                      <div className="text-[11px] text-zinc-400 font-mono">{order.email}</div>
                      {order.phone && (
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-zinc-300 font-mono">{order.phone}</span>
                          <a
                            href={getCustomerWhatsAppUrl(order)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] text-[10px] font-mono transition-colors"
                            title="Chat on WhatsApp"
                          >
                            <WhatsAppIcon className="w-3 h-3" />
                            <span>WhatsApp</span>
                          </a>
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-zinc-300 max-w-xs truncate">
                        {order.address || order.shipping_address || '—'}
                      </div>
                      <div className="text-[10px] text-zinc-500">
                        {[order.city, order.state, order.postal_code, order.country || 'India'].filter(Boolean).join(', ')}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5 max-w-xs">
                        {order.items?.map((it, i) => (
                          <div key={i} className="text-[11px] text-zinc-300">
                            {it.quantity}x {it.name || it.productName} ({it.strength || it.selectedStrength || 'Standard'})
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
                          className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono flex items-center gap-1 transition-all cursor-pointer"
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
                          {ORDER_STATUSES.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
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
                      {selectedOrder.order_number || selectedOrder.id}
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
                <span className="text-xs font-mono text-zinc-400">Order Status:</span>
                <div className="text-sm font-semibold text-white mt-0.5">{selectedOrder.status}</div>
              </div>
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <select
                  value={selectedOrder.status}
                  onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value)}
                  className="px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-zinc-100 text-xs font-mono cursor-pointer focus:outline-none"
                >
                  {ORDER_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => {
                    const label = `SHIP TO:
${selectedOrder.customer_name}
${selectedOrder.institution ? selectedOrder.institution + '\n' : ''}${selectedOrder.address || selectedOrder.shipping_address || ''}
${selectedOrder.city || ''}, ${selectedOrder.state || ''} ${selectedOrder.postal_code || ''}
${selectedOrder.country || 'India'}
Phone: ${selectedOrder.phone || 'N/A'}
Email: ${selectedOrder.email || 'N/A'}
Ref: ${selectedOrder.order_number || selectedOrder.id}`;
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
                          className="text-[10px] text-zinc-400 hover:text-white cursor-pointer"
                        >
                          {copiedKey === 'email' ? 'Copied' : 'Copy'}
                        </button>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px]">PHONE NUMBER (WHATSAPP)</span>
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-medium text-emerald-400">{selectedOrder.phone || 'None provided'}</span>
                      <div className="flex items-center gap-2">
                        {selectedOrder.phone && (
                          <a
                            href={getCustomerWhatsAppUrl(selectedOrder)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#25D366] text-white text-[11px] font-semibold hover:bg-[#20ba59] transition-colors"
                          >
                            <WhatsAppIcon className="w-3 h-3" />
                            <span>Chat on WhatsApp</span>
                          </a>
                        )}
                        {selectedOrder.phone && (
                          <button
                            onClick={() => copyToClipboard(selectedOrder.phone, 'phone')}
                            className="text-[10px] text-zinc-400 hover:text-white cursor-pointer"
                          >
                            {copiedKey === 'phone' ? 'Copied' : 'Copy'}
                          </button>
                        )}
                      </div>
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
                      <span className="text-zinc-500 block text-[10px]">STATE</span>
                      <span className="text-zinc-300 font-mono">{selectedOrder.state || '—'}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-zinc-500 block text-[10px]">PIN / POSTAL CODE</span>
                      <span className="text-zinc-300 font-mono">{selectedOrder.postal_code || '—'}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[10px]">COUNTRY</span>
                      <span className="text-zinc-300 font-mono">{selectedOrder.country || 'India'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Notes & Tracking Number */}
            <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-4">
              <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                <span>Internal Notes & Shipment Tracking</span>
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-zinc-500 text-[10px] uppercase font-mono mb-1">
                    Internal Admin Notes (e.g. Paid via UPI ref 123456789)
                  </label>
                  <textarea
                    rows={3}
                    value={notesInput}
                    onChange={(e) => setNotesInput(e.target.value)}
                    placeholder="Add payment notes, customer preferences, or verification details..."
                    className="w-full p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-emerald-500 text-xs"
                  />
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-zinc-500 text-[10px] uppercase font-mono mb-1">
                      Courier Tracking Number (When Shipped)
                    </label>
                    <input
                      type="text"
                      value={trackingInput}
                      onChange={(e) => setTrackingInput(e.target.value)}
                      placeholder="e.g. DTDC123456789IN / BlueDart 987654"
                      className="w-full p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-emerald-500 text-xs font-mono"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      disabled={savingDetails}
                      onClick={handleSaveDetails}
                      className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-black font-mono font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {savingDetails ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <span>Save Notes & Tracking</span>
                      )}
                    </button>
                    {detailsSavedMsg && (
                      <span className="text-xs text-emerald-400 font-mono animate-fade-in flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>Saved to order!</span>
                      </span>
                    )}
                  </div>
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
                    {selectedOrder.items?.map((item, idx) => {
                      const unitPrice = item.unitPriceInr ?? item.priceInr ?? item.price ?? item.unit_price ?? 0;
                      const lineTotal = item.totalInr ?? (unitPrice * (item.quantity || 1));
                      return (
                        <tr key={idx} className="hover:bg-zinc-900/30">
                          <td className="py-2.5 px-4 font-medium text-white">{item.name || item.productName}</td>
                          <td className="py-2.5 px-4 font-mono text-zinc-400">
                            {item.strength || item.selectedStrength || item.variantLabel || 'Standard Spec'}
                          </td>
                          <td className="py-2.5 px-4 font-mono text-center text-zinc-200">
                            {item.quantity}
                          </td>
                          <td className="py-2.5 px-4 font-mono text-right text-zinc-400">
                            ₹{Number(unitPrice).toLocaleString()}
                          </td>
                          <td className="py-2.5 px-4 font-mono font-semibold text-right text-zinc-100">
                            ₹{Number(lineTotal).toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="border-t border-zinc-800 bg-zinc-900/30 font-mono">
                    <tr>
                      <td colSpan={4} className="py-3 px-4 text-right text-zinc-400">
                        Total Amount:
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

