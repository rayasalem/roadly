/**
 * API layer for provider endpoints. Backend: GET /providers/nearby, GET /providers/:id.
 * On invalid or empty responses, returns an empty list (no mock fallback).
 */
import type { Provider, NearbyProvidersParams, NearbyProvidersResult } from '../domain/types';
import { api } from '../../../shared/services/http/api';
import { ENDPOINTS } from '../../../shared/constants/apiEndpoints';
import { getErrorMessage } from '../../../shared/services/http/errorMessage';
import { ROLES } from '../../../shared/constants/roles';

function buildNearbyQuery(params: NearbyProvidersParams): string {
  const q = new URLSearchParams();
  q.set('lat', String(params.latitude));
  q.set('lng', String(params.longitude));
  if (params.radiusKm != null) q.set('radius', String(params.radiusKm));
  if (params.role) q.set('role', params.role);
  if (params.availableOnly != null) q.set('available', String(params.availableOnly));
  if (params.page != null) q.set('page', String(params.page));
  if (params.limit != null) q.set('limit', String(params.limit));
  return q.toString();
}

const emptyNearby = (limit: number): NearbyProvidersResult => ({
  items: [],
  total: 0,
  page: 1,
  limit,
});

export async function fetchNearbyProviders(params: NearbyProvidersParams): Promise<NearbyProvidersResult> {
  const query = buildNearbyQuery(params);
  const url = `${ENDPOINTS.providersNearby}?${query}`;
  const limit = params.limit ?? 20;
  try {
    const res = await api.get<NearbyProvidersResult>(url);
    if (!res || typeof res !== 'object' || res.data == null) {
      return emptyNearby(limit);
    }
    const data = res.data;
    if (typeof data !== 'object' || !Array.isArray((data as { items?: unknown }).items)) {
      return emptyNearby(limit);
    }
    const rawItems = data.items as unknown[];
    const now = new Date().toISOString();
    const items: Provider[] = rawItems
      .filter(
        (i): i is Record<string, unknown> =>
          i != null &&
          typeof (i as Record<string, unknown>).id === 'string' &&
          (i as Record<string, unknown>).location != null &&
          typeof ((i as Record<string, unknown>).location as { latitude?: unknown }).latitude === 'number' &&
          typeof ((i as Record<string, unknown>).location as { longitude?: unknown }).longitude === 'number',
      )
      .map((i) => {
        const loc = i.location as { latitude: number; longitude: number; lastUpdated?: string };
        const role = (typeof i.role === 'string' ? i.role : ROLES.MECHANIC) as Provider['role'];
        const serviceType = (typeof (i as { serviceType?: string }).serviceType === 'string'
          ? (i as { serviceType: string }).serviceType
          : role === ROLES.MECHANIC_TOW ? 'tow' : role === ROLES.CAR_RENTAL ? 'rental' : 'mechanic') as Provider['serviceType'];
        const phone = typeof (i as { phone?: string }).phone === 'string' ? (i as { phone: string }).phone : (typeof i.contact === 'string' ? i.contact : undefined);
        const photo = (i as { photo?: string | null }).photo ?? (i as { avatarUri?: string | null }).avatarUri ?? null;
        return {
          id: String(i.id),
          name: typeof i.name === 'string' ? i.name : 'Provider',
          role,
          serviceType,
          phone,
          photo: photo ?? undefined,
          avatarUri: typeof photo === 'string' ? photo : undefined,
          isAvailable: typeof i.isAvailable === 'boolean' ? i.isAvailable : true,
          verified: typeof (i as { verified?: boolean }).verified === 'boolean' ? (i as { verified: boolean }).verified : true,
          location: {
            latitude: loc.latitude,
            longitude: loc.longitude,
            lastUpdated: loc.lastUpdated ?? now,
          },
          rating: typeof i.rating === 'number' ? i.rating : undefined,
          contact: phone ?? (typeof i.contact === 'string' ? i.contact : undefined),
          hasTowCapability: role === ROLES.MECHANIC_TOW ? true : undefined,
          availableCars: typeof i.availableCars === 'number' ? i.availableCars : undefined,
        } as Provider;
      });
    return {
      items,
      total: data.total ?? items.length,
      page: data.page ?? 1,
      limit: data.limit ?? limit,
    };
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error));
  }
}

export async function fetchProviderById(id: string): Promise<Provider> {
  try {
    const res = await api.get<Provider>(ENDPOINTS.providerById(id));
    if (!res || typeof res !== 'object' || res.data == null) {
      throw new Error('Invalid API response');
    }
    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
