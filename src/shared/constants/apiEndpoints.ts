/**
 * API endpoint paths. Base URL is configurable via EXPO_PUBLIC_API_URL (see shared/constants/env.ts).
 * All paths are relative to API_BASE_URL; no hardcoded host.
 */
export const ENDPOINTS = {
  /** Geo-based: ?lat=&lng=&radius=&role=&available=&page=&limit= */
  providersNearby: '/providers/nearby',
  providerById: (id: string) => `/providers/${id}`,
  /** Current provider profile (authenticated provider). GET returns id, name, role, services, rating, reviews, phone, email */
  providersMe: '/providers/me',
  /** Provider updates own location (PATCH body: latitude, longitude) */
  myLocation: '/providers/me/location',
  /** Provider updates location (POST body: lat, lng or latitude, longitude) */
  providersLocation: '/providers/location',
  /** Provider toggles availability */
  myAvailability: '/providers/me/availability',
  /** User creates service request (body: serviceType, origin, destination?, providerId?) */
  requests: '/requests',
  /** List requests for current customer (request history) */
  requestsCustomer: '/requests/customer',
  /** List requests for current provider */
  requestsProvider: '/requests/provider',
  /** Rate a completed request (POST body: rating 1-5, comment?) */
  requestRate: (requestId: string) => `/requests/${requestId}/rate`,
  adminUsers: '/admin/users',
  adminProviders: '/admin/providers',
  /** Dashboard data per role */
  dashboardMechanic: '/dashboard/mechanic',
  dashboardTow: '/dashboard/tow',
  dashboardRental: '/dashboard/rental',
  adminDashboard: '/admin/dashboard',
  /** Notifications: list and mark read */
  notifications: '/notifications',
  notificationMarkRead: (id: string) => `/notifications/${id}/read`,
} as const;
