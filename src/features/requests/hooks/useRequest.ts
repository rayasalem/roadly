import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  ServiceRequest,
  RequestStatus,
  UpdateRequestStatusInput,
} from '../domain/types';
import { getRequestById, updateRequestStatus } from '../data/requestApi';
import { isNetworkOrTimeoutError } from '../../../shared/services/http/errorMessage';

const requestKey = (id: string) => ['request', id] as const;

export function useRequest(id: string | null) {
  const enabled = !!id;
  const queryClient = useQueryClient();

  const query = useQuery<ServiceRequest | null, Error>({
    queryKey: enabled ? requestKey(id as string) : ['request', 'disabled'],
    queryFn: async () => {
      if (!id) return null;
      try {
        return await getRequestById(id);
      } catch (error) {
        // If this is a synthetic local-only request (offline_/mock_ from older sessions)
        // and the backend no longer knows about it (e.g. after server restart),
        // stop trying to refetch and just surface "no data" instead of spamming 404s.
        if (id.startsWith('offline_') || id.startsWith('mock_')) {
          if (__DEV__) {
            console.warn('[useRequest] synthetic request id not found on server, returning null', id);
          }
          return null;
        }
        if (isNetworkOrTimeoutError(error)) {
          if (__DEV__) console.warn('[useRequest] Connection failed for request', id);
          return null;
        }
        throw error;
      }
    },
    enabled,
    // Avoid aggressive background refetching when there is no active change,
    // especially on web where this can generate a lot of noise.
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      // For network / timeout errors: retry a couple of times then stop.
      if (isNetworkOrTimeoutError(error)) {
        return failureCount < 2;
      }
      // For other errors (e.g. 4xx, server validation) do not auto‑retry.
      return false;
    },
    staleTime: 3_000,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return false;
      const terminal = ['completed', 'cancelled'].includes(data.status);
      return terminal ? false : 5_000;
    },
  });

  const mutation = useMutation<ServiceRequest, Error, UpdateRequestStatusInput>({
    mutationFn: updateRequestStatus,
    onSuccess: (updated) => {
      queryClient.setQueryData(requestKey(updated.id), updated);
    },
  });

  const setStatus = (
    status: RequestStatus,
    options?: { onSuccess?: () => void },
  ) => {
    if (!id) return;
    mutation.mutate({ requestId: id, status }, options);
  };

  return {
    ...query,
    updateStatus: setStatus,
    isUpdating: mutation.isPending,
  };
}

