import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useGameStore } from '../store/useGameStore';
import { StatCard } from '../components/StatCard';
import { UpgradeRow } from '../components/UpgradeRow';
import { colors, spacing } from '../theme';
import { TICK_MS, TRAIN_COST, DEEP_REST_COST } from '../game/constants';

export function GameScreen() {
  const depth = useGameStore((s) => s.depth);
  const enemyHp = useGameStore((s) => s.enemyHp);
  const power = useGameStore((s) => s.power);
  const energy = useGameStore((s) => s.energy);
  const maxEnergy = useGameStore((s) => s.maxEnergy);
  const gold = useGameStore((s) => s.gold);
  const shards = useGameStore((s) => s.shards);
  const advanceTick = useGameStore((s) => s.advanceTick);
  const train = useGameStore((s) => s.train);
  const deepRest = useGameStore((s) => s.deepRest);

  useEffect(() => {
    const id = setInterval(advanceTick, TICK_MS);
    return () => clearInterval(id);
  }, [advanceTick]);

  const stats = [
    { label: 'Depth', value: depth },
    { label: 'Enemy HP', value: Math.max(0, enemyHp) },
    { label: 'Power', value: power },
    { label: 'Energy', value: `${energy} / ${maxEnergy}` },
    { label: 'Gold', value: gold },
    { label: 'Shards', value: shards },
  ];

  const upgrades = [
    {
      label: `Train  (+1 Power)  ·  ${TRAIN_COST} Gold`,
      onPress: train,
      disabled: gold < TRAIN_COST,
    },
    {
      label: `Deep Rest  (+1 Max Energy)  ·  ${DEEP_REST_COST} Shard`,
      onPress: deepRest,
      disabled: shards < DEEP_REST_COST,
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Echo Delves</Text>
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
    paddingTop: 56,
    paddingHorizontal: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
});
