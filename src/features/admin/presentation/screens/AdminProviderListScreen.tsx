/**
 * Admin: list of providers by role with search, filter, and Verify + API.
 */
import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { AppHeader } from '../../../../shared/components/AppHeader';
import { GlassCard } from '../../../../shared/components/GlassCard';
import { StatusBadge } from '../../../../shared/components/StatusBadge';
import { colors } from '../../../../shared/theme/colors';
import { spacing, typography, radii } from '../../../../shared/theme';
import { ROLE_THEMES } from '../../../../shared/theme/roleThemes';
import { t } from '../../../../shared/i18n/t';
import { useUIStore } from '../../../../store/uiStore';
import type { AdminStackParamList } from '../../../../navigation/AdminStack';
import { useAdminDashboard, type AdminProviderRole } from '../../hooks/useAdminDashboard';
import type { AdminProviderItem } from '../../data/adminDashboardApi';
import { verifyProvider } from '../../data/adminProvidersApi';
import { useDebouncedValue } from '../../../../shared/hooks/useDebouncedValue';

type Route = RouteProp<AdminStackParamList, 'AdminProviderList'>;

const ROLE_ICONS: Record<AdminProviderRole, string> = {
  mechanic: 'wrench',
  tow: 'tow-truck',
  rental: 'car-estate',
};

function getSectionTitle(role: AdminProviderRole): string {
  if (role === 'mechanic') return t('admin.section.mechanics');
  if (role === 'tow') return t('admin.section.tow');
  return t('admin.section.rental');
}

const PAGE_SIZE = 10;

const DASHBOARD_QUERY_KEY = ['dashboard', 'admin'] as const;

export function AdminProviderListScreen() {
  const navigation = useNavigation();
  const toast = useUIStore((s) => s.toast);
  const queryClient = useQueryClient();
  const { params } = useRoute<Route>();
  const role = params?.role ?? 'mechanic';
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebouncedValue(searchQuery, 280);
  const [page, setPage] = useState(1);
  const { getProvidersByRole } = useAdminDashboard();
  const allProviders = useMemo(() => getProvidersByRole(role), [role, getProvidersByRole]);
  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    if (!q) return allProviders;
    return allProviders.filter((p) => p.name.toLowerCase().includes(q));
  }, [allProviders, debouncedSearch]);
  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const theme = ROLE_THEMES[role === 'mechanic' ? 'mechanic' : role === 'tow' ? 'tow' : 'rental'];

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const verifyMutation = useMutation({
    mutationFn: ({ id, verified }: { id: string; verified: boolean }) => verifyProvider(id, verified),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY });
      toast({ type: 'success', message: t('admin.verified') });
    },
    onError: () => {
      toast({ type: 'error', message: t('admin.error') ?? 'Failed' });
    },
  });

  const handleVerify = useCallback(
    (p: AdminProviderItem) => {
      verifyMutation.mutate({ id: p.id, verified: true });
    },
    [verifyMutation]
  );

  return (
    <View style={styles.root}>
      <AppHeader title={getSectionTitle(role)} onBack={() => navigation.goBack()} rightIcon="none" />
      <TextInput
        style={styles.searchInput}
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder={t('admin.searchUsers')}
        placeholderTextColor={colors.textMuted}
      />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {paginated.map((p) => (
          <GlassCard key={p.id} role="admin" style={styles.card}>
            <View style={styles.row}>
              <View style={[styles.iconWrap, { backgroundColor: theme.primaryLight }]}>
                <MaterialCommunityIcons name={ROLE_ICONS[role] as 'wrench'} size={22} color={theme.primary} />
              </View>
              <View style={styles.main}>
                <Text style={styles.name}>{p.name}</Text>
                <View style={styles.metaRow}>
                  <StatusBadge label={p.status} variant="neutral" size="sm" />
                  {p.requestsCount != null ? (
                    <Text style={styles.meta}> • {p.requestsCount} requests</Text>
                  ) : null}
                </View>
              </View>
              <TouchableOpacity
                style={[styles.verifyBtn, { backgroundColor: theme.primaryLight }]}
                onPress={() => handleVerify(p)}
              >
                <MaterialCommunityIcons name="check-circle-outline" size={18} color={theme.primary} />
                <Text style={[styles.verifyBtnText, { color: theme.primary }]}>{t('admin.verify')}</Text>
              </TouchableOpacity>
            </View>
          </GlassCard>
        ))}
        {totalPages > 1 && (
          <View style={styles.pagination}>
            <TouchableOpacity
              style={[styles.pageBtn, page <= 1 && styles.pageBtnDisabled]}
              onPress={() => setPage((x) => Math.max(1, x - 1))}
              disabled={page <= 1}
            >
              <Text style={styles.pageBtnText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.pageInfo}>{page} / {totalPages}</Text>
            <TouchableOpacity
              style={[styles.pageBtn, page >= totalPages && styles.pageBtnDisabled]}
              onPress={() => setPage((x) => Math.min(totalPages, x + 1))}
              disabled={page >= totalPages}
            >
              <Text style={styles.pageBtnText}>→</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  searchInput: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.body,
    color: colors.text,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    marginHorizontal: spacing.xl,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  scroll: { padding: spacing.md, paddingBottom: spacing.lg },
  card: { marginBottom: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center' },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radii.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  main: { flex: 1, minWidth: 0 },
  name: { fontFamily: typography.fontFamily.semibold, fontSize: typography.fontSize.body, color: colors.text },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs },
  meta: { fontFamily: typography.fontFamily.regular, fontSize: typography.fontSize.caption, color: colors.textSecondary },
  verifyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.lg,
    gap: spacing.xs,
  },
  verifyBtnText: { fontFamily: typography.fontFamily.semibold, fontSize: typography.fontSize.caption },
  pagination: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.md, marginTop: spacing.lg },
  pageBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, backgroundColor: colors.surface, borderRadius: radii.lg },
  pageBtnDisabled: { opacity: 0.5 },
  pageBtnText: { fontFamily: typography.fontFamily.semibold, fontSize: typography.fontSize.body, color: colors.text },
  pageInfo: { fontFamily: typography.fontFamily.regular, fontSize: typography.fontSize.caption, color: colors.textSecondary },
});
