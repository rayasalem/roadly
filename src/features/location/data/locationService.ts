/**
 * Retrieves device GPS coordinates. No UI — call from hooks/use cases only.
 * Uses expo-location when available.
 */
import type { GeoPoint } from '../../../shared/types/geo';

export interface LocationService {
  getCurrentPosition(options?: { accuracy?: number }): Promise<GeoPoint>;
  watchPosition(
    onUpdate: (point: GeoPoint) => void,
    options?: { minIntervalMs?: number },
  ): () => void;
}

async function getCurrentExpo(): Promise<GeoPoint> {
  const expo = await import('expo-location');
  const location = await expo.getCurrentPositionAsync({
    accuracy: expo.Accuracy.Balanced,
  });
  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  };
}

function watchExpo(
  onUpdate: (point: GeoPoint) => void,
  options?: { minIntervalMs?: number },
): () => void {
  let subscription: { remove: () => void } | null = null;
  (async () => {
    const expo = await import('expo-location');
    subscription = await expo.watchPositionAsync(
      {
        accuracy: expo.Accuracy.Balanced,
        timeInterval: options?.minIntervalMs ?? 10_000,
        distanceInterval: 50,
      },
      (loc) => {
        onUpdate({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
      },
    );
  })();
  return () => {
    subscription?.remove();
  };
}

export const locationService: LocationService = {
  getCurrentPosition: getCurrentExpo,
  watchPosition: watchExpo,
};
