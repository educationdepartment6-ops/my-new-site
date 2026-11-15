import { create } from 'zustand';

export const useCurrencyStore = create((set) => ({
  currency: 'INR',
  setCurrency: (currency) => set({ currency }),
  toggleCurrency: () => set((state) => ({ currency: state.currency === 'INR' ? 'USD' : 'INR' }))
}));
