export type Role = 'mechanic' | 'mechanic_tow' | 'car_rental';
export type ServiceType = 'mechanic' | 'tow' | 'rental' | 'battery' | 'tire' | 'oil_change';

export interface ProviderLocation {
  latitude: number;
  longitude: number;
  lastUpdated: string;
}

export interface Provider {
  id: string;
  name: string;
  phone: string;
  photo: string | null;
  role: Role;
  serviceType: ServiceType;
  location: ProviderLocation;
  isAvailable: boolean;
  rating: number;
  verified: boolean;
  hasTowCapability?: boolean;
  availableCars?: number;
  contact?: string;
  services?: string[];
}

const providers = new Map<string, Provider>();

function roleToServiceType(role: Role): ServiceType {
  if (role === 'mechanic_tow') return 'tow';
  if (role === 'car_rental') return 'rental';
  return 'mechanic';
}

export const ALL_SERVICE_TYPES: ServiceType[] = ['mechanic', 'tow', 'rental', 'battery', 'tire', 'oil_change'];

export function upsertProvider(
  id: string,
  data: Partial<Provider> & { name: string; role: Role }
): Provider {
  const existing = providers.get(id);
  const now = new Date().toISOString();
  const loc = data.location ?? existing?.location ?? {
    latitude: 0,
    longitude: 0,
    lastUpdated: now,
  };
  const role = data.role ?? existing?.role ?? 'mechanic';
  const provider: Provider = {
    id,
    name: data.name,
    phone: data.phone ?? existing?.phone ?? '',
    photo: data.photo ?? existing?.photo ?? null,
    role,
    serviceType: data.serviceType ?? existing?.serviceType ?? roleToServiceType(role),
    location: loc,
    isAvailable: data.isAvailable ?? existing?.isAvailable ?? true,
    rating: data.rating ?? existing?.rating ?? 0,
    verified: data.verified ?? existing?.verified ?? true,
    hasTowCapability: data.hasTowCapability ?? existing?.hasTowCapability,
    availableCars: data.availableCars ?? existing?.availableCars,
    contact: data.contact ?? data.phone ?? existing?.contact ?? existing?.phone,
    services: (data as { services?: string[] }).services ?? existing?.services,
  };
  providers.set(id, provider);
  return provider;
}

export function getProvider(id: string): Provider | undefined {
  return providers.get(id);
}

export function setProviderVerified(id: string, verified: boolean): Provider | undefined {
  const p = providers.get(id);
  if (!p) return undefined;
  p.verified = verified;
  return p;
}

export function getAllProviders(): Provider[] {
  return Array.from(providers.values());
}

function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function findNearby(
  lat: number,
  lng: number,
  options: {
    radiusKm?: number;
    role?: Role;
    availableOnly?: boolean;
    verifiedOnly?: boolean;
    page?: number;
    limit?: number;
  } = {}
): { items: Provider[]; total: number } {
  const { radiusKm = 50, role, availableOnly = true, verifiedOnly = true, page = 1, limit = 20 } = options;
  let list = Array.from(providers.values());
  if (role) list = list.filter((p) => p.role === role);
  if (availableOnly) list = list.filter((p) => p.isAvailable);
  if (verifiedOnly) list = list.filter((p) => p.verified);
  list = list
    .filter((p) => {
      const { latitude, longitude } = p.location;
      return latitude != null && longitude != null && (latitude !== 0 || longitude !== 0);
    })
    .map((p) => ({
      ...p,
      distanceKm: haversineKm(lat, lng, p.location.latitude, p.location.longitude),
    }))
    .filter((p) => p.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);
  const total = list.length;
  const start = (page - 1) * limit;
  const items = list.slice(start, start + limit).map(({ distanceKm, ...p }) => p);
  return { items, total };
}
