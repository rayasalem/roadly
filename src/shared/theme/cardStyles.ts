/**
 * Shared card design: rounded corners, soft shadow, padding, consistent spacing.
 * Use for Services, Providers, and Requests cards across the app.
 */
import { spacing } from './spacing';
import { radii } from './radii';
import { shadows } from './shadows';

/** Base card container: rounded corners (xl), soft shadow, inner padding 16px */
export const cardBase = {
  borderRadius: radii.xl,
  padding: spacing.md,
  ...shadows.sm,
} as const;

/** Spacing between card sections (e.g. title → content, rows) */
export const cardSectionGap = spacing.sm;

/** Spacing between tight elements (e.g. label + value) */
export const cardElementGap = spacing.xs;
