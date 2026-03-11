/**
 * Notifications list and mark-as-read. GET /notifications + PATCH /notifications/:id/read.
 * On network/timeout (e.g. ERR_CONNECTION_REFUSED) returns fallback empty list so the app does not crash.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchNotifications, markNotificationRead } from '../data/notificationsApi';
import { isNetworkOrTimeoutError } from '../../../shared/services/http/errorMessage';
import type { Notification } from '../domain/types';

export type { Notification };

const QUERY_KEY = ['notifications'] as const;
const STALE_TIME_MS = 60 * 1000;

export function useNotifications() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      try {
        return await fetchNotifications();
      } catch (error) {
        if (isNetworkOrTimeoutError(error)) {
          if (__DEV__) {
            console.warn('[useNotifications] Connection failed, using empty list.', error instanceof Error ? error.message : error);
          }
          return [] as Notification[];
        }
        throw error;
      }
    },
    staleTime: STALE_TIME_MS,
    retry: 2,
  });

  const markReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: (updated) => {
      queryClient.setQueryData<Notification[]>(QUERY_KEY, (prev) =>
        prev?.map((n) => (n.id === updated.id ? { ...n, read: true } : n)) ?? [],
      );
    },
  });

  const markAsRead = (id: string) => {
    markReadMutation.mutate(id);
  };

  return {
    notifications: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error instanceof Error ? query.error : null,
    refetch: query.refetch,
    markAsRead,
    isMarkingRead: markReadMutation.isPending,
  };
}
