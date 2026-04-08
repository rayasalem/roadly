/**
 * Shared layout for list screens: loading, error with retry, empty state, or list content.
 * Memoized to avoid unnecessary re-renders when parent updates.
 */
import React, { memo } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorWithRetry } from './ErrorWithRetry';
import { AmbientSurface } from './dashboard/AmbientSurface';
import { AppText } from './AppText';
import { ListScreenListSkeleton } from './ListScreenListSkeleton';
import { useTheme, spacing } from '../theme';

export interface ListScreenLayoutProps {
  /** Header (e.g. AppHeader). */
  header: React.ReactNode;
  /** When true, shows centered loading spinner. */
  isLoading: boolean;
  /** When true, shows error UI with onRetry. */
  isError: boolean;
  /** Called when user taps retry (required when isError). */
  onRetry: () => void;
  /** Error message (e.g. t('error.network')). */
  errorMessage: string;
  /** When true and not loading/error, shows emptyState instead of children. */
  isEmpty: boolean;
  /** Content when empty (e.g. icon + text). */
  emptyState: React.ReactNode;
  /** Main content (list or content). Rendered when !isLoading && !isError && !isEmpty. */
  children: React.ReactNode;
  /** Optional bottom bar (e.g. BottomNavBar). */
  bottomNav?: React.ReactNode;
  /** Optional wrapper style. */
  style?: ViewStyle;
  /** Map-style soft background behind list body */
  showAmbientBackground?: boolean;
  /** Hint under loading spinner */
  loadingHint?: string;
  /** Spinner vs list-shaped skeleton (same data flow; presentation only). */
  loadingVariant?: 'spinner' | 'skeleton';
  /** Number of skeleton rows when loadingVariant is skeleton */
  skeletonRows?: number;
}

function ListScreenLayoutInner({
  header,
  isLoading,
  isError,
  onRetry,
  errorMessage,
  isEmpty,
  emptyState,
  children,
  bottomNav,
  style,
  showAmbientBackground = false,
  loadingHint,
  loadingVariant = 'spinner',
  skeletonRows = 6,
}: ListScreenLayoutProps) {
  const { colors } = useTheme();
  return (
    <>
      {header}
      <View style={[styles.body, style, showAmbientBackground && styles.bodyRelative]}>
        {showAmbientBackground ? <AmbientSurface /> : null}
        {isLoading && loadingVariant === 'spinner' && (
          <View style={styles.centered}>
            <LoadingSpinner />
            {loadingHint ? (
              <AppText variant="callout" color={colors.textSecondary} center style={styles.loadingHint}>
                {loadingHint}
              </AppText>
            ) : null}
          </View>
        )}
        {isLoading && loadingVariant === 'skeleton' && (
          <View style={styles.skeletonWrap}>
            <ListScreenListSkeleton rows={skeletonRows} />
            {loadingHint ? (
              <AppText variant="callout" color={colors.textSecondary} center style={styles.loadingHintSkeleton}>
                {loadingHint}
              </AppText>
            ) : null}
          </View>
        )}
        {!isLoading && isError && (
          <ErrorWithRetry message={errorMessage} onRetry={onRetry} />
        )}
        {!isLoading && !isError && isEmpty && emptyState}
        {!isLoading && !isError && !isEmpty && children}
      </View>
      {bottomNav}
    </>
  );
}

export const ListScreenLayout = memo(ListScreenLayoutInner);

const styles = StyleSheet.create({
  body: { flex: 1 },
  bodyRelative: { position: 'relative', overflow: 'hidden' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.lg },
  loadingHint: { marginTop: spacing.md },
  skeletonWrap: { flex: 1 },
  loadingHintSkeleton: { marginTop: spacing.sm, paddingHorizontal: spacing.lg },
});
