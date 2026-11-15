import React, { useState, useEffect } from 'react';
import {
  Package,
  Search,
  Plus,
  Edit2,
  Eye,
  EyeOff,
  Trash2,
  X,
  Check,
  Upload,
  AlertCircle,
  Loader2,
  RefreshCw
} from 'lucide-react';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [editingProduct, setEditingProduct] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const [resProd, resCat] = await Promise.all([
        fetch('/api/products/admin'),
        fetch('/api/categories')
      ]);
      const prodData = await resProd.json();
      const catData = await resCat.json();
      setProducts(Array.isArray(prodData) ? prodData : []);
      setCategories(Array.isArray(catData) ? catData : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleToggleVisibility = async (product) => {
    const nextState = !product.isVisible;
    try {
      const res = await fetch(`/api/products/admin/${product.id}/visibility`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVisible: nextState })
      });
      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, isVisible: nextState } : p))
        );
        showStatus(`Set ${product.name} to ${nextState ? 'VISIBLE' : 'HIDDEN'}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const showStatus = (msg) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(null), 3500);
  };

  const handleOpenEdit = (p) => {
    setIsNew(false);
    setEditingProduct(JSON.parse(JSON.stringify(p)));
  };

  const handleOpenNew = () => {
    setIsNew(true);
    setEditingProduct({
      id: '',
      name: '',
      slug: '',
      category: categories[0]?.slug || 'glp1',
      categoryName: categories[0]?.name || 'GLP-1 & Metabolic Peptides',
      shortDescription: '',
      imageUrl: '/brand/molecule-icon.png',
      isVisible: true,
      variants: [
        { sku: 'NEW1', strength: '5mg', priceInr: 2500, priceUsd: 28.9, specification: '5mg per vial' }
      ]
    });
  };

  const handleAddVariantRow = () => {
    if (!editingProduct) return;
    const count = editingProduct.variants.length + 1;
    const baseSku = editingProduct.variants[0]?.sku?.replace(/[0-9]/g, '') || 'VAR';
    setEditingProduct({
      ...editingProduct,
      variants: [
        ...editingProduct.variants,
        {
          sku: `${baseSku}${count * 5}`,
          strength: `${count * 5}mg`,
          priceInr: 3000,
          priceUsd: 34.68,
          specification: `${count * 5}mg per vial`
        }
      ]
    });
  };

  const handleRemoveVariantRow = (index) => {
    if (!editingProduct || editingProduct.variants.length <= 1) {
      alert('A compound must have at least one strength variant.');
      return;
    }
    const updated = [...editingProduct.variants];
    updated.splice(index, 1);
    setEditingProduct({ ...editingProduct, variants: updated });
  };

  const handleVariantChange = (index, field, value) => {
    const updated = [...editingProduct.variants];
    updated[index] = { ...updated[index], [field]: value };
    if (field === 'priceInr') {
      const val = parseInt(value, 10) || 0;
      updated[index].priceUsd = Number((val / 86.5).toFixed(2));
    }
    setEditingProduct({ ...editingProduct, variants: updated });
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = isNew
        ? '/api/products/admin'
        : `/api/products/admin/${editingProduct.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProduct)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save compound');

      showStatus(`Compound '${editingProduct.name}' saved successfully!`);
      setEditingProduct(null);
      await fetchProducts();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Filtered compounds
  const filtered = products.filter((p) => {
    if (selectedCat !== 'all' && p.category !== selectedCat) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchSku = p.primarySku?.toLowerCase().includes(q);
      const matchVar = p.variants?.some((v) => v.sku.toLowerCase().includes(q) || v.strength.toLowerCase().includes(q));
      if (!matchName && !matchSku && !matchVar) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {statusMsg && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-emerald-500 text-black font-semibold text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Header controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold font-mono tracking-tight text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-400" />
            <span>Compound Catalogue ({products.length} Compounds)</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Grouped compounds with live strength variants, per-vial pricing, and visibility toggles.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchProducts}
            className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
            title="Refresh database"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleOpenNew}
            className="py-2 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs tracking-wider uppercase flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/10 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Compound</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by compound name, SKU, or strength..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-950/70 border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-700"
          />
        </div>

        <div className="w-full md:w-auto flex items-center gap-2 text-xs">
          <span className="text-zinc-500 font-mono">Category:</span>
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs focus:outline-none"
          >
            <option value="all">All Categories ({products.length})</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
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
            <span className="text-xs font-mono">Loading Compound Inventory...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-zinc-500 text-xs">
            No matching research compounds found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/80 text-zinc-400 font-mono">
                  <th className="py-3 px-4 font-medium">Compound</th>
                  <th className="py-3 px-4 font-medium">Category</th>
                  <th className="py-3 px-4 font-medium">Strengths & SKUs</th>
                  <th className="py-3 px-4 font-medium">Per-Vial Range</th>
                  <th className="py-3 px-4 font-medium">Visibility</th>
                  <th className="py-3 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-sans">
                {filtered.map((product) => {
                  const variants = product.variants || [];
                  const minPrice = Math.min(...variants.map((v) => v.priceInr || 0));
                  const maxPrice = Math.max(...variants.map((v) => v.priceInr || 0));
                  const priceStr =
                    minPrice === maxPrice
                      ? `₹${minPrice.toLocaleString()}`
                      : `₹${minPrice.toLocaleString()} - ₹${maxPrice.toLocaleString()}`;

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-zinc-900/40 transition-colors group"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                            <img
                              src={product.imageUrl || '/brand/molecule-icon.png'}
                              alt=""
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                e.target.src = '/brand/molecule-icon.png';
                              }}
                            />
                          </div>
                          <div>
                            <div className="font-semibold text-zinc-100 group-hover:text-emerald-400 transition-colors">
                              {product.name}
                            </div>
                            <div className="text-[11px] font-mono text-zinc-500">
                              SKU: {product.primarySku} • {variants.length} options
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-300 font-mono">
                          {product.categoryName || product.category}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {variants.map((v) => (
                            <span
                              key={v.sku}
                              className="px-1.5 py-0.5 rounded bg-zinc-900/90 text-zinc-400 border border-zinc-800 text-[10px] font-mono"
                              title={`${v.sku}: ₹${v.priceInr?.toLocaleString()}`}
                            >
                              {v.strength}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-medium text-zinc-200">
                        {priceStr} <span className="text-[10px] text-zinc-500">/ vial</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleVisibility(product)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                            product.isVisible
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
                          }`}
                        >
                          {product.isVisible ? (
                            <>
                              <Eye className="w-3 h-3" />
                              <span>Live</span>
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
                        <button
                          onClick={() => handleOpenEdit(product)}
                          className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 text-xs font-medium inline-flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit / Add Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-3xl rounded-3xl bg-zinc-950 border border-zinc-800 p-6 sm:p-8 space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <h2 className="text-base font-bold font-mono text-white flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-emerald-400" />
                <span>{isNew ? 'Create New Compound' : `Edit: ${editingProduct.name}`}</span>
              </h2>
              <button
                onClick={() => setEditingProduct(null)}
                className="p-1 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-6">
              {/* Basic Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-zinc-400 mb-1 font-mono">Compound Name *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, name: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs focus:outline-none focus:border-zinc-700"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1 font-mono">Category *</label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) => {
                      const cat = categories.find((c) => c.slug === e.target.value);
                      setEditingProduct({
                        ...editingProduct,
                        category: e.target.value,
                        categoryName: cat?.name || e.target.value
                      });
                    }}
                    className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1 font-mono">Image URL</label>
                  <input
                    type="text"
                    value={editingProduct.imageUrl || ''}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, imageUrl: e.target.value })
                    }
                    placeholder="/products/vial_tirzepatide.png"
                    className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1 font-mono">Primary SKU</label>
                  <input
                    type="text"
                    value={editingProduct.primarySku || editingProduct.variants?.[0]?.sku || ''}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, primarySku: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Strength Variants Editor */}
              <div className="space-y-3 pt-2 border-t border-zinc-800">
                <div className="flex items-center justify-between">
                  <h3 className="font-mono text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                    Strength Variants & Per-Vial Pricing
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddVariantRow}
                    className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-emerald-400 border border-zinc-800 text-xs font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Strength</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {editingProduct.variants.map((v, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-12 gap-2 items-center p-2 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-xs"
                    >
                      <div className="col-span-3">
                        <label className="block text-[10px] text-zinc-500 font-mono">SKU</label>
                        <input
                          type="text"
                          required
                          value={v.sku}
                          onChange={(e) => handleVariantChange(idx, 'sku', e.target.value.toUpperCase())}
                          className="w-full p-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 font-mono text-xs"
                        />
                      </div>

                      <div className="col-span-3">
                        <label className="block text-[10px] text-zinc-500 font-mono">Strength</label>
                        <input
                          type="text"
                          required
                          value={v.strength}
                          onChange={(e) => handleVariantChange(idx, 'strength', e.target.value)}
                          className="w-full p-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs"
                        />
                      </div>

                      <div className="col-span-3">
                        <label className="block text-[10px] text-zinc-500 font-mono">Price (₹ / vial)</label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={v.priceInr || v.price}
                          onChange={(e) => handleVariantChange(idx, 'priceInr', e.target.value)}
                          className="w-full p-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-emerald-400 font-mono text-xs font-semibold"
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="block text-[10px] text-zinc-500 font-mono">USD (~)</label>
                        <span className="block p-1.5 text-zinc-400 font-mono text-xs">
                          ${v.priceUsd || Number(((v.priceInr || 0) / 86.5).toFixed(2))}
                        </span>
                      </div>

                      <div className="col-span-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleRemoveVariantRow(idx)}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-950"
                          title="Remove variant"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold uppercase tracking-wider flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
