/**
 * Fetches nearby providers from API. Use from map/list screens with userLocation.
 * No API calls inside components — call this hook and pass data down.
 */
import { useQuery } from '@tanstack/react-query';
import { fetchNearbyProviders } from '../data/providersApi';
import type { NearbyProvidersParams } from '../domain/types';

const QUERY_KEY = ['providers', 'nearby'] as const;

export function useNearbyProviders(params: NearbyProvidersParams | null, enabled = true) {
  return useQuery({
    queryKey: [...QUERY_KEY, params],
    queryFn: () => fetchNearbyProviders(params!),
    enabled: enabled && params != null && params.latitude != null && params.longitude != null,
  });
}
