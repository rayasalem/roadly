import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle, Platform, useWindowDimensions } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { useTheme, spacing } from '../theme';
import { BREAKPOINT_DESKTOP, CONTENT_MAX_WIDTH } from '../design/layout';
import { BottomNavBar } from './BottomNavBar';
import { SideNavRail } from './SideNavRail';
import type { NavTabId } from '../navigation/navTabs';

export type BottomNavConfig = {
  activeTab: NavTabId;
  onSelect: (tab: NavTabId) => void;
  dark?: boolean;
  labels?: Partial<Record<NavTabId, string>>;
  showChatNotificationBadge?: boolean;
};

type ScreenWrapperProps = {
  children: React.ReactNode;
  backgroundColor?: string;
  edges?: Edge[];
  padded?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  /** Legacy: custom bottom nav node */
  bottomNav?: React.ReactNode;
  /** Typed nav — used with BottomNavBar / SideNavRail */
  bottomNavConfig?: BottomNavConfig;
  /** When true, web desktop width uses side rail instead of bottom bar */
  responsiveNav?: boolean;
};

export function ScreenWrapper({
  children,
  backgroundColor,
  edges = ['top', 'bottom'],
  padded = true,
  contentStyle,
  bottomNav,
  bottomNavConfig,
  responsiveNav = false,
}: ScreenWrapperProps) {
  const { colors } = useTheme();
  const bg = backgroundColor ?? colors.background;
  const { width } = useWindowDimensions();

  const hasConfig = bottomNavConfig != null;
  const isDesktopShell =
    responsiveNav && hasConfig && Platform.OS === 'web' && width >= BREAKPOINT_DESKTOP;

  if (isDesktopShell && bottomNavConfig) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: bg }]} edges={edges}>
        <View style={styles.desktopRow}>
          <SideNavRail
            activeTab={bottomNavConfig.activeTab}
            onSelect={bottomNavConfig.onSelect}
            dark={bottomNavConfig.dark}
            labels={bottomNavConfig.labels}
          />
          <View style={styles.desktopMain}>
            <View style={[styles.content, padded && styles.padded, contentStyle, styles.desktopContentInner]}>
              {children}
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const bottomChrome =
    hasConfig && bottomNavConfig ? (
      <BottomNavBar
        activeTab={bottomNavConfig.activeTab}
        onSelect={bottomNavConfig.onSelect}
        dark={bottomNavConfig.dark}
        labels={bottomNavConfig.labels}
        showChatNotificationBadge={bottomNavConfig.showChatNotificationBadge}
      />
    ) : (
      bottomNav
    );

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: bg }]} edges={edges}>
      <View style={styles.column}>
        <View style={[styles.content, padded && styles.padded, contentStyle]}>{children}</View>
        {bottomChrome != null ? <View style={styles.bottomNavWrap}>{bottomChrome}</View> : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  column: {
    flex: 1,
    width: '100%',
  },
  desktopRow: {
    flex: 1,
    flexDirection: 'row',
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH + 400,
    alignSelf: 'center',
  },
  desktopMain: {
    flex: 1,
    minWidth: 0,
  },
  desktopContentInner: {
    maxWidth: CONTENT_MAX_WIDTH,
    width: '100%',
    alignSelf: 'center',
  },
  content: {
    flex: 1,
  },
  padded: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  bottomNavWrap: {
    width: '100%',
    alignSelf: 'stretch',
  },
});
