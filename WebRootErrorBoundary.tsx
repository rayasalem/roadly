import React, { type ErrorInfo, type ReactNode } from 'react';
import { Platform, View, Text, StyleSheet } from 'react-native';

type Props = { children: ReactNode };

type State = { hasError: boolean; error: unknown };

/**
 * Outermost error boundary (runs before AppProviders).
 * On web uses a plain div so a render failure still shows something if RN tree fails early.
 */
export class WebRootErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: unknown): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: unknown, info: ErrorInfo): void {
    // eslint-disable-next-line no-console
    console.error('[WebRootErrorBoundary]', error, info.componentStack);
  }

  render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const message =
      this.state.error instanceof Error
        ? `${this.state.error.message}\n\n${this.state.error.stack ?? ''}`
        : String(this.state.error ?? 'Unknown error');

    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      return (
        <div
          style={{
            padding: 24,
            fontFamily: 'system-ui, Segoe UI, sans-serif',
            color: '#b91c1c',
            backgroundColor: '#fef2f2',
            minHeight: '100vh',
            boxSizing: 'border-box',
          }}
        >
          <h1 style={{ marginTop: 0, fontSize: 20 }}>Application error</h1>
          <p style={{ color: '#444', marginBottom: 12 }}>
            The app failed to start. Details below (useful for debugging production).
          </p>
          <pre
            style={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              fontSize: 12,
              background: '#fff',
              padding: 12,
              border: '1px solid #fecaca',
              borderRadius: 8,
            }}
          >
            {message}
          </pre>
        </div>
      );
    }

    return (
      <View style={styles.fallback}>
        <Text style={styles.title}>Application error</Text>
        <Text style={styles.body}>{message}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  fallback: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#fef2f2',
  },
  title: { fontSize: 18, fontWeight: '700', color: '#b91c1c', marginBottom: 8 },
  body: { fontSize: 14, color: '#444' },
});
