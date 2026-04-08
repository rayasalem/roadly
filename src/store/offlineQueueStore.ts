import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CreateRequestInput } from '../features/requests/domain/types';

export type PendingCreateRequest = {
  id: string;
  createdAt: string;
  payload: CreateRequestInput;
  attempts: number;
  lastError: string | null;
};

type OfflineQueueState = {
  createRequestQueue: PendingCreateRequest[];
  enqueueCreateRequest: (payload: CreateRequestInput) => PendingCreateRequest;
  dequeueCreateRequest: (id: string) => void;
  markCreateRequestAttempt: (id: string, error: string | null) => void;
};

const createId = () => `offline_req_${Date.now()}_${Math.random().toString(16).slice(2)}`;

function webStorage() {
  if (typeof window === 'undefined') return null;
  try {
    return {
      getItem: (name: string) => localStorage.getItem(name),
      setItem: (name: string, value: string) => Promise.resolve(localStorage.setItem(name, value)),
      removeItem: (name: string) => Promise.resolve(localStorage.removeItem(name)),
    };
  } catch {
    return null;
  }
}

export const useOfflineQueueStore = create<OfflineQueueState>()(
  persist(
    (set) => ({
      createRequestQueue: [],
      enqueueCreateRequest: (payload) => {
        const item: PendingCreateRequest = {
          id: createId(),
          createdAt: new Date().toISOString(),
          payload,
          attempts: 0,
          lastError: null,
        };
        set((s) => ({ createRequestQueue: [...s.createRequestQueue, item] }));
        return item;
      },
      dequeueCreateRequest: (id) => {
        set((s) => ({ createRequestQueue: s.createRequestQueue.filter((q) => q.id !== id) }));
      },
      markCreateRequestAttempt: (id, error) => {
        set((s) => ({
          createRequestQueue: s.createRequestQueue.map((q) =>
            q.id === id
              ? { ...q, attempts: q.attempts + 1, lastError: error }
              : q
          ),
        }));
      },
    }),
    {
      name: 'offline-create-request-queue',
      storage: createJSONStorage(() => (Platform.OS === 'web' ? (webStorage() ?? AsyncStorage) : AsyncStorage)),
      partialize: (s) => ({ createRequestQueue: s.createRequestQueue }),
    }
  )
);

