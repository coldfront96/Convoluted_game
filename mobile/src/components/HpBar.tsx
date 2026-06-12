import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../theme';

type Props = {
  current: number;
  max: number;
  color?: string;
  label?: string;
  showNumbers?: boolean;
};

export function HpBar({ current, max, color, label, showNumbers = true }: Props) {
  const pct = max > 0 ? Math.max(0, Math.min(1, current / max)) : 0;

  const barColor = color ?? (
    pct > 0.5 ? '#22c55e' :
    pct > 0.25 ? '#f59e0b' :
    '#ef4444'
  );

  return (
    <View style={styles.wrap}>
      {(label || showNumbers) && (
        <View style={styles.labelRow}>
          {label && <Text style={styles.label}>{label}</Text>}
          {showNumbers && (
            <Text style={styles.numbers}>
              {Math.max(0, current)} / {max}
            </Text>
          )}
        </View>
      )}
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct * 100}%` as any, backgroundColor: barColor }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 4,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  numbers: {
    color: colors.textMuted,
    fontSize: 12,
  },
  track: {
    height: 8,
    backgroundColor: '#1e2535',
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.sm,
  },
});
