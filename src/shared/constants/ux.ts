/**
 * UX constants for consistent touch feedback and tap targets (Turo/Uber-style).
 * Use across buttons, cards, list items, and nav for smooth, predictable interactions.
 */

/** Opacity when pressed (TouchableOpacity / Pressable). Smooth, not too dim. */
export const ACTIVE_OPACITY = 0.82;

/** Slightly stronger press feedback for primary actions */
export const ACTIVE_OPACITY_STRONG = 0.78;

/** Minimum tappable area extension (points). Improves tap accuracy. */
export const HIT_SLOP_DEFAULT = { top: 12, bottom: 12, left: 12, right: 12 };

/** Larger hit slop for small icon buttons (e.g. header, FAB) */
export const HIT_SLOP_ICON = { top: 16, bottom: 16, left: 16, right: 16 };
