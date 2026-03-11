/**
 * Tow dashboard: data from GET /dashboard/tow, client-side filter by status.
 */
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  fetchTowDashboard,
  type TowJob,
  type TowRequesterItem,
  type TowJobStatus,
} from '../data/towDashboardApi';

const QUERY_KEY = ['dashboard', 'tow'] as const;
const STALE_TIME_MS = 60 * 1000;

export type { TowJobStatus, TowJob, TowRequesterItem };

export function useTowDashboard() {
  const [statusFilter, setStatusFilter] = useState<TowJobStatus | 'all'>('all');

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchTowDashboard,
    staleTime: STALE_TIME_MS,
    retry: 2,
  });

  const stats = useMemo(
    () =>
      data?.stats ?? {
        active: 0,
        waiting: 0,
        fleet: 0,
      },
    [data?.stats],
  );

  const jobs = useMemo(() => {
    const list = data?.jobs ?? [];
    if (statusFilter === 'all') return list;
    return list.filter((j) => j.status === statusFilter);
  }, [data?.jobs, statusFilter]);

  const requesters = useMemo(() => data?.requesters ?? [], [data?.requesters]);

  return {
    stats,
    jobs,
    requesters,
    statusFilter,
    setStatusFilter,
    isLoading,
    isError,
    error: error instanceof Error ? error : null,
    refetch,
  };
}
