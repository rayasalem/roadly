/**
 * Admin dashboard API. Backend: GET /admin/dashboard
 */
import { api } from '../../../shared/services/http/api';
import { ENDPOINTS } from '../../../shared/constants/apiEndpoints';
import { getErrorMessage } from '../../../shared/services/http/errorMessage';

export type AdminProviderRole = 'mechanic' | 'tow' | 'rental';

export interface AdminProviderItem {
  id: string;
  name: string;
  role: AdminProviderRole;
  status: string;
  requestsCount?: number;
}

export interface AdminMechanicRequest {
  id: string;
  title: string;
  customerName: string;
  distance: string;
  eta: string;
  status: 'new' | 'on_the_way' | 'in_garage';
  mechanicName?: string;
}

export interface AdminTowRequest {
  id: string;
  title: string;
  customerName: string;
  distance: string;
  vehicle: string;
  status: 'active' | 'queued';
}

export interface AdminRentalVehicle {
  id: string;
  name: string;
  plate: string;
  status: 'available' | 'rented' | 'maintenance';
  price: string;
}

export interface AdminDashboardStats {
  users: number;
  providers: number;
  requests: number;
  revenue: string;
  mechanicsCount: number;
  towCount: number;
  rentalCount: number;
  /** Active providers (online with location). */
  activeProviders?: number;
  /** Requests in progress (accepted / on_the_way). */
  activeRequests?: number;
  /** Completed services count. */
  completedServices?: number;
  /** Pending requests (not yet accepted). */
  pendingRequests?: number;
}

export interface AdminDashboardResponse {
  stats: AdminDashboardStats;
  chartData: number[];
  mechanicPanel: {
    stats: { jobsToday: number; activeRequests: number; avgRating: string };
    requests: AdminMechanicRequest[];
  };
  towPanel: {
    stats: { active: number; waiting: number; fleet: number };
    requests: AdminTowRequest[];
  };
  rentalPanel: {
    stats: { total: number; available: number; rented: number; maintenance: number };
    vehicles: AdminRentalVehicle[];
  };
  providers: {
    mechanic: AdminProviderItem[];
    tow: AdminProviderItem[];
    rental: AdminProviderItem[];
  };
}

export async function fetchAdminDashboard(): Promise<AdminDashboardResponse> {
  try {
    const { data } = await api.get<AdminDashboardResponse>(ENDPOINTS.adminDashboard);
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
