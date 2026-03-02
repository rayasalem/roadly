/**
 * API layer for provider endpoints. No UI — used by repositories/hooks.
 * Backend implements GET /providers/nearby with geo + filters + pagination.
 */
import type { Provider, NearbyProvidersParams, NearbyProvidersResult } from '../domain/types';
import { api } from '../../../shared/services/http/api';
import { ENDPOINTS } from '../../../shared/constants/apiEndpoints';

function buildNearbyQuery(params: NearbyProvidersParams): string {
  const q = new URLSearchParams();
  q.set('lat', String(params.latitude));
  q.set('lng', String(params.longitude));
  if (params.radiusKm != null) q.set('radius', String(params.radiusKm));
  if (params.role) q.set('role', params.role);
  if (params.availableOnly != null) q.set('available', String(params.availableOnly));
  if (params.page != null) q.set('page', String(params.page));
  if (params.limit != null) q.set('limit', String(params.limit));
  return q.toString();
}

export async function fetchNearbyProviders(
  params: NearbyProvidersParams,
): Promise<NearbyProvidersResult> {
  const query = buildNearbyQuery(params);
  const res = await api.get<NearbyProvidersResult>(`${ENDPOINTS.providersNearby}?${query}`);
  return res.data;
}

export async function fetchProviderById(id: string): Promise<Provider> {
  const res = await api.get<Provider>(ENDPOINTS.providerById(id));
  return res.data;
}
