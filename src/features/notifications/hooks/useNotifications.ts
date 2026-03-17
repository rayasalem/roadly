/**
 * Notifications list and mark-as-read. GET /notifications + PATCH /notifications/:id/read.
 * On network/timeout returns fallback empty list. In __DEV__ when empty, shows mock items.
 */
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchNotifications, markNotificationRead } from '../data/notificationsApi';
import { isNetworkOrTimeoutError } from '../../../shared/services/http/errorMessage';
import type { Notification } from '../domain/types';
import { MOCK_NOTIFICATIONS } from '../../../mock/mockNotifications';

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

  const [readMockIds, setReadMockIds] = useState<Set<string>>(() => new Set());

  const markAsRead = useCallback((id: string) => {
    if (__DEV__ && (id.startsWith('mock-') || id.startsWith('notif_'))) {
      setReadMockIds((s) => new Set(s).add(id));
      return;
    }
    markReadMutation.mutate(id);
  }, []);

  const list = query.data ?? [];
  const baseList = __DEV__ && list.length === 0 ? MOCK_NOTIFICATIONS : list;
  const notifications = baseList.map((n) =>
    (n.id.startsWith('mock-') || n.id.startsWith('notif_')) && readMockIds.has(n.id) ? { ...n, read: true } : n
  );

  return {
    notifications,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error instanceof Error ? query.error : null,
    refetch: query.refetch,
    markAsRead,
    isMarkingRead: markReadMutation.isPending,
  };
}
