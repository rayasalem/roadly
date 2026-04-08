/**
 * Shared bottom sheet surface styles — use with BottomSheetModal `backgroundStyle` + content padding.
 */
import { colors } from '../../theme/colors';
import { radii, shadows, spacing } from '../../theme';

export const standardSheetBackground = {
  backgroundColor: colors.surface,
  borderTopLeftRadius: radii.xxl,
  borderTopRightRadius: radii.xxl,
  ...shadows.lg,
} as const;

export const standardSheetContentPadding = {
  padding: spacing.md,
  paddingBottom: spacing.xl,
} as const;
