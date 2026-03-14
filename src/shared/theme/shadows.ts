/**
 * Shadow system — subtle elevation (Uber/Airbnb style).
 * Three levels only; no heavy drop shadows.
 */
import { Platform, type ViewStyle } from 'react-native';

const shadowSm: ViewStyle = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  android: { elevation: 2 },
  default: {
    boxShadow: '0px 1px 3px rgba(0,0,0,0.08)',
  },
}) as ViewStyle;

const shadowMd: ViewStyle = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  android: { elevation: 4 },
  default: {
    boxShadow: '0px 4px 12px rgba(0,0,0,0.12)',
  },
}) as ViewStyle;

const shadowLg: ViewStyle = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  android: { elevation: 8 },
  default: {
    boxShadow: '0px 12px 32px rgba(0,0,0,0.18)',
  },
}) as ViewStyle;

const shadowNone: ViewStyle = Platform.select({
  web: { boxShadow: 'none', elevation: 0 },
  default: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
}) as ViewStyle;

export const shadows = {
  none: shadowNone,
  sm: shadowSm,
  md: shadowMd,
  lg: shadowLg,
} as const;
