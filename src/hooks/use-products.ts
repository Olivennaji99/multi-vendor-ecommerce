import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";

export interface ProductFilters {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  sort?: "newest" | "price-asc" | "price-desc" | "rating" | "popular";
  page?: number;
  limit?: number;
}

function toSearchParams(filters: ProductFilters): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== "") params.set(key, String(value));
  }
  return params.toString();
}

export function useProducts(filters: ProductFilters) {
  const query = toSearchParams(filters);
  return useQuery({
    queryKey: ["products", filters],
    queryFn: () => apiClient.get<unknown>(`/api/products${query ? `?${query}` : ""}`),
  });
}
