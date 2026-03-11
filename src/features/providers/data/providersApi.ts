/**
 * API layer for provider endpoints. No UI — used by repositories/hooks.
 * Backend implements GET /providers/nearby with geo + filters + pagination.
 * On network/CORS/parse errors, use getFallbackNearbyProviders() so the map never breaks.
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

/** Mock / fallback providers when API fails or no coords yet. Matches Provider type. */
const FALLBACK_NEARBY_PROVIDERS: Provider[] = [
  {
    id: 'mock-1',
    name: 'ورشة أحمد للميكانيك',
    role: ROLES.MECHANIC,
    isAvailable: true,
    location: {
      latitude: 32.3075,
      longitude: 35.1681,
      lastUpdated: new Date().toISOString(),
    },
    rating: 4.7,
    contact: '+972 50 123 4501',
    phone: '+972 50 123 4501',
  },
  {
    id: 'mock-2',
    name: 'ونش سامي 24/7',
    role: ROLES.MECHANIC_TOW,
    isAvailable: true,
    hasTowCapability: true,
    location: {
      latitude: 32.3091,
      longitude: 35.165,
      lastUpdated: new Date().toISOString(),
    },
    rating: 4.5,
    contact: '+972 50 123 4502',
    phone: '+972 50 123 4502',
  },
  {
    id: 'mock-3',
    name: 'تأجير سيارات النخبة',
    role: ROLES.CAR_RENTAL,
    isAvailable: true,
    availableCars: 5,
    location: {
      latitude: 32.304,
      longitude: 35.17,
      lastUpdated: new Date().toISOString(),
    },
    rating: 4.2,
    contact: '+972 50 123 4503',
    phone: '+972 50 123 4503',
  },
  {
    id: 'mock-4',
    name: 'فاست فيكس',
    role: ROLES.MECHANIC,
    isAvailable: true,
    location: {
      latitude: 32.3055,
      longitude: 35.171,
      lastUpdated: new Date().toISOString(),
    },
    rating: 4.8,
    contact: '+972 52 111 2233',
    phone: '+972 52 111 2233',
  },
  {
    id: 'mock-5',
    name: 'ونش الطوارئ',
    role: ROLES.MECHANIC_TOW,
    isAvailable: true,
    hasTowCapability: true,
    location: {
      latitude: 32.302,
      longitude: 35.164,
      lastUpdated: new Date().toISOString(),
    },
    rating: 4.4,
    contact: '+972 54 222 3344',
    phone: '+972 54 222 3344',
  },
  {
    id: 'mock-6',
    name: 'سيارات للايجار',
    role: ROLES.CAR_RENTAL,
    isAvailable: true,
    availableCars: 8,
    location: {
      latitude: 32.31,
      longitude: 35.172,
      lastUpdated: new Date().toISOString(),
    },
    rating: 4.6,
    contact: '+972 53 333 4455',
    phone: '+972 53 333 4455',
  },
];

/**
 * Returns fallback providers, optionally filtered by role so map filters still work.
 */
export function getFallbackNearbyProviders(role?: NearbyProvidersParams['role']): Provider[] {
  if (!role) return [...FALLBACK_NEARBY_PROVIDERS];
  return FALLBACK_NEARBY_PROVIDERS.filter((p) => p.role === role);
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
