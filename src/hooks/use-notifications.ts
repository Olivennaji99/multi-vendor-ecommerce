import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";

const NOTIFICATIONS_QUERY_KEY = ["notifications"];

export function useNotifications(params?: { unreadOnly?: boolean; enabled?: boolean }) {
  const query = params?.unreadOnly ? "?unreadOnly=true" : "";
  return useQuery({
    queryKey: [...NOTIFICATIONS_QUERY_KEY, params],
    queryFn: () => apiClient.get<unknown>(`/api/notifications${query}`),
    refetchInterval: 30_000,
    enabled: params?.enabled ?? true,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.patch(`/api/notifications/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY }),
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient.patch("/api/notifications"),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY }),
  });
}
