import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, Search, SlidersHorizontal, X, Download } from 'lucide-react';
import SEO from '../seo/SEO';
import Breadcrumbs from '../components/common/Breadcrumbs';
import ProductCard from '../components/product/ProductCard';
import productsData from '../data/products.json';
import categoriesData from '../data/categories.json';

export default function ShopPage() {
  const [products, setProducts] = useState(productsData);

  useEffect(() => {
    fetch('/api/products')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
        }
      })
      .catch(() => {});
  }, []);

  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  const initialQuery = searchParams.get('q') || '';

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [sortBy, setSortBy] = useState('featured');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [displayCount, setDisplayCount] = useState(68);

  // Filter & sort logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        // Category filter
        if (selectedCategory !== 'all' && product.category !== selectedCategory) {
          return false;
        }
        // In-stock filter
        if (inStockOnly && !product.inStock) {
          return false;
        }
        // Search query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = product.name.toLowerCase().includes(q);
          const matchSku = product.primarySku.toLowerCase().includes(q);
          const matchVariant = product.variants.some((v) => v.sku.toLowerCase().includes(q) || v.strength.toLowerCase().includes(q));
          const matchCategory = product.categoryName.toLowerCase().includes(q);
          if (!matchName && !matchSku && !matchVariant && !matchCategory) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        const minPriceA = Math.min(...a.variants.map((v) => v.priceInr ?? v.price ?? 0));
        const minPriceB = Math.min(...b.variants.map((v) => v.priceInr ?? v.price ?? 0));

        if (sortBy === 'price-low') return minPriceA - minPriceB;
        if (sortBy === 'price-high') return minPriceB - minPriceA;
        if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
        return (a.row ?? 0) - (b.row ?? 0);
      });
  }, [selectedCategory, searchQuery, sortBy, inStockOnly]);

  const visibleProducts = filteredProducts.slice(0, displayCount);

  const resetFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setSortBy('featured');
    setInStockOnly(false);
    setSearchParams({});
  };

  return (
    <>
      <SEO
        title="All Products"
        description="Browse our full list of compounds and choose your strength. Clear per-vial pricing."
        canonicalPath="/shop"
        breadcrumbs={[{ name: 'Shop Catalogue', url: '/shop' }]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs items={[{ name: 'Shop', url: '/shop' }]} />

        {/* Header Title */}
        <div className="py-6 border-b border-[var(--border)] mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            
            <h1 className="text-3xl sm:text-4xl font-heading font-bold text-[var(--ink)]">
              All Products
            </h1>
            <p className="text-xs sm:text-sm text-[var(--ink-muted)] max-w-2xl mt-1.5 leading-relaxed">
              Browse our full list of compounds and choose your strength. Each product is clearly priced per vial.
            </p>
          </div>
          <a
            href="/Peptide_Catalogue_By_Category.pdf"
            download="Peptide_Catalogue_By_Category.pdf"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-subtle)] text-xs font-semibold text-[var(--ink)] transition-colors shadow-sm shrink-0 self-start md:self-auto"
          >
            <Download className="w-4 h-4 text-[var(--chrome)]" />
            <span>Download Catalogue (PDF)</span>
          </a>
        </div>

        {/* Filter & Controls Toolbar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8">
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--chrome)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by product name or code..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--ink)] text-xs sm:text-sm outline-none focus:border-[var(--ink)]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--chrome)] hover:text-[var(--ink)]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Category Select */}
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setDisplayCount(12);
              }}
              className="py-2.5 px-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--ink)] text-xs sm:text-sm outline-none cursor-pointer"
            >
              <option value="all">All Categories ({productsData.length})</option>
              {Object.values(categoriesData).map((cat) => (
                <option key={cat.slug} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>

            {/* Sort Select */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="py-2.5 px-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--ink)] text-xs sm:text-sm outline-none cursor-pointer"
            >
              <option value="featured">Sort: Featured First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name-asc">Alphabetical: A - Z</option>
            </select>

            {/* In-stock Toggle */}
            <label className="flex items-center gap-2 text-xs text-[var(--ink-muted)] cursor-pointer select-none px-2">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded border-[var(--border)] text-[var(--ink)]"
              />
              <span>In Stock Only</span>
            </label>
          </div>
        </div>

        {/* Results Counter & Active Filter Pills */}
        <div className="flex items-center justify-between text-xs text-[var(--ink-muted)] mb-6 pb-4 border-b border-[var(--border)]">
          <div>
            Showing <strong>{visibleProducts.length}</strong> of <strong>{filteredProducts.length}</strong> products
          </div>
          {(selectedCategory !== 'all' || searchQuery || inStockOnly) && (
            <button
              onClick={resetFilters}
              className="text-xs font-semibold text-[var(--ink)] hover:text-red-500 transition-colors"
            >
              Clear All Filters
            </button>
          )}
        </div>

        {/* Product Grid */}
        {visibleProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {visibleProducts.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-24 text-center glass-panel rounded-2xl p-8 border border-[var(--border)]">
            <h3 className="font-heading font-semibold text-base text-[var(--ink)] mb-2">
              No matching compounds found
            </h3>
            <p className="text-xs text-[var(--ink-muted)] max-w-sm mx-auto mb-6">
              Try adjusting your search criteria or category filter to locate desired laboratory materials.
            </p>
            <button
              onClick={resetFilters}
              className="py-2.5 px-5 rounded-xl bg-[var(--ink)] text-[var(--bg)] text-xs font-semibold"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Load More Button */}
        {visibleProducts.length < filteredProducts.length && (
          <div className="mt-12 text-center">
            <button
              onClick={() => setDisplayCount((prev) => prev + 12)}
              className="py-3 px-8 rounded-xl glass-panel bg-white/70 dark:bg-[#141517]/70 border border-[var(--border)] text-xs font-semibold hover:bg-[var(--surface-subtle)] text-[var(--ink)] transition-colors shadow-sm"
            >
              Load More Compounds ({filteredProducts.length - visibleProducts.length} remaining)
            </button>
          </div>
        )}
      </div>
    </>
  );
}
