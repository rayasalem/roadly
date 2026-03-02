/**
 * Hook for location permission. Requests or checks status.
 * Use before calling useUserLocation or map flows.
 */
import { useCallback, useState } from 'react';
import { locationPermissionService } from '../data/locationPermissionService';
import type { PermissionStatus } from '../data/locationPermissionService';

export function useLocationPermission() {
  const [status, setStatus] = useState<PermissionStatus | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const check = useCallback(async () => {
    setIsChecking(true);
    try {
      const result = await locationPermissionService.check();
      setStatus(result);
      return result;
    } finally {
      setIsChecking(false);
    }
  }, []);

  const request = useCallback(async () => {
    setIsChecking(true);
    try {
      const result = await locationPermissionService.request();
      setStatus(result);
      return result;
    } finally {
      setIsChecking(false);
    }
  }, []);

  return { status, isChecking, check, request };
}
