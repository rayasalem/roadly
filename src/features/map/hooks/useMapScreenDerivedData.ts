/**
 * Derived data for native map: region, route, cluster items, distance.
 * Keeps MapScreen.tsx under 200 lines.
 */
import { useMemo } from 'react';
import type { Provider } from '../../providers/domain/types';
import { clusterProviders, CLUSTER_THRESHOLD_DEFAULT } from '../utils/mapClustering';
import { haversineDistanceKm } from '../../location/data/haversine';
import { DEFAULT_MAP_CENTER, toRegion, buildRouteCoordinates } from '../utils/mapHelpers';

export interface MapScreenDerivedParams {
  /** Map center: used for region and as origin for routes/distances. Falls back to coords then DEFAULT_MAP_CENTER. */
  center?: { latitude: number; longitude: number } | null;
  coords: { latitude: number; longitude: number } | null;
  selectedProvider: Provider | null;
  nearest: Provider | null;
  sortedProviders: Provider[];
}

export function useMapScreenDerivedData({
  center,
  coords,
  selectedProvider,
  nearest,
  sortedProviders,
}: MapScreenDerivedParams) {
  const origin = center ?? coords;

  const region = useMemo(
    () => (origin ? toRegion(origin) : toRegion(DEFAULT_MAP_CENTER)),
    [origin?.latitude, origin?.longitude]
  );
  const routeCoordinates = useMemo(() => {
    const dest = selectedProvider ?? nearest;
    if (!origin || !dest?.location) return [];
    const lat = (dest.location as { latitude?: number }).latitude;
    const lng = (dest.location as { longitude?: number }).longitude;
    if (typeof lat !== 'number' || typeof lng !== 'number') return [];
    return buildRouteCoordinates(origin, { latitude: lat, longitude: lng });
  }, [origin, selectedProvider?.location, nearest?.location]);
  const clusterItems = useMemo(
    () => clusterProviders(sortedProviders, CLUSTER_THRESHOLD_DEFAULT),
    [sortedProviders]
  );
  const selectedProviderDistanceKm = useMemo(() => {
    if (!selectedProvider?.location || !origin) return null;
    return haversineDistanceKm(origin, selectedProvider.location);
  }, [selectedProvider?.location, origin]);

  const nearestDistanceKm = useMemo(() => {
    if (!nearest?.location || !origin) return null;
    return haversineDistanceKm(origin, nearest.location);
  }, [nearest?.location, origin]);

  return { region, routeCoordinates, clusterItems, selectedProviderDistanceKm, nearestDistanceKm };
}
