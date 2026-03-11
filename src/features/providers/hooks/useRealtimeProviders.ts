/**
 * Real-time provider updates (Socket.io integration).
 * Currently returns the same list from useNearbyProviders; replace with socket subscription
 * when backend exposes WebSocket/Socket.io for provider location/availability updates.
 */
import { useMemo } from 'react';
import type { Provider } from '../domain/types';

export interface RealtimeProviderUpdate {
  providerId: string;
  location?: { latitude: number; longitude: number };
  isAvailable?: boolean;
  lastUpdated?: string;
}

/**
 * Stub: no socket yet. In production, subscribe to channel (e.g. providers:nearby)
 * and merge updates into the provider list from useNearbyProviders.
 */
export function useRealtimeProviders(
  _providerIds: string[],
  _enabled = true,
): RealtimeProviderUpdate[] {
  return useMemo(() => [], []);
}

/**
 * Merge real-time updates into provider list (for future use).
 */
export function mergeRealtimeUpdates(
  providers: Provider[],
  updates: RealtimeProviderUpdate[],
): Provider[] {
  if (updates.length === 0) return providers;
  const byId = new Map(updates.map((u) => [u.providerId, u]));
  return providers.map((p) => {
    const u = byId.get(p.id);
    if (!u) return p;
    return {
      ...p,
      ...(u.location && {
        location: {
          ...p.location,
          latitude: u.location.latitude,
          longitude: u.location.longitude,
          lastUpdated: u.lastUpdated ?? p.location.lastUpdated,
        },
      }),
      ...(typeof u.isAvailable === 'boolean' && { isAvailable: u.isAvailable }),
    };
  });
}
