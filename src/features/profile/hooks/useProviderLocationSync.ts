/**
 * When user is a provider, syncs device location to backend periodically and on coords change
 * so they appear on the map. Call from provider stack (e.g. dashboard or app root when role=provider).
 */
import { useEffect, useRef } from 'react';
import { useAuthStore } from '../../../store/authStore';
import { useUserLocation } from '../../location/hooks/useUserLocation';
import { updateProviderLocation } from '../data/providerProfileApi';

const ROLES_PROVIDER = ['mechanic', 'mechanic_tow', 'car_rental'] as const;
const SYNC_INTERVAL_MS = 30_000;

export function useProviderLocationSync() {
  const role = useAuthStore((s) => s.user?.role);
  const { coords, fetchLocation } = useUserLocation();
  const lastSent = useRef<{ lat: number; lng: number } | null>(null);
  const isProvider = role && ROLES_PROVIDER.includes(role as (typeof ROLES_PROVIDER)[number]);

  useEffect(() => {
    if (!isProvider) return;
    void fetchLocation();
  }, [isProvider, fetchLocation]);

  useEffect(() => {
    if (!isProvider || !coords) return;
    const { latitude, longitude } = coords;
    const same =
      lastSent.current &&
      Math.abs(lastSent.current.lat - latitude) < 1e-5 &&
      Math.abs(lastSent.current.lng - longitude) < 1e-5;
    if (same) return;
    lastSent.current = { lat: latitude, lng: longitude };
    updateProviderLocation(latitude, longitude);
  }, [isProvider, coords?.latitude, coords?.longitude]);

  useEffect(() => {
    if (!isProvider) return;
    const id = setInterval(() => {
      if (lastSent.current) {
        updateProviderLocation(lastSent.current.lat, lastSent.current.lng);
      }
    }, SYNC_INTERVAL_MS);
    return () => clearInterval(id);
  }, [isProvider]);
}
