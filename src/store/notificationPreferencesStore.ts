/**
 * Notification preferences: enable/disable by category (new requests, status updates, completion & rating).
 */
import { create } from 'zustand';

export type NotificationCategory = 'newRequests' | 'statusUpdates' | 'completionAndRating';

type NotificationPreferencesState = {
  /** Master switch: all notifications on/off */
  enabled: boolean;
  /** New request alerts (provider) / request updates (customer) */
  newRequests: boolean;
  /** Accept/reject, in progress, provider arrived */
  statusUpdates: boolean;
  /** Request completed, rate provider */
  completionAndRating: boolean;
  setEnabled: (v: boolean) => void;
  setNewRequests: (v: boolean) => void;
  setStatusUpdates: (v: boolean) => void;
  setCompletionAndRating: (v: boolean) => void;
};

export const useNotificationPreferencesStore = create<NotificationPreferencesState>((set) => ({
  enabled: true,
  newRequests: true,
  statusUpdates: true,
  completionAndRating: true,
  setEnabled: (enabled) => set({ enabled }),
  setNewRequests: (newRequests) => set({ newRequests }),
  setStatusUpdates: (statusUpdates) => set({ statusUpdates }),
  setCompletionAndRating: (completionAndRating) => set({ completionAndRating }),
}));
