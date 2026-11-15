import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Package,
  Layers,
  Image as ImageIcon,
  ShoppingBag,
  UserCheck,
  Users,
  LogOut,
  ExternalLink,
  Shield,
  Loader2
} from 'lucide-react';

export default function AdminLayout() {
  const [adminEmail, setAdminEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Verify server session
    fetch('/api/admin/me')
      .then((res) => {
        if (!res.ok) throw new Error('Unauthenticated');
        return res.json();
      })
      .then((data) => {
        setAdminEmail(data.email);
        setLoading(false);
      })
      .catch(() => {
        navigate('/admin/login', { replace: true });
      });
  }, [navigate, location.pathname]);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch (_) {}
    navigate('/admin/login', { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090A0B] flex items-center justify-center text-zinc-400">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-7 h-7 animate-spin text-emerald-400" />
          <span className="text-xs font-mono">Verifying Master Security Token...</span>
        </div>
      </div>
    );
  }

  const navItems = [
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Categories', path: '/admin/categories', icon: Layers },
    { name: 'Image Studio', path: '/admin/images', icon: ImageIcon },
    { name: 'Requisitions', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Customers', path: '/admin/customers', icon: Users },
    { name: 'Security & Logs', path: '/admin/account', icon: UserCheck },
  ];

  return (
    <div className="min-h-screen bg-[#090A0B] text-zinc-100 flex flex-col font-sans antialiased">
      {/* Top Bar */}
      <header className="h-16 border-b border-zinc-800/80 bg-zinc-950/70 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Shield className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <span className="font-bold text-sm tracking-wide text-white font-mono uppercase">MOG WRLD</span>
              <span className="hidden sm:inline-block text-[10px] ml-2 px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
                CONSOLE v2.0
              </span>
            </div>
          </div>
        </div>

        {/* Center / Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `px-3.5 py-1.5 rounded-xl text-xs font-medium flex items-center gap-2 transition-all ${
                    isActive
                      ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700/60'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                  }`
                }
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Right User Controls */}
        <div className="flex items-center gap-3">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-zinc-800/80 transition-all font-mono"
            title="Open Live Public Store"
          >
            <span>Live Store</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs font-mono text-zinc-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{adminEmail}</span>
          </div>

          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
            title="Sign out of Admin Session"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Mobile Nav Bar */}
      <nav className="md:hidden flex items-center justify-around border-b border-zinc-800 bg-zinc-950 p-2 overflow-x-auto text-xs">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `p-2 rounded-lg flex flex-col items-center gap-1 ${
                  isActive ? 'text-emerald-400 font-bold' : 'text-zinc-400'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span className="text-[10px]">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
