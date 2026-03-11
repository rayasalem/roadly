import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateRequestInput, ServiceRequest } from '../domain/types';
import { createRequest } from '../data/requestApi';

const requestKey = (id: string) => ['request', id] as const;

export function useCreateRequest() {
  const queryClient = useQueryClient();

  return useMutation<ServiceRequest, Error, CreateRequestInput>({
    mutationFn: createRequest,
    onSuccess: (request) => {
      queryClient.setQueryData(requestKey(request.id), request);
    },
  });
}

