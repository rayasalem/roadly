import type { Role } from '../../../shared/constants/roles';
import type { GeoLocationWithTimestamp } from '../../../shared/types/geo';

/** Display status for map callout / bottom sheet */
export type ProviderDisplayStatus = 'available' | 'busy' | 'on_the_way';

/** Service type for filter and request (mechanic | tow | rental) */
export type ProviderServiceType = 'mechanic' | 'tow' | 'rental';

export interface Provider {
  id: string;
  name: string;
  role: Role;
  /** Location with lastUpdated for sorting/freshness */
  location: GeoLocationWithTimestamp;
  isAvailable: boolean;
  /** Phone number for contact */
  phone?: string;
  /** Profile photo URL (alias avatarUri for API compatibility) */
  photo?: string | null;
  /** Service type: mechanic | tow | rental */
  serviceType?: ProviderServiceType;
  /** Rating 1–5 for map/profile UI */
  rating?: number;
  /** If true, provider is shown on map (with available + location) */
  verified?: boolean;
  /** Only for mechanic_tow */
  hasTowCapability?: boolean;
  /** Car rental: count or list id */
  availableCars?: number;
  /** Optional display (phone, address) – prefer phone when present */
  contact?: string;
  /** Optional avatar URL for map callout */
  avatarUri?: string | null;
  /** Optional status label for map (default derived from isAvailable) */
  displayStatus?: ProviderDisplayStatus;
  /** Optional list of service names for map popup / profile */
  services?: string[];
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
