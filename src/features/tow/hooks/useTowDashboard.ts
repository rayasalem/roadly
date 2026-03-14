/**
 * Tow dashboard: data from GET /dashboard/tow, accept/reject via PATCH /requests/:id/status.
 */
import { useState, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  type TowJob,
  type TowRequesterItem,
  type TowJobStatus,
} from '../data/towDashboardApi';
import { updateRequestStatus } from '../../requests/data/requestApi';
import { MOCK_REQUESTS } from '../../../mock/mockRequests';
import { MOCK_TOW_PROVIDERS } from '../../../mock/mockProviders';

const QUERY_KEY = ['dashboard', 'tow'] as const;
const STALE_TIME_MS = 60 * 1000;

export type { TowJobStatus, TowJob, TowRequesterItem };

export function useTowDashboard() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<TowJobStatus | 'all'>('all');

  const mockJobs: TowJob[] = useMemo(
    () =>
      MOCK_REQUESTS.filter((r) => r.service === 'tow').map((r) => {
        const provider = MOCK_TOW_PROVIDERS.find((p) => p.id === r.providerId);
        const status: TowJobStatus = r.status === 'pending' ? 'queued' : 'active';
        return {
          id: r.id,
          requestId: r.id,
          title: provider?.name ?? 'طلب سحب',
          distance: '2.1 كم',
          vehicle: 'سيارة خاصة',
          status,
        } as TowJob;
      }),
    [],
  );

  const mockRequesters: TowRequesterItem[] = useMemo(
    () =>
      mockJobs.map((j, idx) => ({
        id: `tow_req_${idx}`,
        customerName: `زبون ونش ${idx + 1}`,
        serviceType: 'tow',
        time: 'قبل دقائق',
        status: j.status,
      })),
    [mockJobs],
  );

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

  const stats = useMemo(
    () => ({
      active: mockJobs.filter((j) => j.status === 'active').length,
      waiting: mockJobs.filter((j) => j.status === 'queued').length,
      fleet: MOCK_TOW_PROVIDERS.length,
    }),
    [mockJobs],
  );

  const jobs = useMemo(() => {
    const list = mockJobs;
    if (statusFilter === 'all') return list;
    return list.filter((j) => j.status === statusFilter);
  }, [mockJobs, statusFilter]);

  const requesters = useMemo(() => mockRequesters, [mockRequesters]);

  const acceptJob = (requestId: string) => acceptMutation.mutateAsync(requestId);
  const rejectJob = (requestId: string) => rejectMutation.mutateAsync(requestId);

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
    acceptJob,
    rejectJob,
    isAccepting: acceptMutation.isPending,
    isRejecting: rejectMutation.isPending,
  };
}
