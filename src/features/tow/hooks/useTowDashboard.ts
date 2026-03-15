/**
 * Tow dashboard: data from GET /dashboard/tow, accept/reject via PATCH /requests/:id/status.
 */
import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchTowDashboard,
  type TowJob,
  type TowRequesterItem,
  type TowJobStatus,
} from '../data/towDashboardApi';
import { updateRequestStatus } from '../../requests/data/requestApi';
import { isNetworkOrTimeoutError } from '../../../shared/services/http/errorMessage';

const QUERY_KEY = ['dashboard', 'tow'] as const;
const STALE_TIME_MS = 30 * 1000;

export type { TowJobStatus, TowJob, TowRequesterItem };

const emptyResponse = {
  stats: { active: 0, waiting: 0, fleet: 0 },
  jobs: [] as TowJob[],
  requesters: [] as TowRequesterItem[],
};

/** Backend returns 'new' | 'accepted' | 'on_the_way' | ...; map to TowJobStatus. */
function mapJobStatus(s: string): TowJobStatus {
  if (s === 'new' || s === 'pending') return 'queued';
  if (s === 'accepted' || s === 'on_the_way') return 'active';
  return 'active';
}

export function useTowDashboard() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<TowJobStatus | 'all'>('all');

  const { data: rawData, isLoading, isError, error, refetch } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      try {
        return await fetchTowDashboard();
      } catch (e) {
        if (isNetworkOrTimeoutError(e)) return emptyResponse;
        throw e;
      }
    },
    staleTime: STALE_TIME_MS,
  });

  const data = useMemo(() => {
    if (!rawData?.jobs) return rawData ?? emptyResponse;
    const jobs: TowJob[] = (rawData.jobs as TowJob[]).map((j) => ({
      ...j,
      status: mapJobStatus((j as { status?: string }).status ?? 'new'),
    }));
    return { ...rawData, jobs };
  }, [rawData]);

  const acceptMutation = useMutation({
    mutationFn: (requestId: string) =>
      updateRequestStatus({ requestId, status: 'accepted' }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  const rejectMutation = useMutation({
    mutationFn: (requestId: string) =>
      updateRequestStatus({ requestId, status: 'cancelled' }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  const jobs = useMemo(() => {
    const list = data.jobs ?? [];
    if (statusFilter === 'all') return list;
    return list.filter((j) => j.status === statusFilter);
  }, [data.jobs, statusFilter]);

  const acceptJob = (requestId: string) => acceptMutation.mutateAsync(requestId);
  const rejectJob = (requestId: string) => rejectMutation.mutateAsync(requestId);

  return {
    stats: data.stats ?? emptyResponse.stats,
    jobs,
    requesters: data.requesters ?? emptyResponse.requesters,
    statusFilter,
    setStatusFilter,
    isLoading,
    isError,
    error,
    refetch,
    acceptJob,
    rejectJob,
    isAccepting: acceptMutation.isPending,
    isRejecting: rejectMutation.isPending,
  };
}
