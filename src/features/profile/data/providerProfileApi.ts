/**
 * Provider profile API.
 * Backend: GET /providers/me (authenticated provider).
 * Returns: id, name, role, services, rating, reviews, phone, email (+ optional avatarUri, status).
 */
import type { Role } from '../../../shared/constants/roles';
import { api } from '../../../shared/services/http/api';
import { ENDPOINTS } from '../../../shared/constants/apiEndpoints';
import { getErrorMessage } from '../../../shared/services/http/errorMessage';

export interface ProviderReview {
  id: string;
  author?: string;
  text?: string;
  rating: number;
  createdAt?: string;
}

export interface MyProviderProfileResponse {
  id: string;
  name: string;
  role: Role;
  services: string[];
  rating: number;
  reviews: ProviderReview[];
  phone: string;
  email: string;
  avatarUri?: string | null;
  status?: 'available' | 'busy' | 'on_the_way';
  isAvailable?: boolean;
}

export async function fetchMyProviderProfile(): Promise<MyProviderProfileResponse> {
  try {
    const res = await api.get<MyProviderProfileResponse>(ENDPOINTS.providersMe);
    if (!res || typeof res !== 'object' || res.data == null) throw new Error('Invalid API response');
    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function updateProviderServices(services: string[]): Promise<MyProviderProfileResponse> {
  try {
    const res = await api.patch<MyProviderProfileResponse>('/providers/me', { services });
    if (!res || typeof res !== 'object' || res.data == null) throw new Error('Invalid API response');
    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function updateProviderAvailability(isAvailable: boolean): Promise<MyProviderProfileResponse> {
  try {
    const res = await api.patch<MyProviderProfileResponse>('/providers/me/availability', { isAvailable });
    if (!res || typeof res !== 'object' || res.data == null) throw new Error('Invalid API response');
    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/** Update provider's current location (PATCH /providers/me/location). Call when accepting request or starting job. */
export async function updateProviderLocation(latitude: number, longitude: number): Promise<void> {
  try {
    await api.patch(ENDPOINTS.myLocation, { latitude, longitude });
  } catch (error) {
    if (__DEV__) {
      console.warn('[providerProfileApi] updateProviderLocation failed:', getErrorMessage(error));
    }
  }
}
