/**
 * Design-system modal: centered card, backdrop, accessible close.
 */
import React from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  type ModalProps,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, spacing, radii } from '../theme';
import { Button } from './Button';

export type AppModalProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  /** Primary action (e.g. confirm) */
  primaryAction?: { label: string; onPress: () => void; loading?: boolean };
  secondaryAction?: { label: string; onPress: () => void };
  /** Modal size */
  size?: 'sm' | 'md' | 'lg';
} & Pick<ModalProps, 'animationType' | 'transparent'>;

export function AppModal({
  visible,
  onClose,
  title,
  children,
  primaryAction,
  secondaryAction,
  size = 'md',
  animationType = 'fade',
  transparent = true,
}: AppModalProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const maxW = size === 'sm' ? 360 : size === 'lg' ? 560 : 440;

  return (
    <Modal visible={visible} transparent={transparent} animationType={animationType} onRequestClose={onClose}>
      <Pressable
        style={[styles.backdrop, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Close"
      >
        <Pressable
          style={[styles.sheet, { backgroundColor: colors.surface, maxWidth: maxW }, shadowsForPlatform(colors)]}
          onPress={(e) => e.stopPropagation()}
        >
          {title ? (
            <Text style={[styles.title, { color: colors.text }]} accessibilityRole="header">
              {title}
            </Text>
          ) : null}
          <View style={styles.body}>{children}</View>
          {(primaryAction || secondaryAction) && (
            <View style={styles.actions}>
              {secondaryAction ? (
                <View style={styles.actionBtn}>
                  <Button title={secondaryAction.label} variant="outline" onPress={secondaryAction.onPress} />
                </View>
              ) : null}
              {primaryAction ? (
                <View style={styles.actionBtn}>
                  <Button
                    title={primaryAction.label}
                    onPress={primaryAction.onPress}
                    loading={primaryAction.loading}
                  />
                </View>
              ) : null}
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function shadowsForPlatform(colors: { text: string }) {
  return Platform.OS === 'web'
    ? ({ boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' } as const)
    : {
        shadowColor: colors.text,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
        elevation: 12,
      };
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  sheet: {
    width: '100%',
    borderRadius: radii.xl,
    padding: spacing.lg,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  body: {
    marginBottom: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  actionBtn: {
    minWidth: 120,
  },
});
