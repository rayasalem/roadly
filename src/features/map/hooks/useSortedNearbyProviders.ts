/**
 * Hook موحد: موقع المستخدم + جلب المزودين القريبين + ترتيب الأقرب (Haversine).
 * يعيد فقط المزودين الذين سجّلوا موقعهم (lat, lng).
 * عند فشل API تُعرض قائمة فارغة ويُبلغ الـ hook عبر isProvidersError.
 */
import { useMemo } from 'react';
import type { Provider } from '../../providers/domain/types';
import type { GeoPoint } from '../../../shared/types/geo';
import { useUserLocation } from '../../location/hooks/useUserLocation';
import { useNearbyProviders } from '../../providers/hooks/useNearbyProviders';
import { sortByNearest, haversineDistanceKm } from '../../location/data/haversine';

/** Default when user location not yet available; matches mock providers area (بزارية / فلسطين). */
const DEFAULT_CENTER: GeoPoint = { latitude: 32.3075, longitude: 35.168 };
const RADIUS_KM = 15;
const PAGE = 1;
const LIMIT = 50;

export interface UseSortedNearbyProvidersOptions {
  /** فلتر حسب نوع المزود (mechanic | mechanic_tow | car_rental) أو null = الكل */
  role?: Provider['role'] | null;
  /** تفعيل الجلب (مثلاً عندما الشاشة ظاهرة) */
  enabled?: boolean;
}

function hasValidLocation(p: Provider): p is Provider & { location: GeoPoint } {
  const loc = p?.location;
  return (
    loc != null &&
    typeof (loc as GeoPoint).latitude === 'number' &&
    typeof (loc as GeoPoint).longitude === 'number'
  );
}

export function useSortedNearbyProviders(options: UseSortedNearbyProvidersOptions = {}) {
  const { role = null, enabled = true } = options;
  const { coords, isLoading: locationLoading, error: locationError, fetchLocation } = useUserLocation();

  /** Always pass params (default center when coords null) so nearby query can run. */
  const nearbyParams = useMemo(
    () => {
      const lat = coords?.latitude ?? DEFAULT_CENTER.latitude;
      const lng = coords?.longitude ?? DEFAULT_CENTER.longitude;
      return {
        latitude: lat,
        longitude: lng,
        radiusKm: RADIUS_KM,
        availableOnly: true,
        role: role ?? undefined,
        page: PAGE,
        limit: LIMIT,
      };
    },
    [coords?.latitude, coords?.longitude, role]
  );

  const {
    data,
    isLoading: providersLoading,
    isError: isProvidersError,
    isRefetching,
    refetch: refetchProviders,
  } = useNearbyProviders(nearbyParams, enabled, false);

  const rawItems = (data?.items ?? []) as Provider[];
  const withLocation = useMemo(() => rawItems.filter(hasValidLocation), [rawItems]);
  const referencePoint = coords ?? DEFAULT_CENTER;
  const sortedProviders = useMemo(
    () => sortByNearest(withLocation, (p) => p.location, referencePoint),
    [withLocation, referencePoint.latitude, referencePoint.longitude]
  );

  const nearest = sortedProviders[0] ?? null;
  const isLoading = locationLoading || providersLoading;
  const error = locationError ?? (isProvidersError ? 'Failed to load providers' : null);

  const getDistanceKm = useMemo(
    () => (provider: Provider) => {
      if (!provider?.location || !coords) return null;
      return haversineDistanceKm(coords, provider.location as GeoPoint);
    },
    [coords?.latitude, coords?.longitude]
  );

  return {
    /** المزودون المرتبون من الأقرب إلى الأبعد (فقط من سجّل موقعه) */
    sortedProviders,
    /** أقرب مزود */
    nearest,
    /** إحداثيات المستخدم الحالية */
    userCoords: coords,
    /** نقطة مرجعية للخريطة (المستخدم أو افتراضي) */
    mapCenter: coords ?? DEFAULT_CENTER,
    isLoading,
    isRefetching,
    error,
    /** true when useNearbyProviders failed (network/API error) */
    isProvidersError,
    /** @deprecated use isProvidersError */
    usedFallback: isProvidersError,
    refetchLocation: fetchLocation,
    refetchProviders,
    getDistanceKm,
  };
}
