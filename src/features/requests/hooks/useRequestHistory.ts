/**
 * Fetches current user's request history (GET /requests/customer).
 * On network/timeout (e.g. ERR_CONNECTION_REFUSED) returns fallback empty list so the app does not crash.
 */
import { useQuery } from '@tanstack/react-query';
import type { CustomerRequestsResponse } from '../data/requestApi';
import { fetchCustomerRequests } from '../data/requestApi';
import { isNetworkOrTimeoutError } from '../../../shared/services/http/errorMessage';

const QUERY_KEY = ['requests', 'customer'] as const;
const STALE_MS = 60 * 1000;

const FALLBACK: CustomerRequestsResponse = { items: [], total: 0 };

export function useRequestHistory(enabled = true) {
  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      try {
        return await fetchCustomerRequests();
      } catch (error) {
        if (isNetworkOrTimeoutError(error)) {
          if (__DEV__) {
            console.warn('[useRequestHistory] Connection failed, using empty list.', error instanceof Error ? error.message : error);
          }
          return FALLBACK;
        }
        throw error;
      }
    },
    staleTime: STALE_MS,
    enabled,
  });
  return {
    requests: query.data?.items ?? [],
    total: query.data?.total ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error instanceof Error ? query.error : null,
    refetch: query.refetch,
  };
}
