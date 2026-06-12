import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useGameStore } from '../store/useGameStore';
import { StatCard } from '../components/StatCard';
import { UpgradeRow } from '../components/UpgradeRow';
import { colors, spacing } from '../theme';
import { TICK_MS, TRAIN_COST, DEEP_REST_COST } from '../game/constants';
import { effectivePower, effectiveMaxEnergy } from '../game/engine';
import type { RootStackParamList } from '../../App';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function GameScreen() {
  const navigation = useNavigation<Nav>();

  const depth        = useGameStore((s) => s.depth);
  const enemyHp      = useGameStore((s) => s.enemyHp);
  const power        = useGameStore((s) => s.power);
  const energy       = useGameStore((s) => s.energy);
  const maxEnergy    = useGameStore((s) => s.maxEnergy);
  const gold         = useGameStore((s) => s.gold);
  const shards       = useGameStore((s) => s.shards);
  const essence      = useGameStore((s) => s.essence);
  const inventory    = useGameStore((s) => s.inventory);
  const equipped     = useGameStore((s) => s.equipped);
  const advanceTick  = useGameStore((s) => s.advanceTick);
  const train        = useGameStore((s) => s.train);
  const deepRest     = useGameStore((s) => s.deepRest);

  useEffect(() => {
    const id = setInterval(advanceTick, TICK_MS);
    return () => clearInterval(id);
  }, [advanceTick]);

  // Build a temporary state snapshot to compute effective values
  const snap = { power, maxEnergy, equipped } as Parameters<typeof effectivePower>[0];
  const totalPower  = effectivePower(snap);
  const totalEnergy = effectiveMaxEnergy(snap);

  const stats = [
    { label: 'Depth',    value: depth },
    { label: 'Enemy HP', value: Math.max(0, enemyHp) },
    { label: 'Power',    value: totalPower  !== power    ? `${totalPower} (base ${power})`    : power },
    { label: 'Energy',   value: `${energy} / ${totalEnergy !== maxEnergy ? `${totalEnergy} (base ${maxEnergy})` : maxEnergy}` },
    { label: 'Gold',     value: gold },
    { label: 'Shards',   value: shards },
    ...(essence > 0 ? [{ label: 'Essence', value: essence }] : []),
  ];

  const upgrades = [
    {
      label:    `Train  (+1 Power)  ·  ${TRAIN_COST} Gold`,
      onPress:  train,
      disabled: gold < TRAIN_COST,
    },
    {
      label:    `Deep Rest  (+1 Max Energy)  ·  ${DEEP_REST_COST} Shard`,
      onPress:  deepRest,
      disabled: shards < DEEP_REST_COST,
    },
  ];

  const inventoryCount = inventory.length;
  const equippedCount  = Object.keys(equipped).length;

  return (
    <View style={styles.container}>
      {/* Header row */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>Echo Delves</Text>
        <Pressable
          style={styles.gearBtn}
          onPress={() => navigation.navigate('Inventory')}
        >
          <Text style={styles.gearBtnText}>
            Equipment{inventoryCount > 0 ? ` (${inventoryCount})` : ''}
          </Text>
          {equippedCount > 0 && (
            <Text style={styles.equippedBadge}>{equippedCount}/7</Text>
          )}
        </Pressable>
      </View>

      <StatCard stats={stats} />
      <UpgradeRow upgrades={upgrades} />
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingTop: 52,
    paddingHorizontal: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '700',
  },
  gearBtn: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
  },
  gearBtnText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  equippedBadge: {
    color: colors.accentLight,
    fontSize: 11,
    marginTop: 1,
  },
});
