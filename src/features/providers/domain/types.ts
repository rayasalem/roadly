import type { Role } from '../../../shared/constants/roles';
import type { GeoLocationWithTimestamp } from '../../../shared/types/geo';

export interface Provider {
  id: string;
  name: string;
  role: Role;
  /** Location with lastUpdated for sorting/freshness */
  location: GeoLocationWithTimestamp;
  isAvailable: boolean;
  /** Only for mechanic_tow */
  hasTowCapability?: boolean;
  /** Car rental: count or list id */
  availableCars?: number;
  /** Optional display (phone, address) */
  contact?: string;
}

export interface NearbyProvidersParams {
  latitude: number;
  longitude: number;
  radiusKm?: number;
  role?: Role;
  availableOnly?: boolean;
  page?: number;
  limit?: number;
}

export interface NearbyProvidersResult {
  items: Provider[];
  total?: number;
  page?: number;
  limit?: number;
}
