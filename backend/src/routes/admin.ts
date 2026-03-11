import { Router } from 'express';
import { authGuard } from '../middleware/auth.js';
import { adminLimiter } from '../middleware/rateLimit.js';
import { validateBodyJoi, validateParamsJoi } from '../middleware/validateRequest.js';
import { adminBlockSchemaJoi, adminVerifySchemaJoi, idParamSchemaJoi } from '../validation/joiSchemas.js';
import { normalizePagination, paginate } from '../lib/pagination.js';
import { getAllUsers, setUserBlocked } from '../store/authStore.js';
import { getAllProviders, setProviderVerified } from '../store/providerStore.js';
import { countRequestsByStatus } from '../store/requestStore.js';

const router = Router();
router.use(authGuard);
router.use(adminLimiter);

function requireAdmin(req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ message: 'Admin only' });
    return;
  }
  next();
}

router.get('/dashboard', requireAdmin, (_req, res) => {
  const users = getAllUsers();
  const providers = getAllProviders();
  const { active, completed, pending } = countRequestsByStatus();
  const activeProviders = providers.filter((p) => p.isAvailable && p.location && (p.location.latitude !== 0 || p.location.longitude !== 0)).length;
  res.json({
    stats: {
      users: users.length,
      providers: providers.length,
      requests: active + completed + pending,
      activeProviders,
      activeRequests: active,
      completedServices: completed,
      pendingRequests: pending,
      revenue: 0,
    },
    mechanics: providers.filter((p) => p.role === 'mechanic'),
    tow: providers.filter((p) => p.role === 'mechanic_tow'),
    rental: providers.filter((p) => p.role === 'car_rental'),
  });
});

/** GET /admin/users – list all users (admin only). Query: page, limit. */
router.get('/users', requireAdmin, (req, res) => {
  const list = getAllUsers();
  const { page, limit } = normalizePagination(req.query as { page?: number; limit?: number });
  res.json(paginate(list, page, limit));
});

/** PATCH /admin/users/:id/block – block or unblock user */
router.patch('/users/:id/block', requireAdmin, validateParamsJoi(idParamSchemaJoi), validateBodyJoi(adminBlockSchemaJoi), (req, res) => {
  const { id } = req.validated!.params as { id: string };
  const { blocked } = req.validated!.body as { blocked: boolean };
  const user = setUserBlocked(id, blocked);
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }
  res.json(user);
});

/** GET /admin/providers – list all providers (admin only). Query: page, limit. */
router.get('/providers', requireAdmin, (req, res) => {
  const list = getAllProviders();
  const { page, limit } = normalizePagination(req.query as { page?: number; limit?: number });
  res.json(paginate(list, page, limit));
});

/** PATCH /admin/providers/:id/verify – approve (true) or reject (false) provider */
router.patch('/providers/:id/verify', requireAdmin, validateParamsJoi(idParamSchemaJoi), validateBodyJoi(adminVerifySchemaJoi), (req, res) => {
  const { id } = req.validated!.params as { id: string };
  const { verified } = req.validated!.body as { verified: boolean };
  const provider = setProviderVerified(id, verified);
  if (!provider) {
    res.status(404).json({ message: 'Provider not found' });
    return;
  }
  res.json(provider);
});

export default router;
