/**
 * Rental dashboard: data from GET /dashboard/rental.
 */
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  type RentalVehicle,
  type RentalBooking,
} from '../data/rentalDashboardApi';
import { MOCK_CARS } from '../../../mock/mockCars';
import { MOCK_REQUESTS } from '../../../mock/mockRequests';

const QUERY_KEY = ['dashboard', 'rental'] as const;
const STALE_TIME_MS = 60 * 1000;

export type { RentalVehicle, RentalBooking };
export type VehicleStatus = 'available' | 'rented' | 'maintenance' | 'reserved';

export function useRentalDashboard() {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEY,
    // backend optional – we always have mock cars, and API (if available) just augments them
    queryFn: async () => ({ stats: undefined, vehicles: [], bookings: [] } as any),
    staleTime: STALE_TIME_MS,
    retry: 0,
  });

  const vehicles = useMemo<RentalVehicle[]>(
    () =>
      MOCK_CARS.map((c) => ({
        id: c.id,
        name: c.name,
        plate: `PLT-${c.id.slice(-3)}`,
        price: `${c.pricePerDay} ₪ / يوم`,
        status: c.available ? 'available' : 'rented',
      })),
    [],
  );

  const bookings = useMemo<RentalBooking[]>(
    () =>
      MOCK_REQUESTS.filter((r) => r.service === 'rental').map((r, idx) => ({
        id: `rental_booking_${idx}`,
        customer: `زبون تأجير ${idx + 1}`,
        vehicle: 'سيارة إيجار',
        time: 'اليوم',
      })),
    [],
  );

  const stats = useMemo(
    () => ({
      total: vehicles.length,
      available: vehicles.filter((v) => v.status === 'available').length,
      rented: vehicles.filter((v) => v.status === 'rented').length,
    }),
    [vehicles],
  );

  return {
    stats,
    vehicles,
    bookings,
    isLoading: false,
    isError: false,
    error: null,
    refetch,
  };
}
