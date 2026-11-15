import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User, KeyRound, MapPin, ShoppingBag, Plus, Trash2, Check, Edit2, Loader2, AlertCircle, LogOut } from 'lucide-react';
import SEO from '../../seo/SEO';
import { useCustomerAuthStore } from '../../store/useCustomerAuthStore';

export default function AccountPage() {
  const { user, isAuthenticated, isLoading: authLoading, logout, updateUser } = useCustomerAuthStore();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'profile';

  const [activeTab, setActiveTab] = useState(initialTab);

  // Profile Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState(null);

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState(null);

  // Addresses State
  const [addresses, setAddresses] = useState([]);
  const [addrLoading, setAddrLoading] = useState(false);
  const [editingAddr, setEditingAddr] = useState(null);
  const [isNewAddr, setIsNewAddr] = useState(false);

  // Orders State
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Auth gate
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login?redirect=/account', { replace: true });
    }
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
    }
  }, [authLoading, isAuthenticated, user, navigate]);

  // Load addresses & orders when corresponding tab active
  useEffect(() => {
    if (activeTab === 'addresses') {
      setAddrLoading(true);
      fetch('/api/account/addresses')
        .then((r) => r.json())
        .then((data) => setAddresses(Array.isArray(data) ? data : []))
        .finally(() => setAddrLoading(false));
    } else if (activeTab === 'orders') {
      setOrdersLoading(true);
      fetch('/api/account/orders')
        .then((r) => r.json())
        .then((data) => setOrders(Array.isArray(data) ? data : []))
        .finally(() => setOrdersLoading(false));
    }
  }, [activeTab]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg(null);
    try {
      const res = await fetch('/api/account/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile');
      updateUser({ name: data.user.name, phone: data.user.phone });
      setProfileMsg({ type: 'success', text: 'Profile updated successfully.' });
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.message });
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwSaving(true);
    setPwMsg(null);
    try {
      const res = await fetch('/api/account/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to change password');
      setPwMsg({ type: 'success', text: 'Password updated. Please sign in again with your new password.' });
      setTimeout(() => logout(), 2000);
    } catch (err) {
      setPwMsg({ type: 'error', text: err.message });
    } finally {
      setPwSaving(false);
    }
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    try {
      const url = isNewAddr ? '/api/account/addresses' : `/api/account/addresses/${editingAddr.id}`;
      const method = isNewAddr ? 'POST' : 'PUT';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingAddr)
      });
      if (res.ok) {
        setEditingAddr(null);
        // Reload
        const refetch = await fetch('/api/account/addresses');
        setAddresses(await refetch.json());
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!confirm('Are you sure you want to delete this delivery address?')) return;
    try {
      const res = await fetch(`/api/account/addresses/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setAddresses((prev) => prev.filter((a) => a.id !== id));
      }
    } catch (err) {
      alert(err.message);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-zinc-400">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  const tabs = [
    { id: 'profile', name: 'Profile Information', icon: User },
    { id: 'security', name: 'Change Password', icon: KeyRound },
    { id: 'addresses', name: 'Saved Addresses', icon: MapPin },
    { id: 'orders', name: 'My Orders', icon: ShoppingBag },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans antialiased text-zinc-100">
      <SEO title="My Account" description="Customer account portal." noindex={true} />

      {/* Top Greeting & User Tagline */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <span className="badge-ruo inline-block text-[10px] uppercase font-mono mb-1.5">
            Customer Account
          </span>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[var(--ink)]">
            Welcome, {user.name}
          </h1>
          <p className="text-xs text-[var(--ink-muted)] font-mono">{user.email}</p>
        </div>

        <button
          onClick={logout}
          className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Log out</span>
        </button>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mt-8">
        {/* Left Navigation */}
        <div className="md:col-span-4 lg:col-span-3 space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSearchParams({ tab: tab.id });
                }}
                className={`w-full p-3 rounded-2xl text-xs font-medium flex items-center gap-3 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-zinc-900 border border-zinc-700/80 text-white font-semibold shadow-md'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-zinc-500'}`} />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Right Content */}
        <div className="md:col-span-8 lg:col-span-9">
          {/* TAB 1: PROFILE */}
          {activeTab === 'profile' && (
            <div className="p-6 sm:p-8 rounded-3xl bg-zinc-950/70 border border-zinc-800 space-y-6">
              <div>
                <h2 className="text-base font-bold font-mono text-white">Profile Details</h2>
                <p className="text-xs text-zinc-400 mt-0.5">Manage your personal identification and institutional contact details.</p>
              </div>

              {profileMsg && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    profileMsg.type === 'success'
                      ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                      : 'bg-red-500/10 border border-red-500/20 text-red-400'
                  }`}
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{profileMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
                <div>
                  <label className="block text-zinc-400 mb-1 font-mono">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1 font-mono">Registered Email (Read-Only)</label>
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className="w-full p-2.5 rounded-xl bg-zinc-900/50 border border-zinc-800/60 text-zinc-500 cursor-not-allowed font-mono"
                  />
                  <p className="text-[11px] text-zinc-500 mt-1">Contact customer support if email modification is required.</p>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1 font-mono">Contact Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={profileSaving}
                    className="py-2.5 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {profileSaving ? 'Saving...' : 'Save Profile Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: CHANGE PASSWORD */}
          {activeTab === 'security' && (
            <div className="p-6 sm:p-8 rounded-3xl bg-zinc-950/70 border border-zinc-800 space-y-6">
              <div>
                <h2 className="text-base font-bold font-mono text-white">Change Password</h2>
                <p className="text-xs text-zinc-400 mt-0.5">Update your password. You will need your current password to proceed.</p>
              </div>

              {pwMsg && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    pwMsg.type === 'success'
                      ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                      : 'bg-red-500/10 border border-red-500/20 text-red-400'
                  }`}
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{pwMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
                <div>
                  <label className="block text-zinc-400 mb-1 font-mono">Current Password *</label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1 font-mono">New Password (min 8 chars, letter + number) *</label>
                  <input
                    type="password"
                    required
                    minLength="8"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1 font-mono">Confirm New Password *</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={pwSaving}
                    className="py-2.5 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {pwSaving ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: ADDRESSES */}
          {activeTab === 'addresses' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold font-mono text-white">Saved Delivery Addresses</h2>
                  <p className="text-xs text-zinc-400 mt-0.5">Addresses used for expedited laboratory delivery during requisition checkout.</p>
                </div>
                <button
                  onClick={() => {
                    setIsNewAddr(true);
                    setEditingAddr({
                      recipientName: user.name || '',
                      phone: user.phone || '',
                      addressLine1: '',
                      addressLine2: '',
                      city: '',
                      postalCode: '',
                      country: 'United States',
                      isDefault: addresses.length === 0
                    });
                  }}
                  className="py-2 px-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Address</span>
                </button>
              </div>

              {addrLoading ? (
                <div className="py-12 text-center text-zinc-500">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-400" />
                </div>
              ) : addresses.length === 0 ? (
                <div className="p-8 rounded-3xl bg-zinc-950/70 border border-zinc-800 text-center space-y-2">
                  <MapPin className="w-8 h-8 text-zinc-600 mx-auto" />
                  <p className="text-xs text-zinc-400 font-mono">No delivery addresses saved yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className="p-5 rounded-2xl bg-zinc-950/70 border border-zinc-800 space-y-3 relative flex flex-col justify-between"
                    >
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-zinc-100">{addr.recipient_name}</span>
                          {addr.is_default === 1 && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-zinc-400 leading-relaxed">
                          {addr.address_line1}
                          {addr.address_line2 && `, ${addr.address_line2}`}
                        </p>
                        <p className="text-zinc-400 font-mono">
                          {addr.city}, {addr.postal_code}
                        </p>
                        <p className="text-zinc-500 text-[11px]">{addr.country}</p>
                        {addr.phone && <p className="text-zinc-500 font-mono text-[11px] pt-1">{addr.phone}</p>}
                      </div>

                      <div className="pt-3 border-t border-zinc-900 flex items-center justify-end gap-2 text-xs">
                        <button
                          onClick={() => {
                            setIsNewAddr(false);
                            setEditingAddr({
                              id: addr.id,
                              recipientName: addr.recipient_name,
                              phone: addr.phone || '',
                              addressLine1: addr.address_line1,
                              addressLine2: addr.address_line2 || '',
                              city: addr.city,
                              postalCode: addr.postal_code,
                              country: addr.country,
                              isDefault: Boolean(addr.is_default)
                            });
                          }}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-white"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Address Modal */}
              {editingAddr && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="w-full max-w-md rounded-3xl bg-zinc-950 border border-zinc-800 p-6 space-y-4 shadow-2xl">
                    <h3 className="text-sm font-bold font-mono text-white">
                      {isNewAddr ? 'Add Delivery Address' : 'Edit Delivery Address'}
                    </h3>
                    <form onSubmit={handleSaveAddress} className="space-y-3 text-xs">
                      <div>
                        <label className="block text-zinc-400 mb-1 font-mono">Recipient Name *</label>
                        <input
                          type="text"
                          required
                          value={editingAddr.recipientName}
                          onChange={(e) => setEditingAddr({ ...editingAddr, recipientName: e.target.value })}
                          className="w-full p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-400 mb-1 font-mono">Street Address Line 1 *</label>
                        <input
                          type="text"
                          required
                          value={editingAddr.addressLine1}
                          onChange={(e) => setEditingAddr({ ...editingAddr, addressLine1: e.target.value })}
                          className="w-full p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-400 mb-1 font-mono">Address Line 2 (Lab / Suite)</label>
                        <input
                          type="text"
                          value={editingAddr.addressLine2}
                          onChange={(e) => setEditingAddr({ ...editingAddr, addressLine2: e.target.value })}
                          className="w-full p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-zinc-400 mb-1 font-mono">City *</label>
                          <input
                            type="text"
                            required
                            value={editingAddr.city}
                            onChange={(e) => setEditingAddr({ ...editingAddr, city: e.target.value })}
                            className="w-full p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100"
                          />
                        </div>
                        <div>
                          <label className="block text-zinc-400 mb-1 font-mono">Postal Code *</label>
                          <input
                            type="text"
                            required
                            value={editingAddr.postalCode}
                            onChange={(e) => setEditingAddr({ ...editingAddr, postalCode: e.target.value })}
                            className="w-full p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-zinc-400 mb-1 font-mono">Contact Phone</label>
                        <input
                          type="tel"
                          value={editingAddr.phone}
                          onChange={(e) => setEditingAddr({ ...editingAddr, phone: e.target.value })}
                          className="w-full p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100"
                        />
                      </div>
                      <div>
                        <label className="flex items-center gap-2 cursor-pointer pt-1 text-zinc-400">
                          <input
                            type="checkbox"
                            checked={editingAddr.isDefault}
                            onChange={(e) => setEditingAddr({ ...editingAddr, isDefault: e.target.checked })}
                            className="rounded border-zinc-800 bg-zinc-900 text-emerald-500"
                          />
                          <span>Set as default delivery address</span>
                        </label>
                      </div>
                      <div className="flex justify-end gap-2 pt-3">
                        <button
                          type="button"
                          onClick={() => setEditingAddr(null)}
                          className="px-3 py-1.5 rounded-xl bg-zinc-900 text-zinc-400"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 rounded-xl bg-emerald-500 text-black font-semibold uppercase tracking-wider"
                        >
                          Save
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-bold font-mono text-white">My Orders</h2>
                <p className="text-xs text-zinc-400 mt-0.5">Orders placed under your account.</p>
              </div>

              {ordersLoading ? (
                <div className="py-12 text-center text-zinc-500">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-400" />
                </div>
              ) : orders.length === 0 ? (
                <div className="p-8 rounded-3xl bg-zinc-950/70 border border-zinc-800 text-center space-y-2">
                  <ShoppingBag className="w-8 h-8 text-zinc-600 mx-auto" />
                  <p className="text-xs text-zinc-400 font-mono">No orders placed yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-5 rounded-2xl bg-zinc-950/70 border border-zinc-800 space-y-3 text-xs"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-zinc-900">
                        <div>
                          <span className="font-mono font-bold text-emerald-400">{ord.order_number}</span>
                          <span className="text-[11px] text-zinc-500 ml-2 font-mono">
                            {new Date(ord.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono border bg-zinc-900 border-zinc-800 text-zinc-300">
                          {ord.status}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        {ord.items?.map((it, idx) => (
                          <div key={idx} className="flex justify-between text-zinc-300">
                            <span>
                              {it.quantity}x {it.name} ({it.strength || it.selectedStrength || 'Standard'})
                            </span>
                            <span className="font-mono text-zinc-400">
                              ₹{(it.unitPriceInr ? it.unitPriceInr * it.quantity : it.price * it.quantity).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-zinc-900 flex justify-between font-mono font-bold text-zinc-100">
                        <span>Total:</span>
                        <span className="text-emerald-400">₹{ord.total_inr?.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
