/**
 * Fetches current provider's requests (GET /requests/provider).
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchProviderRequests, updateRequestStatus } from '../data/requestApi';
import type { ServiceRequest } from '../domain/types';
import type { RequestStatus } from '../domain/types';
import { isRequestInProgress } from '../constants/requestStatusTheme';
import { useAuthStore } from '../../../store/authStore';

const QUERY_KEY = ['requests', 'provider'] as const;
const STALE_MS = 45 * 1000;

export function useProviderRequests() {
  const queryClient = useQueryClient();
  const providerId = useAuthStore((s) => s.user?.id ?? undefined);
  const queryKey = [...QUERY_KEY, providerId] as const;

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const res = await fetchProviderRequests();
      return res.items;
    },
    staleTime: STALE_MS,
    retry: 2,
  });

  const updateMutation = useMutation({
    mutationFn: updateRequestStatus,
    onSuccess: (updated) => {
      queryClient.setQueryData<ServiceRequest[]>(queryKey, (prev) =>
        prev?.map((r) => (r.id === updated.id ? updated : r)) ?? [],
      );
    },
  });

  const requests = query.data ?? [];
  const newOrPending = requests.filter((r) => r.status === 'new' || r.status === 'pending');
  const inProgress = requests.filter((r) => isRequestInProgress(r.status));
  const completed = requests.filter((r) => r.status === 'completed');
  const rejected = requests.filter((r) => r.status === 'cancelled');

  const updateStatus = (requestId: string, status: RequestStatus, onSuccess?: () => void) => {
    updateMutation.mutate({ requestId, status }, { onSuccess: () => onSuccess?.() });
  };

  return {
    requests,
    newOrPending,
    inProgress,
    completed,
    rejected,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    updateStatus,
    isUpdating: updateMutation.isPending,
  };
}
