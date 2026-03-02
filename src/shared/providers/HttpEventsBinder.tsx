import React, { useEffect } from 'react';
import { httpEvents } from '../services/http/httpEvents';
import { useUIStore } from '../../store/uiStore';

export function HttpEventsBinder() {
  const toast = useUIStore((s) => s.toast);

  useEffect(() => {
    return httpEvents.on('httpError', (e) => {
      // Only surface errors that matter globally. Feature layers should handle expected errors locally.
      if (e.kind === 'Unauthorized') return;
      toast({ type: 'error', message: e.message });
    });
  }, [toast]);

  return null;
}

