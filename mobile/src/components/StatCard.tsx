import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, radius } from '../theme';

type Stat = { label: string; value: string | number };

type Props = { stats: Stat[] };

export function StatCard({ stats }: Props) {
  return (
    <View style={styles.card}>
      {stats.map((s) => (
        <Text key={s.label} style={styles.stat}>
          {s.label}: <Text style={styles.value}>{s.value}</Text>
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: 6,
  },
  stat: {
    color: colors.textMuted,
    fontSize: 15,
  },
  value: {
    color: colors.text,
    fontWeight: '600',
  },
});
