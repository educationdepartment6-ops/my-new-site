import { create } from 'zustand';
import { useCartStore } from './useCartStore';
import { safeApiFetch } from '../utils/api';

export const useCustomerAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  checkAuth: async () => {
    try {
      const data = await safeApiFetch('/api/auth/me');
      if (data && data.user) {
        set({ user: data.user, isAuthenticated: true, isLoading: false });
        return data.user;
      }
      set({ user: null, isAuthenticated: false, isLoading: false });
      return null;
    } catch (_) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      return null;
    }
  },

  login: async (email, password) => {
    const data = await safeApiFetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    set({ user: data.user, isAuthenticated: true });

    // Merge guest cart with customer cart
    try {
      const guestItems = useCartStore.getState().items;
      if (guestItems && guestItems.length > 0) {
        const cartData = await safeApiFetch('/api/account/cart/merge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ guestItems })
        });
        if (cartData && cartData.items) {
          useCartStore.setState({ items: cartData.items });
        }
      }
    } catch (err) {
      console.warn('Cart merge error:', err);
    }

    return data.user;
  },

  logout: async () => {
    try {
      await safeApiFetch('/api/auth/logout', { method: 'POST' });
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
