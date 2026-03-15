import { useQuery } from '@tanstack/react-query';
import { fetchProviderRatings } from '../data/ratingsApi';

const QUERY_KEY = ['ratings', 'provider'] as const;
const STALE_MS = 60 * 1000;

export function useProviderRatings() {
  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchProviderRatings,
    staleTime: STALE_MS,
  });
  const data = query.data;
  return {
    ratings: data?.items ?? [],
    total: data?.total ?? 0,
    averageRating: data?.averageRating ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
