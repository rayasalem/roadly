/**
 * Simple grid-based marker clustering for map performance when provider count > threshold.
 * Groups providers by grid cell and returns cluster points (center + count) or single providers.
 * Web: no clustering. Native: cluster only when count > CLUSTER_THRESHOLD_DEFAULT.
 */
import type { Provider } from '../../../providers/domain/types';

/** Grid cell size (~1.5km at equator); adjust for desired cluster radius. */
const GRID_SIZE = 0.015;

/** Default threshold: above this count, providers are clustered (Native only). */
export const CLUSTER_THRESHOLD_DEFAULT = 20;

export type MapClusterItem =
  | { type: 'provider'; id: string; provider: Provider }
  | { type: 'cluster'; id: string; latitude: number; longitude: number; count: number; providers: Provider[] };

/** Filters to providers with valid location so clustering never throws. */
function withValidLocation(providers: Provider[]): Provider[] {
  return providers.filter(
    (p) =>
      p &&
      p.location &&
      typeof (p.location as { latitude?: unknown }).latitude === 'number' &&
      typeof (p.location as { longitude?: unknown }).longitude === 'number',
  );
}

/**
 * Groups providers into clusters when there are more than `threshold` providers.
 * Uses a fixed grid; each cell becomes either one marker (single provider) or a cluster (count + centroid).
 * Only providers with valid location are included.
 */
export function clusterProviders(
  providers: Provider[],
  threshold: number = CLUSTER_THRESHOLD_DEFAULT,
): MapClusterItem[] {
  const valid = withValidLocation(providers);
  if (valid.length === 0) return [];
  if (valid.length <= threshold) {
    return valid.map((p) => ({
      type: 'provider' as const,
      id: p.id,
      provider: p,
    }));
  }

  const grid = new Map<string, Provider[]>();
  for (const p of valid) {
    const lat = p.location.latitude;
    const lng = p.location.longitude;
    const key = `${Math.floor(lat / GRID_SIZE)}_${Math.floor(lng / GRID_SIZE)}`;
    const list = grid.get(key) ?? [];
    list.push(p);
    grid.set(key, list);
  }

  const result: MapClusterItem[] = [];
  grid.forEach((list, key) => {
    if (list.length === 1) {
      result.push({ type: 'provider', id: list[0].id, provider: list[0] });
    } else {
      const lat = list.reduce((s, p) => s + p.location.latitude, 0) / list.length;
      const lng = list.reduce((s, p) => s + p.location.longitude, 0) / list.length;
      result.push({
        type: 'cluster',
        id: `cluster_${key}`,
        latitude: lat,
        longitude: lng,
        count: list.length,
        providers: list,
      });
    }
  });
  return result;
}
