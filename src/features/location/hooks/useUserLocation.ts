/**
 * Hook for current user location. Ensures permission then gets position.
 * Used by map and provider list; no API calls inside.
 */
import { useCallback, useState } from 'react';
import type { GeoPoint } from '../../../shared/types/geo';
import { locationPermissionService } from '../data/locationPermissionService';
import { locationService } from '../data/locationService';

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

  const fetchLocation = useCallback(async () => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const perm = await locationPermissionService.request();
      if (perm !== 'granted') {
        setState((s) => ({
          ...s,
          isLoading: false,
          error: 'Location permission denied',
          coords: null,
        }));
        return null;
      }
      const coords = await locationService.getCurrentPosition();
      setState({ coords, error: null, isLoading: false });
      return coords;
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to get location';
      setState((s) => ({ ...s, isLoading: false, error: message, coords: null }));
      return null;
    }
  }, []);

  return { ...state, fetchLocation };
}
