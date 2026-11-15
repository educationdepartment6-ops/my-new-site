import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  RefreshCw,
  UploadCloud,
  Plus,
  Edit2,
  Phone,
  AlertCircle
} from 'lucide-react';
import { safeApiFetch } from '../utils/api';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [syncStatus, setSyncStatus] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    password: ''
  });

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      // 1. Sync any client-side accounts stored in this browser to the server database
      try {
        const clientUsersRaw = localStorage.getItem('mogwrld_client_users');
        if (clientUsersRaw) {
          const clientUsers = JSON.parse(clientUsersRaw);
          if (Array.isArray(clientUsers) && clientUsers.length > 0) {
            const syncRes = await safeApiFetch('/api/auth/sync-client-users', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ users: clientUsers })
            });
            if (syncRes && syncRes.added > 0) {
              setSyncStatus(`Synced ${syncRes.added} new customer account(s) to database.`);
            }
          }
        }
      } catch (_) {}

      // 2. Fetch server customers
      const res = await safeApiFetch('/api/admin/customers');
      let list = Array.isArray(res) ? res : [];

      // 3. Merge with localStorage client users to guarantee they always appear
      try {
        const clientUsersRaw = localStorage.getItem('mogwrld_client_users');
        if (clientUsersRaw) {
          const clientUsers = JSON.parse(clientUsersRaw);
          if (Array.isArray(clientUsers)) {
            for (const cu of clientUsers) {
              if (cu && cu.email && !list.some((existing) => existing.email?.toLowerCase() === cu.email.toLowerCase())) {
                list.unshift({
                  id: cu.id || ('usr_' + Date.now()),
                  name: cu.name || cu.email.split('@')[0],
                  email: cu.email,
                  phone: cu.phone || null,
                  role: cu.role || 'customer',
                  emailVerified: true,
                  disabled: false,
                  createdAt: cu.created_at || new Date().toISOString(),
                  orderCount: 0
                });
              }
            }
          }
        }
      } catch (_) {}

      setCustomers(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const openCreateModal = () => {
    setModalMode('create');
    setFormData({
      id: '',
      name: '',
      email: '',
      phone: '',
      password: ''
    });
    setModalError('');
    setIsModalOpen(true);
  };

  const openEditModal = (c) => {
    setModalMode('edit');
    setFormData({
      id: c.id,
      name: c.name || '',
      email: c.email || '',
      phone: c.phone || '',
      password: ''
    });
    setModalError('');
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setModalError('');

    const cleanPhone = formData.phone.trim().replace(/[\s\-\(\)\.]/g, '');
    let normalizedPhone = null;
    if (/^\+91[6-9]\d{9}$/.test(cleanPhone)) {
      normalizedPhone = cleanPhone;
    } else if (/^91[6-9]\d{9}$/.test(cleanPhone)) {
      normalizedPhone = '+' + cleanPhone;
    } else if (/^[6-9]\d{9}$/.test(cleanPhone)) {
      normalizedPhone = '+91' + cleanPhone;
    }

    if (!normalizedPhone) {
      setModalError('A valid 10-digit Indian mobile number is mandatory (starts with 6, 7, 8, or 9).');
      return;
    }

    setModalLoading(true);

    try {
      if (modalMode === 'create') {
        if (!formData.email.trim()) {
          setModalError('Customer email is required.');
          setModalLoading(false);
          return;
        }

        await safeApiFetch('/api/admin/customers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name.trim(),
            email: formData.email.trim(),
            phone: normalizedPhone,
            password: formData.password || undefined
          })
        });
        setSyncStatus(`Created new customer ${formData.email} with mobile ${normalizedPhone}`);
      } else {
        await safeApiFetch(`/api/admin/customers/${formData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name.trim(),
            phone: normalizedPhone
          })
        });
        setSyncStatus(`Updated customer profile (mobile: ${normalizedPhone})`);
      }

      setIsModalOpen(false);
      fetchCustomers();
    } catch (err) {
      setModalError(err.message || 'Operation failed. Please check inputs.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleToggleStatus = async (customer) => {
    const nextDisabled = !customer.disabled;
    try {
      await safeApiFetch(`/api/admin/customers/${customer.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ disabled: nextDisabled })
      });
      setCustomers((prev) =>
        prev.map((c) => (c.id === customer.id ? { ...c, disabled: nextDisabled } : c))
      );
    } catch (err) {
      alert(err.message);
    }
  };

  const filtered = customers.filter((c) => {
    if (filter === 'verified' && !c.emailVerified) return false;
    if (filter === 'disabled' && !c.disabled) return false;
    if (filter === 'missing_phone' && c.phone) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = c.name?.toLowerCase().includes(q);
      const matchEmail = c.email?.toLowerCase().includes(q);
      const matchPhone = c.phone?.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchPhone) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold font-mono tracking-tight text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            <span>Registered Customers ({customers.length})</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Customer directory with mandatory Indian phone verification, order counts, and access controls.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-emerald-500/10"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Customer</span>
          </button>
          <button
            onClick={fetchCustomers}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 text-xs font-mono transition-colors cursor-pointer"
            title="Sync Accounts from Client & Server"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Sync Accounts</span>
          </button>
          <button
            onClick={fetchCustomers}
            className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {syncStatus && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center justify-between font-mono animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{syncStatus}</span>
          </div>
          <button onClick={() => setSyncStatus(null)} className="text-emerald-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by customer name, email, or mobile..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-950/70 border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-zinc-500 font-mono">Status:</span>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs focus:outline-none"
          >
            <option value="all">All Accounts ({customers.length})</option>
            <option value="verified">Verified Only</option>
            <option value="disabled">Disabled Accounts</option>
            <option value="missing_phone">Missing Phone</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-zinc-800 overflow-hidden bg-zinc-950/40">
        {loading ? (
          <div className="py-20 text-center text-zinc-500 flex flex-col items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
            <span className="text-xs font-mono">Loading Customers...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-zinc-500 text-xs">No registered customer accounts found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/80 text-zinc-400 font-mono">
                  <th className="py-3 px-4 font-medium">Customer</th>
                  <th className="py-3 px-4 font-medium">Email</th>
                  <th className="py-3 px-4 font-medium">Mandatory Mobile</th>
                  <th className="py-3 px-4 font-medium">Email Verified</th>
                  <th className="py-3 px-4 font-medium">Registered</th>
                  <th className="py-3 px-4 font-medium">Orders</th>
                  <th className="py-3 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-sans">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-zinc-200">{c.name}</div>
                      <div className="text-[11px] font-mono text-zinc-500">ID: {c.id?.slice(0, 12)}</div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-zinc-300">
                      {c.email}
                    </td>

                    <td className="py-3.5 px-4 font-mono">
                      {c.phone ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-emerald-400 font-mono text-xs">
                          <Phone className="w-3 h-3 text-emerald-400" />
                          <span>{c.phone}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono text-[11px]">
                          <AlertCircle className="w-3 h-3" />
                          <span>Phone Missing (Gated)</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {c.emailVerified ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-mono">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Verified</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px] font-mono">
                          <XCircle className="w-3 h-3" />
                          <span>Unverified</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-zinc-400">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-semibold text-zinc-200">
                      {c.orderCount}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(c)}
                          className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                          title="Edit Customer & Phone"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleToggleStatus(c)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-colors cursor-pointer ${
                            c.disabled
                              ? 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                          }`}
                        >
                          {c.disabled ? 'Disabled' : 'Active'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer Modal (Create or Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl animate-fade-in text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h2 className="text-base font-bold font-mono text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>{modalMode === 'create' ? 'Create Customer' : 'Edit Customer & Phone'}</span>
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-500 hover:text-zinc-300 cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            {modalError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleModalSubmit} className="space-y-4">
              <div>
                <label className="block text-zinc-400 mb-1 font-mono">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Rajesh Kumar"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-mono">Email Address *</label>
                <input
                  type="email"
                  required
                  disabled={modalMode === 'edit'}
                  placeholder="customer@laboratory.in"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  className={`w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-emerald-500 ${
                    modalMode === 'edit' ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-mono">Mandatory Mobile Number *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    placeholder="9876543210 or +91 9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                    className="w-full pl-9 pr-3 p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <p className="text-[10px] text-zinc-500 mt-1 font-mono">
                  Must be 10-digit Indian mobile starting with 6–9 (stored as +91XXXXXXXXXX).
                </p>
              </div>

              {modalMode === 'create' && (
                <div>
                  <label className="block text-zinc-400 mb-1 font-mono">Initial Password (Optional)</label>
                  <input
                    type="text"
                    placeholder="Default: Customer2026!"
                    value={formData.password}
                    onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                    className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              )}

              <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-mono cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer flex items-center gap-2"
                >
                  {modalLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{modalMode === 'create' ? 'Create Customer' : 'Save Customer'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
