/**
 * Notifications list and mark-as-read. GET /notifications + PATCH /notifications/:id/read.
 * On network/timeout returns fallback empty list. In __DEV__ when empty, shows mock items.
 */
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchNotifications, markNotificationRead } from '../data/notificationsApi';
import { isNetworkOrTimeoutError } from '../../../shared/services/http/errorMessage';
import type { Notification } from '../domain/types';

export type { Notification };

const QUERY_KEY = ['notifications'] as const;
const STALE_TIME_MS = 60 * 1000;

/** Mock notifications for development when API returns empty */
function getMockNotifications(): Notification[] {
  const now = new Date().toISOString();
  const hourAgo = new Date(Date.now() - 3600000).toISOString();
  return [
    { id: 'mock-1', type: 'new_request', title: 'New request', message: 'Ahmed — Mechanic, 2.1 km away', createdAt: now, read: false, data: { requestId: 'r1' } },
    { id: 'mock-2', type: 'request_accepted', title: 'Request accepted', message: 'Your request was accepted by the provider.', createdAt: hourAgo, read: true, data: { requestId: 'r2' } },
    { id: 'mock-3', type: 'service_completed', title: 'Service completed', message: 'Rate your provider.', createdAt: hourAgo, read: false, data: { requestId: 'r3' } },
  ];
}

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
    if (__DEV__ && id.startsWith('mock-')) {
      setReadMockIds((s) => new Set(s).add(id));
      return;
    }
    markReadMutation.mutate(id);
  }, []);

  const list = query.data ?? [];
  const baseList = __DEV__ && list.length === 0 ? getMockNotifications() : list;
  const notifications = baseList.map((n) =>
    n.id.startsWith('mock-') && readMockIds.has(n.id) ? { ...n, read: true } : n
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
