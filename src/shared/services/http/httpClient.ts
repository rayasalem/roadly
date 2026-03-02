import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
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
};

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

let refreshPromise: Promise<string | null> | null = null;

function toHttpError(err: unknown): HttpError {
  if (err instanceof AxiosError) {
    const status = err.response?.status;
    const requestId = (err.response?.headers?.['x-request-id'] as string | undefined) ?? undefined;

    if (err.code === 'ECONNABORTED') {
      return { kind: 'Timeout', message: 'Request timed out.', status, requestId, details: err.response?.data };
    }

    if (!err.response) {
      return { kind: 'Network', message: 'Network error. Check your connection.', requestId };
    }

    const serverMessage =
      (err.response.data as any)?.message ||
      (err.response.data as any)?.error ||
      (typeof err.message === 'string' ? err.message : undefined);

    if (status === 401) return { kind: 'Unauthorized', message: serverMessage ?? 'Unauthorized.', status, requestId, details: err.response.data };
    if (status === 403) return { kind: 'Forbidden', message: serverMessage ?? 'Forbidden.', status, requestId, details: err.response.data };
    if (status === 404) return { kind: 'NotFound', message: serverMessage ?? 'Not found.', status, requestId, details: err.response.data };
    if (status === 422) return { kind: 'Validation', message: serverMessage ?? 'Validation error.', status, requestId, details: err.response.data };
    if (status && status >= 500) return { kind: 'Server', message: serverMessage ?? 'Server error.', status, requestId, details: err.response.data };

    return { kind: 'Unknown', message: serverMessage ?? 'Unknown error.', status, requestId, details: err.response.data };
  }

  if (err instanceof Error) return { kind: 'Unknown', message: err.message };
  return { kind: 'Unknown', message: 'Unknown error.' };
}

async function withAuthHeader(config: InternalAxiosRequestConfig, tokenProvider?: TokenProvider) {
  if (!tokenProvider) return config;
  const token = await tokenProvider.getAccessToken();
  if (!token) return config;
  config.headers = config.headers ?? {};
  config.headers.Authorization = `Bearer ${token}`;
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

  client.interceptors.request.use((config) => withAuthHeader(config, options.tokenProvider));

  client.interceptors.response.use(
    (res) => res,
    async (error: unknown) => {
      const httpError = toHttpError(error);

      const maybeAxiosError = error as AxiosError | undefined;
      const originalConfig = maybeAxiosError?.config as RetriableConfig | undefined;

      if (httpError.kind === 'Unauthorized' && originalConfig && !originalConfig._retry) {
        originalConfig._retry = true;
        const newToken = await tryRefreshToken(options.tokenProvider);
        if (newToken) {
          originalConfig.headers = originalConfig.headers ?? {};
          (originalConfig.headers as any).Authorization = `Bearer ${newToken}`;
          return client(originalConfig);
        }
        options.tokenProvider?.onUnauthorized?.();
      }

      options.onError?.(httpError);
      return Promise.reject(error);
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

