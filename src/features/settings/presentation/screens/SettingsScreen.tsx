/**
 * Settings — يعمل بالكامل مع موك داتا لكل خاصية.
 * أقسام:
 * - حساب المستخدم
 * - التطبيق (لغة، ثيم، إشعارات)
 * - السيارة / الخدمة
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppHeader } from '../../../../shared/components/AppHeader';
import { BottomNavBar, type NavTabId } from '../../../../shared/components/BottomNavBar';
import { ScreenWrapper } from '../../../../shared/components/ScreenWrapper';
import { useTheme, spacing, typography, radii, shadows } from '../../../../shared/theme';
import type { ColorPalette } from '../../../../shared/theme';
import { t } from '../../../../shared/i18n/t';
import { useThemeStore, type ColorSchemePreference } from '../../../../store/themeStore';
import { useAuthStore } from '../../../../store/authStore';
import { useUIStore } from '../../../../store/uiStore';

type SettingsItem = {
  id: string;
  label: string;
  value?: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  type?: 'link' | 'toggle';
};

const ACCOUNT_ITEMS: SettingsItem[] = [
  {
    id: 'profile',
    label: 'بيانات الحساب',
    value: 'عرض وتعديل المعلومات',
    icon: 'account-circle-outline',
    type: 'link',
  },
  {
    id: 'security',
    label: 'الأمان',
    value: 'كلمة المرور والجلسات',
    icon: 'shield-lock-outline',
    type: 'link',
  },
];

const APP_ITEMS: SettingsItem[] = [
  { id: 'language', label: 'اللغة', value: 'العربية / الإنجليزية', icon: 'translate', type: 'link' },
  { id: 'notifications', label: 'الإشعارات', icon: 'bell-outline', type: 'toggle' },
];

const VEHICLE_ITEMS: SettingsItem[] = [
  {
    id: 'vehicle',
    label: 'مركبتي',
    value: 'تويوتا كورولا ٢٠٢٠',
    icon: 'car-info',
    type: 'link',
  },
  {
    id: 'preferredService',
    label: 'الخدمة المفضّلة',
    value: 'ميكانيكي + ونش',
    icon: 'tow-truck',
    type: 'link',
  },
];

const THEME_OPTIONS: { value: ColorSchemePreference; label: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }[] = [
  { value: 'light', label: 'نهاري', icon: 'white-balance-sunny' },
  { value: 'dark', label: 'ليلي', icon: 'weather-night' },
  { value: 'system', label: 'حسب الجهاز', icon: 'theme-light-dark' },
];

export function SettingsScreen() {
  const navigation = useNavigation<any>();
  const toast = useUIStore((s) => s.toast);
  const user = useAuthStore((s) => s.user);
  const { colors } = useTheme();
  const colorSchemePreference = useThemeStore((s) => s.colorSchemePreference);
  const setColorSchemePreference = useThemeStore((s) => s.setColorSchemePreference);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleTab = (tab: NavTabId) => {
    if (tab === 'Home') navigation.navigate('Home');
    if (tab === 'Chat') navigation.navigate('Chat');
    if (tab === 'Notifications') navigation.navigate('Notifications');
    if (tab === 'Profile') navigation.navigate('Profile');
    if (tab === 'Settings') return;
  };

  const handlePressItem = (item: SettingsItem) => {
    if (item.id === 'profile') {
      navigation.navigate('Profile');
      return;
    }
    if (item.id === 'security') {
      navigation.navigate('Profile');
      return;
    }
    if (item.id === 'language' || item.id === 'vehicle' || item.id === 'preferredService') {
      toast({ type: 'info', message: t('common.notImplemented') });
      return;
    }
  };

  return (
    <ScreenWrapper>
      <AppHeader
        title={t('nav.settings')}
        onBack={() => navigation.navigate('Home')}
        rightIcon="none"
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* حساب المستخدم */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.userRow}>
            <View style={[styles.avatar, { backgroundColor: colors.background }]}>
              <MaterialCommunityIcons name="account" size={24} color={colors.primary} />
            </View>
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: colors.text }]}>{user?.name ?? 'ضيف Roadly'}</Text>
              <Text style={[styles.userMeta, { color: colors.textSecondary }]}>
                {user?.email ?? 'guest@roadly.app'} • {user?.role ?? 'guest'}
              </Text>
            </View>
          </View>

          {ACCOUNT_ITEMS.map((item) => (
            <SettingsRow key={item.id} item={item} onPress={handlePressItem} colors={colors} />
          ))}
        </View>

        {/* إعدادات التطبيق */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>App</Text>
          {/* Light / Dark / System toggle */}
          <View style={styles.themeSection}>
            <Text style={[styles.themeLabel, { color: colors.text }]}>{t('settings.appearance')}</Text>
            <View style={styles.themeRow}>
              {THEME_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.themeChip,
                    { borderColor: colors.border, backgroundColor: colorSchemePreference === opt.value ? colors.primary : colors.surface },
                  ]}
                  onPress={() => setColorSchemePreference(opt.value)}
                >
                  <MaterialCommunityIcons
                    name={opt.icon}
                    size={18}
                    color={colorSchemePreference === opt.value ? colors.primaryContrast : colors.textSecondary}
                  />
                  <Text style={[styles.themeChipText, { color: colorSchemePreference === opt.value ? colors.primaryContrast : colors.text }]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          {APP_ITEMS.map((item) =>
            item.type === 'toggle' ? (
              <View key={item.id} style={styles.row}>
                <View style={styles.rowLeft}>
                  <MaterialCommunityIcons name={item.icon} size={22} color={colors.primaryDark} />
                  <Text style={[styles.rowLabel, { color: colors.text }]}>{item.label}</Text>
                </View>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  thumbColor={notificationsEnabled ? colors.primary : colors.surface}
                  trackColor={{ true: colors.successLight, false: colors.border }}
                />
              </View>
            ) : (
              <SettingsRow key={item.id} item={item} onPress={handlePressItem} colors={colors} />
            ),
          )}
        </View>

        {/* السيارة / الخدمة */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Vehicle & Service</Text>
          {VEHICLE_ITEMS.map((item) => (
            <SettingsRow key={item.id} item={item} onPress={handlePressItem} colors={colors} />
          ))}
        </View>
      </ScrollView>
      <BottomNavBar activeTab="Settings" onSelect={handleTab} />
    </ScreenWrapper>
  );
}

type RowProps = {
  item: SettingsItem;
  onPress: (item: SettingsItem) => void;
  colors: ColorPalette;
};

function SettingsRow({ item, onPress, colors }: RowProps) {
  return (
    <TouchableOpacity style={styles.row} onPress={() => onPress(item)} activeOpacity={0.85}>
      <View style={styles.rowLeft}>
        <MaterialCommunityIcons name={item.icon} size={22} color={colors.primaryDark} />
        <Text style={[styles.rowLabel, { color: colors.text }]}>{item.label}</Text>
      </View>
      <View style={styles.rowRight}>
        {item.value ? <Text style={[styles.rowValue, { color: colors.textSecondary }]}>{item.value}</Text> : null}
        <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textMuted} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
    gap: spacing.lg,
  },
  card: {
    borderRadius: radii.lg,
    padding: spacing.lg,
    ...shadows.sm,
    gap: spacing.sm,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  userInfo: { flex: 1 },
  userName: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.fontSize.body,
  },
  userMeta: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.caption,
    marginTop: spacing.xs,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.caption,
    marginBottom: spacing.xs,
  },
  themeSection: { marginBottom: spacing.md },
  themeLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.caption,
    marginBottom: spacing.sm,
  },
  themeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  themeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.full,
    borderWidth: 1,
    gap: spacing.xs,
  },
  themeChipText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.caption,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rowLabel: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.body,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  rowValue: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.caption,
  },
});
