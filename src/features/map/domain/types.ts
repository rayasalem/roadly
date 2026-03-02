import type { GeoPoint } from '../../../shared/types/geo';
import type { Role } from '../../../shared/constants/roles';

/** Marker type for map (determines icon/pin style) */
export type ProviderMarkerType = 'mechanic' | 'mechanic_tow' | 'car_rental';

export interface MapProviderMarker {
  id: string;
  role: Role;
  markerType: ProviderMarkerType;
  position: GeoPoint;
  title: string;
  isAvailable?: boolean;
  /** Optional; from API or Haversine */
  distanceKm?: number;
}

export interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}
