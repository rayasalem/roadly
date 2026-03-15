/**
 * لوحة تحكم كاملة لكل مزود خدمة (ميكانيكي، ونش، مؤجر سيارات).
 * Header (صورة، اسم، إشعارات + عداد، تسجيل خروج) + شريط تنقل + محتوى: الرئيسية، الطلبات، السجل، الإحصائيات، الملف، المساعدة.
 */
import React, { useCallback, useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../../../../shared/components/AppText';
import { Button } from '../../../../shared/components/Button';
import { t } from '../../../../shared/i18n/t';
import { spacing, typography, shadows } from '../../../../shared/theme';
import { useAuthStore } from '../../../../store/authStore';
import { useUIStore } from '../../../../store/uiStore';
import { useProviderRequests } from '../../../requests/hooks/useProviderRequests';
import { getRequestStatusTheme } from '../../../requests/constants/requestStatusTheme';
import { useProviderRatings } from '../../../ratings/hooks/useProviderRatings';

const BG_LIGHT = '#F6F6F6';
const CARD_BG = '#FFFFFF';
const BORDER = '#E5E7EB';
const GREEN = '#22C55E';
const RED = '#EF4444';
const TEXT = '#111827';
const TEXT_MUTED = '#6B7280';

type SectionId = 'dashboard' | 'incoming' | 'inProgress' | 'history' | 'map' | 'statistics' | 'profile' | 'help';

const NAV_ITEMS: { id: SectionId; icon: string; labelKey: string }[] = [
  { id: 'dashboard', icon: 'view-dashboard-outline', labelKey: 'providerDashboard.sidebar.dashboard' },
  { id: 'incoming', icon: 'bell-alert-outline', labelKey: 'providerDashboard.sidebar.incoming' },
  { id: 'inProgress', icon: 'progress-clock', labelKey: 'providerDashboard.sidebar.inProgress' },
  { id: 'history', icon: 'history', labelKey: 'providerDashboard.sidebar.history' },
  { id: 'map', icon: 'map-marker-radius', labelKey: 'providerDashboard.sidebar.map' },
  { id: 'statistics', icon: 'chart-bar', labelKey: 'providerDashboard.sidebar.statistics' },
  { id: 'profile', icon: 'account-cog-outline', labelKey: 'providerDashboard.sidebar.profile' },
  { id: 'help', icon: 'help-circle-outline', labelKey: 'providerDashboard.sidebar.help' },
];

function serviceTypeLabel(st: string): string {
  if (st === 'mechanic') return t('map.filter.mechanic');
  if (st === 'tow') return t('map.filter.tow');
  if (st === 'rental') return t('map.filter.rental');
  return st;
}

function formatRequestTime(createdAt: string): string {
  try {
    const date = new Date(createdAt);
    const diffMs = Date.now() - date.getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return t('notifications.justNow') ?? 'Just now';
    if (mins < 60) return `${mins} ${t('notifications.minAgo') ?? 'min ago'}`;
    const hours = Math.floor(diffMs / 3600000);
    return `${hours} ${t('notifications.hoursAgo') ?? 'h ago'}`;
  } catch {
    return '';
  }
}

export function ProviderDashboardScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const toast = useUIStore((s) => s.toast);
  const {
    newOrPending,
    inProgress,
    completed,
    updateStatus,
    isUpdating,
    refetch,
  } = useProviderRequests();
  const { ratings, averageRating, refetch: refetchRatings } = useProviderRatings();

  const [activeSection, setActiveSection] = useState<SectionId>('dashboard');
  const [available, setAvailable] = useState(true);
  const newRequestsCount = newOrPending.length;

  const providerName = user?.name ?? 'المزود';
  const showSidebar = width >= 600;
  const bottomNavHeight = 56 + Math.max(insets.bottom, 8);

  const onLogout = useCallback(async () => {
    await logout();
    toast({ type: 'info', message: t('providerDashboard.logout') });
  }, [logout, toast]);

  const goToNotifications = useCallback(() => {
    navigation.navigate('Notifications');
  }, [navigation]);
  const goToProfile = useCallback(() => {
    navigation.navigate('Profile');
  }, [navigation]);
  const goToSettings = useCallback(() => {
    navigation.navigate('Settings');
  }, [navigation]);
  const goToMap = useCallback(() => {
    navigation.navigate('Map');
  }, [navigation]);

  return (
    <View style={[styles.root, { backgroundColor: BG_LIGHT }]}>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        {/* ——— 1. رأس الصفحة (Header) ——— */}
        <View style={[styles.header, { backgroundColor: '#000' }]}>
          <View style={styles.headerLeft}>
            <View style={styles.avatar}>
              <MaterialCommunityIcons name="account-wrench" size={32} color="#FFF" />
            </View>
            <AppText variant="title3" weight="semibold" style={styles.headerName} numberOfLines={1}>
              {providerName}
            </AppText>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconBtn} onPress={goToNotifications} accessibilityLabel={t('providerDashboard.notifications')}>
              <MaterialCommunityIcons name="bell-outline" size={24} color="#FFF" />
              {newRequestsCount > 0 && (
                <View style={styles.badge}>
                  <AppText variant="caption" style={styles.badgeText}>{newRequestsCount}</AppText>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={onLogout} accessibilityLabel={t('providerDashboard.logout')}>
              <MaterialCommunityIcons name="logout" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.body, showSidebar && styles.bodyRow]}>
          {showSidebar && (
            <View style={[styles.sidebar, { backgroundColor: CARD_BG, borderRightColor: BORDER }]}>
              {NAV_ITEMS.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.sidebarItem, activeSection === item.id && styles.sidebarItemActive]}
                  onPress={() => setActiveSection(item.id)}
                >
                  <MaterialCommunityIcons
                    name={item.icon as any}
                    size={22}
                    color={activeSection === item.id ? GREEN : TEXT_MUTED}
                  />
                  <AppText variant="callout" style={[styles.sidebarLabel, activeSection === item.id && styles.sidebarLabelActive]}>
                    {t(item.labelKey)}
                  </AppText>
                </TouchableOpacity>
              ))}
            </View>
          )}
          <ScrollView
            style={styles.main}
            contentContainerStyle={[styles.mainContent, !showSidebar && { paddingBottom: bottomNavHeight + 24 }]}
            showsVerticalScrollIndicator={false}
          >
            {activeSection === 'dashboard' && (
              <>
                {/* حالة التوافر — زر كبير */}
                <View style={[styles.availabilityCard, { backgroundColor: available ? GREEN : RED }]}>
                  <View style={styles.availabilityLeft}>
                    <View style={[styles.availabilityDot, { backgroundColor: '#FFF' }]} />
                    <View>
                      <AppText variant="title3" weight="bold" style={styles.availabilityTitle}>
                        {available ? t('providerReg.available') : t('providerReg.unavailable')}
                      </AppText>
                      <AppText variant="caption" style={styles.availabilitySub}>
                        {available ? t('providerReg.statusSubOn') : t('providerReg.statusSubOff')}
                      </AppText>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={[styles.availabilityBtn, { backgroundColor: 'rgba(255,255,255,0.25)' }]}
                    onPress={() => setAvailable((v) => !v)}
                  >
                    <AppText variant="callout" weight="semibold" style={styles.availabilityBtnText}>
                      {available ? t('providerReg.unavailable') : t('providerReg.available')}
                    </AppText>
                  </TouchableOpacity>
                </View>

                {/* طلبات جديدة / قيد الانتظار */}
                <View style={[styles.card, { backgroundColor: CARD_BG }]}>
                  <AppText variant="subhead" weight="semibold" style={styles.cardTitle}>{t('providerDashboard.newRequests')}</AppText>
                  {newOrPending.length === 0 ? (
                    <AppText variant="body" color={TEXT_MUTED} style={styles.emptyText}>{t('providerDashboard.noNewRequests')}</AppText>
                  ) : (
                    newOrPending.map((req) => {
                      const theme = getRequestStatusTheme(req.status);
                      return (
                        <View key={req.id} style={[styles.requestCard, { borderColor: BORDER }]}>
                          <View style={[styles.miniMap, { backgroundColor: BORDER }]}>
                            <MaterialCommunityIcons name="map-marker" size={28} color={theme.color} />
                            <AppText variant="caption" color={TEXT_MUTED} numberOfLines={1}>
                              {req.origin?.latitude?.toFixed(4)}, {req.origin?.longitude?.toFixed(4)}
                            </AppText>
                          </View>
                          <View style={styles.requestBody}>
                            <AppText variant="body" weight="semibold" style={{ color: TEXT }}>{req.customerName ?? t('request.customer')}</AppText>
                            <AppText variant="caption" color={TEXT_MUTED}>{serviceTypeLabel(req.serviceType)} · {formatRequestTime(req.createdAt)}</AppText>
                            <View style={[styles.statusChip, { backgroundColor: theme.color + '22' }]}>
                              <AppText variant="caption" weight="semibold" style={{ color: theme.color }}>{t(theme.labelKey)}</AppText>
                            </View>
                          </View>
                          <View style={styles.requestActions}>
                            <TouchableOpacity
                              style={[styles.btnAccept, { backgroundColor: GREEN }]}
                              onPress={() => {
                                updateStatus(req.id, 'accepted', () => {
                                  toast({ type: 'success', message: t('providerReg.accept') });
                                  refetch();
                                });
                              }}
                              disabled={isUpdating}
                            >
                              <MaterialCommunityIcons name="check" size={20} color="#FFF" />
                              <AppText variant="callout" weight="semibold" style={styles.btnTextWhite}>{t('providerReg.accept')}</AppText>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[styles.btnDecline, { backgroundColor: RED }]}
                              onPress={() => {
                                updateStatus(req.id, 'rejected', () => {
                                  toast({ type: 'info', message: t('providerReg.decline') });
                                  refetch();
                                });
                              }}
                              disabled={isUpdating}
                            >
                              <MaterialCommunityIcons name="close" size={20} color="#FFF" />
                              <AppText variant="callout" weight="semibold" style={styles.btnTextWhite}>{t('providerReg.decline')}</AppText>
                            </TouchableOpacity>
                          </View>
                        </View>
                      );
                    })
                  )}
                </View>

                {/* طلبات جارية */}
                <View style={[styles.card, { backgroundColor: CARD_BG }]}>
                  <AppText variant="subhead" weight="semibold" style={styles.cardTitle}>{t('providerDashboard.inProgress')}</AppText>
                  {inProgress.length === 0 ? (
                    <AppText variant="body" color={TEXT_MUTED} style={styles.emptyText}>{t('providerDashboard.noInProgress')}</AppText>
                  ) : (
                    inProgress.map((req) => {
                      const theme = getRequestStatusTheme(req.status);
                      return (
                        <View key={req.id} style={[styles.inProgressCard, { borderColor: BORDER }]}>
                          <AppText variant="body" weight="semibold" style={{ color: TEXT }}>{req.customerName ?? t('request.customer')}</AppText>
                          <AppText variant="caption" color={TEXT_MUTED}>{serviceTypeLabel(req.serviceType)} — {t(theme.labelKey)}</AppText>
                          <View style={styles.inProgressActions}>
                            <TouchableOpacity style={styles.mapLink} onPress={goToMap}>
                              <MaterialCommunityIcons name="map-marker-outline" size={18} color={GREEN} />
                              <AppText variant="callout" style={{ color: GREEN }}>{t('providerDashboard.viewOnMap')}</AppText>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[styles.btnComplete, { backgroundColor: '#F59E0B' }]}
                              onPress={() => {
                                updateStatus(req.id, 'completed', () => {
                                  toast({ type: 'success', message: t('request.markComplete') });
                                  refetch();
                                });
                              }}
                              disabled={isUpdating}
                            >
                              <MaterialCommunityIcons name="flag-checkered" size={18} color="#FFF" />
                              <AppText variant="callout" weight="semibold" style={styles.btnTextWhite}>{t('request.markComplete')}</AppText>
                            </TouchableOpacity>
                          </View>
                        </View>
                      );
                    })
                  )}
                </View>

                {/* طلبات مكتملة */}
                <View style={[styles.card, { backgroundColor: CARD_BG }]}>
                  <AppText variant="subhead" weight="semibold" style={styles.cardTitle}>{t('providerDashboard.completed')}</AppText>
                  {completed.length === 0 ? (
                    <AppText variant="body" color={TEXT_MUTED} style={styles.emptyText}>{t('providerDashboard.noCompleted')}</AppText>
                  ) : (
                    completed.map((req) => (
                      <View key={req.id} style={[styles.completedCard, { borderColor: BORDER }]}>
                        <View style={styles.completedRow}>
                          <AppText variant="body" weight="semibold" style={{ color: TEXT }}>{req.customerName ?? t('request.customer')}</AppText>
                        </View>
                        <AppText variant="caption" color={TEXT_MUTED}>{serviceTypeLabel(req.serviceType)} · {formatRequestTime(req.updatedAt)}</AppText>
                      </View>
                    ))
                  )}
                </View>
              </>
            )}

            {activeSection === 'incoming' && (
              <View style={[styles.card, { backgroundColor: CARD_BG }]}>
                <AppText variant="subhead" weight="semibold" style={styles.cardTitle}>{t('providerDashboard.sidebar.incoming')}</AppText>
                {newOrPending.length === 0 ? (
                  <AppText variant="body" color={TEXT_MUTED} style={styles.emptyText}>{t('providerDashboard.noNewRequests')}</AppText>
                ) : (
                  newOrPending.map((req) => {
                    const theme = getRequestStatusTheme(req.status);
                    return (
                      <View key={req.id} style={[styles.requestCard, { borderColor: BORDER }]}>
                        <View style={[styles.miniMap, { backgroundColor: BORDER }]}>
                          <MaterialCommunityIcons name="map-marker" size={28} color={theme.color} />
                          <AppText variant="caption" color={TEXT_MUTED} numberOfLines={1}>{req.origin?.latitude?.toFixed(4)}, {req.origin?.longitude?.toFixed(4)}</AppText>
                        </View>
                        <View style={styles.requestBody}>
                          <AppText variant="body" weight="semibold" style={{ color: TEXT }}>{req.customerName ?? t('request.customer')}</AppText>
                          <AppText variant="caption" color={TEXT_MUTED}>{serviceTypeLabel(req.serviceType)} · {formatRequestTime(req.createdAt)}</AppText>
                        </View>
                        <View style={styles.requestActions}>
                          <TouchableOpacity style={[styles.btnAccept, { backgroundColor: GREEN }]} onPress={() => updateStatus(req.id, 'accepted', () => { toast({ type: 'success', message: t('providerReg.accept') }); refetch(); })} disabled={isUpdating}>
                            <MaterialCommunityIcons name="check" size={20} color="#FFF" />
                            <AppText variant="callout" weight="semibold" style={styles.btnTextWhite}>{t('providerReg.accept')}</AppText>
                          </TouchableOpacity>
                          <TouchableOpacity style={[styles.btnDecline, { backgroundColor: RED }]} onPress={() => updateStatus(req.id, 'rejected', () => { toast({ type: 'info', message: t('providerReg.decline') }); refetch(); })} disabled={isUpdating}>
                            <MaterialCommunityIcons name="close" size={20} color="#FFF" />
                            <AppText variant="callout" weight="semibold" style={styles.btnTextWhite}>{t('providerReg.decline')}</AppText>
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })
                )}
              </View>
            )}

            {activeSection === 'inProgress' && (
              <View style={[styles.card, { backgroundColor: CARD_BG }]}>
                <AppText variant="subhead" weight="semibold" style={styles.cardTitle}>{t('providerDashboard.sidebar.inProgress')}</AppText>
                {inProgress.length === 0 ? (
                  <AppText variant="body" color={TEXT_MUTED} style={styles.emptyText}>{t('providerDashboard.noInProgress')}</AppText>
                ) : (
                  inProgress.map((req) => {
                    const theme = getRequestStatusTheme(req.status);
                    return (
                      <View key={req.id} style={[styles.inProgressCard, { borderColor: BORDER }]}>
                        <AppText variant="body" weight="semibold" style={{ color: TEXT }}>{req.customerName ?? t('request.customer')}</AppText>
                        <AppText variant="caption" color={TEXT_MUTED}>{serviceTypeLabel(req.serviceType)} — {t(theme.labelKey)}</AppText>
                        <View style={styles.inProgressActions}>
                          <TouchableOpacity style={styles.mapLink} onPress={goToMap}>
                            <MaterialCommunityIcons name="map-marker-outline" size={18} color={GREEN} />
                            <AppText variant="callout" style={{ color: GREEN }}>{t('providerDashboard.viewOnMap')}</AppText>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.btnComplete, { backgroundColor: '#F59E0B' }]}
                            onPress={() => {
                              updateStatus(req.id, 'completed', () => {
                                toast({ type: 'success', message: t('request.markComplete') });
                                refetch();
                              });
                            }}
                            disabled={isUpdating}
                          >
                            <MaterialCommunityIcons name="flag-checkered" size={18} color="#FFF" />
                            <AppText variant="callout" weight="semibold" style={styles.btnTextWhite}>{t('request.markComplete')}</AppText>
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })
                )}
              </View>
            )}

            {activeSection === 'map' && (
              <View style={[styles.card, { backgroundColor: CARD_BG }]}>
                <MaterialCommunityIcons name="map-marker-radius" size={48} color={GREEN} style={styles.helpIcon} />
                <AppText variant="subhead" weight="semibold" style={[styles.cardTitle, { color: TEXT }]}>{t('providerDashboard.sidebar.map')}</AppText>
                <AppText variant="body" color={TEXT_MUTED} style={styles.helpDesc}>
                  {t('providerDashboard.mapSectionDesc')}
                </AppText>
                <Button title={t('providerDashboard.viewOnMap')} onPress={goToMap} variant="primary" fullWidth style={styles.menuBtn} />
              </View>
            )}

            {activeSection === 'history' && (
              <View style={[styles.card, { backgroundColor: CARD_BG }]}>
                <AppText variant="subhead" weight="semibold" style={styles.cardTitle}>{t('providerDashboard.sidebar.history')}</AppText>
                {completed.length === 0 ? (
                  <AppText variant="body" color={TEXT_MUTED} style={styles.emptyText}>{t('providerDashboard.noCompleted')}</AppText>
                ) : (
                  completed.map((req) => (
                    <View key={req.id} style={[styles.completedCard, { borderColor: BORDER }]}>
                      <View style={styles.completedRow}>
                        <AppText variant="body" weight="semibold" style={{ color: TEXT }}>{req.customerName ?? t('request.customer')}</AppText>
                      </View>
                      <AppText variant="caption" color={TEXT_MUTED}>{serviceTypeLabel(req.serviceType)} · {formatRequestTime(req.updatedAt)}</AppText>
                    </View>
                  ))
                )}
              </View>
            )}

            {activeSection === 'statistics' && (
              <View style={[styles.card, { backgroundColor: CARD_BG }]}>
                <AppText variant="subhead" weight="semibold" style={styles.cardTitle}>{t('providerDashboard.sidebar.statistics')}</AppText>
                <View style={styles.statsGrid}>
                  <View style={[styles.statBox, { borderColor: BORDER }]}>
                    <AppText variant="title3" weight="bold" style={{ color: TEXT }}>{newOrPending.length}</AppText>
                    <AppText variant="caption" color={TEXT_MUTED}>{t('providerDashboard.newRequests')}</AppText>
                  </View>
                  <View style={[styles.statBox, { borderColor: BORDER }]}>
                    <AppText variant="title3" weight="bold" style={{ color: TEXT }}>{inProgress.length}</AppText>
                    <AppText variant="caption" color={TEXT_MUTED}>{t('providerDashboard.inProgress')}</AppText>
                  </View>
                  <View style={[styles.statBox, { borderColor: BORDER }]}>
                    <AppText variant="title3" weight="bold" style={{ color: TEXT }}>{completed.length}</AppText>
                    <AppText variant="caption" color={TEXT_MUTED}>{t('providerDashboard.completed')}</AppText>
                  </View>
                </View>
                <View style={[styles.statRow, { borderColor: BORDER }]}>
                  <AppText variant="body" style={{ color: TEXT_MUTED }}>{t('providerDashboard.totalEarnings')}</AppText>
                  <AppText variant="title3" weight="bold" style={{ color: GREEN }}>—</AppText>
                </View>
                <View style={[styles.statRow, { borderColor: BORDER }]}>
                  <AppText variant="body" style={{ color: TEXT_MUTED }}>{t('providerDashboard.acceptRate')}</AppText>
                  <AppText variant="title3" weight="bold" style={{ color: TEXT }}>
                    {completed.length + rejected.length > 0
                      ? `${Math.round((completed.length / (completed.length + rejected.length)) * 100)}%`
                      : '—'}
                  </AppText>
                </View>
                <View style={[styles.statRow, { borderColor: BORDER }]}>
                  <AppText variant="body" style={{ color: TEXT_MUTED }}>{t('rating.averageRating')}</AppText>
                  <View style={styles.ratingStarsInline}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <MaterialCommunityIcons key={n} name={n <= Math.round(averageRating) ? 'star' : 'star-outline'} size={18} color="#F59E0B" />
                    ))}
                    <AppText variant="callout" weight="bold" style={{ color: TEXT, marginLeft: 4 }}>{averageRating > 0 ? averageRating.toFixed(1) : '—'}</AppText>
                  </View>
                </View>
                <View style={[styles.chartPlaceholder, { backgroundColor: BG_LIGHT, borderColor: BORDER }]}>
                  <MaterialCommunityIcons name="chart-line" size={48} color={TEXT_MUTED} />
                  <AppText variant="caption" color={TEXT_MUTED} style={styles.chartLabel}>رسم بياني — الطلبات / الأرباح</AppText>
                </View>
              </View>
            )}

            {activeSection === 'profile' && (
              <View style={[styles.card, { backgroundColor: CARD_BG }]}>
                <AppText variant="subhead" weight="semibold" style={styles.cardTitle}>{t('providerDashboard.sidebar.profile')}</AppText>
                <Button title={t('nav.profile')} onPress={goToProfile} variant="outline" fullWidth style={styles.menuBtn} />
                <Button title={t('nav.settings')} onPress={goToSettings} variant="outline" fullWidth style={styles.menuBtn} />
              </View>
            )}

            {activeSection === 'help' && (
              <View style={[styles.card, { backgroundColor: CARD_BG }]}>
                <MaterialCommunityIcons name="help-circle-outline" size={48} color={TEXT_MUTED} style={styles.helpIcon} />
                <AppText variant="title3" weight="semibold" style={[styles.cardTitle, { color: TEXT }]}>{t('providerDashboard.helpTitle')}</AppText>
                <AppText variant="body" color={TEXT_MUTED} style={styles.helpDesc}>{t('providerDashboard.helpDesc')}</AppText>
              </View>
            )}

            <View style={{ height: spacing.xl * 2 }} />
          </ScrollView>
        </View>

        {/* ——— شريط تنقل تحت (موبايل) ——— */}
        {!showSidebar && (
          <View style={[styles.bottomNav, { paddingBottom: Math.max(insets.bottom, 8), backgroundColor: '#000' }]}>
            {NAV_ITEMS.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.bottomNavItem}
                onPress={() => setActiveSection(item.id)}
                accessibilityRole="tab"
                accessibilityState={{ selected: activeSection === item.id }}
              >
                <MaterialCommunityIcons
                  name={item.icon as any}
                  size={22}
                  color={activeSection === item.id ? GREEN : 'rgba(255,255,255,0.6)'}
                />
                <AppText
                  variant="caption"
                  numberOfLines={1}
                  style={[styles.bottomNavLabel, { color: activeSection === item.id ? '#FFF' : 'rgba(255,255,255,0.6)' }]}
                >
                  {t(item.labelKey)}
                </AppText>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 56,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerName: { color: '#FFF', flex: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  iconBtn: { padding: 8, position: 'relative' },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: RED,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { color: '#FFF', fontSize: 11 },
  body: { flex: 1 },
  bodyRow: { flexDirection: 'row' },
  sidebar: {
    width: 200,
    borderRightWidth: 1,
    paddingVertical: spacing.sm,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  sidebarItemActive: { backgroundColor: 'rgba(34,197,94,0.1)' },
  sidebarLabel: { color: TEXT_MUTED },
  sidebarLabelActive: { color: GREEN },
  main: { flex: 1 },
  mainContent: { padding: spacing.md },
  bottomNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 8,
    paddingHorizontal: 4,
    minHeight: 56,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  bottomNavItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  bottomNavLabel: { marginTop: 2, fontSize: 10 },
  availabilityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginBottom: 16,
    ...shadows.sm,
  },
  availabilityLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  availabilityDot: { width: 12, height: 12, borderRadius: 6 },
  availabilityTitle: { color: '#FFF', fontSize: 18 },
  availabilitySub: { color: 'rgba(255,255,255,0.9)', marginTop: 2 },
  availabilityBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12 },
  availabilityBtnText: { color: '#FFF' },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    ...shadows.sm,
  },
  cardTitle: { marginBottom: 16, color: TEXT },
  requestCard: { marginBottom: 12, borderRadius: 12, overflow: 'hidden', borderWidth: 1 },
  miniMap: { height: 72, alignItems: 'center', justifyContent: 'center', gap: 4 },
  requestBody: { paddingHorizontal: 16, paddingVertical: 10 },
  requestActions: { flexDirection: 'row', paddingHorizontal: 12, paddingBottom: 12, gap: 8 },
  btnAccept: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 12 },
  btnDecline: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 12 },
  btnTextWhite: { color: '#FFF' },
  statusChip: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, marginTop: 6 },
  inProgressCard: { marginBottom: 12, padding: 16, borderRadius: 12, borderWidth: 1 },
  inProgressActions: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 10 },
  mapLink: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  btnComplete: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10 },
  completedCard: { marginBottom: 12, padding: 16, borderRadius: 12, borderWidth: 1 },
  completedRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  emptyText: { marginTop: 8 },
  ratingCard: { marginBottom: 12, padding: 12, borderRadius: 12, borderWidth: 1 },
  ratingCardRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  ratingStarsInline: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  ratingDims: { marginBottom: 4 },
  ratingComment: { marginTop: 4, fontStyle: 'italic' },
  ratingDate: { marginTop: 2 },
  statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  statBox: { flex: 1, padding: 16, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
  chartPlaceholder: { height: 180, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginTop: 16 },
  chartLabel: { marginTop: 8 },
  menuBtn: { marginBottom: 12 },
  helpIcon: { alignSelf: 'center', marginBottom: 12 },
  helpDesc: { marginTop: 8 },
});
