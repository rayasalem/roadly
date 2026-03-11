/**
 * Chat conversations list from GET /chat/conversations.
 */
import { useQuery } from '@tanstack/react-query';
import { fetchConversations } from '../data/chatApi';

const QUERY_KEY = ['chat', 'conversations'] as const;
const STALE_TIME_MS = 60 * 1000;

export function useChatConversations() {
  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchConversations,
    staleTime: STALE_TIME_MS,
    retry: 2,
  });

  return {
    conversations: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error instanceof Error ? query.error : null,
    refetch: query.refetch,
  };
}
