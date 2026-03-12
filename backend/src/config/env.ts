import 'dotenv/config';

const required = (key: string): string => {
  const v = process.env[key];
  if (!v || typeof v !== 'string') throw new Error(`Missing required env: ${key}`);
  return v;
};

const optional = (key: string, def: string): string => process.env[key] ?? def;

export const env = {
  NODE_ENV: optional('NODE_ENV', 'development'),
  PORT: parseInt(optional('PORT', '8082'), 10),
  /** In production set CLIENT_URL. In development defaults to allow common localhost ports. */
  CLIENT_URL: optional('CLIENT_URL', 'http://localhost:8081'),
  JWT_SECRET: required('JWT_SECRET'),
  JWT_REFRESH_SECRET: required('JWT_REFRESH_SECRET'),
  BCRYPT_ROUNDS: parseInt(optional('BCRYPT_ROUNDS', '12'), 10),
} as const;
