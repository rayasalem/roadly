import type { Role } from '../../../shared/constants/roles';
import { api } from '../../../shared/services/http/api';
import { getErrorMessage } from '../../../shared/services/http/errorMessage';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: Role | 'guest';
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
  role?: Role | 'guest';
};

export type AuthResponse = {
  user: AuthUser;
  accessToken: string;
  refreshToken?: string | null;
};

export async function login(request: LoginRequest): Promise<AuthResponse> {
  try {
    const res = await api.post<AuthResponse>('/auth/login', request);
    if (!res || typeof res !== 'object' || res.data == null) throw new Error('Invalid API response');
    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function register(request: RegisterRequest): Promise<AuthResponse> {
  try {
    const res = await api.post<AuthResponse>('/auth/register', request);
    if (!res || typeof res !== 'object' || res.data == null) throw new Error('Invalid API response');
    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/** Call backend to invalidate refresh token. Safe to call without token. */
export async function logout(): Promise<void> {
  try {
    await api.post('/auth/logout', {});
  } catch {
    // Proceed with local clear even if backend fails (e.g. network)
  }
}

