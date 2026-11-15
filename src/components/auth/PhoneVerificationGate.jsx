import React, { useState } from 'react';
import { Phone, ShieldCheck, AlertCircle, Loader2, LogOut } from 'lucide-react';
import { useCustomerAuthStore } from '../../store/useCustomerAuthStore';
import { safeApiFetch } from '../../utils/api';

export default function PhoneVerificationGate({ children }) {
  const { user, isAuthenticated, isLoading, updateUser, logout } = useCustomerAuthStore();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  // If user is not logged in, let the child component handle its own authentication redirect
  if (!isAuthenticated || !user) {
    return children;
  }

  // Check if current user has a valid Indian mobile number
  const cleanPhone = (user.phone || '').trim().replace(/[\s\-\(\)\.]/g, '');
  const isValidIndianPhone = /^(?:\+91)?[6-9]\d{9}$/.test(cleanPhone) || /^91[6-9]\d{9}$/.test(cleanPhone);

  if (isValidIndianPhone) {
    return children;
  }

  // User has missing or invalid phone - show the mandatory Phone Gate
  const handleSavePhone = async (e) => {
    e.preventDefault();
    setError('');

    const raw = phoneNumber.trim().replace(/[\s\-\(\)\.]/g, '');
    let normalized = null;

    if (/^\+91[6-9]\d{9}$/.test(raw)) {
      normalized = raw;
    } else if (/^91[6-9]\d{9}$/.test(raw)) {
      normalized = '+' + raw;
    } else if (/^[6-9]\d{9}$/.test(raw)) {
      normalized = '+91' + raw;
    }

    if (!normalized) {
      setError('Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.');
      return;
    }

    setSaving(true);
    try {
      const data = await safeApiFetch('/api/account/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: normalized })
      });
      updateUser({ phone: data.user.phone });
    } catch (err) {
      setError(err.message || 'Failed to update phone number. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans antialiased text-zinc-100">
      <div className="w-full max-w-md space-y-6 animate-fade-in">
        <div className="p-6 sm:p-8 rounded-3xl bg-zinc-950/90 border border-zinc-800 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <Phone className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-heading font-bold text-white">
              Add Your Mobile Number
            </h1>
            <p className="text-xs text-zinc-400 leading-relaxed">
              In accordance with delivery verification and research supply guidelines, all account holders must provide a valid Indian mobile number to continue.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          <form onSubmit={handleSavePhone} className="space-y-4 text-xs">
            <div>
              <label className="block text-zinc-400 mb-1 font-mono font-medium">
                Mobile Number *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  autoFocus
                  placeholder="9876543210 or +91 9876543210"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                />
              </div>
              <p className="text-[10px] text-zinc-500 mt-1 font-mono">
                10-digit Indian mobile number (starts with 6, 7, 8, or 9)
              </p>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Mobile Number...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Save & Continue</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500">
            <span>Signed in as {user.email}</span>
            <button
              type="button"
              onClick={() => logout()}
              className="text-zinc-400 hover:text-red-400 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
