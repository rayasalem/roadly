/**
 * Tow dashboard API. Backend: GET /dashboard/tow
 */
import { api } from '../../../shared/services/http/api';
import { ENDPOINTS } from '../../../shared/constants/apiEndpoints';
import { getErrorMessage } from '../../../shared/services/http/errorMessage';

export type TowJobStatus = 'active' | 'queued';

export interface TowJob {
  id: string;
  /** Request id for accept/reject (PATCH /requests/:id/status). May equal id. */
  requestId?: string;
  title: string;
  distance: string;
  eta: string;
  vehicle: string;
  status: TowJobStatus;
}

export interface TowRequesterItem {
  id: string;
  customerName: string;
  serviceType: string;
  time: string;
  status: string;
}

export interface TowDashboardStats {
  active: number;
  waiting: number;
  fleet: number;
}

export interface TowDashboardResponse {
  stats: TowDashboardStats;
  jobs: TowJob[];
  requesters: TowRequesterItem[];
}

export async function fetchTowDashboard(): Promise<TowDashboardResponse> {
  try {
    const { data } = await api.get<TowDashboardResponse>(ENDPOINTS.dashboardTow);
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
