import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";

const WISHLIST_QUERY_KEY = ["wishlist"];

export function useWishlist(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: WISHLIST_QUERY_KEY,
    queryFn: () => apiClient.get<unknown>("/api/wishlist"),
    enabled: options?.enabled ?? true,
  });
}

export function useAddToWishlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) => apiClient.post(`/api/wishlist/${productId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: WISHLIST_QUERY_KEY }),
  });
}

export function useRemoveFromWishlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) => apiClient.delete(`/api/wishlist/${productId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: WISHLIST_QUERY_KEY }),
  });
}
