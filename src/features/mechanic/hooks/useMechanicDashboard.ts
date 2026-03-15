/**
 * Mechanic dashboard: data from GET /dashboard/mechanic, client-side filter by status.
 * Accept/Decline/Complete call PATCH /requests/:id/status and refetch.
 */
import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchMechanicDashboard,
  type MechanicJob,
  type RequesterItem,
  type MechanicRequestStatus,
} from '../data/mechanicDashboardApi';
import { updateRequestStatus } from '../../requests/data/requestApi';
import { isNetworkOrTimeoutError } from '../../../shared/services/http/errorMessage';

const QUERY_KEY = ['dashboard', 'mechanic'] as const;
const STALE_TIME_MS = 30 * 1000;

export type { MechanicRequestStatus, MechanicJob, RequesterItem };

const emptyResponse = {
  stats: { jobsToday: 0, onTheWay: 0, rating: '0' },
  jobs: [] as MechanicJob[],
  requesters: [] as RequesterItem[],
};

export function useMechanicDashboard(enabled = true) {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<MechanicRequestStatus | 'all'>('all');

  const { data = emptyResponse, isLoading, isError, error, refetch } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      try {
        return await fetchMechanicDashboard();
      } catch (e) {
        if (isNetworkOrTimeoutError(e)) return emptyResponse;
        throw e;
      }
    },
    enabled,
    staleTime: STALE_TIME_MS,
  });

  const acceptMutation = useMutation({
    mutationFn: (requestId: string) =>
      updateRequestStatus({ requestId, status: 'accepted' }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  const declineMutation = useMutation({
    mutationFn: (requestId: string) =>
      updateRequestStatus({ requestId, status: 'cancelled' }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  const completeMutation = useMutation({
    mutationFn: (requestId: string) =>
      updateRequestStatus({ requestId, status: 'completed' }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  const jobs = useMemo(() => {
    const list = data.jobs ?? [];
    if (statusFilter === 'all') return list;
    return list.filter((j) => j.status === statusFilter);
  }, [data.jobs, statusFilter]);

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
    acceptJob: acceptMutation.mutateAsync,
    declineJob: declineMutation.mutateAsync,
    completeJob: completeMutation.mutateAsync,
    isAccepting: acceptMutation.isPending,
    isDeclining: declineMutation.isPending,
    isCompleting: completeMutation.isPending,
  };
}
