export type AppEnv = 'development' | 'staging' | 'production';

const rawEnv = (process.env.EXPO_PUBLIC_ENVIRONMENT as AppEnv | undefined) ?? 'development';
const rawApiUrl = process.env.EXPO_PUBLIC_API_URL;

/** In development, fallback to localhost:4000 so the app runs; set .env or Vercel env for production. */
const defaultDevApiUrl = 'http://localhost:4000';
const resolvedApiUrl =
  rawApiUrl && typeof rawApiUrl === 'string' && rawApiUrl.trim() !== ''
    ? rawApiUrl.trim()
    : rawEnv === 'development'
      ? defaultDevApiUrl
      : '';

/** Avoid throwing at build time so Vercel build succeeds; set EXPO_PUBLIC_API_URL in Vercel dashboard. */
const normalizedApiUrl = resolvedApiUrl.replace(/\/+$/, '');

export const APP_ENV: AppEnv = rawEnv;
export const API_BASE_URL: string = normalizedApiUrl;

