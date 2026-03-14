/**
 * Shared layout for list screens: loading, error with retry, empty state, or list content.
 * Memoized to avoid unnecessary re-renders when parent updates.
 */
import React, { memo } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorWithRetry } from './ErrorWithRetry';

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
}: ListScreenLayoutProps) {
  return (
    <>
      {header}
      <View style={[styles.body, style]}>
        {isLoading && (
          <View style={styles.centered}>
            <LoadingSpinner />
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
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
