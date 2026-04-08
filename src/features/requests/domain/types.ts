export type ServiceType =
  | 'mechanic'
  | 'tow'
  | 'rental'
  | 'insurance'
  | 'battery'
  | 'tire'
  | 'oil_change';

/**
 * Request lifecycle: new → pending → accepted | rejected;
 * accepted → in_progress → completed; any → cancelled.
 */
export type RequestStatus =
  | 'new'
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  /** Legacy: treat as in_progress in UI */
  | 'on_the_way';

export type ServiceRequest = {
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
  providerName?: string | null;
  providerLocation?: { latitude: number; longitude: number } | null;
  /** Customer name (for provider view) */
  customerName?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateRequestInput = {
  serviceType: ServiceType;
  origin: { latitude: number; longitude: number };
  destination?: { latitude: number; longitude: number } | null;
  providerId?: string | null;
  description?: string | null;
};

export type UpdateRequestStatusInput = {
  requestId: string;
  status: RequestStatus;
};
