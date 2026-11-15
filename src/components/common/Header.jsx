import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Search, ShoppingBag, Menu, X, ShieldCheck, ChevronDown, FlaskConical, User, LogOut } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { useCurrencyStore } from '../../store/useCurrencyStore';
import { useCustomerAuthStore } from '../../store/useCustomerAuthStore';
import SearchModal from '../search/SearchModal';
import categoriesData from '../../data/categories.json';

export default function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const getItemCount = useCartStore((state) => state.getItemCount);
  const toggleDrawer = useCartStore((state) => state.toggleDrawer);
  const { currency, toggleCurrency } = useCurrencyStore();
  const { isAuthenticated, logout } = useCustomerAuthStore();

  const itemCount = getItemCount();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <>
      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Main Header Bar */}
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-[var(--border)] bg-white/80 dark:bg-[#0B0B0C]/85 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-2 sm:gap-4">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center shrink-0 group" aria-label="MOG WRLD Home">
            <div className="h-9 sm:h-11 w-auto flex items-center">
              <img
                src="/brand/logo.png"
                alt="mog wrld - Research Compounds"
                className="h-7 sm:h-9 w-auto object-contain dark:invert transition-transform group-hover:scale-[1.02] drop-shadow-sm"
                width="220"
                height="40"
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
            <NavLink
              to="/shop"
              className={({ isActive }) =>
                `transition-colors hover:text-[var(--chrome)] ${isActive ? 'text-[var(--ink)] font-bold' : 'text-[var(--ink-muted)]'}`
              }
            >
              Shop
            </NavLink>

            {/* Category Flyout */}
            <div
              className="relative"
              onMouseEnter={() => setIsCategoryDropdownOpen(true)}
              onMouseLeave={() => setIsCategoryDropdownOpen(false)}
            >
              <button
                className="flex items-center gap-1 text-[var(--ink-muted)] hover:text-[var(--chrome)] transition-colors py-2"
                aria-expanded={isCategoryDropdownOpen}
              >
                <span>Categories</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {isCategoryDropdownOpen && (
                <div className="absolute top-full left-0 w-72 rounded-2xl glass-panel bg-white/95 dark:bg-[#141517]/95 shadow-xl border border-[var(--border)] p-2 z-50 animate-fade-in">
                  {Object.values(categoriesData).map((cat) => (
                    <Link
                      key={cat.slug}
                      to={`/category/${cat.slug}`}
                      onClick={() => setIsCategoryDropdownOpen(false)}
                      className="block p-2.5 rounded-xl text-xs hover:bg-[var(--surface-subtle)] transition-colors"
                    >
                      <div className="font-semibold text-[var(--ink)]">{cat.name}</div>
                      <div className="text-[11px] text-[var(--ink-muted)] line-clamp-1">{cat.description}</div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <NavLink
              to="/about"
              className={({ isActive }) =>
                `transition-colors hover:text-[var(--chrome)] ${isActive ? 'text-[var(--ink)] font-bold' : 'text-[var(--ink-muted)]'}`
              }
            >
              About
            </NavLink>

            <NavLink
              to="/contact"
              className={({ isActive }) =>
                `transition-colors hover:text-[var(--chrome)] ${isActive ? 'text-[var(--ink)] font-bold' : 'text-[var(--ink-muted)]'}`
              }
            >
              Contact
            </NavLink>
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Search Trigger */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 sm:px-3 sm:py-2 rounded-xl text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-subtle)] border border-transparent hover:border-[var(--border)] flex items-center gap-2 text-xs font-medium transition-all"
              aria-label="Search compounds"
            >
              <Search className="w-4 h-4" />
              <span className="hidden md:inline">Search products...</span>
              <kbd className="hidden md:inline px-1.5 py-0.5 text-[10px] rounded bg-[var(--surface-subtle)] font-mono border border-[var(--border)]">
                /
              </kbd>
            </button>

            {/* Currency Switcher Toggle */}
            <button
              onClick={toggleCurrency}
              className="px-2 py-1.5 sm:px-2.5 rounded-xl text-xs font-mono font-semibold border border-[var(--border)] bg-[var(--surface-subtle)] text-[var(--ink)] hover:bg-[var(--border)] transition-colors"
              title="Toggle USD / INR Currency"
              aria-label={`Current currency: ${currency}. Click to switch.`}
            >
              {currency}
            </button>

            {/* Customer Auth Button / Dropdown */}
            {isAuthenticated ? (
              <div
                className="relative"
                onMouseEnter={() => setIsUserMenuOpen(true)}
                onMouseLeave={() => setIsUserMenuOpen(false)}
              >
                <Link
                  to="/account"
                  className="p-2 sm:px-2.5 sm:py-2 rounded-xl text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-subtle)] border border-transparent hover:border-[var(--border)] flex items-center gap-1.5 text-xs font-medium transition-all"
                  aria-label="Customer Account"
                >
                  <User className="w-4 h-4 text-emerald-500" />
                  <ChevronDown className="w-3 h-3 hidden sm:inline" />
                </Link>

                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-44 rounded-2xl glass-panel bg-white/95 dark:bg-[#141517]/95 shadow-xl border border-[var(--border)] p-1.5 z-50 animate-fade-in">
                    <Link
                      to="/account"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="block px-3 py-2 rounded-xl text-xs font-medium hover:bg-[var(--surface-subtle)] text-[var(--ink)] transition-colors"
                    >
                      My Account
                    </Link>
                    <Link
                      to="/account?tab=orders"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="block px-3 py-2 rounded-xl text-xs font-medium hover:bg-[var(--surface-subtle)] text-[var(--ink)] transition-colors"
                    >
                      Orders
                    </Link>
                    <div className="my-1 border-t border-[var(--border)]" />
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-rose-500 hover:bg-rose-500/10 flex items-center justify-between transition-colors"
                    >
                      <span>Log Out</span>
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="p-2 sm:px-3 sm:py-2 rounded-xl text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-subtle)] border border-transparent hover:border-[var(--border)] flex items-center gap-1.5 text-xs font-medium transition-all"
                title="Customer Sign In / Register"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Sign in</span>
              </Link>
            )}

            {/* Cart Button */}
            <button
              onClick={toggleDrawer}
              className="relative p-2 sm:p-2.5 rounded-xl bg-[var(--ink)] text-[var(--bg)] hover:opacity-90 transition-opacity flex items-center justify-center shadow-md"
              aria-label={`View cart with ${itemCount} items`}
            >
              <ShoppingBag className="w-4 h-4" />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded-full bg-emerald-500 text-black text-[10px] font-bold flex items-center justify-center shadow-sm">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-[var(--ink)] hover:bg-[var(--surface-subtle)] transition-colors"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Flyout Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-[var(--border)] bg-[var(--surface)] p-4 space-y-3 animate-fade-in">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2 text-sm font-medium text-[var(--ink)] hover:text-[var(--chrome)]"
              >
                {link.name}
              </Link>
            ))}

            {/* Mobile Auth Links */}
            <div className="pt-2 border-t border-[var(--border)]">
              {isAuthenticated ? (
                <div className="space-y-1">
                  <Link
                    to="/account"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-2 text-sm font-medium text-[var(--ink)] hover:text-[var(--chrome)]"
                  >
                    My Account
                  </Link>
                  <Link
                    to="/account?tab=orders"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-2 text-sm font-medium text-[var(--ink)] hover:text-[var(--chrome)]"
                  >
                    Orders
                  </Link>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      logout();
                    }}
                    className="block w-full text-left py-2 text-sm font-medium text-rose-500 hover:text-rose-400"
                  >
                    Log Out
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-2 text-sm font-medium text-[var(--ink)] hover:text-[var(--chrome)]"
                >
                  Sign in
                </Link>
              )}
            </div>

            <div className="pt-2 border-t border-[var(--border)]">
              <span className="text-xs font-mono uppercase text-[var(--chrome)] tracking-wider">Categories</span>
              <div className="grid grid-cols-1 gap-1.5 mt-2">
                {Object.values(categoriesData).map((cat) => (
                  <Link
                    key={cat.slug}
                    to={`/category/${cat.slug}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-xs py-1.5 text-[var(--ink-muted)] hover:text-[var(--ink)]"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
