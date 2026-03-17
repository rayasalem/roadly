/**
 * Fetch ratings received by the current provider (GET /providers/me/ratings).
 */
import { api } from '../../../shared/services/http/api';
import { ENDPOINTS } from '../../../shared/constants/apiEndpoints';
import { getErrorMessage, isNetworkOrTimeoutError } from '../../../shared/services/http/errorMessage';
import type { RequestRating } from '../domain/types';

export interface ProviderRatingsResponse {
  items: RequestRating[];
  total: number;
  averageRating?: number;
}

const MOCK_RATINGS: RequestRating[] = [
  {
    id: 'rating_1',
    requestId: 'request_4',
    providerId: 'tow_3',
    customerId: 'user_1',
    customerName: 'أحمد محمد',
    rating: 5,
    ratingSpeed: 5,
    ratingQuality: 5,
    ratingProfessionalism: 5,
    comment: 'خدمة ممتازة وسريعة.',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    serviceType: 'tow',
  },
  {
    id: 'rating_2',
    requestId: 'request_old',
    providerId: 'tow_3',
    customerId: 'user_2',
    customerName: 'سارة',
    rating: 4,
    ratingSpeed: 4,
    ratingQuality: 5,
    ratingProfessionalism: 4,
    comment: null,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    serviceType: 'mechanic',
  },
];

export async function fetchProviderRatings(): Promise<ProviderRatingsResponse> {
  try {
    const res = await api.get<ProviderRatingsResponse>(ENDPOINTS.providersMeRatings);
    if (!res?.data) return { items: MOCK_RATINGS, total: MOCK_RATINGS.length, averageRating: 4.5 };
    const data = res.data;
    const items = Array.isArray(data.items) ? data.items : [];
    const avg = data.averageRating ?? (items.length ? items.reduce((s, r) => s + r.rating, 0) / items.length : 0);
    return { items, total: data.total ?? items.length, averageRating: avg };
  } catch (error) {
    if (isNetworkOrTimeoutError(error)) {
      if (__DEV__) console.warn('[ratingsApi] fetchProviderRatings failed, using mock.');
      const avg = MOCK_RATINGS.reduce((s, r) => s + r.rating, 0) / MOCK_RATINGS.length;
      return { items: MOCK_RATINGS, total: MOCK_RATINGS.length, averageRating: avg };
    }
    throw new Error(getErrorMessage(error));
  }
}
