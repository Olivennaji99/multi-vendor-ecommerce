import { create } from "zustand";
import { persist } from "zustand/middleware";

const MAX_RECENTLY_VIEWED = 10;

interface RecentlyViewedState {
  productIds: string[];
  addProductId: (id: string) => void;
}

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set, get) => ({
      productIds: [],
      addProductId: (id: string) => {
        const existing = get().productIds.filter((productId) => productId !== id);
        set({ productIds: [id, ...existing].slice(0, MAX_RECENTLY_VIEWED) });
      },
    }),
    { name: "novashop-recently-viewed" }
  )
);
