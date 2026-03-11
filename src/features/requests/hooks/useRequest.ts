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
        if (isNetworkOrTimeoutError(error)) {
          if (__DEV__) {
            console.warn('[useRequest] Connection failed for request', id, error instanceof Error ? error.message : error);
          }
          return null;
        }
        throw error;
      }
    },
    enabled,
    staleTime: 3_000,
    refetchInterval: (data) => {
      if (!data) return false;
      const terminal = data.status === 'completed' || data.status === 'cancelled';
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

