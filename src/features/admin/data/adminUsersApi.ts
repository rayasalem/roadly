import { api } from '../../../shared/services/http/api';
import { ENDPOINTS } from '../../../shared/constants/apiEndpoints';

export interface AdminUserApiItem {
  id: string;
  name: string;
  email: string;
  role: string;
  blocked: boolean;
  createdAt: string;
}

export interface AdminUsersListResponse {
  items: AdminUserApiItem[];
  total: number;
  page: number;
  limit: number;
}

export async function fetchAdminUsers(params?: { page?: number; limit?: number }): Promise<AdminUsersListResponse> {
  const { data } = await api.get<AdminUsersListResponse>(ENDPOINTS.adminUsers, { params });
  return data;
}

export async function blockUser(userId: string, blocked: boolean): Promise<AdminUserApiItem> {
  const { data } = await api.patch<AdminUserApiItem>(ENDPOINTS.adminUserBlock(userId), { blocked });
  return data;
}
