import { prisma } from '../lib/prisma.js';
import type { Prisma, Role as PrismaRole, ServiceType as PrismaServiceType } from '@prisma/client';

export type Role = 'mechanic' | 'mechanic_tow' | 'car_rental' | 'insurance';
export type ServiceType =
  | 'mechanic'
  | 'tow'
  | 'rental'
  | 'insurance'
  | 'battery'
  | 'tire'
  | 'oil_change';

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

function roleToServiceType(role: Role): ServiceType {
  if (role === 'mechanic_tow') return 'tow';
  if (role === 'car_rental') return 'rental';
  if (role === 'insurance') return 'insurance';
  return 'mechanic';
}

function rowToProvider(p: {
  userId: string;
  name: string;
  phone: string;
  photo: string | null;
  role: PrismaRole;
  serviceType: PrismaServiceType;
  latitude: number;
  longitude: number;
  locationUpdatedAt: Date | null;
  isAvailable: boolean;
  rating: number;
  verified: boolean;
  services: string[];
}): Provider {
  return {
    id: p.userId,
    name: p.name,
    phone: p.phone,
    photo: p.photo,
    role: p.role as Role,
    serviceType: p.serviceType as ServiceType,
    location: {
      latitude: p.latitude,
      longitude: p.longitude,
      lastUpdated: p.locationUpdatedAt?.toISOString() ?? new Date().toISOString(),
    },
    isAvailable: p.isAvailable,
    rating: p.rating,
    verified: p.verified,
    services: p.services,
  };
}

export async function upsertProvider(
  id: string,
  data: Partial<Provider> & { name: string; role: Role }
): Promise<Provider> {
  const existing = await prisma.providerProfile.findUnique({
    where: { userId: id },
  });
  const role = data.role ?? (existing?.role as Role) ?? 'mechanic';
  const serviceType =
    data.serviceType ?? existing?.serviceType ?? roleToServiceType(role);
  const now = new Date();
  const p = await prisma.providerProfile.upsert({
    where: { userId: id },
    create: {
      userId: id,
      name: data.name,
      phone: data.phone ?? '',
      photo: data.photo ?? null,
      role: role as PrismaRole,
      serviceType: serviceType as PrismaServiceType,
      latitude: (data.location?.latitude ?? 0),
      longitude: (data.location?.longitude ?? 0),
      locationUpdatedAt: data.location?.lastUpdated ? new Date(data.location.lastUpdated) : now,
      isAvailable: data.isAvailable ?? true,
      rating: data.rating ?? 0,
      verified: data.verified ?? true,
      services: data.services ?? [],
    },
    update: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.photo !== undefined && { photo: data.photo }),
      ...(data.role !== undefined && { role: data.role as PrismaRole }),
      ...(data.serviceType !== undefined && { serviceType: data.serviceType as PrismaServiceType }),
      ...(data.location !== undefined && {
        latitude: data.location.latitude,
        longitude: data.location.longitude,
        locationUpdatedAt: new Date(data.location.lastUpdated),
      }),
      ...(data.isAvailable !== undefined && { isAvailable: data.isAvailable }),
      ...(data.rating !== undefined && { rating: data.rating }),
      ...(data.verified !== undefined && { verified: data.verified }),
      ...(data.services !== undefined && { services: data.services }),
    },
  });
  return rowToProvider({
    ...p,
    services: p.services,
  });
}

export async function getProvider(id: string): Promise<Provider | undefined> {
  const p = await prisma.providerProfile.findUnique({
    where: { userId: id },
  });
  if (!p) return undefined;
  return rowToProvider({ ...p, services: p.services });
}

export async function setProviderVerified(
  id: string,
  verified: boolean
): Promise<Provider | undefined> {
  const p = await prisma.providerProfile
    .update({
      where: { userId: id },
      data: { verified },
    })
    .catch(() => null);
  if (!p) return undefined;
  return rowToProvider({ ...p, services: p.services });
}

export async function getAllProviders(): Promise<Provider[]> {
  const list = await prisma.providerProfile.findMany();
  return list.map((p) => rowToProvider({ ...p, services: p.services }));
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

export async function findNearby(
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
): Promise<{ items: Provider[]; total: number }> {
  const {
    radiusKm = 50,
    role,
    availableOnly = true,
    verifiedOnly = true,
    page = 1,
    limit = 20,
  } = options;

  const where: Prisma.ProviderProfileWhereInput = {};
  if (role) where.role = role as PrismaRole;
  if (availableOnly) where.isAvailable = true;
  if (verifiedOnly) where.verified = true;
  where.OR = [
    { latitude: { not: 0 } },
    { longitude: { not: 0 } },
  ];

  const all = await prisma.providerProfile.findMany({
    where,
  });

  type WithDistance = Provider & { distanceKm: number };
  const withDistance: WithDistance[] = all
    .filter(
      (p) =>
        (p.latitude !== 0 || p.longitude !== 0)
    )
    .map((p) => {
      const prov = rowToProvider({ ...p, services: p.services });
      return {
        ...prov,
        distanceKm: haversineKm(lat, lng, p.latitude, p.longitude),
      };
    });

  const sorted = withDistance
    .filter((p) => p.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);
  const total = sorted.length;
  const start = (page - 1) * limit;
  const items = sorted.slice(start, start + limit).map(({ distanceKm: _d, ...p }) => p);
  return { items, total };
}

export const ALL_SERVICE_TYPES: ServiceType[] = [
  'mechanic',
  'tow',
  'rental',
  'insurance',
  'battery',
  'tire',
  'oil_change',
];
