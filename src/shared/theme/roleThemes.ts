/**
 * Per-role color and icon theme for dashboards.
 * Mechanic: blue, Tow: orange, Rental: purple, Admin: slate.
 */
import { colors } from './colors';

export type RoleThemeId = 'mechanic' | 'tow' | 'rental' | 'admin';

export const ROLE_THEMES: Record<
  RoleThemeId,
  { primary: string; primaryLight: string; icon: string; gradient: [string, string] }
> = {
  mechanic: {
    primary: colors.mapMechanic,
    primaryLight: '#E0F2FE',
    icon: 'wrench',
    gradient: ['#0EA5E9', '#38BDF8'],
  },
  tow: {
    primary: colors.mapTow,
    primaryLight: '#FFEDD5',
    icon: 'tow-truck',
    gradient: ['#EA580C', '#F97316'],
  },
  rental: {
    primary: colors.mapRental,
    primaryLight: '#E0E7FF',
    icon: 'car-estate',
    gradient: ['#4F46E5', '#6366F1'],
  },
  admin: {
    primary: '#475569',
    primaryLight: '#F1F5F9',
    icon: 'shield-account',
    gradient: ['#334155', '#64748B'],
  },
};
