import type {
  ServiceRequest,
  CreateRequestInput,
  UpdateRequestStatusInput,
} from '../domain/types';
import { api } from '../../../shared/services/http/api';
import { ENDPOINTS } from '../../../shared/constants/apiEndpoints';
import { getErrorMessage, isNetworkOrTimeoutError } from '../../../shared/services/http/errorMessage';
import { MOCK_REQUESTS } from '../../../mock/mockRequests';

export interface CustomerRequestsResponse {
  items: ServiceRequest[];
  total: number;
}

function mockItemsToResponse(): CustomerRequestsResponse {
  const now = new Date().toISOString();
  const items: ServiceRequest[] = MOCK_REQUESTS.map((m) => ({
    id: m.id,
    customerId: m.customerId,
    providerId: m.providerId ?? null,
    serviceType: m.service,
    status: m.status,
    origin: { latitude: m.customerLocation.latitude, longitude: m.customerLocation.longitude },
    providerName: m.providerName ?? null,
    customerName: m.customerName ?? null,
    createdAt: m.createdAt ?? now,
    updatedAt: m.createdAt ?? now,
  }));
  return { items, total: items.length };
}

export async function fetchCustomerRequests(): Promise<CustomerRequestsResponse> {
  try {
    const res = await api.get<CustomerRequestsResponse>(ENDPOINTS.requestsCustomer);
    if (!res || typeof res !== 'object' || res.data == null) return mockItemsToResponse();
    const data = res.data;
    const items = Array.isArray(data.items) ? (data.items as ServiceRequest[]) : [];
    return { items, total: data.total ?? items.length };
  } catch (error) {
    if (isNetworkOrTimeoutError(error)) {
      if (__DEV__) console.warn('[requestApi] fetchCustomerRequests failed, using mock.');
      return mockItemsToResponse();
    }
    throw new Error(getErrorMessage(error));
  }
}

export interface ProviderRequestsResponse {
  items: ServiceRequest[];
  total: number;
}

export async function fetchProviderRequests(): Promise<ProviderRequestsResponse> {
  try {
    const res = await api.get<ProviderRequestsResponse>(ENDPOINTS.requestsProvider);
    if (!res || typeof res !== 'object' || res.data == null) return mockItemsToResponse();
    const data = res.data;
    const items = Array.isArray(data.items) ? (data.items as ServiceRequest[]) : [];
    return { items, total: data.total ?? items.length };
  } catch (error) {
    if (isNetworkOrTimeoutError(error)) {
      if (__DEV__) console.warn('[requestApi] fetchProviderRequests failed, using mock.');
      return mockItemsToResponse();
    }
    throw new Error(getErrorMessage(error));
  }
}

export async function createRequest(
  input: CreateRequestInput,
): Promise<ServiceRequest> {
  try {
    const body = { ...input, description: input.description ?? undefined };
    const res = await api.post<ServiceRequest>('/requests', body);
    if (!res || typeof res !== 'object' || res.data == null) throw new Error('Invalid API response');
    return res.data;
  } catch (error) {
    if (isNetworkOrTimeoutError(error)) {
      const id = `mock_${Date.now()}`;
      const now = new Date().toISOString();
      const synthetic: ServiceRequest = {
        id,
        customerId: 'user_1',
        providerId: input.providerId ?? null,
        serviceType: input.serviceType,
        status: 'pending',
        origin: input.origin,
        createdAt: now,
        updatedAt: now,
      };
      if (__DEV__) console.warn('[requestApi] createRequest failed, returning mock request.');
      return synthetic;
    }
    throw new Error(getErrorMessage(error));
  }
}

export async function getRequestById(id: string): Promise<ServiceRequest> {
  try {
    const res = await api.get<ServiceRequest>(`/requests/${id}`);
    if (!res || typeof res !== 'object' || res.data == null) throw new Error('Invalid API response');
    return res.data;
  } catch (error) {
    const mock = MOCK_REQUESTS.find((r) => r.id === id);
    if (mock) {
      const now = mock.createdAt ?? new Date().toISOString();
      return {
        id: mock.id,
        customerId: mock.customerId,
        providerId: mock.providerId ?? null,
        serviceType: mock.service,
        status: mock.status,
        origin: { latitude: mock.customerLocation.latitude, longitude: mock.customerLocation.longitude },
        providerName: mock.providerName ?? null,
        customerName: mock.customerName ?? null,
        createdAt: now,
        updatedAt: now,
      };
    }
    throw new Error(getErrorMessage(error));
  }
}

export async function updateRequestStatus(
  input: UpdateRequestStatusInput,
): Promise<ServiceRequest> {
  const { requestId, status } = input;
  try {
    const res = await api.patch<ServiceRequest>(
      `/requests/${requestId}/status`,
      { status },
    );
    if (!res || typeof res !== 'object' || res.data == null) throw new Error('Invalid API response');
    return res.data;
  } catch (error) {
    const mock = MOCK_REQUESTS.find((r) => r.id === requestId);
    if (mock && isNetworkOrTimeoutError(error)) {
      const now = new Date().toISOString();
      if (__DEV__) console.warn('[requestApi] updateRequestStatus failed, returning mock.');
      return {
        id: mock.id,
        customerId: mock.customerId,
        providerId: mock.providerId ?? null,
        serviceType: mock.service,
        status,
        origin: { latitude: mock.customerLocation.latitude, longitude: mock.customerLocation.longitude },
        providerName: mock.providerName ?? null,
        customerName: mock.customerName ?? null,
        createdAt: mock.createdAt ?? now,
        updatedAt: now,
      };
    }
    throw new Error(getErrorMessage(error));
  }
}

export interface RateRequestInput {
  requestId: string;
  /** Overall rating 1-5 (required). */
  rating: number;
  /** Response/speed 1-5. */
  ratingSpeed?: number | null;
  /** Service quality 1-5. */
  ratingQuality?: number | null;
  /** Professionalism/behavior 1-5. */
  ratingProfessionalism?: number | null;
  comment?: string | null;
}

export interface RatingResponse {
  id: string;
  providerId: string;
  customerId: string;
  requestId: string;
  rating: number;
  ratingSpeed?: number | null;
  ratingQuality?: number | null;
  ratingProfessionalism?: number | null;
  comment: string | null;
  createdAt: string;
}

export async function rateRequest(input: RateRequestInput): Promise<RatingResponse> {
  try {
    const body = {
      rating: input.rating,
      ratingSpeed: input.ratingSpeed ?? undefined,
      ratingQuality: input.ratingQuality ?? undefined,
      ratingProfessionalism: input.ratingProfessionalism ?? undefined,
      comment: input.comment ?? undefined,
    };
    const res = await api.post<RatingResponse>(
      `/requests/${input.requestId}/rate`,
      body,
    );
    if (!res || typeof res !== 'object' || res.data == null) throw new Error('Invalid API response');
    return res.data;
  } catch (error) {
    const msg = getErrorMessage(error);
    if (__DEV__) console.warn('[requestApi] rateRequest failed:', msg);
    throw new Error(msg);
  }
}
