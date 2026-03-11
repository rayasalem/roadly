export type ServiceType = 'mechanic' | 'tow' | 'rental' | 'battery' | 'tire' | 'oil_change';

export type RequestStatus =
  | 'pending'
  | 'accepted'
  | 'on_the_way'
  | 'completed'
  | 'cancelled';

export type ServiceRequest = {
  id: string;
  customerId: string;
  providerId: string | null;
  serviceType: ServiceType;
  status: RequestStatus;
  origin: { latitude: number; longitude: number };
  destination?: { latitude: number; longitude: number } | null;
  priceEstimate?: number | null;
  /** Estimated arrival time in minutes (provider to customer). */
  etaMinutes?: number | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateRequestInput = {
  serviceType: ServiceType;
  origin: { latitude: number; longitude: number };
  destination?: { latitude: number; longitude: number } | null;
  /** When provided, request is sent to this provider (e.g. from map marker). */
  providerId?: string | null;
};

export type UpdateRequestStatusInput = {
  requestId: string;
  status: RequestStatus;
};

