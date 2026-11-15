import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { calculatePrice } from '../utils/pricing';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      isDrawerOpen: false,

      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),
      toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),

      addItem: (product, variant, quantity = 1) => {
        const currentItems = get().items;
        const itemKey = `${product.slug}_${variant.sku}`;
        const existingIndex = currentItems.findIndex((item) => item.key === itemKey);

        const unitPriceInr = variant.priceInr ?? (typeof variant.price === 'number' ? variant.price : 0);
        const unitPriceUsd = variant.priceUsd ?? (variant.priceInr ? Number((variant.priceInr / 86.5).toFixed(2)) : (typeof variant.price === 'number' ? variant.price : 0));

        if (existingIndex > -1) {
          const updatedItems = [...currentItems];
          updatedItems[existingIndex].quantity += quantity;
          set({ items: updatedItems, isDrawerOpen: true });
        } else {
          const newItem = {
            key: itemKey,
            productSlug: product.slug,
            productName: product.name,
            category: product.category,
            variantLabel: variant.label,
            sku: variant.sku,
            unitPriceInr,
            unitPriceUsd,
            unitPrice: unitPriceInr,
            quantity,
            batchNumber: variant.batchNumber || null,
          };
          set({ items: [...currentItems, newItem], isDrawerOpen: true });
        }
      },

      updateQuantity: (key, quantity) => {
        if (quantity <= 0) {
          get().removeItem(key);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.key === key ? { ...item, quantity } : item
          ),
        }));
      },

      removeItem: (key) => {
        set((state) => ({
          items: state.items.filter((item) => item.key !== key),
        }));
      },

      clearCart: () => set({ items: [] }),

      getSubtotal: (currency = 'INR') => {
        return get().items.reduce((acc, item) => {
          const price = currency === 'INR'
            ? (item.unitPriceInr ?? item.unitPrice ?? 0)
            : (item.unitPriceUsd ?? (item.unitPrice ? item.unitPrice / 86.5 : 0));
          return acc + price * item.quantity;
        }, 0);
      },

      getItemCount: () => {
        return get().items.reduce((acc, item) => acc + item.quantity, 0);
      },
    }),
    {
      name: 'mogwrld_cart_storage',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
