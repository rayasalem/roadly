import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info';

export type ToastPayload = {
  id: string;
  type: ToastType;
  message: string;
  durationMs?: number;
};

type UIState = {
  /** Loader is a counter to support nested async operations */
  loadingCount: number;
  toasts: ToastPayload[];
  showLoader: () => void;
  hideLoader: () => void;
  toast: (toast: Omit<ToastPayload, 'id'>) => void;
  dismissToast: (id: string) => void;
  clearToasts: () => void;
};

function uid(): string {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export const useUIStore = create<UIState>((set, get) => ({
  loadingCount: 0,
  toasts: [],
  showLoader: () => set((s) => ({ loadingCount: s.loadingCount + 1 })),
  hideLoader: () => set((s) => ({ loadingCount: Math.max(0, s.loadingCount - 1) })),
  toast: (toast) => {
    const id = uid();
    set((s) => ({ toasts: [...s.toasts, { id, ...toast }] }));
  },
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  clearToasts: () => set({ toasts: [] }),
}));

export function isGlobalLoading(): boolean {
  return useUIStore.getState().loadingCount > 0;
}

