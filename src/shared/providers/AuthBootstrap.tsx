import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { tokenStore } from '../services/auth/tokenStore';
import { colors } from '../theme/colors';
import { spacing } from '../theme';

type Props = {
  children: React.ReactNode;
};

export function AuthBootstrap({ children }: Props) {
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const isHydrating = useAuthStore((s) => s.isHydrating);
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    tokenStore.setAccessTokenFallback(() => useAuthStore.getState().accessToken ?? null);
    return () => tokenStore.setAccessTokenFallback(null);
  }, []);

  if (!hasHydrated || isHydrating) {
    return (
      <View style={styles.root}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.authBackground,
    paddingHorizontal: spacing.xl,
  },
});

