/**
 * Location permission handling. No UI — call from hooks/use cases only.
 * Uses expo-location when available; stub for tests or missing module.
 */

export type PermissionStatus = 'granted' | 'denied' | 'undetermined';

export interface LocationPermissionService {
  check(): Promise<PermissionStatus>;
  request(): Promise<PermissionStatus>;
}

async function checkExpo(): Promise<PermissionStatus> {
  const { getForegroundPermissionsAsync } = await import('expo-location');
  const { status } = await getForegroundPermissionsAsync();
  if (status === 'granted') return 'granted';
  if (status === 'denied') return 'denied';
  return 'undetermined';
}

async function requestExpo(): Promise<PermissionStatus> {
  const { requestForegroundPermissionsAsync } = await import('expo-location');
  const { status } = await requestForegroundPermissionsAsync();
  if (status === 'granted') return 'granted';
  if (status === 'denied') return 'denied';
  return 'undetermined';
}

export const locationPermissionService: LocationPermissionService = {
  check: checkExpo,
  request: requestExpo,
};
