import { prisma } from '../lib/prisma.js';
import type {
  Prisma,
  ServiceType as PrismaServiceType,
  RequestStatus as PrismaRequestStatus,
} from '@prisma/client';

export type ServiceType = 'mechanic' | 'tow' | 'rental' | 'battery' | 'tire' | 'oil_change';
export type RequestStatus =
  | 'pending'
  | 'accepted'
  | 'on_the_way'
  | 'completed'
  | 'cancelled';

export interface ServiceRequest {
  id: string;
  customerId: string;
  providerId: string | null;
  serviceType: ServiceType;
  status: RequestStatus;
  description?: string | null;
  origin: { latitude: number; longitude: number };
  destination?: { latitude: number; longitude: number } | null;
  priceEstimate?: number | null;
  etaMinutes?: number | null;
  createdAt: string;
  updatedAt: string;
}

const AVG_SPEED_KMH = 30;
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function computeEtaMinutes(
  from: { latitude: number; longitude: number },
  to: { latitude: number; longitude: number }
): number {
  const km = haversineKm(from.latitude, from.longitude, to.latitude, to.longitude);
  const hours = km / AVG_SPEED_KMH;
  return Math.max(1, Math.round(hours * 60));
}

function rowToServiceRequest(r: {
  id: string;
  customerId: string;
  providerId: string | null;
  serviceType: PrismaServiceType;
  status: PrismaRequestStatus;
  description: string | null;
  originLat: number;
  originLng: number;
  destLat: number | null;
  destLng: number | null;
  priceEstimate: number | null;
  etaMinutes: number | null;
  createdAt: Date;
  updatedAt: Date;
}): ServiceRequest {
  return {
    id: r.id,
    customerId: r.customerId,
    providerId: r.providerId,
    serviceType: r.serviceType as ServiceType,
    status: r.status as RequestStatus,
    description: r.description ?? undefined,
    origin: { latitude: r.originLat, longitude: r.originLng },
    destination:
      r.destLat != null && r.destLng != null
        ? { latitude: r.destLat, longitude: r.destLng }
        : null,
    priceEstimate: r.priceEstimate ?? undefined,
    etaMinutes: r.etaMinutes ?? undefined,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

export async function createRequest(
  customerId: string,
  serviceType: ServiceType,
  origin: { latitude: number; longitude: number },
  destination?: { latitude: number; longitude: number } | null,
  providerId?: string | null,
  description?: string | null
): Promise<ServiceRequest> {
  const r = await prisma.request.create({
    data: {
      customerId,
      providerId: providerId ?? undefined,
      serviceType: serviceType as PrismaServiceType,
      status: 'pending',
      description: description ?? undefined,
      originLat: origin.latitude,
      originLng: origin.longitude,
      destLat: destination?.latitude ?? undefined,
      destLng: destination?.longitude ?? undefined,
    },
  });
  return rowToServiceRequest(r);
}

export async function getRequestById(id: string): Promise<ServiceRequest | undefined> {
  const r = await prisma.request.findUnique({ where: { id } });
  if (!r) return undefined;
  return rowToServiceRequest(r);
}

export async function updateRequestStatus(
  id: string,
  status: RequestStatus,
  providerId?: string | null,
  etaMinutes?: number | null
): Promise<ServiceRequest | undefined> {
  const r = await prisma.request
    .update({
      where: { id },
      data: {
        status: status as PrismaRequestStatus,
        ...(providerId !== undefined && { providerId: providerId ?? undefined }),
        ...(etaMinutes !== undefined && { etaMinutes: etaMinutes ?? undefined }),
      },
    })
    .catch(() => null);
  if (!r) return undefined;
  return rowToServiceRequest(r);
}

export async function listRequestsByCustomer(customerId: string): Promise<ServiceRequest[]> {
  const list = await prisma.request.findMany({
    where: { customerId },
    orderBy: { createdAt: 'desc' },
  });
  return list.map(rowToServiceRequest);
}

export async function listRequestsByProvider(providerId: string): Promise<ServiceRequest[]> {
  const list = await prisma.request.findMany({
    where: { providerId },
    orderBy: { updatedAt: 'desc' },
  });
  return list.map(rowToServiceRequest);
}

/** All requests where user is customer or provider (for chat conversation list). */
export async function listRequestsForChat(userId: string): Promise<ServiceRequest[]> {
  const list = await prisma.request.findMany({
    where: {
      OR: [{ customerId: userId }, { providerId: userId }],
    },
    orderBy: { updatedAt: 'desc' },
  });
  return list.map(rowToServiceRequest);
}

export async function listPendingRequests(serviceType?: ServiceType): Promise<ServiceRequest[]> {
  const list = await prisma.request.findMany({
    where: {
      status: 'pending',
      providerId: null,
      ...(serviceType && { serviceType: serviceType as PrismaServiceType }),
    },
    orderBy: { createdAt: 'asc' },
  });
  return list.map(rowToServiceRequest);
}

export async function countRequestsByStatus(): Promise<{
  active: number;
  completed: number;
  pending: number;
}> {
  const [active, completed, pending] = await Promise.all([
    prisma.request.count({
      where: { status: { in: ['accepted', 'on_the_way'] } },
    }),
    prisma.request.count({ where: { status: 'completed' } }),
    prisma.request.count({ where: { status: 'pending' } }),
  ]);
  return { active, completed, pending };
}

/** Last N days: count of requests created per day (oldest to newest). */
export async function getRequestCountsByDay(days: number): Promise<number[]> {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - days);
  const list = await prisma.request.findMany({
    where: { createdAt: { gte: start } },
    select: { createdAt: true },
  });
  const counts: number[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const next = new Date(d);
    next.setDate(next.getDate() + 1);
    const n = list.filter((r) => r.createdAt >= d && r.createdAt < next).length;
    counts.push(n);
  }
  return counts;
}

export interface ListAllRequestsOptions {
  page?: number;
  limit?: number;
  status?: RequestStatus;
  serviceType?: ServiceType;
}

export interface ServiceRequestWithNames extends ServiceRequest {
  customerName: string;
  providerName: string | null;
}

export async function listAllRequestsForAdmin(options: ListAllRequestsOptions): Promise<{
  items: ServiceRequestWithNames[];
  total: number;
  page: number;
  limit: number;
}> {
  const page = Math.max(1, options.page ?? 1);
  const limit = Math.min(100, Math.max(1, options.limit ?? 20));
  const skip = (page - 1) * limit;
  const where: Prisma.RequestWhereInput = {};
  if (options.status) where.status = options.status as PrismaRequestStatus;
  if (options.serviceType) where.serviceType = options.serviceType as PrismaServiceType;
  const [items, total] = await Promise.all([
    prisma.request.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        customer: { select: { name: true } },
        provider: { select: { name: true } },
      },
    }),
    prisma.request.count({ where }),
  ]);
  return {
    items: items.map((r) => ({
      ...rowToServiceRequest(r),
      customerName: r.customer.name,
      providerName: r.provider?.name ?? null,
    })),
    total,
    page,
    limit,
  };
}

/** Recent requests with customer/provider names for admin dashboard panels. */
export async function listRecentRequestsWithNames(serviceType: ServiceType, limitCount: number): Promise<ServiceRequestWithNames[]> {
  const list = await prisma.request.findMany({
    where: { serviceType: serviceType as PrismaServiceType },
    orderBy: { updatedAt: 'desc' },
    take: limitCount,
    include: {
      customer: { select: { name: true } },
      provider: { select: { name: true } },
    },
  });
  return list.map((r) => ({
    ...rowToServiceRequest(r),
    customerName: r.customer.name,
    providerName: r.provider?.name ?? null,
  }));
}
