/**
 * API layer for provider endpoints. No UI — used by repositories/hooks.
 * Backend implements GET /providers/nearby with geo + filters + pagination.
 * On network/CORS/parse errors, use getFallbackNearbyProviders() so the map never breaks.
 * Uses mock data with all provider states: available, busy, on_the_way, offline.
 */
import type { Provider, NearbyProvidersParams, NearbyProvidersResult } from '../domain/types';
import { api } from '../../../shared/services/http/api';
import { ENDPOINTS } from '../../../shared/constants/apiEndpoints';
import { getErrorMessage } from '../../../shared/services/http/errorMessage';
import { ROLES } from '../../../shared/constants/roles';
import { MOCK_PROVIDERS_ALL } from '../../../mock/mockProviders';

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

/** Map mock providers to Provider type (with displayStatus for map UI). */
function mockToProvider(m: import('../../../mock/mockProviders').MockProvider): Provider {
  const loc = m.location as { latitude: number; longitude: number; lastUpdated?: string };
  return {
    id: m.id,
    name: m.name,
    role: m.role,
    phone: m.phone ?? undefined,
    isAvailable: m.isAvailable ?? true,
    location: {
      latitude: loc?.latitude ?? 32.22,
      longitude: loc?.longitude ?? 35.26,
      lastUpdated: (loc as { lastUpdated?: string })?.lastUpdated ?? new Date().toISOString(),
    },
    rating: m.rating,
    displayStatus: m.displayStatus,
    serviceType: m.role === ROLES.MECHANIC ? 'mechanic' : m.role === ROLES.MECHANIC_TOW ? 'tow' : 'rental',
    hasTowCapability: m.role === ROLES.MECHANIC_TOW ? true : undefined,
    availableCars: m.role === ROLES.CAR_RENTAL ? 5 : undefined,
  };
}

/**
 * Returns fallback providers from mock data (available, busy, on_the_way, offline), optionally filtered by role.
 */
export function getFallbackNearbyProviders(role?: NearbyProvidersParams['role']): Provider[] {
  const list = MOCK_PROVIDERS_ALL.map(mockToProvider);
  if (!role) return list;
  return list.filter((p) => p.role === role);
}

export async function fetchNearbyProviders(
  params: NearbyProvidersParams,
): Promise<NearbyProvidersResult> {
  const query = buildNearbyQuery(params);
  const url = `${ENDPOINTS.providersNearby}?${query}`;
  try {
    const res = await api.get<NearbyProvidersResult>(url);
    if (!res || typeof res !== 'object') {
      return { items: getFallbackNearbyProviders(params.role), total: 0, page: 1, limit: params.limit ?? 20 };
    }
    const data = res.data;
    if (data == null || typeof data !== 'object' || !Array.isArray((data as { items?: unknown }).items)) {
      return { items: getFallbackNearbyProviders(params.role), total: 0, page: 1, limit: params.limit ?? 20 };
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
    // إذا الـ API رجع ناجح لكن بدون مزودين، استخدم القائمة التجريبية حتى لا تبقى الخريطة فارغة
    const useFallback = items.length === 0;
    const finalItems = useFallback ? getFallbackNearbyProviders(params.role) : items;
    return {
      items: finalItems,
      total: useFallback ? finalItems.length : (data.total ?? items.length),
      page: data.page ?? 1,
      limit: data.limit ?? params.limit ?? 20,
    };
  } catch (error: unknown) {
    // عند فشل الشبكة أو الـ CORS، أعد قائمة مزودين تجريبية بدل رمي خطأ
    // حتى لا تبقى الخريطة فارغة في بيئة التطوير.
    const fallback = getFallbackNearbyProviders(params.role);
    if (fallback.length > 0) {
      return {
        items: fallback,
        total: fallback.length,
        page: 1,
        limit: params.limit ?? 20,
      };
    }
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
