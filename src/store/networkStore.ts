import { create } from 'zustand';

type NetworkState = {
  isOnline: boolean;
  lastChangedAt: number;
  setOnlineState: (isOnline: boolean) => void;
};

export const useNetworkStore = create<NetworkState>((set, get) => ({
  isOnline: true,
  lastChangedAt: Date.now(),
  setOnlineState: (isOnline) => {
    if (get().isOnline === isOnline) return;
    set({ isOnline, lastChangedAt: Date.now() });
  },
}));

