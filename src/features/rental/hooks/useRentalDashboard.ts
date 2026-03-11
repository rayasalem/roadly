/**
 * Rental dashboard: data from GET /dashboard/rental.
 */
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  fetchRentalDashboard,
  type RentalVehicle,
  type RentalBooking,
} from '../data/rentalDashboardApi';

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
    queryFn: fetchRentalDashboard,
    staleTime: STALE_TIME_MS,
    retry: 2,
  });

  const stats = useMemo(
    () =>
      data?.stats ?? {
        total: 0,
        available: 0,
        rented: 0,
      },
    [data?.stats],
  );

  const vehicles = useMemo(() => data?.vehicles ?? [], [data?.vehicles]);
  const bookings = useMemo(() => data?.bookings ?? [], [data?.bookings]);

  return {
    stats,
    vehicles,
    bookings,
    isLoading,
    isError,
    error: error instanceof Error ? error : null,
    refetch,
  };
}
