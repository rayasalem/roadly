/**
 * Rental dashboard API. Backend: GET /dashboard/rental
 */
import { api } from '../../../shared/services/http/api';
import { ENDPOINTS } from '../../../shared/constants/apiEndpoints';
import { getErrorMessage } from '../../../shared/services/http/errorMessage';

export type VehicleStatus = 'available' | 'rented' | 'maintenance' | 'reserved';

export interface RentalVehicle {
  id: string;
  name: string;
  plate: string;
  status: VehicleStatus;
  price: string;
}

export interface RentalBooking {
  id: string;
  customer: string;
  vehicle: string;
  time: string;
}

export interface RentalDashboardStats {
  total: number;
  available: number;
  rented: number;
}

export interface RentalDashboardResponse {
  stats: RentalDashboardStats;
  vehicles: RentalVehicle[];
  bookings: RentalBooking[];
}

export async function fetchRentalDashboard(): Promise<RentalDashboardResponse> {
  try {
    const { data } = await api.get<RentalDashboardResponse>(ENDPOINTS.dashboardRental);
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
