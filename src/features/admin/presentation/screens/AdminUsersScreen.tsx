/**
 * Admin: list all users with search, role/status badges. Edit services via BottomSheet; Block/Unblock; toasts on actions.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomSheetModal } from '@gorhom/bottom-sheet';

import { AppHeader } from '../../../../shared/components/AppHeader';
import { GlassCard } from '../../../../shared/components/GlassCard';
import { PressableCard } from '../../../../shared/components/PressableCard';
import { Button } from '../../../../shared/components/Button';
import { colors } from '../../../../shared/theme/colors';
import { spacing, typography, radii, shadows } from '../../../../shared/theme';
import { ROLE_THEMES } from '../../../../shared/theme/roleThemes';
import { t } from '../../../../shared/i18n/t';
import type { AdminStackParamList } from '../../../../navigation/AdminStack';
import {
  useAdminUsers,
  type AdminUser,
  type AdminUserRole,
  type AdminUserStatus,
  type ServiceCategory,
} from '../../hooks/useAdminUsers';

type Nav = NativeStackNavigationProp<AdminStackParamList, 'AdminUsers'>;
const THEME = ROLE_THEMES.admin;

const ROLE_LABELS: Record<AdminUserRole, string> = {
  user: 'User',
  mechanic: 'Mechanic',
  tow: 'Tow',
  rental: 'Rental',
  admin: 'Admin',
};
const STATUS_LABELS: Record<AdminUserStatus, string> = {
  active: 'Active',
  suspended: 'Suspended',
  pending: 'Pending',
};

function getRoleTheme(role: AdminUserRole) {
  if (role === 'mechanic') return ROLE_THEMES.mechanic;
  if (role === 'tow') return ROLE_THEMES.tow;
  if (role === 'rental') return ROLE_THEMES.rental;
  return THEME;
}

export function AdminUsersScreen() {
  const navigation = useNavigation<Nav>();
  const toast = useUIStore((s) => s.toast);
  const sheetRef = useRef<BottomSheetModal>(null);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [draftName, setDraftName] = useState('');
  const [draftRole, setDraftRole] = useState<AdminUserRole>('user');
  const [draftStatus, setDraftStatus] = useState<AdminUserStatus>('active');
  const [draftServiceIds, setDraftServiceIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<AdminUserRole | 'all'>('all');

  const {
    users,
    servicesByCategory,
    updateUser,
    setUserAssignedServices,
  } = useAdminUsers();

  const filteredUsers = useMemo(() => {
    let list = users;
    const q = searchQuery.trim().toLowerCase();
    if (q) list = list.filter((u) => u.name.toLowerCase().includes(q));
    if (roleFilter !== 'all') list = list.filter((u) => u.role === roleFilter);
    return list;
  }, [users, searchQuery, roleFilter]);

  const openEdit = useCallback((user: AdminUser) => {
    setEditingUser(user);
    setDraftName(user.name);
    setDraftRole(user.role);
    setDraftStatus(user.status);
    setDraftServiceIds(new Set(user.assignedServiceIds));
  }, []);

  useEffect(() => {
    if (editingUser) sheetRef.current?.present();
  }, [editingUser]);

  const closeSheet = useCallback(() => {
    sheetRef.current?.dismiss();
    setEditingUser(null);
  }, []);

  const toggleService = useCallback((serviceId: string) => {
    setDraftServiceIds((prev) => {
      const next = new Set(prev);
      if (next.has(serviceId)) next.delete(serviceId);
      else next.add(serviceId);
      return next;
    });
  }, []);

  const handleSave = useCallback(() => {
    if (!editingUser) return;
    updateUser(editingUser.id, { name: draftName, role: draftRole, status: draftStatus });
    setUserAssignedServices(editingUser.id, Array.from(draftServiceIds));
    closeSheet();
    toast({ type: 'success', message: t('admin.saved') });
  }, [editingUser, draftName, draftRole, draftStatus, draftServiceIds, updateUser, setUserAssignedServices, closeSheet, toast]);

  const handleBlock = useCallback(
    (user: AdminUser) => {
      const newStatus: AdminUserStatus = user.status === 'suspended' ? 'active' : 'suspended';
      updateUser(user.id, { status: newStatus });
      toast({
        type: newStatus === 'suspended' ? 'warning' : 'success',
        message: newStatus === 'suspended' ? t('admin.userBlocked') : t('admin.userUnblocked'),
      });
    },
    [updateUser, toast]
  );

  const renderServiceToggles = (category: ServiceCategory) => {
    const list = servicesByCategory[category];
    const label =
      category === 'mechanic'
        ? t('admin.servicesMechanic')
        : category === 'tow'
          ? t('admin.servicesTow')
          : t('admin.servicesRental');
    const roleTheme = getRoleTheme(category === 'mechanic' ? 'mechanic' : category === 'tow' ? 'tow' : 'rental');
    return (
      <View style={styles.serviceSection} key={category}>
        <Text style={[styles.serviceSectionTitle, { color: roleTheme.primary }]}>{label}</Text>
        {list.map((s) => {
          const assigned = draftServiceIds.has(s.id);
          return (
            <TouchableOpacity
              key={s.id}
              style={[
                styles.serviceRow,
                assigned && { backgroundColor: roleTheme.primaryLight },
              ]}
              onPress={() => toggleService(s.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.serviceName}>{s.name}</Text>
              {assigned ? (
                <MaterialCommunityIcons name="check-circle" size={22} color={roleTheme.primary} />
              ) : (
                <MaterialCommunityIcons name="circle-outline" size={22} color={colors.textMuted} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <AppHeader
          title={t('admin.manageUsers')}
          onBack={() => navigation.goBack()}
          rightIcon="none"
        />
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionTitle}>{t('admin.usersList')}</Text>
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={t('admin.searchUsers')}
            placeholderTextColor={colors.textMuted}
          />
          <View style={styles.filterRow}>
            {(['all', 'user', 'mechanic', 'tow', 'rental', 'admin'] as const).map((r) => (
              <TouchableOpacity
                key={r}
                style={[styles.filterChip, roleFilter === r && styles.filterChipActive]}
                onPress={() => setRoleFilter(r)}
              >
                <Text style={[styles.filterChipText, roleFilter === r && styles.filterChipTextActive]}>
                  {r === 'all' ? t('admin.filterAll') : ROLE_LABELS[r]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {filteredUsers.map((user, index) => {
            const roleTheme = getRoleTheme(user.role);
            const serviceCount = user.assignedServiceIds.length;
            return (
              <PressableCard
                key={user.id}
                style={styles.userCard}
                onPress={() => openEdit(user)}
                testID={index === 0 ? 'admin-user-card-first' : undefined}
              >
                <View style={styles.userRow}>
                  <View style={[styles.avatar, { backgroundColor: roleTheme.primaryLight }]}>
                    <MaterialCommunityIcons name="account" size={24} color={roleTheme.primary} />
                  </View>
                  <View style={styles.userMain}>
                    <Text style={styles.userName} numberOfLines={1}>{user.name}</Text>
                    <View style={styles.badges}>
                      <StatusBadge label={ROLE_LABELS[user.role]} variant="neutral" size="sm" />
                      <StatusBadge
                        label={STATUS_LABELS[user.status]}
                        variant={user.status === 'suspended' ? 'cancelled' : user.status === 'pending' ? 'pending' : 'active'}
                        size="sm"
                      />
                    </View>
                    <Text style={styles.assignedLabel}>
                      {t('admin.assignedServices')}: {serviceCount}
                    </Text>
                  </View>
                  <View style={styles.actionBtns}>
                    <TouchableOpacity
                      style={[styles.blockBtn, user.status === 'suspended' && styles.unblockBtn]}
                      onPress={() => handleBlock(user)}
                      testID="admin-user-block"
                    >
                      <MaterialCommunityIcons
                        name={user.status === 'suspended' ? 'lock-open-outline' : 'lock-outline'}
                        size={16}
                        color={user.status === 'suspended' ? THEME.primary : colors.error}
                      />
                      <Text style={[styles.blockBtnText, user.status === 'suspended' && { color: THEME.primary }]}>
                        {user.status === 'suspended' ? t('admin.unblock') : t('admin.block')}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.editBtn, { backgroundColor: THEME.primaryLight }]}
                      onPress={() => openEdit(user)}
                      testID="admin-user-edit"
                    >
                      <MaterialCommunityIcons name="pencil" size={18} color={THEME.primary} />
                      <Text style={[styles.editBtnText, { color: THEME.primary }]}>
                        {t('admin.editServices')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </PressableCard>
            );
          })}
        </ScrollView>
      </SafeAreaView>

      <BottomSheetModal
        ref={sheetRef}
        snapPoints={[520, '90%']}
        enablePanDownToClose
        onDismiss={() => setEditingUser(null)}
        backgroundStyle={styles.sheetBg}
        handleIndicatorStyle={styles.sheetHandle}
      >
        <ScrollView style={styles.sheetScroll} contentContainerStyle={styles.sheetContent}>
          {editingUser ? (
            <>
              <Text style={styles.sheetTitle}>{t('admin.editServices')}</Text>
              <GlassCard role="admin" style={styles.sheetCard}>
                <Text style={styles.fieldLabel}>{t('admin.userName')}</Text>
                <TextInput
                  style={styles.input}
                  value={draftName}
                  onChangeText={setDraftName}
                  placeholder={t('admin.userName')}
                  placeholderTextColor={colors.textMuted}
                />
                <Text style={styles.fieldLabel}>{t('admin.userRole')}</Text>
                <View style={styles.roleRow}>
                  {(['user', 'mechanic', 'tow', 'rental', 'admin'] as const).map((r) => (
                    <TouchableOpacity
                      key={r}
                      style={[
                        styles.roleChip,
                        draftRole === r && { backgroundColor: getRoleTheme(r).primary },
                      ]}
                      onPress={() => setDraftRole(r)}
                      testID={`admin-role-${r}`}
                    >
                      <Text
                        style={[
                          styles.roleChipText,
                          draftRole === r && styles.roleChipTextActive,
                        ]}
                      >
                        {ROLE_LABELS[r]}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={styles.fieldLabel}>{t('admin.userStatus')}</Text>
                <View style={styles.roleRow}>
                  {(['active', 'suspended', 'pending'] as const).map((s) => (
                    <TouchableOpacity
                      key={s}
                      style={[styles.roleChip, draftStatus === s && styles.roleChipActive]}
                      onPress={() => setDraftStatus(s)}
                    >
                      <Text
                        style={[
                          styles.roleChipText,
                          draftStatus === s && styles.roleChipTextActive,
                        ]}
                      >
                        {STATUS_LABELS[s]}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </GlassCard>

              <Text style={styles.sectionTitle}>{t('admin.assignedServices')}</Text>
              {(['mechanic', 'tow', 'rental'] as const).map(renderServiceToggles)}

              <View style={styles.sheetActions}>
                <Button
                  testID="admin-sheet-cancel"
                  title={t('admin.cancel')}
                  onPress={closeSheet}
                  variant="outline"
                  fullWidth
                  style={styles.sheetBtn}
                />
                <Button
                  testID="admin-sheet-save"
                  title={t('admin.save')}
                  onPress={handleSave}
                  fullWidth
                  style={styles.sheetBtn}
                />
              </View>
            </>
          ) : null}
        </ScrollView>
      </BottomSheetModal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  safe: { flex: 1 },
  scroll: { padding: spacing.xl, paddingBottom: spacing.xxl },
  searchInput: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.body,
    color: colors.text,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.md },
  filterChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
  },
  filterChipActive: { backgroundColor: THEME.primary },
  filterChipText: { fontFamily: typography.fontFamily.medium, fontSize: typography.fontSize.caption, color: colors.text },
  filterChipTextActive: { color: colors.primaryContrast },
  actionBtns: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginLeft: spacing.sm },
  blockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.lg,
    backgroundColor: colors.errorLight,
    gap: spacing.xs,
  },
  unblockBtn: { backgroundColor: THEME.primaryLight },
  blockBtnText: { fontFamily: typography.fontFamily.medium, fontSize: typography.fontSize.caption, color: colors.error },
  sectionTitle: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.fontSize.title3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  userCard: { marginBottom: spacing.md },
  userRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  userMain: { flex: 1, minWidth: 0 },
  userName: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.fontSize.body,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.xs },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  badgeStatus: { backgroundColor: colors.surface },
  badgeText: { fontFamily: typography.fontFamily.medium, fontSize: typography.fontSize.caption, color: colors.text },
  assignedLabel: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.caption,
    color: colors.textSecondary,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: radii.lg,
    gap: spacing.xs,
    marginLeft: spacing.sm,
  },
  editBtnText: { fontFamily: typography.fontFamily.semibold, fontSize: typography.fontSize.caption },
  sheetBg: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    ...shadows.lg,
  },
  sheetHandle: { backgroundColor: colors.border, width: 40 },
  sheetScroll: { flex: 1 },
  sheetContent: { padding: spacing.xl, paddingBottom: spacing.xxl },
  sheetTitle: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.fontSize.title2,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  sheetCard: { marginBottom: spacing.lg },
  fieldLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  input: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.body,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  roleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.xs },
  roleChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
  },
  roleChipActive: { backgroundColor: THEME.primary },
  roleChipText: { fontFamily: typography.fontFamily.medium, fontSize: typography.fontSize.caption, color: colors.text },
  roleChipTextActive: { color: colors.primaryContrast },
  serviceSection: { marginBottom: spacing.lg },
  serviceSectionTitle: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.fontSize.callout,
    marginBottom: spacing.sm,
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.lg,
    marginBottom: spacing.xs,
  },
  serviceName: { fontFamily: typography.fontFamily.medium, fontSize: typography.fontSize.body, color: colors.text },
  sheetActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl },
  sheetBtn: { flex: 1 },
});
