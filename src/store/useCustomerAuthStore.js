import { create } from 'zustand';
import { useCartStore } from './useCartStore';

export const useCustomerAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  checkAuth: async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        set({ user: data.user, isAuthenticated: true, isLoading: false });
        return data.user;
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
        return null;
      }
    } catch (_) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      return null;
    }
  },

  login: async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Invalid email or password');
    }

    set({ user: data.user, isAuthenticated: true });

    // Merge guest cart with customer cart
    try {
      const guestItems = useCartStore.getState().items;
      if (guestItems && guestItems.length > 0) {
        const mergeRes = await fetch('/api/account/cart/merge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ guestItems })
        });
        if (mergeRes.ok) {
          const cartData = await mergeRes.json();
          if (cartData.items) {
            useCartStore.setState({ items: cartData.items });
          }
        }
      }
    } catch (err) {
      console.warn('Cart merge error:', err);
    }

    return data.user;
  },

  logout: async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (_) {}
    set({ user: null, isAuthenticated: false });
  },

  updateUser: (updatedFields) => {
    const current = get().user;
    if (current) {
      set({ user: { ...current, ...updatedFields } });
    }
  }
}));
