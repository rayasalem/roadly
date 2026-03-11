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
  origin: { latitude: number; longitude: number };
  destination?: { latitude: number; longitude: number } | null;
  priceEstimate?: number | null;
  /** Estimated arrival time in minutes (from provider to customer). */
  etaMinutes?: number | null;
  createdAt: string;
  updatedAt: string;
}

const requests = new Map<string, ServiceRequest>();
let idCounter = 1;
const nextId = () => `req_${idCounter++}`;

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

/** Compute ETA in minutes from provider location to destination (origin). */
export function computeEtaMinutes(
  from: { latitude: number; longitude: number },
  to: { latitude: number; longitude: number }
): number {
  const km = haversineKm(from.latitude, from.longitude, to.latitude, to.longitude);
  const hours = km / AVG_SPEED_KMH;
  return Math.max(1, Math.round(hours * 60));
}

export function createRequest(
  customerId: string,
  serviceType: ServiceType,
  origin: { latitude: number; longitude: number },
  destination?: { latitude: number; longitude: number } | null,
  providerId?: string | null
): ServiceRequest {
  const now = new Date().toISOString();
  const req: ServiceRequest = {
    id: nextId(),
    customerId,
    providerId: providerId ?? null,
    serviceType,
    status: 'pending',
    origin,
    destination: destination ?? null,
    priceEstimate: null,
    etaMinutes: null,
    createdAt: now,
    updatedAt: now,
  };
  requests.set(req.id, req);
  return req;
}

export function getRequestById(id: string): ServiceRequest | undefined {
  return requests.get(id);
}

export function updateRequestStatus(
  id: string,
  status: RequestStatus,
  providerId?: string | null,
  etaMinutes?: number | null
): ServiceRequest | undefined {
  const req = requests.get(id);
  if (!req) return undefined;
  req.status = status;
  req.updatedAt = new Date().toISOString();
  if (providerId !== undefined) req.providerId = providerId;
  if (etaMinutes !== undefined) req.etaMinutes = etaMinutes;
  return req;
}

export function listRequestsByCustomer(customerId: string): ServiceRequest[] {
  return Array.from(requests.values()).filter((r) => r.customerId === customerId);
}

export function listRequestsByProvider(providerId: string): ServiceRequest[] {
  return Array.from(requests.values()).filter((r) => r.providerId === providerId);
}

/** Pending requests (no provider assigned), optionally by serviceType for dashboard lists */
export function listPendingRequests(serviceType?: ServiceType): ServiceRequest[] {
  const list = Array.from(requests.values()).filter((r) => r.status === 'pending' && r.providerId == null);
  if (serviceType) return list.filter((r) => r.serviceType === serviceType);
  return list;
}

export function countRequestsByStatus(): { active: number; completed: number; pending: number } {
  const list = Array.from(requests.values());
  const active = list.filter((r) =>
    ['accepted', 'on_the_way'].includes(r.status)
  ).length;
  const completed = list.filter((r) => r.status === 'completed').length;
  const pending = list.filter((r) => r.status === 'pending').length;
  return { active, completed, pending };
}
