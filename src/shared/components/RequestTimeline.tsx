/**
 * Vertical timeline for request status (e.g. Pending → Accepted → On the way → Completed).
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { typography, spacing } from '../theme';
import { useTheme } from '../theme';

export interface TimelineStep {
  key: string;
  label: string;
  done: boolean;
  current?: boolean;
  time?: string;
}

export interface RequestTimelineProps {
  steps: TimelineStep[];
  accentColor?: string;
}

export const RequestTimeline = React.memo(function RequestTimeline({
  steps,
  accentColor,
}: RequestTimelineProps) {
  const { colors } = useTheme();
  const accent = accentColor ?? colors.primary;
  const mutedColor = colors.textSecondary ?? '#6B7280';

  return (
    <View style={styles.wrap}>
      {steps.map((step, i) => (
        <View key={step.key} style={styles.row}>
          <View style={styles.leftCol}>
            <View
              style={[
                styles.dot,
                step.done && { backgroundColor: accent },
                step.current && [styles.dotCurrent, { borderColor: accent }],
                !step.done && !step.current && { backgroundColor: colors.border },
              ]}
            >
              {step.done ? (
                <MaterialCommunityIcons name="check" size={12} color="#FFF" />
              ) : null}
            </View>
            {i < steps.length - 1 && (
              <View style={[styles.line, step.done ? { backgroundColor: accent } : { backgroundColor: colors.border }]} />
            )}
          </View>
          <View style={styles.content}>
            <Text
              style={[
                styles.label,
                { color: (step.done || step.current) ? colors.text : mutedColor },
                (step.done || step.current) && { fontFamily: typography.fontFamily.semibold },
              ]}
              numberOfLines={1}
            >
              {step.label}
            </Text>
            {step.time ? (
              <Text style={[styles.time, { color: mutedColor }]} numberOfLines={1}>{step.time}</Text>
            ) : null}
          </View>
        </View>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { paddingVertical: spacing.xs },
  row: { flexDirection: 'row', alignItems: 'flex-start', minHeight: 36 },
  leftCol: { alignItems: 'center', width: 24 },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotCurrent: {
    backgroundColor: 'transparent',
    borderWidth: 2,
  },
  line: {
    width: 2,
    flex: 1,
    minHeight: 12,
    marginVertical: 2,
  },
  content: { flex: 1, paddingLeft: spacing.sm, paddingBottom: spacing.sm },
  label: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.presets.caption.fontSize,
  },
  time: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 11,
    marginTop: 2,
  },
});
