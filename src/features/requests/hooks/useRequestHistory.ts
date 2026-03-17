/**
 * Fetches current user's request history (GET /requests/customer).
 * On network/timeout or API failure returns mock request list so the app always has data to show.
 */
import { useQuery } from '@tanstack/react-query';
import type { CustomerRequestsResponse } from '../data/requestApi';
import { fetchCustomerRequests } from '../data/requestApi';
import { isNetworkOrTimeoutError } from '../../../shared/services/http/errorMessage';
import type { ServiceRequest } from '../domain/types';
import { MOCK_REQUESTS } from '../../../mock/mockRequests';
import { useAuthStore } from '../../../store/authStore';

const QUERY_KEY = ['requests', 'customer'] as const;
const STALE_MS = 60 * 1000;

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

function getMockFallback(customerId: string | undefined): CustomerRequestsResponse {
  const list = customerId ? MOCK_REQUESTS.filter((m) => m.customerId === customerId) : MOCK_REQUESTS;
  const items: ServiceRequest[] = list.map(mockToServiceRequest);
  return { items, total: items.length };
}

export function useRequestHistory(enabled = true) {
  const customerId = useAuthStore((s) => s.user?.role === 'user' ? s.user?.id : undefined);

  const query = useQuery({
    queryKey: [...QUERY_KEY, customerId],
    queryFn: async () => {
      try {
        return await fetchCustomerRequests();
      } catch (error) {
        if (__DEV__) {
          console.warn('[useRequestHistory] API failed, using mock requests.', error instanceof Error ? error.message : error);
        }
        return getMockFallback(customerId);
      }
    },
    staleTime: STALE_MS,
    enabled,
  });
  return {
    requests: query.data?.items ?? [],
    total: query.data?.total ?? 0,
    isLoading: query.isLoading,
    isError: false,
    error: null,
    refetch: query.refetch,
  };
}
