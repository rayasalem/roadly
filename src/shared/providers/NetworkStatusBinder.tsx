import { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { useNetworkStore } from '../../store/networkStore';

export function NetworkStatusBinder() {
  const setOnlineState = useNetworkStore((s) => s.setOnlineState);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const isOnline = Boolean(state.isConnected && state.isInternetReachable !== false);
      setOnlineState(isOnline);
    });

    void NetInfo.fetch().then((state) => {
      const isOnline = Boolean(state.isConnected && state.isInternetReachable !== false);
      setOnlineState(isOnline);
    });

    return () => unsubscribe();
  }, [setOnlineState]);

  return null;
}

