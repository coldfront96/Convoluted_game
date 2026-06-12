import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { colors, spacing, radius } from '../theme';

type Upgrade = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

type Props = { upgrades: Upgrade[] };

export function UpgradeRow({ upgrades }: Props) {
  return (
    <View style={styles.row}>
      {upgrades.map((u) => (
        <Pressable
          key={u.label}
          style={[styles.button, u.disabled && styles.buttonDisabled]}
          onPress={u.onPress}
          disabled={u.disabled}
        >
          <Text style={[styles.label, u.disabled && styles.labelDisabled]}>
            {u.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: spacing.sm,
  },
  button: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingVertical: 13,
    paddingHorizontal: spacing.md,
  },
  buttonDisabled: {
    backgroundColor: colors.accentDisabled,
  },
  label: {
    color: colors.text,
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 15,
  },
  labelDisabled: {
    color: colors.textMuted,
  },
});
