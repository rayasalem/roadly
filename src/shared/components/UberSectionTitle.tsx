/**
 * Uber-style section title: bold, clear hierarchy (like Uber's H2 sections).
 */
import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme';

export interface UberSectionTitleProps {
  title: string;
  /** Optional subtitle below the title (muted). */
  subtitle?: string;
}

export function UberSectionTitle({ title, subtitle }: UberSectionTitleProps) {
  return (
    <>
      <Text style={styles.title} numberOfLines={2}>
        {title}
      </Text>
      {subtitle ? (
        <Text style={styles.subtitle} numberOfLines={2}>
          {subtitle}
        </Text>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 20,
    lineHeight: 26,
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },
});
