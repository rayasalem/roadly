/**
 * Admin dashboard: data from GET /admin/dashboard, client-side filters per panel.
 */
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAdminDashboard } from '../data/adminDashboardApi';
import type {
  AdminProviderRole,
  AdminProviderItem,
  AdminMechanicRequest,
  AdminTowRequest,
  AdminRentalVehicle,
} from '../data/adminDashboardApi';

export type {
  AdminProviderRole,
  AdminProviderItem,
  AdminMechanicRequest,
  AdminTowRequest,
  AdminRentalVehicle,
};

export type AdminMechanicFilter = 'all' | 'new' | 'on_the_way' | 'in_garage';
export type AdminTowFilter = 'all' | 'active' | 'queued';
export type AdminRentalFilter = 'all' | 'available' | 'rented' | 'maintenance';

const QUERY_KEY = ['dashboard', 'admin'] as const;
const STALE_TIME_MS = 60 * 1000;

export function useAdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminProviderRole>('mechanic');
  const [mechanicFilter, setMechanicFilter] = useState<AdminMechanicFilter>('all');
  const [towFilter, setTowFilter] = useState<AdminTowFilter>('all');
  const [rentalFilter, setRentalFilter] = useState<AdminRentalFilter>('all');

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchAdminDashboard,
    staleTime: STALE_TIME_MS,
    retry: 2,
  });

  const stats = useMemo(
    () =>
      data?.stats ?? {
        users: 0,
        providers: 0,
        requests: 0,
        revenue: '0',
        mechanicsCount: 0,
        towCount: 0,
        rentalCount: 0,
      },
    [data?.stats],
  );

  const chartData = useMemo(() => data?.chartData ?? [], [data?.chartData]);

  const mechanicStats = useMemo(
    () =>
      data?.mechanicPanel?.stats ?? {
        jobsToday: 0,
        activeRequests: 0,
        avgRating: '0',
      },
    [data?.mechanicPanel?.stats],
  );

  const mechanicRequests = useMemo((): AdminMechanicRequest[] => {
    const list = data?.mechanicPanel?.requests ?? [];
    if (mechanicFilter === 'all') return list;
    return list.filter((r) => r.status === mechanicFilter);
  }, [data?.mechanicPanel?.requests, mechanicFilter]);

  const towStats = useMemo(
    () =>
      data?.towPanel?.stats ?? {
        active: 0,
        waiting: 0,
        fleet: 0,
      },
    [data?.towPanel?.stats],
  );

  const towRequests = useMemo((): AdminTowRequest[] => {
    const list = data?.towPanel?.requests ?? [];
    if (towFilter === 'all') return list;
    return list.filter((r) => r.status === towFilter);
  }, [data?.towPanel?.requests, towFilter]);

  const rentalStats = useMemo(
    () =>
      data?.rentalPanel?.stats ?? {
        total: 0,
        available: 0,
        rented: 0,
        maintenance: 0,
      },
    [data?.rentalPanel?.stats],
  );

  const rentalVehicles = useMemo((): AdminRentalVehicle[] => {
    const list = data?.rentalPanel?.vehicles ?? [];
    if (rentalFilter === 'all') return list;
    return list.filter((v) => v.status === rentalFilter);
  }, [data?.rentalPanel?.vehicles, rentalFilter]);

  const getProvidersByRole = useMemo(
    () => (role: AdminProviderRole): AdminProviderItem[] => {
      const providers = data?.providers;
      if (!providers) return [];
      if (role === 'mechanic') return providers.mechanic ?? [];
      if (role === 'tow') return providers.tow ?? [];
      return providers.rental ?? [];
    },
    [data?.providers],
  );

  return {
    stats,
    chartData,
    getProvidersByRole,
    activeTab,
    setActiveTab,
    mechanicPanel: {
      stats: mechanicStats,
      requests: mechanicRequests,
      filter: mechanicFilter,
      setFilter: setMechanicFilter,
    },
    towPanel: {
      stats: towStats,
      requests: towRequests,
      filter: towFilter,
      setFilter: setTowFilter,
    },
    rentalPanel: {
      stats: rentalStats,
      vehicles: rentalVehicles,
      filter: rentalFilter,
      setFilter: setRentalFilter,
    },
    isLoading,
    isError,
    error: error instanceof Error ? error : null,
    refetch,
  };
}
