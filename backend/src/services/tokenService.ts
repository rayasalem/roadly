import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import type { UserPayload } from '../store/authStore.js';

const ACCESS_EXP = '15m';
const REFRESH_EXP = '30d';

export function signAccess(payload: UserPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: ACCESS_EXP });
}

export function signRefresh(payload: UserPayload): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: REFRESH_EXP });
}

export function verifyAccess(token: string): UserPayload {
  return jwt.verify(token, env.JWT_SECRET) as UserPayload;
}

export function verifyRefresh(token: string): UserPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as UserPayload;
}
