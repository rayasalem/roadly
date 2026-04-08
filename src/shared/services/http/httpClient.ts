import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '../../constants/env';
import type { HttpError } from './types';

export type TokenProvider = {
  getAccessToken: () => string | null | Promise<string | null>;
  /**
   * Optional: used for future refresh-token support.
   * Return the new access token, or null if refresh failed.
   */
  refreshAccessToken?: () => Promise<string | null>;
  /**
   * Called when a request is unauthorized and refresh fails / is not configured.
   * Useful for navigation to Auth stack, clearing local session, etc.
   */
  onUnauthorized?: () => void;
};

export type HttpClientOptions = {
  baseURL: string;
  timeoutMs?: number;
  tokenProvider?: TokenProvider;
  onError?: (error: HttpError) => void;
  /** Called when a request starts; use for global loader */
  onRequestStart?: () => void;
  /** Called when a request ends (success or error); must run in finally so loader always resolves */
  onRequestEnd?: () => void;
};

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

let refreshPromise: Promise<string | null> | null = null;
let nearby401Logged = false;

/** API error response body shape (backend may return message or error field) */
export interface ApiErrorBody {
  message?: string;
  error?: string;
}

function buildNetworkHttpMessage(code: string | undefined, axiosMessage: string | undefined): string {
  const unreachable =
    code === 'ERR_NETWORK' ||
    code === 'ECONNREFUSED' ||
    (typeof axiosMessage === 'string' && axiosMessage.toLowerCase().includes('network error'));
  const base = `Could not reach the API at ${API_BASE_URL}.`;
  if (!unreachable) {
    return `${base} Check your connection and try again.`;
  }
  const hint =
    'Often caused by localhost/127.0.0.1 on a physical device (the phone cannot see your PC as "localhost"). The app should auto-use the same LAN IP as Metro; if not, set EXPO_PUBLIC_DEV_API_HOST to your PC IPv4. Android emulator: host machine is 10.0.2.2; iOS Simulator: use 127.0.0.1.';
  const devNote =
    typeof __DEV__ !== 'undefined' && __DEV__
      ? ' Enable EXPO_PUBLIC_DEBUG_HTTP=1 to print how API_BASE_URL was resolved.'
      : '';
  return `${base} ${hint}${devNote}`;
}

/** Converts unknown (e.g. Axios error) to normalized HttpError. Exported for errorMessage helper. */
export function toHttpError(err: unknown): HttpError {
  if (err instanceof AxiosError) {
    const response = err.response;
    const status = response?.status;
    const requestId = (response?.headers?.['x-request-id'] as string | undefined) ?? undefined;

    if (err.code === 'ECONNABORTED') {
      return { kind: 'Timeout', message: 'Request timed out.', status, requestId, details: response?.data };
    }

    if (!response || typeof response !== 'object') {
      const code = err.code;
      const isUnreachable =
        code === 'ERR_NETWORK' ||
        code === 'ECONNREFUSED' ||
        (typeof err.message === 'string' && err.message.toLowerCase().includes('network error'));
      const message = buildNetworkHttpMessage(code, typeof err.message === 'string' ? err.message : undefined);
      if (typeof __DEV__ !== 'undefined' && __DEV__ && isUnreachable) {
        console.warn('[HTTP]', message, { code, axiosCode: err.code });
      }
      return {
        kind: 'Network',
        message,
        requestId,
        details: { axiosCode: code },
      };
    }

    const data = response.data;
    const body = data != null && typeof data === 'object' ? (data as ApiErrorBody) : undefined;
    const serverMessage =
      (typeof body?.message === 'string' ? body.message : undefined) ||
      (typeof body?.error === 'string' ? body.error : undefined) ||
      (typeof err.message === 'string' ? err.message : undefined);

    if (status === 401) return { kind: 'Unauthorized', message: serverMessage ?? 'Unauthorized.', status, requestId, details: data };
    if (status === 403) return { kind: 'Forbidden', message: serverMessage ?? 'Forbidden.', status, requestId, details: data };
    if (status === 404) return { kind: 'NotFound', message: serverMessage ?? 'Not found.', status, requestId, details: data };
    if (status === 422) return { kind: 'Validation', message: serverMessage ?? 'Validation error.', status, requestId, details: data };
    if (status && status >= 500) return { kind: 'Server', message: serverMessage ?? 'Server error.', status, requestId, details: data };

    return { kind: 'Unknown', message: serverMessage ?? 'Unknown error.', status, requestId, details: data };
  }

  if (err instanceof Error) return { kind: 'Unknown', message: err.message };
  return { kind: 'Unknown', message: 'Unknown error.' };
}

/**
 * Request interceptor: attach Authorization: Bearer <accessToken> to every request when token is available.
 * Token is read from tokenProvider (auth store / tokenStore synced on login and hydrate).
 * If token is missing or expired, requests may get 401; then onUnauthorized redirects to Login (except /providers/nearby).
 */
async function withAuthHeader(config: InternalAxiosRequestConfig, tokenProvider?: TokenProvider) {
  if (!tokenProvider) return config;
  const token = await Promise.resolve(tokenProvider.getAccessToken());
  if (!token || typeof token !== 'string' || token.trim() === '') return config;
  config.headers = config.headers ?? {};
  config.headers.Authorization = `Bearer ${token.trim()}`;
  return config;
}

async function tryRefreshToken(tokenProvider?: TokenProvider): Promise<string | null> {
  if (!tokenProvider?.refreshAccessToken) return null;
  if (!refreshPromise) {
    refreshPromise = tokenProvider
      .refreshAccessToken()
      .catch(() => null)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

export function createHttpClient(options: HttpClientOptions): AxiosInstance {
  const client = axios.create({
    baseURL: options.baseURL,
    timeout: options.timeoutMs ?? 15_000,
    headers: { 'Content-Type': 'application/json' },
  });

  client.interceptors.request.use(async (config) => {
    options.onRequestStart?.();
    try {
      return await withAuthHeader(config, options.tokenProvider);
    } catch (e) {
      options.onRequestEnd?.();
      throw e;
    }
  });

  client.interceptors.response.use(
    (res) => {
      options.onRequestEnd?.();
      return res;
    },
    async (error: unknown) => {
      try {
        const httpError = toHttpError(error);
        const maybeAxiosError = error as AxiosError | undefined;
        const originalConfig = maybeAxiosError?.config as RetriableConfig | undefined;

        if (httpError.kind === 'Unauthorized' && originalConfig && !originalConfig._retry) {
          originalConfig._retry = true;
          const newToken = await tryRefreshToken(options.tokenProvider);
          if (newToken) {
            originalConfig.headers = originalConfig.headers ?? {};
            originalConfig.headers.Authorization = `Bearer ${newToken}`;
            return client(originalConfig);
          }
          // No retry on 401 after refresh failed – prevent repeated retries
          const url = (originalConfig?.url as string) ?? '';
          const isProvidersNearby = url.includes('/providers/nearby') || url.includes('providers/nearby');
          if (isProvidersNearby) {
            if (!nearby401Logged && __DEV__) {
              nearby401Logged = true;
              console.warn('[HTTP] 401 on providers/nearby – using fallback providers');
            }
          } else {
            options.tokenProvider?.onUnauthorized?.();
          }
        }

        options.onError?.(httpError);
        return Promise.reject(error);
      } finally {
        options.onRequestEnd?.();
      }
    },
  );

  return client;
}

/**
 * Helper for typed requests.
 * This is intentionally thin to keep the data layer testable and framework-agnostic.
 */
export async function httpGet<T>(client: AxiosInstance, url: string, config?: AxiosRequestConfig): Promise<T> {
  const res = await client.get<T>(url, config);
  return res.data;
}

export async function httpPost<T, B = unknown>(
  client: AxiosInstance,
  url: string,
  body?: B,
  config?: AxiosRequestConfig,
): Promise<T> {
  const res = await client.post<T>(url, body, config);
  return res.data;
}

