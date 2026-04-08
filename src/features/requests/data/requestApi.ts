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

export interface ProviderRequestsResponse {
  items: ServiceRequest[];
  total: number;
}

function parseListResponse<T extends { items?: unknown; total?: unknown }>(data: T): { items: ServiceRequest[]; total: number } {
  const items = Array.isArray(data.items) ? (data.items as ServiceRequest[]) : [];
  return { items, total: typeof data.total === 'number' ? data.total : items.length };
}

export async function fetchCustomerRequests(): Promise<CustomerRequestsResponse> {
  try {
    const res = await api.get<CustomerRequestsResponse>(ENDPOINTS.requestsCustomer);
    if (!res || typeof res !== 'object' || res.data == null) {
      throw new Error('Empty API response');
    }
    return parseListResponse(res.data as CustomerRequestsResponse);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function fetchProviderRequests(): Promise<ProviderRequestsResponse> {
  try {
    const res = await api.get<ProviderRequestsResponse>(ENDPOINTS.requestsProvider);
    if (!res || typeof res !== 'object' || res.data == null) {
      throw new Error('Empty API response');
    }
    return parseListResponse(res.data as ProviderRequestsResponse);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function createRequest(input: CreateRequestInput): Promise<ServiceRequest> {
  try {
    const body = { ...input, description: input.description ?? undefined };
    const res = await api.post<ServiceRequest>('/requests', body);
    if (!res || typeof res !== 'object' || res.data == null) throw new Error('Invalid API response');
    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getRequestById(id: string): Promise<ServiceRequest> {
  try {
    const res = await api.get<ServiceRequest>(`/requests/${id}`);
    if (!res || typeof res !== 'object' || res.data == null) throw new Error('Invalid API response');
    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function updateRequestStatus(input: UpdateRequestStatusInput): Promise<ServiceRequest> {
  const { requestId, status } = input;
  try {
    const res = await api.patch<ServiceRequest>(`/requests/${requestId}/status`, { status });
    if (!res || typeof res !== 'object' || res.data == null) throw new Error('Invalid API response');
    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export interface RateRequestInput {
  requestId: string;
  rating: number;
  ratingSpeed?: number | null;
  ratingQuality?: number | null;
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
    const res = await api.post<RatingResponse>(`/requests/${input.requestId}/rate`, body);
    if (!res || typeof res !== 'object' || res.data == null) throw new Error('Invalid API response');
    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
