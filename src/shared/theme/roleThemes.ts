/**
 * Per-role color and icon theme — unified green for all roles.
 * User: green (primary). Mechanic / Tow / Rental / Admin: green variations.
 */
import { colors } from './colors';

export type RoleThemeId = 'mechanic' | 'tow' | 'rental' | 'admin';

export const ROLE_THEMES: Record<
  RoleThemeId,
  { primary: string; primaryLight: string; icon: string; gradient: [string, string] }
> = {
  mechanic: {
    primary: colors.primary,
    primaryLight: colors.greenLight,
    icon: 'wrench',
    gradient: [colors.primary, colors.primaryDark],
  },
  tow: {
    primary: colors.primary,
    primaryLight: colors.greenLight,
    icon: 'tow-truck',
    gradient: [colors.primary, colors.primaryDark],
  },
  rental: {
    primary: colors.primary,
    primaryLight: colors.greenLight,
    icon: 'car-estate',
    gradient: [colors.primary, colors.primaryDark],
  },
  admin: {
    primary: colors.primaryDark,
    primaryLight: colors.greenLight,
    icon: 'shield-account',
    gradient: [colors.primaryDark, colors.primary],
  },
};
