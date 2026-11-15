import React, { useState, useEffect } from 'react';
import { Layers, Edit3, ArrowRightLeft, Check, X, Loader2 } from 'lucide-react';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCat, setEditingCat] = useState(null);
  const [moveModal, setMoveModal] = useState(false);
  const [moveProductId, setMoveProductId] = useState('');
  const [moveTargetCat, setMoveTargetCat] = useState('');
  const [statusMsg, setStatusMsg] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [resCat, resProd] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/products/admin')
      ]);
      const catData = await resCat.json();
      const prodData = await resProd.json();
      setCategories(catData);
      setProducts(prodData);
      if (prodData.length > 0) setMoveProductId(prodData[0].id);
      if (catData.length > 0) setMoveTargetCat(catData[0].slug);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showStatus = (msg) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(null), 3500);
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/categories/admin/${editingCat.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editingCat.name, description: editingCat.description })
      });
      if (res.ok) {
        showStatus(`Category '${editingCat.name}' updated!`);
        setEditingCat(null);
        await loadData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleMoveProduct = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/categories/admin/move-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: moveProductId, categorySlug: moveTargetCat })
      });
      if (res.ok) {
        showStatus('Compound moved successfully!');
        setMoveModal(false);
        await loadData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {statusMsg && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-emerald-500 text-black font-semibold text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4" />
          <span>{statusMsg}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold font-mono tracking-tight text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-400" />
            <span>Category Manager</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Reorganize laboratory compound categories and relocate compounds.
          </p>
        </div>

        <button
          onClick={() => setMoveModal(true)}
          className="py-2 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer"
        >
          <ArrowRightLeft className="w-4 h-4 text-emerald-400" />
          <span>Move Compound Category</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-zinc-500 flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
          <span className="text-xs font-mono">Loading Categories...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((c) => (
            <div
              key={c.id}
              className="p-5 rounded-2xl bg-zinc-950/60 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                    ID #{c.id}
                  </span>
                  <span className="text-xs font-mono text-emerald-400 font-semibold">
                    {c.productCount || 0} Compounds
                  </span>
                </div>
                <h3 className="font-bold text-sm text-zinc-100">{c.name}</h3>
                <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{c.description || 'No description'}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-900 flex justify-end">
                <button
                  onClick={() => setEditingCat(c)}
                  className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Rename</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Category Modal */}
      {editingCat && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-zinc-950 border border-zinc-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h2 className="text-sm font-bold font-mono text-white">Rename Category #{editingCat.id}</h2>
              <button onClick={() => setEditingCat(null)} className="text-zinc-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleUpdateCategory} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1 font-mono">Category Name *</label>
                <input
                  type="text"
                  required
                  value={editingCat.name}
                  onChange={(e) => setEditingCat({ ...editingCat, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1 font-mono">Description</label>
                <textarea
                  rows="3"
                  value={editingCat.description || ''}
                  onChange={(e) => setEditingCat({ ...editingCat, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingCat(null)}
                  className="px-3 py-2 rounded-xl bg-zinc-900 text-zinc-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-black font-semibold uppercase tracking-wider"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Move Product Modal */}
      {moveModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-zinc-950 border border-zinc-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h2 className="text-sm font-bold font-mono text-white flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-emerald-400" />
                <span>Move Compound to Category</span>
              </h2>
              <button onClick={() => setMoveModal(false)} className="text-zinc-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleMoveProduct} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1 font-mono">Select Compound</label>
                <select
                  value={moveProductId}
                  onChange={(e) => setMoveProductId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Current: {p.categoryName})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-zinc-400 mb-1 font-mono">Target Category</label>
                <select
                  value={moveTargetCat}
                  onChange={(e) => setMoveTargetCat(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs"
                >
                  {categories.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMoveModal(false)}
                  className="px-3 py-2 rounded-xl bg-zinc-900 text-zinc-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-black font-semibold uppercase tracking-wider"
                >
                  Relocate Compound
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
