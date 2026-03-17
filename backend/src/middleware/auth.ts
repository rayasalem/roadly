import type { Request, Response, NextFunction } from 'express';
import { verifyAccess } from '../services/tokenService.js';
import { findUserById } from '../store/authStore.js';
import type { UserPayload } from '../store/authStore.js';

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

const isDev = process.env.NODE_ENV !== 'production';
const MOCK_PREFIX = 'mock-access-';

/** In development, accept mock tokens from frontend (e.g. mock-access-mechanic) so dashboard/data load. */
function tryMockUser(token: string): UserPayload | null {
  if (!isDev || !token.startsWith(MOCK_PREFIX)) return null;
  const role = token.slice(MOCK_PREFIX.length) as UserPayload['role'];
  const validRoles: UserPayload['role'][] = ['user', 'mechanic', 'mechanic_tow', 'car_rental', 'admin'];
  if (!validRoles.includes(role)) return null;
  return {
    id: `mock-${role}`,
    email: `${role}@mock.roadly.dev`,
    role,
  };
}

export function authGuard(req: Request, res: Response, next: NextFunction): void {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }
  const token = auth.slice(7);

  const mockUser = tryMockUser(token);
  if (mockUser) {
    req.user = mockUser;
    next();
    return;
  }

  (async () => {
    try {
      const decoded = verifyAccess(token);
      if (!decoded || typeof (decoded as { id?: unknown }).id !== 'string') {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      const user = await findUserById(decoded.id);
      if (user && 'blocked' in user && user.blocked === true) {
        res.status(403).json({ message: 'Account is blocked' });
        return;
      }
      req.user = decoded as UserPayload;
      next();
    } catch {
      res.status(401).json({ message: 'Unauthorized' });
    }
  })().catch(next);
}

/** Optional auth: if Bearer token is valid (or mock in dev), set req.user; otherwise continue without user (no 401). */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    next();
    return;
  }
  const token = auth.slice(7);

  const mockUser = tryMockUser(token);
  if (mockUser) {
    req.user = mockUser;
    next();
    return;
  }

  (async () => {
    try {
      const decoded = verifyAccess(token);
      if (!decoded || typeof (decoded as { id?: unknown }).id !== 'string') {
        next();
        return;
      }
      const user = await findUserById(decoded.id);
      if (user && 'blocked' in user && user.blocked === true) {
        next();
        return;
      }
      req.user = decoded as UserPayload;
    } catch {
      // ignore invalid/expired token
    }
    next();
  })().catch(next);
}
