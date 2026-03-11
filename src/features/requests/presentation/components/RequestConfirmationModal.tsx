import React from 'react';
import { View, Modal, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '../../../../shared/components/AppText';
import { Button } from '../../../../shared/components/Button';
import { useTheme, spacing, radii, shadows } from '../../../../shared/theme';
import { t } from '../../../../shared/i18n/t';

interface RequestConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
}

export function RequestConfirmationModal({ visible, onClose }: RequestConfirmationModalProps) {
  const { colors } = useTheme();
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.content, { backgroundColor: colors.surface }, shadows.lg]}>
          <MaterialCommunityIcons name="check-circle" size={56} color={colors.success} />
          <AppText variant="title3" style={[styles.title, { color: colors.text }]}>
            {t('request.confirmationTitle')}
          </AppText>
          <AppText variant="body" style={{ color: colors.textSecondary }} center>
            {t('request.createdSuccess')}
          </AppText>
          <Button title={t('common.ok')} onPress={onClose} fullWidth style={styles.button} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  content: {
    borderRadius: radii.xl,
    padding: spacing.xl,
    alignItems: 'center',
    minWidth: 280,
  },
  title: { marginTop: spacing.md, marginBottom: spacing.xs },
  button: { marginTop: spacing.lg },
});
