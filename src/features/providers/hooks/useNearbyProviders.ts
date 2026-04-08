/**
 * Fetches nearby providers from GET /providers/nearby. Pass memoized params to avoid refetch loops.
 */
import { useQuery } from '@tanstack/react-query';
import { fetchNearbyProviders } from '../data/providersApi';
import type { NearbyProvidersParams, NearbyProvidersResult } from '../domain/types';

const QUERY_KEY = ['providers', 'nearby'] as const;

const STALE_TIME_MS = 2 * 60 * 1000;

function getNearbyQueryKey(params: NearbyProvidersParams | null) {
  if (params == null) return [...QUERY_KEY, 'null'] as const;
  return [
    ...QUERY_KEY,
    params.latitude,
    params.longitude,
    params.radiusKm ?? 0,
    params.role ?? '',
    params.availableOnly ?? true,
    params.page ?? 1,
    params.limit ?? 20,
  ] as const;
}

const REALTIME_REFETCH_MS = 5000;

export function useNearbyProviders(
  params: NearbyProvidersParams | null,
  enabled = true,
  realTimeTracking = false,
) {
  const queryKey = getNearbyQueryKey(params);

  return useQuery({
    queryKey,
    queryFn: (): Promise<NearbyProvidersResult> =>
      params
        ? fetchNearbyProviders(params)
        : Promise.resolve({ items: [], total: 0, page: 1, limit: 20 }),
    enabled: enabled && params != null && params.latitude != null && params.longitude != null,
    staleTime: realTimeTracking ? 0 : STALE_TIME_MS,
    refetchInterval: realTimeTracking ? REALTIME_REFETCH_MS : false,
    refetchOnWindowFocus: false,
    retry: 2,
    retryOnMount: true,
  });
}
