import 'dotenv/config';

const required = (key: string): string => {
  const v = process.env[key];
  if (!v || typeof v !== 'string') throw new Error(`Missing required env: ${key}`);
  return v;
};

const optional = (key: string, def: string): string => process.env[key] ?? def;

const isProd = process.env.NODE_ENV === 'production';

export const env = {
  NODE_ENV: optional('NODE_ENV', 'development'),
  PORT: parseInt(optional('PORT', '8082'), 10),
  CLIENT_URL: optional('CLIENT_URL', 'http://localhost:8081'),
  /** In production required. In development defaults to local PostgreSQL so server can start. */
  DATABASE_URL: isProd ? required('DATABASE_URL') : optional('DATABASE_URL', 'postgresql://localhost:5432/mechnow'),
  /** In production required. In development use a default so server can start (dev only). */
  JWT_SECRET: isProd ? required('JWT_SECRET') : optional('JWT_SECRET', 'dev-jwt-access-secret-min-32-characters-long'),
  JWT_REFRESH_SECRET: isProd ? required('JWT_REFRESH_SECRET') : optional('JWT_REFRESH_SECRET', 'dev-jwt-refresh-secret-min-32-characters'),
  BCRYPT_ROUNDS: parseInt(optional('BCRYPT_ROUNDS', '12'), 10),
} as const;

// Prisma reads DATABASE_URL directly from process.env.
// In dev we allow a default via env.ts, but we must also set process.env so Prisma doesn't throw:
// "Environment variable not found: DATABASE_URL."
if (!process.env.DATABASE_URL && env.DATABASE_URL) {
  process.env.DATABASE_URL = env.DATABASE_URL;
}
