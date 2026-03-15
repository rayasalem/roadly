import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  ServiceRequest,
  RequestStatus,
  UpdateRequestStatusInput,
} from '../domain/types';
import { getRequestById, updateRequestStatus } from '../data/requestApi';
import { isNetworkOrTimeoutError } from '../../../shared/services/http/errorMessage';
import { MOCK_REQUESTS } from '../../../mock/mockRequests';

const requestKey = (id: string) => ['request', id] as const;

function mockToServiceRequest(m: import('../../../mock/mockRequests').MockRequest): ServiceRequest {
  const now = m.createdAt ?? new Date().toISOString();
  return {
    id: m.id,
    customerId: m.customerId,
    providerId: m.providerId ?? null,
    serviceType: m.service,
    status: m.status,
    origin: { latitude: m.customerLocation.latitude, longitude: m.customerLocation.longitude },
    createdAt: now,
    updatedAt: now,
  };
}

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
        const mock = MOCK_REQUESTS.find((r) => r.id === id);
        if (mock) {
          if (__DEV__) console.warn('[useRequest] API failed, using mock request', id);
          return mockToServiceRequest(mock);
        }
        if (isNetworkOrTimeoutError(error)) {
          if (__DEV__) console.warn('[useRequest] Connection failed for request', id);
          return null;
        }
        throw error;
      }
    },
    enabled,
    staleTime: 3_000,
    refetchInterval: (data) => {
      if (!data) return false;
      const terminal = ['completed', 'cancelled', 'rejected'].includes(data.status);
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

