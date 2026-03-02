/**
 * API endpoint paths for backend preparation.
 * Base URL is in shared/constants/env.ts (API_BASE_URL).
 */
export const ENDPOINTS = {
  /** Geo-based: ?lat=&lng=&radius=&role=&available=&page=&limit= */
  providersNearby: '/providers/nearby',
  providerById: (id: string) => `/providers/${id}`,
  /** Provider updates own location (PATCH body: latitude, longitude) */
  myLocation: '/providers/me/location',
  /** Provider toggles availability */
  myAvailability: '/providers/me/availability',
  /** User creates service request */
  requests: '/requests',
  adminUsers: '/admin/users',
  adminProviders: '/admin/providers',
} as const;
