/**
 * Chat API: conversations list and messages. Backend: GET /chat/conversations, GET /chat/conversations/:id/messages, POST /chat/conversations/:id/messages
 */
import { api } from '../../../shared/services/http/api';
import { getErrorMessage } from '../../../shared/services/http/errorMessage';

export interface ChatConversation {
  id: string;
  name: string;
  lastMessage: string;
  lastAt: string;
  unread: number;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'provider';
  createdAt: string;
}

export interface ChatMessagesResponse {
  conversationId: string;
  messages: ChatMessage[];
}

export async function fetchConversations(): Promise<ChatConversation[]> {
  try {
    const { data } = await api.get<ChatConversation[]>('/chat/conversations');
    return Array.isArray(data) ? data : [];
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function fetchMessages(conversationId: string): Promise<ChatMessage[]> {
  try {
    const { data } = await api.get<ChatMessagesResponse>(`/chat/conversations/${conversationId}/messages`);
    return data?.messages ?? [];
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function sendMessage(conversationId: string, text: string): Promise<ChatMessage> {
  try {
    const { data } = await api.post<ChatMessage>(`/chat/conversations/${conversationId}/messages`, { text });
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
