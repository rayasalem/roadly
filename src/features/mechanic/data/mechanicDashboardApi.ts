/**
 * Mechanic dashboard API. Backend: GET /dashboard/mechanic
 */
import { api } from '../../../shared/services/http/api';
import { ENDPOINTS } from '../../../shared/constants/apiEndpoints';
import { getErrorMessage } from '../../../shared/services/http/errorMessage';

export type MechanicRequestStatus = 'new' | 'on_the_way' | 'in_garage';

export interface MechanicJob {
  id: string;
  /** Request id for API accept/decline (PATCH /requests/:id/status) */
  requestId?: string;
  title: string;
  distance: string;
  eta: string;
  status: MechanicRequestStatus;
}

export interface RequesterItem {
  id: string;
  customerName: string;
  serviceType: string;
  time: string;
  status: string;
}

export interface MechanicDashboardStats {
  jobsToday: number;
  onTheWay: number;
  rating: string;
}

export interface MechanicDashboardResponse {
  stats: MechanicDashboardStats;
  jobs: MechanicJob[];
  requesters: RequesterItem[];
}

export async function fetchMechanicDashboard(): Promise<MechanicDashboardResponse> {
  try {
    const { data } = await api.get<MechanicDashboardResponse>(ENDPOINTS.dashboardMechanic);
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
