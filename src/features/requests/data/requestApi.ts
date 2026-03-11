import type {
  ServiceRequest,
  CreateRequestInput,
  UpdateRequestStatusInput,
} from '../domain/types';
import { api } from '../../../shared/services/http/api';
import { ENDPOINTS } from '../../../shared/constants/apiEndpoints';
import { getErrorMessage } from '../../../shared/services/http/errorMessage';

export interface CustomerRequestsResponse {
  items: ServiceRequest[];
  total: number;
}

export async function fetchCustomerRequests(): Promise<CustomerRequestsResponse> {
  try {
    const res = await api.get<CustomerRequestsResponse>(ENDPOINTS.requestsCustomer);
    if (!res || typeof res !== 'object' || res.data == null) return { items: [], total: 0 };
    const data = res.data;
    const items = Array.isArray(data.items) ? (data.items as ServiceRequest[]) : [];
    return { items, total: data.total ?? items.length };
  } catch (error) {
    const msg = getErrorMessage(error);
    if (__DEV__) console.warn('[requestApi] fetchCustomerRequests failed:', msg);
    throw new Error(msg);
  }
}

export async function createRequest(
  input: CreateRequestInput,
): Promise<ServiceRequest> {
  try {
    const res = await api.post<ServiceRequest>('/requests', input);
    if (!res || typeof res !== 'object' || res.data == null) throw new Error('Invalid API response');
    return res.data;
  } catch (error) {
    const msg = getErrorMessage(error);
    if (__DEV__) console.warn('[requestApi] createRequest failed:', msg);
    throw new Error(msg);
  }
}

export async function getRequestById(id: string): Promise<ServiceRequest> {
  try {
    const res = await api.get<ServiceRequest>(`/requests/${id}`);
    if (!res || typeof res !== 'object' || res.data == null) throw new Error('Invalid API response');
    return res.data;
  } catch (error) {
    const msg = getErrorMessage(error);
    if (__DEV__) console.warn('[requestApi] getRequestById failed:', msg);
    throw new Error(msg);
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
    const msg = getErrorMessage(error);
    if (__DEV__) console.warn('[requestApi] updateRequestStatus failed:', msg);
    throw new Error(msg);
  }
}

export interface RateRequestInput {
  requestId: string;
  rating: number;
  comment?: string | null;
}

export interface RatingResponse {
  id: string;
  providerId: string;
  customerId: string;
  requestId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

export async function rateRequest(input: RateRequestInput): Promise<RatingResponse> {
  try {
    const res = await api.post<RatingResponse>(
      `/requests/${input.requestId}/rate`,
      { rating: input.rating, comment: input.comment ?? undefined },
    );
    if (!res || typeof res !== 'object' || res.data == null) throw new Error('Invalid API response');
    return res.data;
  } catch (error) {
    const msg = getErrorMessage(error);
    if (__DEV__) console.warn('[requestApi] rateRequest failed:', msg);
    throw new Error(msg);
  }
}
