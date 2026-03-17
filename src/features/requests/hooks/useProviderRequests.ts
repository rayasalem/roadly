/**
 * Fetches current provider's requests (GET /requests/provider).
 * Returns list split into new/pending, in progress, and completed for dashboard sections.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchProviderRequests, updateRequestStatus } from '../data/requestApi';
import { isNetworkOrTimeoutError } from '../../../shared/services/http/errorMessage';
import type { ServiceRequest } from '../domain/types';
import type { RequestStatus } from '../domain/types';
import { isRequestInProgress } from '../constants/requestStatusTheme';
import { MOCK_REQUESTS } from '../../../mock/mockRequests';
import { useAuthStore } from '../../../store/authStore';

const QUERY_KEY = ['requests', 'provider'] as const;
const STALE_MS = 45 * 1000;

function mockToServiceRequest(m: import('../../../mock/mockRequests').MockRequest): ServiceRequest {
  const now = m.createdAt ?? new Date().toISOString();
  return {
    id: m.id,
    customerId: m.customerId,
    providerId: m.providerId ?? null,
    serviceType: m.service,
    status: m.status,
    origin: { latitude: m.customerLocation.latitude, longitude: m.customerLocation.longitude },
    providerName: m.providerName ?? null,
    customerName: m.customerName ?? null,
    createdAt: now,
    updatedAt: now,
  };
}

function getMockFallback(providerId: string | undefined): ServiceRequest[] {
  const list = providerId
    ? MOCK_REQUESTS.filter((m) => m.providerId === providerId)
    : MOCK_REQUESTS;
  return list.map(mockToServiceRequest);
}

export function useProviderRequests() {
  const queryClient = useQueryClient();
  const providerId = useAuthStore((s) => s.user?.id ?? undefined);

  const query = useQuery({
    queryKey: [...QUERY_KEY, providerId],
    queryFn: async () => {
      try {
        const res = await fetchProviderRequests();
        return res.items;
      } catch (error) {
        if (isNetworkOrTimeoutError(error)) {
          if (__DEV__) console.warn('[useProviderRequests] API failed, using mock.');
          return getMockFallback(providerId);
        }
        throw error;
      }
    },
    staleTime: STALE_MS,
  });

  const updateMutation = useMutation({
    mutationFn: updateRequestStatus,
    onSuccess: (updated) => {
      queryClient.setQueryData<ServiceRequest[]>(QUERY_KEY, (prev) =>
        prev?.map((r) => (r.id === updated.id ? updated : r)) ?? []
      );
    },
  });

  const requests = query.data ?? [];
  const newOrPending = requests.filter((r) => r.status === 'new' || r.status === 'pending');
  const inProgress = requests.filter((r) => isRequestInProgress(r.status));
  const completed = requests.filter((r) => r.status === 'completed');
  const rejected = requests.filter((r) => r.status === 'cancelled');

  const updateStatus = (requestId: string, status: RequestStatus, onSuccess?: () => void) => {
    updateMutation.mutate(
      { requestId, status },
      { onSuccess: () => onSuccess?.() }
    );
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
