/**
 * Admin requests API: GET /admin/requests
 */
import { api } from '../../../shared/services/http/api';
import { ENDPOINTS } from '../../../shared/constants/apiEndpoints';

export interface AdminRequestApiItem {
  id: string;
  customerId: string;
  providerId: string | null;
  serviceType: string;
  status: string;
  description?: string | null;
  origin: { latitude: number; longitude: number };
  destination?: { latitude: number; longitude: number } | null;
  priceEstimate?: number | null;
  etaMinutes?: number | null;
  createdAt: string;
  updatedAt: string;
  customerName: string;
  providerName: string | null;
}

export interface AdminRequestsListResponse {
  items: AdminRequestApiItem[];
  total: number;
  page: number;
  limit: number;
}

export async function fetchAdminRequests(params?: {
  page?: number;
  limit?: number;
  status?: string;
  serviceType?: string;
}): Promise<AdminRequestsListResponse> {
  const { data } = await api.get<AdminRequestsListResponse>(ENDPOINTS.adminRequests, { params });
  return data;
}
