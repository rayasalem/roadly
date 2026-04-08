/**
 * Fetches current user's request history (GET /requests/customer).
 */
import { useQuery } from '@tanstack/react-query';
import { fetchCustomerRequests } from '../data/requestApi';
import { useAuthStore } from '../../../store/authStore';

const QUERY_KEY = ['requests', 'customer'] as const;
const STALE_MS = 60 * 1000;

export function useRequestHistory(enabled = true) {
  const customerId = useAuthStore((s) => (s.user?.role === 'user' ? s.user?.id : undefined));

  const query = useQuery({
    queryKey: [...QUERY_KEY, customerId],
    queryFn: () => fetchCustomerRequests(),
    staleTime: STALE_MS,
    enabled,
    retry: 2,
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
