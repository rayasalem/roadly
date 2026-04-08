import { useEffect, useRef } from 'react';
import { createRequest } from '../../features/requests/data/requestApi';
import { useUIStore } from '../../store/uiStore';
import { useNetworkStore } from '../../store/networkStore';
import { useOfflineQueueStore } from '../../store/offlineQueueStore';

export function OfflineQueueProcessor() {
  const isOnline = useNetworkStore((s) => s.isOnline);
  const queue = useOfflineQueueStore((s) => s.createRequestQueue);
  const dequeue = useOfflineQueueStore((s) => s.dequeueCreateRequest);
  const markAttempt = useOfflineQueueStore((s) => s.markCreateRequestAttempt);
  const toast = useUIStore((s) => s.toast);
  const isProcessingRef = useRef(false);
  const hadQueueBeforeRef = useRef(false);

  useEffect(() => {
    if (!isOnline || queue.length === 0 || isProcessingRef.current) return;
    isProcessingRef.current = true;

    (async () => {
      let sentCount = 0;
      for (const item of queue) {
        try {
          await createRequest(item.payload);
          dequeue(item.id);
          sentCount += 1;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Network error';
          markAttempt(item.id, message);
          break;
        }
      }
      if (sentCount > 0) {
        toast({
          type: 'success',
          message: `تم إرسال ${sentCount} طلب${sentCount > 1 ? 'ات' : ''} من الانتظار`,
          durationMs: 3000,
        });
      }
      isProcessingRef.current = false;
    })();
  }, [isOnline, queue, dequeue, markAttempt, toast]);

  useEffect(() => {
    if (queue.length > 0) hadQueueBeforeRef.current = true;
    if (hadQueueBeforeRef.current && queue.length === 0) hadQueueBeforeRef.current = false;
  }, [queue.length]);

  return null;
}

