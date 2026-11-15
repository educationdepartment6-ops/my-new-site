import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, FileCheck2, FlaskConical, Search, CheckCircle2, ChevronRight, Award, Dna } from 'lucide-react';
import SEO from '../seo/SEO';
import TrustStrip from '../components/common/TrustStrip';
import ProductCard from '../components/product/ProductCard';
import FAQAccordion from '../components/common/FAQAccordion';
import productsData from '../data/products.json';
import categoriesData from '../data/categories.json';

export default function HomePage() {
  const featuredProducts = productsData.filter((p) => p.featured).slice(0, 8);

  const homeFaqs = [
    {
      q: 'How do I order?',
      a: 'Choose your product and strength from our shop, add it to your cart, and head to checkout. Sign in or create an account to enter your delivery address and complete your order.'
    },
    {
      q: 'What does "per vial" mean?',
      a: 'Each price shown is for one single sealed vial containing the strength you selected.'
    },
    {
      q: 'How long does shipping take?',
      a: 'Orders are processed quickly. [FILL IN: typical delivery timeframe, e.g. 2 to 5 business days].'
    },
    {
      q: 'How do I contact support?',
      a: 'You can reach our support team by email at [FILL IN: support email address] or by phone at [FILL IN: support phone number].'
    }
  ];

  return (
    <>
      <SEO
        title="MOG WRLD — Quality Peptides, Clear Prices"
        description="Quality peptides with clear per-vial prices and easy ordering. Browse our full catalogue and choose your strength."
        canonicalPath="/"
        faqItems={homeFaqs}
      />

      {/* Hero Section with Liquid Chrome Ribbon Brand Aesthetic */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32">
        {/* Ambient Liquid Chrome Corner Swooshes from Official Brand Artwork */}
        <div className="absolute -top-6 -left-6 w-72 sm:w-96 md:w-[32rem] pointer-events-none opacity-55 dark:opacity-25 select-none mix-blend-multiply dark:mix-blend-screen">
          <img
            src="/brand/chrome-swoosh-tl.png"
            alt=""
            role="presentation"
            className="w-full h-auto object-contain"
            width="620"
            height="380"
          />
        </div>

        <div className="absolute -bottom-6 -right-6 w-72 sm:w-96 md:w-[32rem] pointer-events-none opacity-55 dark:opacity-25 select-none mix-blend-multiply dark:mix-blend-screen">
          <img
            src="/brand/chrome-swoosh-br.png"
            alt=""
            role="presentation"
            className="w-full h-auto object-contain"
            width="644"
            height="404"
          />
        </div>

        {/* Subtle background ambient curves */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none overflow-hidden opacity-25 dark:opacity-15">
          <svg viewBox="0 0 1200 800" className="w-full h-full stroke-[var(--chrome)] fill-none">
            <path d="M-100,200 C300,50 800,350 1300,100" strokeWidth="1.5" />
            <path d="M-50,250 C350,100 850,400 1350,150" strokeWidth="1" strokeDasharray="6 6" />
            <circle cx="600" cy="200" r="180" stroke="url(#heroGrad)" strokeWidth="1" />
            <defs>
              <linearGradient id="heroGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#C9CCD1" />
                <stop offset="100%" stopColor="#8E9298" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Brand Wordmark & Needles Showcase */}
          <div className="hidden sm:flex items-center justify-center gap-4 mb-6">
            <div className="hidden sm:block flex-1 max-w-[120px] h-px bg-gradient-to-r from-transparent to-[var(--chrome)] opacity-60" />
            <div className="inline-flex items-center justify-center px-6 py-2 rounded-2xl glass-panel bg-white/70 dark:bg-[#141517]/70 border border-[var(--border-bright)] shadow-md">
              <img
                src="/brand/logo.png"
                alt="MOG WRLD"
                className="h-8 sm:h-9 w-auto object-contain dark:invert drop-shadow-sm"
                width="240"
                height="45"
              />
            </div>
            <div className="hidden sm:block flex-1 max-w-[120px] h-px bg-gradient-to-l from-transparent to-[var(--chrome)] opacity-60" />
          </div>

          {/* Main Hero Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-heading font-extrabold tracking-tight text-[var(--ink)] max-w-4xl mx-auto leading-[1.08] mb-6">
            Quality peptides, <span className="chrome-text">clear prices</span>, easy ordering.
          </h1>

          <p className="text-base sm:text-lg text-[var(--ink-muted)] max-w-2xl mx-auto leading-relaxed mb-10">
            Find your product, choose your strength, and order with clear prices per vial. Fast, reliable delivery directly to you.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/shop"
              className="w-full sm:w-auto py-3.5 px-8 rounded-xl bg-[var(--ink)] text-[var(--bg)] font-semibold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-xl hover:-translate-y-0.5"
            >
              <span>Shop All Products</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/shop"
              className="w-full sm:w-auto py-3.5 px-8 rounded-xl glass-panel bg-white/70 dark:bg-[#141517]/70 border border-[var(--border)] text-[var(--ink)] font-semibold text-sm hover:bg-[var(--surface-subtle)] transition-all flex items-center justify-center gap-2"
            >
              <FileCheck2 className="w-4 h-4 text-[var(--chrome)]" />
              <span>Browse Categories</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Strip */}
      <TrustStrip />

      {/* Featured Categories Grid */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-[var(--chrome)] block mb-1">
              Categories
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-[var(--ink)]">
              Browse by Category
            </h2>
          </div>
          <Link
            to="/shop"
            className="text-xs font-semibold text-[var(--ink)] hover:text-[var(--chrome)] flex items-center gap-1 transition-colors"
          >
            <span>View All Categories</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.values(categoriesData).map((cat) => {
            const count = productsData.filter((p) => p.category === cat.slug).length;
            return (
              <Link
                key={cat.slug}
                to={`/category/${cat.slug}`}
                className="group p-6 rounded-2xl glass-panel bg-white/70 dark:bg-[#141517]/70 border border-[var(--border)] glass-panel-hover flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)] flex items-center justify-center text-[var(--chrome)] group-hover:text-[var(--ink)] transition-colors">
                      <FlaskConical className="w-6 h-6 stroke-[1.5]" />
                    </div>
                    <span className="text-xs font-mono font-medium text-[var(--ink-muted)]">
                      {count} Compounds
                    </span>
                  </div>
                  <h3 className="font-heading font-bold text-lg text-[var(--ink)] group-hover:text-[var(--chrome)] transition-colors mb-2">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-[var(--ink-muted)] leading-relaxed line-clamp-2">
                    {cat.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[var(--border)] flex items-center justify-between text-xs font-semibold text-[var(--ink)]">
                  <span>Browse Category</span>
                  <ArrowRight className="w-4 h-4 text-[var(--chrome)] group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Research Compounds Section */}
      <section className="py-20 bg-[var(--surface-subtle)] border-y border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-[var(--chrome)] block mb-1">
                Popular Compounds
              </span>
              <h2 className="text-2xl sm:text-3xl font-heading font-bold text-[var(--ink)]">
                Featured Products
              </h2>
            </div>
            <Link
              to="/shop"
              className="text-xs font-semibold text-[var(--ink)] hover:text-[var(--chrome)] flex items-center gap-1 transition-colors"
            >
              <span>View All Products ({productsData.length})</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* How to Order - 3 Simple Steps */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-mono uppercase tracking-widest text-[var(--chrome)] block mb-1">
            Simple Process
          </span>
          <h2 className="text-2xl sm:text-4xl font-heading font-bold text-[var(--ink)] mb-4">
            How to order
          </h2>
          <p className="text-xs sm:text-sm text-[var(--ink-muted)] leading-relaxed">
            Ordering from MOG WRLD takes just 3 simple steps:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="p-6 rounded-2xl glass-panel bg-white/80 dark:bg-[#141517]/80 border border-[var(--border)]">
            <div className="w-10 h-10 rounded-xl bg-[var(--ink)] text-[var(--bg)] font-mono font-bold text-sm flex items-center justify-center mb-4">
              1
            </div>
            <h3 className="font-heading font-bold text-lg text-[var(--ink)] mb-2">
              Choose your product and strength
            </h3>
            <p className="text-xs text-[var(--ink-muted)] leading-relaxed">
              Pick the product you need from our catalogue and select your strength option.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-panel bg-white/80 dark:bg-[#141517]/80 border border-[var(--border)]">
            <div className="w-10 h-10 rounded-xl bg-[var(--ink)] text-[var(--bg)] font-mono font-bold text-sm flex items-center justify-center mb-4">
              2
            </div>
            <h3 className="font-heading font-bold text-lg text-[var(--ink)] mb-2">
              Add to cart and sign in
            </h3>
            <p className="text-xs text-[var(--ink-muted)] leading-relaxed">
              Add items to your cart, then sign in or create an account in a few seconds.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-panel bg-white/80 dark:bg-[#141517]/80 border border-[var(--border)]">
            <div className="w-10 h-10 rounded-xl bg-[var(--ink)] text-[var(--bg)] font-mono font-bold text-sm flex items-center justify-center mb-4">
              3
            </div>
            <h3 className="font-heading font-bold text-lg text-[var(--ink)] mb-2">
              Checkout and we ship to you
            </h3>
            <p className="text-xs text-[var(--ink-muted)] leading-relaxed">
              Review your order, enter your address, and checkout. We pack and ship directly to you.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section with FAQPage Schema */}
      <section className="py-20 bg-[var(--surface-subtle)] border-t border-[var(--border)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-mono uppercase tracking-widest text-[var(--chrome)] block mb-1">
              Common Questions
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-[var(--ink)]">
              Frequently Asked Questions
            </h2>
          </div>

          <FAQAccordion items={homeFaqs} />
        </div>
      </section>

      {/* Institutional Updates Newsletter */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl glass-panel bg-white/80 dark:bg-[#141517]/80 border border-[var(--border)] text-center max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-[var(--ink)] mb-3">
            Stay Updated
          </h2>
          <p className="text-xs sm:text-sm text-[var(--ink-muted)] leading-relaxed max-w-lg mx-auto mb-6">
            Subscribe to get news on new products, strength options, and catalogue updates.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert('Thank you for subscribing!');
            }}
            className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto"
          >
            <input
              type="email"
              required
              placeholder="Enter your email address..."
              className="flex-1 py-3 px-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--ink)] text-xs sm:text-sm outline-none focus:border-[var(--ink)]"
            />
            <button
              type="submit"
              className="py-3 px-6 rounded-xl bg-[var(--ink)] text-[var(--bg)] font-semibold text-xs sm:text-sm hover:opacity-90 transition-opacity shrink-0"
            >
              Subscribe
            </button>
          </form>
          <span className="block text-[10px] text-[var(--ink-muted)] mt-3">
            We respect your privacy. Unsubscribe at any time.
          </span>
        </div>
      </section>
    </>
  );
}
