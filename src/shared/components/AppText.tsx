/**
 * Theme-aware text with locale-based font: Poppins (EN), Tajawal (AR).
 * Supports i18n and RTL: text alignment and writing direction follow locale.
 */
import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { typography, useTypography } from '../theme';

export type AppTextVariant =
  | 'display'
  | 'title1'
  | 'title2'
  | 'title3'
  | 'body'
  | 'callout'
  | 'subhead'
  | 'caption';

export type AppTextWeight = 'regular' | 'medium' | 'semibold' | 'bold';

export interface AppTextProps extends RNTextProps {
  variant?: AppTextVariant;
  weight?: AppTextWeight;
  color?: string;
  /** Center text (overrides RTL alignment) */
  center?: boolean;
  /** Force LTR/RTL alignment; default: follow locale (right for Arabic) */
  align?: 'left' | 'right' | 'center' | 'auto';
}

const variantToFontSizeAndLineHeight = {
  display: { fontSize: typography.presets.display.fontSize, lineHeight: typography.presets.display.lineHeight },
  title1: { fontSize: typography.fontSize.title1, lineHeight: 30 },
  title2: { fontSize: typography.fontSize.title2, lineHeight: 26 },
  title3: { fontSize: typography.presets.titleSmall.fontSize, lineHeight: typography.presets.titleSmall.lineHeight },
  body: { fontSize: typography.presets.body.fontSize, lineHeight: typography.presets.body.lineHeight },
  callout: { fontSize: typography.presets.bodySmall.fontSize, lineHeight: typography.presets.bodySmall.lineHeight },
  subhead: { fontSize: typography.presets.bodySmall.fontSize, lineHeight: typography.presets.bodySmall.lineHeight },
  caption: { fontSize: typography.presets.caption.fontSize, lineHeight: typography.presets.caption.lineHeight },
} as const;

const weightToKey = {
  regular: 'regular' as const,
  medium: 'medium' as const,
  semibold: 'semibold' as const,
  bold: 'bold' as const,
};

const variantToDefaultWeight = {
  display: 'bold' as const,
  title1: 'bold' as const,
  title2: 'semibold' as const,
  title3: 'semibold' as const,
  body: 'regular' as const,
  callout: 'regular' as const,
  subhead: 'medium' as const,
  caption: 'regular' as const,
};

export const AppText = React.memo(function AppText({
  variant = 'body',
  weight,
  color,
  center,
  align,
  style,
  ...rest
}: AppTextProps) {
  const { fontFamily, isRTL } = useTypography();
  const sizeAndLine = variantToFontSizeAndLineHeight[variant];
  const weightKey = weight ?? variantToDefaultWeight[variant];
  const family = fontFamily[weightToKey[weightKey]];

  const textAlign =
    align !== undefined
      ? align
      : center
        ? 'center'
        : isRTL
          ? 'right'
          : 'left';
  const writingDirection = isRTL ? 'rtl' : 'ltr';

  return (
    <RNText
      style={[
        sizeAndLine,
        { fontFamily: family, textAlign, writingDirection },
        color != null && { color },
        style,
      ]}
      {...rest}
    />
  );
});
