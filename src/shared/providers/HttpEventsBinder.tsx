import React, { useEffect } from 'react';
import { httpEvents } from '../services/http/httpEvents';
import { useUIStore } from '../../store/uiStore';
import { getMessageFromHttpError } from '../services/http/errorMessage';

export function HttpEventsBinder() {
  const toast = useUIStore((s) => s.toast);

  useEffect(() => {
    return httpEvents.on('httpError', (e) => {
      if (e.kind === 'Unauthorized') return;
      toast({ type: 'error', message: getMessageFromHttpError(e) });
    });
  }, [toast]);

  return null;
}

