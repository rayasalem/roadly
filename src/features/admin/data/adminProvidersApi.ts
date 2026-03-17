/**
 * Admin providers API: GET /admin/providers, PATCH /admin/providers/:id/verify
 */
import { api } from '../../../shared/services/http/api';
import { ENDPOINTS } from '../../../shared/constants/apiEndpoints';

export interface AdminProviderApiItem {
  id: string;
  name: string;
  role: string;
  verified?: boolean;
  [key: string]: unknown;
}

export interface AdminProvidersListResponse {
  items: AdminProviderApiItem[];
  total: number;
  page: number;
  limit: number;
}

export async function fetchAdminProviders(params?: { page?: number; limit?: number }): Promise<AdminProvidersListResponse> {
  const { data } = await api.get<AdminProvidersListResponse>(ENDPOINTS.adminProviders, { params });
  return data;
}

export async function verifyProvider(providerId: string, verified: boolean): Promise<AdminProviderApiItem> {
  const { data } = await api.patch<AdminProviderApiItem>(ENDPOINTS.adminProviderVerify(providerId), { verified });
  return data;
}
