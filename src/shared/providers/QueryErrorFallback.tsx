/**
 * Global fallback for failed queries: shows a toast when any query errors.
 * Ensures loading and errors are visible; works alongside HttpEventsBinder (API errors) and screen-level ErrorWithRetry.
 */
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useUIStore } from '../../store/uiStore';
import { getErrorMessage } from '../services/http/errorMessage';

export function QueryErrorFallback() {
  const queryClient = useQueryClient();
  const toast = useUIStore((s) => s.toast);

  useEffect(() => {
    const cache = queryClient.getQueryCache();
    const unsub = cache.subscribe((event: { type?: string; query?: { state: { status?: string; error?: unknown } } }) => {
      const query = event?.query;
      if (query?.state?.status === 'error' && query.state.error != null) {
        const message = getErrorMessage(query.state.error);
        toast({ type: 'error', message });
      }
    });
    return unsub;
  }, [queryClient, toast]);

  return null;
}
