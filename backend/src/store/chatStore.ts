import { prisma } from '../lib/prisma.js';

export interface ChatMessage {
  id: string;
  requestId: string;
  senderId: string;
  text: string;
  createdAt: string;
}

export async function addMessage(
  requestId: string,
  senderId: string,
  text: string
): Promise<ChatMessage> {
  const safeText = String(text).trim().slice(0, 2000);
  const msg = await prisma.chatMessage.create({
    data: { requestId, senderId, text: safeText },
  });
  return {
    id: msg.id,
    requestId: msg.requestId,
    senderId: msg.senderId,
    text: msg.text,
    createdAt: msg.createdAt.toISOString(),
  };
}

export async function getMessagesByRequest(
  requestId: string
): Promise<ChatMessage[]> {
  const list = await prisma.chatMessage.findMany({
    where: { requestId },
    orderBy: { createdAt: 'asc' },
  });
  return list.map((m) => ({
    id: m.id,
    requestId: m.requestId,
    senderId: m.senderId,
    text: m.text,
    createdAt: m.createdAt.toISOString(),
  }));
}

/** Get last message (by createdAt) for each requestId. Returns array of { requestId, text, createdAt }. */
export async function getLastMessagesByRequestIds(
  requestIds: string[]
): Promise<Array<{ requestId: string; text: string; createdAt: string }>> {
  if (requestIds.length === 0) return [];
  const list = await prisma.chatMessage.findMany({
    where: { requestId: { in: requestIds } },
    orderBy: { createdAt: 'desc' },
  });
  const byRequest = new Map<string, { text: string; createdAt: string }>();
  for (const m of list) {
    if (!byRequest.has(m.requestId)) {
      byRequest.set(m.requestId, { text: m.text, createdAt: m.createdAt.toISOString() });
    }
  }
  return requestIds
    .filter((id) => byRequest.has(id))
    .map((requestId) => {
      const v = byRequest.get(requestId)!;
      return { requestId, text: v.text, createdAt: v.createdAt };
    });
}
