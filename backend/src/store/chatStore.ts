/**
 * In-app chat between customer and provider, scoped by request.
 */
export interface ChatMessage {
  id: string;
  requestId: string;
  senderId: string;
  text: string;
  createdAt: string;
}

const messages = new Map<string, ChatMessage>();
let idCounter = 1;
const nextId = () => `msg_${idCounter++}`;

export function addMessage(requestId: string, senderId: string, text: string): ChatMessage {
  const id = nextId();
  const msg: ChatMessage = {
    id,
    requestId,
    senderId,
    text: String(text).trim().slice(0, 2000),
    createdAt: new Date().toISOString(),
  };
  messages.set(id, msg);
  return msg;
}

export function getMessagesByRequest(requestId: string): ChatMessage[] {
  return Array.from(messages.values())
    .filter((m) => m.requestId === requestId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}
