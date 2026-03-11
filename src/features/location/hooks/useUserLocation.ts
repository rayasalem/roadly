/**
 * Hook for current user location. Ensures permission then gets position.
 * Used by map and provider list; no API calls inside.
 * Safe: skips setState after unmount (isMountedRef), handles timeout and permission denied.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { GeoPoint } from '../../../shared/types/geo';
import { locationPermissionService } from '../data/locationPermissionService';
import { locationService } from '../data/locationService';

const LOCATION_TIMEOUT_MS = 15_000;

export interface UserLocationState {
  coords: GeoPoint | null;
  error: string | null;
  isLoading: boolean;
}

export function useUserLocation() {
  const [state, setState] = useState<UserLocationState>({
    coords: null,
    error: null,
    isLoading: false,
  });
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchLocation = useCallback(async () => {
    if (!isMountedRef.current) return null;
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const perm = await locationPermissionService.request();
      if (!isMountedRef.current) return null;
      if (perm !== 'granted') {
        setState((s) => ({
          ...s,
          isLoading: false,
          error: 'Location permission denied',
          coords: null,
        }));
        return null;
      }
      const coords = await Promise.race([
        locationService.getCurrentPosition(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Location request timed out')), LOCATION_TIMEOUT_MS),
        ),
      ]);
      if (!isMountedRef.current) return coords;
      setState({ coords, error: null, isLoading: false });
      return coords;
    } catch (e) {
      if (!isMountedRef.current) return null;
      const message = e instanceof Error ? e.message : 'Failed to get location';
      setState((s) => ({ ...s, isLoading: false, error: message, coords: null }));
      return null;
    }
  }, []);

  return { ...state, fetchLocation };
}
