import type { GeoPoint } from '../../../shared/types/geo';

export type LocationPermissionStatus = 'granted' | 'denied' | 'undetermined';

export interface LocationState {
  coords: GeoPoint | null;
  lastUpdated: string | null; // ISO8601
  error: string | null;
  isLoading: boolean;
}

export interface WatchLocationOptions {
  /** Minimum interval in ms between updates (e.g. 5000) */
  minIntervalMs?: number;
}
