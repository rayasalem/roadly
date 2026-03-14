/**
 * Provider (Mechanic / Tow / Rental) profile from GET /providers/me.
 * Uses React Query; loading and error are exposed for ProfileScreen.
 */
import { useState, useCallback, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Role } from '../../../shared/constants/roles';
import { ROLES } from '../../../shared/constants/roles';
import { fetchMyProviderProfile, updateProviderServices } from '../data/providerProfileApi';
import type { ProviderReview } from '../data/providerProfileApi';

export type { ProviderReview };
export type ProviderDisplayStatus = 'available' | 'busy' | 'on_the_way';

export interface ProviderProfile {
  id: string;
  name: string;
  avatarUri: string | null;
  rating: number;
  status: ProviderDisplayStatus;
  /** Realtime availability flag used by dashboards & profile toggles */
  isAvailable: boolean;
  phone: string;
  email: string;
  reviews: ProviderReview[];
}

const MECHANIC_SERVICES_POOL = ['Tire repair', 'Engine diagnostic', 'Oil change', 'Battery service', 'AC repair', 'Brake service'];
const TOW_SERVICES_POOL = ['Tow to garage', 'Roadside assistance', 'Long-distance tow', 'Motorcycle tow', 'Heavy vehicle'];
const RENTAL_SERVICES_POOL = ['Daily rental', 'Weekly rental', 'Luxury vehicles', 'Economy cars', 'SUV rental'];

function getServicesPool(role: Role): string[] {
  if (role === ROLES.MECHANIC) return [...MECHANIC_SERVICES_POOL];
  if (role === ROLES.MECHANIC_TOW) return [...TOW_SERVICES_POOL];
  if (role === ROLES.CAR_RENTAL) return [...RENTAL_SERVICES_POOL];
  return [];
}

const QUERY_KEY = ['provider', 'me'] as const;
const STALE_TIME_MS = 2 * 60 * 1000;

export function useProviderProfile(role: Role | 'guest' | null, displayName: string) {
  const isProvider = role === ROLES.MECHANIC || role === ROLES.MECHANIC_TOW || role === ROLES.CAR_RENTAL;

  const queryClient = useQueryClient();
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchMyProviderProfile,
    enabled: isProvider,
    staleTime: STALE_TIME_MS,
    retry: 2,
  });

  const saveServicesMutation = useMutation({
    mutationFn: updateProviderServices,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  const [localServices, setLocalServices] = useState<string[]>([]);

  useEffect(() => {
    if (data?.services) setLocalServices(data.services);
  }, [data?.services]);

  const profile: ProviderProfile | null = useMemo(() => {
    if (!data) return null;
    return {
      id: data.id,
      name: data.name,
      avatarUri: data.avatarUri ?? null,
      rating: data.rating ?? 0,
      status: (data.status ?? 'available') as ProviderDisplayStatus,
      isAvailable: data.isAvailable ?? true,
      phone: data.phone ?? '',
      email: data.email ?? '',
      reviews: data.reviews ?? [],
    };
  }, [data]);

  const services = useMemo(() => (data ? localServices : []), [data, localServices]);

  const servicesPool = useMemo(() => (role ? getServicesPool(role) : []), [role]);

  const addService = useCallback((serviceName: string) => {
    setLocalServices((prev) => (prev.includes(serviceName) ? prev : [...prev, serviceName]));
  }, []);

  const removeService = useCallback((serviceName: string) => {
    setLocalServices((prev) => prev.filter((s) => s !== serviceName));
  }, []);

  const setServicesList = useCallback((list: string[]) => {
    setLocalServices(list);
  }, []);

  const availableToAdd = useMemo(
    () => servicesPool.filter((s) => !services.includes(s)),
    [servicesPool, services],
  );

  const saveServices = useCallback(
    async (list: string[]) => {
      await saveServicesMutation.mutateAsync(list);
    },
    [saveServicesMutation],
  );

  return {
    isProvider,
    profile,
    services,
    servicesPool,
    availableToAdd,
    addService,
    removeService,
    setServicesList,
    saveServices,
    isSavingServices: saveServicesMutation.isPending,
    isLoading: isProvider ? isLoading : false,
    isError: isProvider ? isError : false,
    error: error instanceof Error ? error : null,
    refetch,
    isRefetching: isProvider ? isRefetching : false,
  };
}
