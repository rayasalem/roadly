import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useUIStore } from '../../store/uiStore';
import { colors } from '../theme/colors';
import { ToastHost } from './ToastHost';

export const GlobalOverlayHost = React.memo(function GlobalOverlayHost() {
  const loadingCount = useUIStore((s) => s.loadingCount);
  const isLoading = loadingCount > 0;

  return (
    <>
      {isLoading ? (
        <View style={styles.loaderBackdrop} pointerEvents="auto">
          <View style={styles.loaderCard}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        </View>
      ) : null}
      <ToastHost />
    </>
  );
});

const styles = StyleSheet.create({
  loaderBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loaderCard: {
    width: 84,
    height: 84,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

