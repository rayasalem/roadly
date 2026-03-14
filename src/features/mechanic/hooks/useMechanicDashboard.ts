/**
 * Mechanic dashboard: data from GET /dashboard/mechanic, client-side filter by status.
 * Accept/Decline call PATCH /requests/:id/status and refetch.
 */
import { useState, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  type MechanicJob,
  type RequesterItem,
  type MechanicRequestStatus,
} from '../data/mechanicDashboardApi';
import { updateRequestStatus } from '../../requests/data/requestApi';
import { MOCK_REQUESTS } from '../../../mock/mockRequests';
import { MOCK_MECHANIC_PROVIDERS } from '../../../mock/mockProviders';

const QUERY_KEY = ['dashboard', 'mechanic'] as const;
const STALE_TIME_MS = 60 * 1000;

export type { MechanicRequestStatus, MechanicJob, RequesterItem };

export function useMechanicDashboard(enabled = true) {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<MechanicRequestStatus | 'all'>('all');

  const mockJobs: MechanicJob[] = useMemo(
    () =>
      MOCK_REQUESTS.filter((r) => r.service === 'mechanic').map((r) => {
        const provider = MOCK_MECHANIC_PROVIDERS.find((p) => p.id === r.providerId);
        const status: MechanicRequestStatus =
          r.status === 'on_the_way' ? 'on_the_way' : r.status === 'completed' ? 'in_garage' : 'new';
        return {
          id: r.id,
          requestId: r.id,
          title: provider?.name ?? 'طلب ميكانيكي',
          distance: '1.2 كم',
          eta: '10 دقائق',
          status,
        } as MechanicJob;
      }),
    [],
  );

  const mockRequesters: RequesterItem[] = useMemo(
    () =>
      mockJobs.map((j, idx) => ({
        id: `req_${idx}`,
        customerName: `زبون ${idx + 1}`,
        serviceType: 'mechanic',
        time: 'قبل قليل',
        status: j.status,
      })),
    [mockJobs],
  );

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

  const stats = useMemo(
    () => ({
      jobsToday: mockJobs.length,
      onTheWay: mockJobs.filter((j) => j.status === 'on_the_way').length,
      rating: '4.7',
    }),
    [mockJobs],
  );

  const jobs = useMemo(() => {
    const list = mockJobs;
    if (statusFilter === 'all') return list;
    return list.filter((j) => j.status === statusFilter);
  }, [mockJobs, statusFilter]);

  const requesters = useMemo(() => mockRequesters, [mockRequesters]);

  return {
    stats,
    jobs,
    requesters,
    statusFilter,
    setStatusFilter,
    isLoading: false,
    isError: false,
    error: null,
    refetch: () => Promise.resolve(),
    acceptJob: acceptMutation.mutateAsync,
    declineJob: declineMutation.mutateAsync,
    completeJob: completeMutation.mutateAsync,
    isAccepting: acceptMutation.isPending,
    isDeclining: declineMutation.isPending,
    isCompleting: completeMutation.isPending,
  };
}
