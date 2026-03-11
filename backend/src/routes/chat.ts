import { Router } from 'express';
import { authGuard } from '../middleware/auth.js';
import { validateBodyJoi } from '../middleware/validateRequest.js';
import { chatMessageSchemaJoi } from '../validation/joiSchemas.js';
import { sanitizeUserInput } from '../lib/sanitize.js';

const router = Router();
router.use(authGuard);

/** Stub: list conversations for current user */
router.get('/conversations', (_req, res) => {
  res.json([
    { id: '1', name: 'FastFix Garage', lastMessage: 'Your mechanic is on the way. ETA 12 min.', lastAt: new Date().toISOString(), unread: 1 },
    { id: '2', name: 'RoadTow 24/7', lastMessage: 'Tow truck waiting at your location.', lastAt: new Date(Date.now() - 3600000).toISOString(), unread: 0 },
    { id: '3', name: 'CityDrive Rentals', lastMessage: 'Your rental booking is confirmed for 6 PM.', lastAt: new Date(Date.now() - 86400000).toISOString(), unread: 3 },
  ]);
});

/** Stub: messages for a conversation */
router.get('/conversations/:id/messages', (req, res) => {
  const id = req.params.id;
  res.json({
    conversationId: id,
    messages: [
      { id: 'm1', text: 'Hello, I need assistance.', sender: 'user', createdAt: new Date(Date.now() - 600000).toISOString() },
      { id: 'm2', text: 'Your mechanic is on the way. ETA 12 min.', sender: 'provider', createdAt: new Date().toISOString() },
    ],
  });
});

/** Stub: send message */
router.post('/conversations/:id/messages', validateBodyJoi(chatMessageSchemaJoi), (req, res) => {
  const { text } = req.validated!.body as { text: string };
  const safeText = sanitizeUserInput(text, 2000);
  res.status(201).json({
    id: `m-${Date.now()}`,
    text: safeText,
    sender: 'user',
    createdAt: new Date().toISOString(),
  });
});

export default router;
