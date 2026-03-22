import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import {
  fetchMyVehicles,
  addVehicle,
  updateVehicleApi,
  deleteVehicleApi,
  type RentalVehicleDto,
  type SaveVehicleInput,
} from '../data/rentalVehicleApi';
import { isNetworkOrTimeoutError } from '../../../shared/services/http/errorMessage';

const QUERY_KEY = ['rental', 'vehicles'] as const;
const STALE_TIME_MS = 60 * 1000;

export function useRentalVehicles() {
  const queryClient = useQueryClient();

  const vehiclesQuery = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      try {
        return await fetchMyVehicles();
      } catch (error) {
        if (isNetworkOrTimeoutError(error)) {
          if (__DEV__) {
            console.warn(
              '[useRentalVehicles] fetchMyVehicles failed (network), returning empty list.',
              error instanceof Error ? error.message : error,
            );
          }
          return [] as RentalVehicleDto[];
        }
        throw error;
      }
    },
    staleTime: STALE_TIME_MS,
  });

  const addMutation = useMutation({
    mutationFn: addVehicle,
    onSuccess: (created) => {
      queryClient.setQueryData<RentalVehicleDto[]>(QUERY_KEY, (prev) =>
        prev ? [created, ...prev] : [created],
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<SaveVehicleInput> }) =>
      updateVehicleApi(id, input),
    onSuccess: (updated) => {
      queryClient.setQueryData<RentalVehicleDto[]>(QUERY_KEY, (prev) =>
        prev?.map((v) => (v.id === updated.id ? updated : v)) ?? [updated],
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteVehicleApi(id),
    onSuccess: (_data, id) => {
      queryClient.setQueryData<RentalVehicleDto[]>(QUERY_KEY, (prev) =>
        prev?.filter((v) => v.id !== id) ?? [],
      );
    },
  });

  const add = useCallback(
    (input: SaveVehicleInput) => {
      addMutation.mutate(input);
    },
    [addMutation],
  );

  const update = useCallback(
    (id: string, input: Partial<SaveVehicleInput>) => {
      updateMutation.mutate({ id, input });
    },
    [updateMutation],
  );

  const remove = useCallback(
    (id: string) => {
      deleteMutation.mutate(id);
    },
    [deleteMutation],
  );

  return {
    vehicles: vehiclesQuery.data ?? [],
    isLoading: vehiclesQuery.isLoading,
    isError: vehiclesQuery.isError,
    error: vehiclesQuery.error,
    refetch: vehiclesQuery.refetch,
    add,
    update,
    remove,
    isAdding: addMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

