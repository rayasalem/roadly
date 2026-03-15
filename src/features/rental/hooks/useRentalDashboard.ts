/**
 * Rental dashboard: data from GET /dashboard/rental; jobs (requests) with accept/reject.
 */
import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchRentalDashboard,
  type RentalVehicle,
  type RentalBooking,
  type RentalJob,
  type RentalRequesterItem,
} from '../data/rentalDashboardApi';
import { updateRequestStatus } from '../../requests/data/requestApi';
import { isNetworkOrTimeoutError } from '../../../shared/services/http/errorMessage';
import { MOCK_CARS } from '../../../mock/mockCars';

const QUERY_KEY = ['dashboard', 'rental'] as const;
const STALE_TIME_MS = 30 * 1000;

export type { RentalVehicle, RentalBooking, RentalJob, RentalRequesterItem };
export type VehicleStatus = 'available' | 'rented' | 'maintenance' | 'reserved';

export function useRentalDashboard() {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      try {
        return await fetchRentalDashboard();
      } catch (e) {
        if (isNetworkOrTimeoutError(e)) {
          return { stats: { total: 0, available: 0, rented: 0 }, vehicles: [], bookings: [], jobs: [], requesters: [] };
        }
        throw e;
      }
    },
    staleTime: STALE_TIME_MS,
  });

  const acceptMutation = useMutation({
    mutationFn: (requestId: string) => updateRequestStatus({ requestId, status: 'accepted' }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  const rejectMutation = useMutation({
    mutationFn: (requestId: string) => updateRequestStatus({ requestId, status: 'cancelled' }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  const vehicles = useMemo<RentalVehicle[]>(() => {
    if (data?.vehicles?.length) return data.vehicles;
    return MOCK_CARS.map((c) => ({
      id: c.id,
      name: c.name,
      plate: `PLT-${c.id.slice(-3)}`,
      price: `${c.pricePerDay} ₪ / يوم`,
      status: (c.available ? 'available' : 'rented') as VehicleStatus,
    }));
  }, [data?.vehicles]);

  const stats = useMemo(
    () =>
      data?.stats ?? {
        total: vehicles.length,
        available: vehicles.filter((v) => v.status === 'available').length,
        rented: vehicles.filter((v) => v.status === 'rented').length,
      },
    [data?.stats, vehicles],
  );

  const jobs = data?.jobs ?? [];
  const requesters = data?.requesters ?? [];
  const bookings = useMemo<RentalBooking[]>(() => data?.bookings ?? [], [data?.bookings]);

  return {
    stats,
    vehicles,
    bookings,
    jobs,
    requesters,
    isLoading,
    isError,
    error,
    refetch,
    acceptJob: (requestId: string) => acceptMutation.mutateAsync(requestId),
    rejectJob: (requestId: string) => rejectMutation.mutateAsync(requestId),
    isAccepting: acceptMutation.isPending,
    isRejecting: rejectMutation.isPending,
  };
}
