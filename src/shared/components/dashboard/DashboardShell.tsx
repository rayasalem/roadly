/**
 * Role dashboard frame: Map-level ambient background + unified loading / error / content.
 */
import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, spacing } from '../../theme';
import { LoadingSpinner } from '../LoadingSpinner';
import { ErrorWithRetry } from '../ErrorWithRetry';
import { AppText } from '../AppText';
import { AmbientSurface } from './AmbientSurface';

export type DashboardShellProps = {
  children: React.ReactNode;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  /** Shown under spinner while loading */
  loadingHint?: string;
  ambientTint?: string;
  /** Bottom chrome (e.g. BottomNavBar) — shown in all states */
  bottomSlot?: React.ReactNode;
};

function DashboardShellInner({
  children,
  isLoading = false,
  isError = false,
  errorMessage = '',
  onRetry,
  loadingHint,
  ambientTint,
  bottomSlot,
}: DashboardShellProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <AmbientSurface tint={ambientTint} />
      {isLoading ? (
        <SafeAreaView style={styles.flex} edges={['top', 'left', 'right']}>
          <View style={styles.centered}>
            <LoadingSpinner />
            {loadingHint ? (
              <AppText variant="callout" color={colors.textSecondary} center style={styles.loadingHint}>
                {loadingHint}
              </AppText>
            ) : null}
          </View>
        </SafeAreaView>
      ) : isError ? (
        <SafeAreaView style={styles.flex} edges={['top', 'left', 'right']}>
          <View style={styles.errorWrap}>
            <ErrorWithRetry message={errorMessage} onRetry={onRetry ?? (() => {})} />
          </View>
        </SafeAreaView>
      ) : (
        children
      )}
      {bottomSlot}
    </View>
  );
}

export const DashboardShell = memo(DashboardShellInner);

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  loadingHint: { marginTop: spacing.md },
  errorWrap: { flex: 1, justifyContent: 'center', paddingHorizontal: spacing.md },
});
