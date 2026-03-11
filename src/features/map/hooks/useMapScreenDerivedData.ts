/**
 * Derived data for native map: region, route, cluster items, distance.
 * Keeps MapScreen.tsx under 200 lines.
 */
import { useMemo } from 'react';
import type { Provider } from '../../../providers/domain/types';
import { clusterProviders, CLUSTER_THRESHOLD_DEFAULT } from '../utils/mapClustering';
import { haversineDistanceKm } from '../../../location/data/haversine';
import { DEFAULT_MAP_CENTER, toRegion, buildRouteCoordinates } from '../utils/mapHelpers';

export interface MapScreenDerivedParams {
  coords: { latitude: number; longitude: number } | null;
  selectedProvider: Provider | null;
  nearest: Provider | null;
  sortedProviders: Provider[];
}

export function useMapScreenDerivedData({
  coords,
  selectedProvider,
  nearest,
  sortedProviders,
}: MapScreenDerivedParams) {
  const region = useMemo(
    () => (coords ? toRegion(coords) : toRegion(DEFAULT_MAP_CENTER)),
    [coords?.latitude, coords?.longitude]
  );
  const routeCoordinates = useMemo(() => {
    const dest = selectedProvider ?? nearest;
    if (!coords || !dest?.location) return [];
    const lat = (dest.location as { latitude?: number }).latitude;
    const lng = (dest.location as { longitude?: number }).longitude;
    if (typeof lat !== 'number' || typeof lng !== 'number') return [];
    return buildRouteCoordinates(coords, { latitude: lat, longitude: lng });
  }, [coords, selectedProvider?.location, nearest?.location]);
  const clusterItems = useMemo(
    () => clusterProviders(sortedProviders, CLUSTER_THRESHOLD_DEFAULT),
    [sortedProviders]
  );
  const selectedProviderDistanceKm = useMemo(() => {
    if (!selectedProvider?.location || !coords) return null;
    return haversineDistanceKm(coords, selectedProvider.location);
  }, [selectedProvider?.location, coords]);

  return { region, routeCoordinates, clusterItems, selectedProviderDistanceKm };
}
