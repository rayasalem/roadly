/**
 * Central hook for service request flow: nearby providers, suggested list, create mutation.
 * Keeps RequestScreen focused on layout; business logic and API here.
 */
import { useMemo } from 'react';
import type { Provider } from '../../providers/domain/types';
import type { ServiceType } from '../domain/types';
import type { Role } from '../../../shared/constants/roles';
import { useCreateRequest } from './useCreateRequest';
import { useSortedNearbyProviders } from '../../map/hooks/useSortedNearbyProviders';

const FALLBACK_ORIGIN = { latitude: 25.2048, longitude: 55.2708 };

function serviceTypeToRole(st: ServiceType): Role | null {
  if (st === 'mechanic' || st === 'battery' || st === 'tire' || st === 'oil_change') return 'mechanic';
  if (st === 'tow') return 'mechanic_tow';
  if (st === 'rental') return 'car_rental';
  return null;
}

export interface UseRequestServiceOptions {
  serviceType: ServiceType;
  serviceDescription: string;
  providerIdFromParams: string | null;
  coords: { latitude: number; longitude: number } | null;
  enabled: boolean;
}

export function useRequestService(options: UseRequestServiceOptions) {
  const { serviceType, serviceDescription, providerIdFromParams, coords, enabled } = options;
  const role = useMemo(() => serviceTypeToRole(serviceType), [serviceType]);
  const createMutation = useCreateRequest();
  const {
    sortedProviders,
    nearest,
    isProvidersError,
    getDistanceKm,
  } = useSortedNearbyProviders({ role, enabled });

  const origin = coords ?? FALLBACK_ORIGIN;

  const suggestedProviders = useMemo(() => {
    const q = serviceDescription.trim().toLowerCase();
    if (!q) return sortedProviders;
    return sortedProviders.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (Array.isArray(p.services) && p.services.some((s: string) => String(s).toLowerCase().includes(q)))
    );
  }, [sortedProviders, serviceDescription]);

  const nearestSuggested = suggestedProviders[0] ?? nearest;
  const providerId = providerIdFromParams ?? nearestSuggested?.id ?? undefined;
  const distanceKm = nearestSuggested ? getDistanceKm(nearestSuggested) : null;

  const handleCreate = (onSuccess: (requestId: string) => void, onError?: (error: Error) => void) => {
    createMutation.mutate(
      { serviceType, origin, providerId, description: serviceDescription?.trim() || undefined },
      {
        onSuccess: (req) => {
          onSuccess(req.id);
        },
        onError: (err) => {
          onError?.(err as Error);
        },
      }
    );
  };

  return {
    suggestedProviders,
    nearestSuggested,
    distanceKm,
    providerId,
    origin,
    createMutation,
    isProvidersError,
    handleCreate,
  };
}
