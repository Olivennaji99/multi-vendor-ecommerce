"use client";

import { useEffect } from "react";

import { useRecentlyViewedStore } from "@/stores/recently-viewed.store";

export function useTrackRecentlyViewed(productId: string) {
  const addProductId = useRecentlyViewedStore((state) => state.addProductId);

  useEffect(() => {
    addProductId(productId);
  }, [productId, addProductId]);
}

export function useRecentlyViewedIds() {
  return useRecentlyViewedStore((state) => state.productIds);
}
