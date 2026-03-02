import type { GeoPoint } from '../../../shared/types/geo';

const EARTH_RADIUS_KM = 6371;

/**
 * Haversine distance between two points in kilometres.
 * Use for client-side distance display or fallback when backend does not return distance.
 */
export function haversineDistanceKm(a: GeoPoint, b: GeoPoint): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const x =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  return EARTH_RADIUS_KM * c;
}

/**
 * Sort an array of items with a GeoPoint by distance from a reference point (nearest first).
 */
export function sortByNearest<T>(items: T[], getPoint: (item: T) => GeoPoint, from: GeoPoint): T[] {
  return [...items].sort(
    (a, b) =>
      haversineDistanceKm(from, getPoint(a)) - haversineDistanceKm(from, getPoint(b)),
  );
}
