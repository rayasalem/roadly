/**
 * Geo types used across location, map, and provider features.
 * Backend stores location as { latitude, longitude, lastUpdated }.
 */
export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface GeoLocationWithTimestamp extends GeoPoint {
  lastUpdated: string; // ISO8601
}

/** Map region for initial fit or camera */
export interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}
