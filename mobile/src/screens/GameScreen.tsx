import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useGameStore } from '../store/useGameStore';
import { UpgradeRow } from '../components/UpgradeRow';
import { HpBar } from '../components/HpBar';
import { SkillBar } from '../components/SkillBar';
import { colors, spacing, radius } from '../theme';
import { TICK_MS, TRAIN_COST, DEEP_REST_COST } from '../game/constants';
import { effectivePower, effectiveMaxEnergy, effectiveMaxHp } from '../game/engine';
import { getFloorType, getEnemyMaxHp, getEnemyName, FLOOR_TYPE_COLOR, FLOOR_TYPE_LABEL } from '../game/dungeon';
import type { RootStackParamList } from '../../App';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function GameScreen() {
  const navigation = useNavigation<Nav>();

  const depth       = useGameStore((s) => s.depth);
  const enemyHp     = useGameStore((s) => s.enemyHp);
  const playerHp    = useGameStore((s) => s.playerHp);
  const maxPlayerHp = useGameStore((s) => s.maxPlayerHp);
  const power       = useGameStore((s) => s.power);
  const energy      = useGameStore((s) => s.energy);
  const maxEnergy   = useGameStore((s) => s.maxEnergy);
  const gold        = useGameStore((s) => s.gold);
  const shards      = useGameStore((s) => s.shards);
  const essence     = useGameStore((s) => s.essence);
  const inventory   = useGameStore((s) => s.inventory);
  const equipped    = useGameStore((s) => s.equipped);
  const activeBuffs = useGameStore((s) => s.activeBuffs);
  const advanceTick = useGameStore((s) => s.advanceTick);
  const train       = useGameStore((s) => s.train);
  const deepRest    = useGameStore((s) => s.deepRest);

  useEffect(() => {
    const id = setInterval(advanceTick, TICK_MS);
    return () => clearInterval(id);
  }, [advanceTick]);

  // Derived values
  const snap         = { power, maxEnergy, maxPlayerHp, equipped, activeBuffs };
  const totalPower   = effectivePower(snap);
  const totalEnergy  = effectiveMaxEnergy(snap);
  const totalMaxHp   = effectiveMaxHp(snap);
  const floorType    = getFloorType(depth);
  const enemyName    = getEnemyName(depth);
  const enemyMaxHp   = getEnemyMaxHp(depth);
  const typeLabel    = FLOOR_TYPE_LABEL[floorType];
  const typeColor    = FLOOR_TYPE_COLOR[floorType];

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

  const equippedCount  = Object.keys(equipped).length;

  return (
    <View style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>Echo Delves</Text>
        <Pressable style={styles.gearBtn} onPress={() => navigation.navigate('Inventory')}>
          <Text style={styles.gearBtnText}>
            Gear{inventory.length > 0 ? ` (${inventory.length})` : ''}
          </Text>
          {equippedCount > 0 && (
            <Text style={styles.equippedBadge}>{equippedCount}/7</Text>
          )}
        </Pressable>
      </View>

      {/* ── Enemy card ── */}
      <View style={[styles.card, floorType !== 'normal' && { borderColor: typeColor }]}>
        <View style={styles.enemyHeader}>
          <View style={styles.enemyNameRow}>
            {typeLabel && (
              <View style={[styles.typeBadge, { backgroundColor: typeColor }]}>
                <Text style={styles.typeBadgeText}>{typeLabel}</Text>
              </View>
            )}
            <Text style={[styles.enemyName, floorType !== 'normal' && { color: typeColor }]}>
              {enemyName}
            </Text>
          </View>
          <Text style={styles.depthLabel}>Floor {depth}</Text>
        </View>
        <HpBar
          current={Math.max(0, enemyHp)}
          max={enemyMaxHp}
          color="#ef4444"
          showNumbers
        />
      </View>

      {/* ── Player HP ── */}
      <View style={styles.card}>
        <HpBar current={playerHp} max={totalMaxHp} label="Player HP" showNumbers />
      </View>

      {/* ── Stats grid ── */}
      <View style={styles.statsGrid}>
        <StatCell label="Power"  value={totalPower  !== power   ? `${totalPower}  ▲` : `${power}`} />
        <StatCell label="Energy" value={`${energy}/${totalEnergy !== maxEnergy ? `${totalEnergy} ▲` : maxEnergy}`} />
        <StatCell label="Gold"   value={gold} />
        <StatCell label="Shards" value={shards} />
        {essence > 0 && <StatCell label="Essence" value={essence} />}
      </View>

      {/* ── Skills ── */}
      <SkillBar />

      {/* ── Upgrades ── */}
      <UpgradeRow upgrades={upgrades} />

      <StatusBar style="light" />
    </View>
  );
}

function StatCell({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={styles.statCell}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingTop: 52,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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

  // Cards
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
  },

  // Enemy card internals
  enemyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  enemyNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
  },
  typeBadge: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  typeBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  enemyName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    flexShrink: 1,
  },
  depthLabel: {
    color: colors.textMuted,
    fontSize: 12,
    marginLeft: spacing.sm,
  },

  // Stats grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  statCell: {
    width: '50%',
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderColor: colors.border,
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  statValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
});
