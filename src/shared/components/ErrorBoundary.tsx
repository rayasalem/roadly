import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { spacing, typography, radii } from '../theme';
import { t } from '../i18n/t';

type Props = {
  children: React.ReactNode;
  onReset?: () => void;
};

type State = {
  hasError: boolean;
  message?: string;
};

/**
 * React Native still requires class components for Error Boundaries.
 * This is a framework constraint (not a preference).
 */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: unknown): State {
    return { hasError: true, message: error instanceof Error ? error.message : undefined };
  }

  componentDidCatch(_error: unknown) {
    // Hook your crash reporting here later (Sentry, Bugsnag, etc.)
  }

  private reset = () => {
    this.setState({ hasError: false, message: undefined });
    this.props.onReset?.();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <View style={styles.container}>
        <Text style={styles.title}>{t('errors.unknown')}</Text>
        {this.state.message ? <Text style={styles.message}>{this.state.message}</Text> : null}
        <TouchableOpacity style={styles.button} onPress={this.reset}>
          <Text style={styles.buttonText}>{t('common.retry')}</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  title: {
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
    fontSize: typography.fontSize.body,
    textAlign: 'center',
  },
  message: {
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    fontSize: typography.fontSize.callout,
    textAlign: 'center',
  },
  button: {
    marginTop: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.md,
  },
  buttonText: {
    fontFamily: typography.fontFamily.semibold,
    color: colors.primaryContrast,
    fontSize: typography.fontSize.md,
  },
});

