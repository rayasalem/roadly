import { Router } from 'express';
import { authGuard, optionalAuth } from '../middleware/auth.js';
import { validateBodyJoi } from '../middleware/validateRequest.js';
import { notificationRegisterSchemaJoi } from '../validation/joiSchemas.js';
import { normalizePagination, paginate } from '../lib/pagination.js';
import {
  registerDevice,
  unregisterDevice,
  listNotifications,
  markNotificationRead,
} from '../store/notificationStore.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

router.get('/', authGuard, asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }
  let list: Awaited<ReturnType<typeof listNotifications>>;
  try {
    list = await listNotifications(userId);
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[notifications] listNotifications failed:', e instanceof Error ? e.message : e);
    }
    list = [];
  }
  const { page, limit } = normalizePagination(req.query as { page?: number; limit?: number });
  const result = paginate(list, page, limit);
  res.json(result);
}));

router.patch('/:id/read', authGuard, asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }
  let n: Awaited<ReturnType<typeof markNotificationRead>>;
  try {
    n = await markNotificationRead(req.params.id);
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[notifications] markNotificationRead failed:', e instanceof Error ? e.message : e);
    }
    res.status(404).json({ message: 'Notification not found' });
    return;
  }
  if (!n || n.userId !== userId) {
    res.status(404).json({ message: 'Notification not found' });
    return;
  }
  res.json(n);
}));

router.post('/register', authGuard, validateBodyJoi(notificationRegisterSchemaJoi), asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user || typeof user.id !== 'string') {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }
  const { token } = req.validated!.body as { token: string };
  await registerDevice(user.id, token);
  res.status(204).send();
}));

router.post('/unregister', optionalAuth, asyncHandler(async (req, res) => {
  const user = req.user;
  if (user && typeof user.id === 'string') {
    try {
      await unregisterDevice(user.id);
    } catch (e) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[notifications] unregister failed:', e instanceof Error ? e.message : e);
      }
    }
  }
  res.status(204).send();
}));

export default router;
