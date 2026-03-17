import { Router } from 'express';
import { authGuard } from '../middleware/auth.js';
import { validateBodyJoi } from '../middleware/validateRequest.js';
import { chatMessageSchemaJoi } from '../validation/joiSchemas.js';
import { sanitizeUserInput } from '../lib/sanitize.js';
import { getMessagesByRequest, addMessage, getLastMessagesByRequestIds } from '../store/chatStore.js';
import { getRequestById, listRequestsForChat } from '../store/requestStore.js';
import { findUserById } from '../store/authStore.js';
import { getProvider } from '../store/providerStore.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();
router.use(authGuard);

/** List conversations for current user (request-based: conversationId = requestId). */
router.get('/conversations', asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  let requests: Awaited<ReturnType<typeof listRequestsForChat>>;
  try {
    requests = await listRequestsForChat(userId);
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[chat] listRequestsForChat failed:', e instanceof Error ? e.message : e);
    }
    res.json([]);
    return;
  }
  const requestIds = requests.map((r) => r.id);
  const lastMessages = await getLastMessagesByRequestIds(requestIds);
  const lastByRequestId = new Map(lastMessages.map((m) => [m.requestId, m]));

  const conversations: Array<{ id: string; name: string; lastMessage: string; lastAt: string; unread: number }> = [];

  for (const r of requests) {
    const otherId = r.customerId === userId ? r.providerId : r.customerId;
    let name = 'Unknown';
    if (otherId) {
      try {
        if (r.customerId === userId) {
          const provider = await getProvider(otherId);
          const user = await findUserById(otherId);
          name = provider?.name ?? user?.name ?? user?.email ?? 'Provider';
        } else {
          const user = await findUserById(otherId);
          name = user?.name ?? user?.email ?? 'Customer';
        }
      } catch {
        name = 'Unknown';
      }
    }
    const last = lastByRequestId.get(r.id);
    conversations.push({
      id: r.id,
      name,
      lastMessage: last?.text ?? '',
      lastAt: last?.createdAt ?? r.updatedAt,
      unread: 0,
    });
  }

  res.json(conversations);
}));

/** Messages for a conversation (id = requestId). Returns DB messages when user is participant. */
router.get('/conversations/:id/messages', asyncHandler(async (req, res) => {
  const id = req.params.id;
  const request = await getRequestById(id);
  const userId = req.user!.id;
  if (!request || (request.customerId !== userId && request.providerId !== userId)) {
    res.status(403).json({ message: 'Forbidden' });
    return;
  }
  const messages = await getMessagesByRequest(id);
  res.json({
    conversationId: id,
    messages: messages.map((m) => ({
      id: m.id,
      text: m.text,
      sender: m.senderId === userId ? 'user' : 'provider',
      createdAt: m.createdAt,
    })),
  });
}));

/** Send message in a conversation (requestId). Persists to DB. */
router.post('/conversations/:id/messages', validateBodyJoi(chatMessageSchemaJoi), asyncHandler(async (req, res) => {
  const requestId = req.params.id;
  const { text } = req.validated!.body as { text: string };
  const safeText = sanitizeUserInput(text, 2000);
  const userId = req.user!.id;
  const request = await getRequestById(requestId);
  if (!request || (request.customerId !== userId && request.providerId !== userId)) {
    res.status(403).json({ message: 'Forbidden' });
    return;
  }
  const msg = await addMessage(requestId, userId, safeText);
  res.status(201).json({
    id: msg.id,
    text: msg.text,
    sender: msg.senderId === userId ? 'user' : 'provider',
    createdAt: msg.createdAt,
  });
}));

export default router;
