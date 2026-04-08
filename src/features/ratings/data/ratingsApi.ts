/**
 * Fetch ratings received by the current provider (GET /providers/me/ratings).
 */
import { api } from '../../../shared/services/http/api';
import { ENDPOINTS } from '../../../shared/constants/apiEndpoints';
import { getErrorMessage } from '../../../shared/services/http/errorMessage';
import type { RequestRating } from '../domain/types';

export interface ProviderRatingsResponse {
  items: RequestRating[];
  total: number;
  averageRating?: number;
}

const emptyResponse: ProviderRatingsResponse = { items: [], total: 0, averageRating: 0 };

export async function fetchProviderRatings(): Promise<ProviderRatingsResponse> {
  try {
    const res = await api.get<ProviderRatingsResponse>(ENDPOINTS.providersMeRatings);
    if (!res?.data) return emptyResponse;
    const data = res.data;
    const items = Array.isArray(data.items) ? data.items : [];
    const avg =
      data.averageRating ??
      (items.length ? items.reduce((s, r) => s + r.rating, 0) / items.length : 0);
    return { items, total: data.total ?? items.length, averageRating: avg };
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
