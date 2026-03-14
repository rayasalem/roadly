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
    createdAt: now,
    updatedAt: now,
  };
}

function getMockFallback(): CustomerRequestsResponse {
  const items: ServiceRequest[] = MOCK_REQUESTS.map(mockToServiceRequest);
  return { items, total: items.length };
}

export function useRequestHistory(enabled = true) {
  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      try {
        return await fetchCustomerRequests();
      } catch (error) {
        if (__DEV__) {
          console.warn('[useRequestHistory] API failed, using mock requests.', error instanceof Error ? error.message : error);
        }
        return getMockFallback();
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
