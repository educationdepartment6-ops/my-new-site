import React, { useState, useEffect } from 'react';
import {
  FileText,
  Upload,
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Download,
  Trash2,
  Edit2,
  Plus,
  Loader2,
  ExternalLink,
  AlertCircle,
  RefreshCw,
  FileCheck
} from 'lucide-react';
import { safeApiFetch } from '../utils/api';
import rawProducts from '../data/products.json';

export default function AdminCOA() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [statusMsg, setStatusMsg] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    id: '',
    productId: '',
    productName: '',
    category: 'general',
    strength: '',
    batchNumber: '',
    testDate: new Date().toISOString().split('T')[0],
    lab: 'Eurofins / Bono Biological',
    isVisible: true,
    file: null
  });

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const data = await safeApiFetch('/api/admin/coa');
      if (Array.isArray(data)) {
        setRecords(data);
      }
    } catch (err) {
      console.error('Failed to fetch COA records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const openNewModal = () => {
    setIsEditing(false);
    setFormData({
      id: '',
      productId: '',
      productName: '',
      category: 'peptides',
      strength: '',
      batchNumber: '',
      testDate: new Date().toISOString().split('T')[0],
      lab: 'Eurofins / Bono Biological',
      isVisible: true,
      file: null
    });
    setModalError('');
    setIsModalOpen(true);
  };

  const openEditModal = (rec) => {
    setIsEditing(true);
    setFormData({
      id: rec.id,
      productId: rec.product_id || '',
      productName: rec.product_name || '',
      category: rec.category || 'peptides',
      strength: rec.strength || '',
      batchNumber: rec.batch_number || '',
      testDate: rec.test_date || '',
      lab: rec.lab || 'Eurofins / Bono Biological',
      isVisible: rec.is_visible === 1,
      file: null
    });
    setModalError('');
    setIsModalOpen(true);
  };

  const handleProductSelect = (prodId) => {
    const selected = rawProducts.find((p) => p.id === prodId);
    if (selected) {
      setFormData((prev) => ({
        ...prev,
        productId: selected.id,
        productName: selected.name,
        category: selected.category || 'peptides',
        strength: selected.variants?.[0]?.strength || ''
      }));
    } else {
      setFormData((prev) => ({ ...prev, productId: '' }));
    }
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!formData.productName.trim()) {
      setModalError('Product name is required.');
      return;
    }
    if (!formData.strength.trim()) {
      setModalError('Specification / strength is required (e.g. 5mg / vial).');
      return;
    }
    if (!formData.batchNumber.trim()) {
      setModalError('Batch number is required.');
      return;
    }

    setModalLoading(true);

    try {
      if (isEditing) {
        // Edit metadata
        await safeApiFetch(`/api/admin/coa/${formData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: formData.productId || null,
            productName: formData.productName.trim(),
            category: formData.category,
            strength: formData.strength.trim(),
            batchNumber: formData.batchNumber.trim(),
            testDate: formData.testDate,
            lab: formData.lab.trim(),
            isVisible: formData.isVisible
          })
        });

        // If a replacement file was also chosen
        if (formData.file) {
          const body = new FormData();
          body.append('pdf', formData.file);
          await safeApiFetch(`/api/admin/coa/${formData.id}/replace-pdf`, {
            method: 'POST',
            body
          });
        }

        setStatusMsg({ type: 'success', text: `COA for "${formData.productName}" updated successfully.` });
      } else {
        // New Upload
        if (!formData.file) {
          setModalError('Please select a PDF document (<10 MB).');
          setModalLoading(false);
          return;
        }

        const body = new FormData();
        body.append('pdf', formData.file);
        body.append('productId', formData.productId || '');
        body.append('productName', formData.productName.trim());
        body.append('category', formData.category);
        body.append('strength', formData.strength.trim());
        body.append('batchNumber', formData.batchNumber.trim());
        body.append('testDate', formData.testDate);
        body.append('lab', formData.lab.trim());

        await safeApiFetch('/api/admin/coa/upload', {
          method: 'POST',
          body
        });

        setStatusMsg({ type: 'success', text: `New COA for "${formData.productName}" uploaded successfully.` });
      }

      setIsModalOpen(false);
      fetchRecords();
    } catch (err) {
      setModalError(err.message || 'Action failed. Please try again.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleToggleVisibility = async (rec) => {
    const nextVal = rec.is_visible === 1 ? false : true;
    try {
      await safeApiFetch(`/api/admin/coa/${rec.id}/visibility`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVisible: nextVal })
      });
      setRecords((prev) =>
        prev.map((r) => (r.id === rec.id ? { ...r, is_visible: nextVal ? 1 : 0 } : r))
      );
      setStatusMsg({
        type: 'success',
        text: `Visibility for "${rec.product_name}" updated to ${nextVal ? 'Visible' : 'Hidden'}.`
      });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (rec) => {
    if (!window.confirm(`Are you sure you want to permanently delete the COA report for "${rec.product_name}" (Batch ${rec.batch_number})?`)) {
      return;
    }

    try {
      await safeApiFetch(`/api/admin/coa/${rec.id}`, { method: 'DELETE' });
      setRecords((prev) => prev.filter((r) => r.id !== rec.id));
      setStatusMsg({ type: 'success', text: `COA report for "${rec.product_name}" removed.` });
    } catch (err) {
      alert(err.message);
    }
  };

  const filtered = records.filter((r) => {
    if (filter === 'visible' && r.is_visible !== 1) return false;
    if (filter === 'hidden' && r.is_visible === 1) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = r.product_name?.toLowerCase().includes(q);
      const matchBatch = r.batch_number?.toLowerCase().includes(q);
      const matchStrength = r.strength?.toLowerCase().includes(q);
      if (!matchName && !matchBatch && !matchStrength) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold font-mono tracking-tight text-white flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-emerald-400" />
            <span>COA Lab Reports ({records.length})</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Upload, verify, and link Certificates of Analysis & Third-Party Lab Packs to catalog products (under 10 MB per PDF).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openNewModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-emerald-500/10"
          >
            <Plus className="w-4 h-4" />
            <span>Upload COA Report</span>
          </button>
          <button
            onClick={fetchRecords}
            className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center justify-between font-mono animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{statusMsg.text}</span>
          </div>
          <button onClick={() => setStatusMsg(null)} className="text-emerald-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by product name, batch number, strength..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-950/70 border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-zinc-500 font-mono">Filter:</span>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs focus:outline-none"
          >
            <option value="all">All COAs ({records.length})</option>
            <option value="visible">Published Only</option>
            <option value="hidden">Hidden Only</option>
          </select>
        </div>
      </div>

      {/* COA Table */}
      <div className="rounded-2xl border border-zinc-800 overflow-hidden bg-zinc-950/40">
        {loading ? (
          <div className="py-20 text-center text-zinc-500 flex flex-col items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
            <span className="text-xs font-mono">Loading COA Registry...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-zinc-500 text-xs">No matching COA reports found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/80 text-zinc-400 font-mono">
                  <th className="py-3 px-4 font-medium">Product / Compound</th>
                  <th className="py-3 px-4 font-medium">Batch No.</th>
                  <th className="py-3 px-4 font-medium">Strength</th>
                  <th className="py-3 px-4 font-medium">File Size</th>
                  <th className="py-3 px-4 font-medium">Catalog Link</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-sans">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-zinc-100">{r.product_name}</div>
                      <div className="text-[11px] font-mono text-zinc-500">
                        {r.lab || 'Analytical Lab'} • {r.test_date || 'N/A'}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-emerald-400 font-medium">
                      {r.batch_number}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-zinc-300">
                      {r.strength}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-zinc-400">
                      {r.file_size || '<5 MB'}
                    </td>

                    <td className="py-3.5 px-4">
                      {r.in_catalog === 1 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Active SKU</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 text-[10px] font-mono">
                          <span>Unlisted In Catalog</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleVisibility(r)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono transition-colors cursor-pointer ${
                          r.is_visible === 1
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                            : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700'
                        }`}
                      >
                        {r.is_visible === 1 ? (
                          <>
                            <Eye className="w-3 h-3" />
                            <span>Published</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3" />
                            <span>Hidden</span>
                          </>
                        )}
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={r.pdf_url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                          title="View PDF"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => openEditModal(r)}
                          className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                          title="Edit Details / Replace PDF"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(r)}
                          className="p-1.5 rounded-lg bg-zinc-900 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
                          title="Delete COA"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Upload / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl animate-fade-in text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h2 className="text-base font-bold font-mono text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>{isEditing ? 'Edit COA Report' : 'Upload New COA Lab Pack'}</span>
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
              {/* Quick Select from Store Products */}
              <div>
                <label className="block text-zinc-400 mb-1 font-mono">Link to Store Product (Optional)</label>
                <select
                  value={formData.productId}
                  onChange={(e) => handleProductSelect(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="">-- Manual Entry / Not In Catalog --</option>
                  {rawProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.variants?.[0]?.strength || 'General'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-mono">Product / Compound Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AOD 9604"
                  value={formData.productName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, productName: e.target.value }))}
                  className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-mono">Strength / Variant *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 5mg / vial"
                    value={formData.strength}
                    onChange={(e) => setFormData((prev) => ({ ...prev, strength: e.target.value }))}
                    className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1 font-mono">Batch Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2025248"
                    value={formData.batchNumber}
                    onChange={(e) => setFormData((prev) => ({ ...prev, batchNumber: e.target.value }))}
                    className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-mono">Test / Report Date</label>
                  <input
                    type="date"
                    value={formData.testDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, testDate: e.target.value }))}
                    className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1 font-mono">Testing Laboratory</label>
                  <input
                    type="text"
                    placeholder="e.g. Eurofins / Bono Biological"
                    value={formData.lab}
                    onChange={(e) => setFormData((prev) => ({ ...prev, lab: e.target.value }))}
                    className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* PDF File Picker */}
              <div>
                <label className="block text-zinc-400 mb-1 font-mono">
                  {isEditing ? 'Replace PDF Document (Optional, <10 MB)' : 'Upload PDF Document * (<10 MB)'}
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  required={!isEditing}
                  onChange={(e) => setFormData((prev) => ({ ...prev, file: e.target.files[0] }))}
                  className="w-full p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-zinc-800 file:text-zinc-200 hover:file:bg-zinc-700 cursor-pointer"
                />
                <p className="text-[10px] text-zinc-500 mt-1 font-mono">Strict limit: 10 MB per file. Only PDF documents accepted.</p>
              </div>

              {/* Visibility Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isVisible"
                  checked={formData.isVisible}
                  onChange={(e) => setFormData((prev) => ({ ...prev, isVisible: e.target.checked }))}
                  className="w-4 h-4 rounded border-zinc-800 bg-zinc-900 text-emerald-500 focus:ring-0 cursor-pointer"
                />
                <label htmlFor="isVisible" className="text-zinc-300 cursor-pointer font-mono text-xs">
                  Publish to Public COA Library and Product Detail Page
                </label>
              </div>

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
                  <span>{isEditing ? 'Save Changes' : 'Upload COA'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
