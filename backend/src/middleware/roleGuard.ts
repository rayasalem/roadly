/**
 * Role-based access control. Use after authGuard.
 * Restricts route to users whose role is in the allowed list.
 */
import type { Request, Response, NextFunction } from 'express';
import type { UserPayload } from '../store/authStore.js';

type Role = UserPayload['role'];

export function requireRole(...allowed: Role[]) {
  const set = new Set(allowed);
  return (req: Request, res: Response, next: NextFunction): void => {
    const role = req.user?.role;
    if (!role || !set.has(role)) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }
    next();
  };
}

export const requireAdmin = requireRole('admin');
export const requireProvider = requireRole('mechanic', 'mechanic_tow', 'car_rental');
export const requireCustomer = requireRole('user');
