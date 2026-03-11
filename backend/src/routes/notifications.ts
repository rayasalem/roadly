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

const router = Router();

/** GET /notifications – list notifications for current user. Query: page, limit. */
router.get('/', authGuard, (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }
  const list = listNotifications(userId);
  const { page, limit } = normalizePagination(req.query as { page?: number; limit?: number });
  const result = paginate(list, page, limit);
  res.json(result);
});

router.patch('/:id/read', authGuard, (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }
  const n = markNotificationRead(req.params.id);
  if (!n || n.userId !== userId) {
    res.status(404).json({ message: 'Notification not found' });
    return;
  }
  res.json(n);
});

router.post('/register', authGuard, validateBodyJoi(notificationRegisterSchemaJoi), (req, res) => {
  const user = req.user;
  if (!user || typeof user.id !== 'string') {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }
  const { token } = req.validated!.body as { token: string };
  registerDevice(user.id, token);
  res.status(204).send();
});

router.post('/unregister', optionalAuth, (req, res) => {
  const user = req.user;
  if (user && typeof user.id === 'string') {
    unregisterDevice(user.id);
  }
  res.status(204).send();
});

export default router;
