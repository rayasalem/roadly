/**
 * Pure helpers and constants for map screens (native + web).
 */
import type { GeoPoint } from '../../../shared/types/geo';
import type { Provider } from '../../providers/domain/types';
import { ROLES } from '../../../shared/constants/roles';
import type { MapFilterRole } from '../hooks/useMapFilters';
import { t } from '../../../shared/i18n/t';
import { MOCK_PROVIDERS_ALL } from '../../../mock/mockProviders';

export const DEFAULT_REGION_DELTA = { latitudeDelta: 0.05, longitudeDelta: 0.05 };
export const DEFAULT_MAP_CENTER: GeoPoint = { latitude: 25.2048, longitude: 55.2708 };

export type FilterRole = MapFilterRole;
export type ArcIconId = 'all' | 'mechanic' | 'tow' | 'rental' | 'insurance';

export function filterRoleToArcId(role: FilterRole): ArcIconId {
  if (role === null) return 'all';
  if (role === ROLES.MECHANIC) return 'mechanic';
  if (role === ROLES.MECHANIC_TOW) return 'tow';
  if (role === ROLES.CAR_RENTAL) return 'rental';
  if (role === ROLES.INSURANCE) return 'insurance';
  return 'all';
}

export function arcIdToFilterRole(id: ArcIconId): MapFilterRole {
  if (id === 'all') return null;
  if (id === 'mechanic') return ROLES.MECHANIC;
  if (id === 'tow') return ROLES.MECHANIC_TOW;
  if (id === 'rental') return ROLES.CAR_RENTAL;
  if (id === 'insurance') return ROLES.INSURANCE;
  return null;
}

export function buildRouteCoordinates(
  from: GeoPoint,
  to: GeoPoint
): Array<{ latitude: number; longitude: number }> {
  const midLat = (from.latitude + to.latitude) / 2;
  const midLng = (from.longitude + to.longitude) / 2;
  const offset = 0.002;
  const mid = { latitude: midLat + offset, longitude: midLng + offset };
  return [from, mid, to];
}

export function toRegion(coords: GeoPoint) {
  return {
    ...coords,
    latitudeDelta: DEFAULT_REGION_DELTA.latitudeDelta,
    longitudeDelta: DEFAULT_REGION_DELTA.longitudeDelta,
  };
}

export function getFilterLabel(role: MapFilterRole): string {
  if (role === null) return t('map.filter.all');
  if (role === 'mechanic') return t('map.filter.mechanic');
  if (role === 'mechanic_tow') return t('map.filter.tow');
  if (role === 'car_rental') return t('map.filter.rental');
  if (role === 'insurance') return t('map.filter.insurance');
  return t('map.filter.all');
}

export const MOCK_PROVIDERS: Provider[] = MOCK_PROVIDERS_ALL as Provider[];
