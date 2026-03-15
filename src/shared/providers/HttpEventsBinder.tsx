import React, { useEffect } from 'react';
import { httpEvents } from '../services/http/httpEvents';
import { useUIStore } from '../../store/uiStore';
import { getMessageFromHttpError } from '../services/http/errorMessage';

export function HttpEventsBinder() {
  const toast = useUIStore((s) => s.toast);

  useEffect(() => {
    return httpEvents.on('httpError', (e) => {
      if (e.kind === 'Unauthorized') return;
      // Defer toast so we don't update ToastHost while another component is still rendering
      const schedule = typeof queueMicrotask !== 'undefined' ? queueMicrotask : (fn: () => void) => setTimeout(fn, 0);
      schedule(() => toast({ type: 'error', message: getMessageFromHttpError(e) }));
    });
  }, [toast]);

  return null;
}

