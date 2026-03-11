/**
 * Fetches nearby providers from API. Use from map/list screens with userLocation.
 * Pass memoized params (useMemo) at call site to avoid refetch loops from object reference changes.
 * On API failure (CORS, network, invalid JSON): retries once, then returns fallback providers so the map never breaks.
 */
import { useQuery } from '@tanstack/react-query';
import { fetchNearbyProviders, getFallbackNearbyProviders } from '../data/providersApi';
import type { NearbyProvidersParams, NearbyProvidersResult } from '../domain/types';

const QUERY_KEY = ['providers', 'nearby'] as const;

const STALE_TIME_MS = 2 * 60 * 1000; // 2 minutes

/** Stable query key from primitives only — prevents refetch loops from new param object references */
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

let providersFallbackLogged = false;

/** Retry providers API only once; then always return fallback so the map never breaks. Never throws. */
async function fetchWithRetryAndFallback(params: NearbyProvidersParams): Promise<NearbyProvidersResult> {
  const fallbackResult = (): NearbyProvidersResult => {
    const fallback = getFallbackNearbyProviders(params.role);
    return { items: fallback, total: fallback.length, page: 1, limit: params.limit ?? 20 };
  };
  try {
    const result = await fetchNearbyProviders(params);
    return result;
  } catch {
    try {
      return await fetchNearbyProviders(params);
    } catch {
      if (!providersFallbackLogged) {
        providersFallbackLogged = true;
        if (__DEV__) console.warn('[providers] Using fallback list (API unavailable or 401).');
      }
      return fallbackResult();
    }
  }
}

const REALTIME_REFETCH_MS = 5000; // 5s when tracking provider movement

export function useNearbyProviders(
  params: NearbyProvidersParams | null,
  enabled = true,
  /** When true, refetch every 5s for real-time provider location (e.g. when tracking active request). */
  realTimeTracking = false
) {
  const queryKey = getNearbyQueryKey(params);

  return useQuery({
    queryKey,
    queryFn: () =>
      params
        ? fetchWithRetryAndFallback(params)
        : Promise.resolve({ items: [], total: 0, page: 1, limit: 20 }),
    enabled: enabled && params != null && params.latitude != null && params.longitude != null,
    staleTime: realTimeTracking ? 0 : STALE_TIME_MS,
    refetchInterval: realTimeTracking ? REALTIME_REFETCH_MS : false,
    refetchOnWindowFocus: false,
    retry: false,
    retryOnMount: false,
  });
}
