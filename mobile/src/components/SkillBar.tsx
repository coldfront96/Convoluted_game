import React from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { useGameStore } from '../store/useGameStore';
import { ALL_SKILL_IDS, SKILL_DEFS, rankUpCost } from '../game/skills';
import type { SkillId } from '../game/types';
import { colors, radius, spacing } from '../theme';

function SkillButton({ id }: { id: SkillId }) {
  const def          = SKILL_DEFS[id];
  const rank         = useGameStore((s) => s.skillRanks[id] ?? 0);
  const cd           = useGameStore((s) => s.skillCooldowns[id] ?? 0);
  const shards       = useGameStore((s) => s.shards);
  const depth        = useGameStore((s) => s.depth);
  const activate     = useGameStore((s) => s.activateSkill);
  const upgrade      = useGameStore((s) => s.upgradeSkill);

  const locked  = rank === 0;
  const ready   = !locked && cd === 0;
  const maxed   = rank >= def.maxRank;
  const upCost  = maxed ? 0 : rankUpCost(rank);

  const handlePress = () => {
    if (locked) return;

    if (cd > 0 || !ready) {
      // On cooldown — show info + upgrade option
      const upgradeText = maxed
        ? 'MAX RANK'
        : shards >= upCost
          ? `Upgrade to Rank ${rank + 1}  (${upCost} Shard${upCost !== 1 ? 's' : ''})`
          : `Upgrade  — need ${upCost} Shards (have ${shards})`;

      Alert.alert(
        `${def.name}  ·  Rank ${rank}`,
        def.describe(rank) + (cd > 0 ? `\n\nCooldown: ${cd}s` : ''),
        [
          { text: 'Close', style: 'cancel' },
          ...(maxed ? [] : [{
            text: upgradeText,
            onPress: () => upgrade(id),
            style: 'default' as const,
          }]),
        ],
      );
      return;
    }

    activate(id);
  };

  const handleLongPress = () => {
    if (locked) {
      Alert.alert(def.name, `Unlocks at Floor ${def.unlockDepth}.\n\n${def.describe(1)}`);
      return;
    }
    const upgradeText = maxed
      ? 'Already at MAX rank.'
      : shards >= upCost
        ? `Upgrade to Rank ${rank + 1} for ${upCost} shard${upCost !== 1 ? 's' : ''}?`
        : `Need ${upCost} shard${upCost !== 1 ? 's' : ''} to upgrade (have ${shards}).`;

    Alert.alert(
      `${def.name}  ·  Rank ${rank}/${def.maxRank}`,
      def.describe(rank) + '\n\n' + upgradeText,
      [
        { text: 'Close', style: 'cancel' },
        ...(!maxed && shards >= upCost
          ? [{ text: `Upgrade  (${upCost} shard${upCost !== 1 ? 's' : ''})`, onPress: () => upgrade(id) }]
          : []),
      ],
    );
  };

  return (
    <View style={styles.wrap}>
      <Pressable
        style={[
          styles.btn,
          ready   && styles.btnReady,
          locked  && styles.btnLocked,
          cd > 0  && styles.btnCooldown,
        ]}
        onPress={handlePress}
        onLongPress={handleLongPress}
      >
        <Text style={[styles.shortName, locked && styles.lockedText]}>
          {locked ? '?' : def.shortName}
        </Text>
        {!locked && rank > 1 && (
          <Text style={styles.rankDot}>{'●'.repeat(rank - 1)}</Text>
        )}
      </Pressable>

      <Text style={[
        styles.status,
        ready   && styles.statusReady,
        locked  && styles.statusLocked,
        cd > 0  && styles.statusCd,
      ]}>
        {locked
          ? `F${def.unlockDepth}`
          : cd > 0
            ? `${cd}s`
            : 'RDY'}
      </Text>
    </View>
  );
}

export function SkillBar() {
  return (
    <View style={styles.row}>
      {ALL_SKILL_IDS.map((id) => <SkillButton key={id} id={id} />)}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const BTN = 54;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xs,
  },
  wrap: {
    alignItems: 'center',
    gap: 4,
  },

  btn: {
    width: BTN,
    height: BTN,
    borderRadius: BTN / 2,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnReady: {
    borderColor: colors.accentLight,
    backgroundColor: '#1a2540',
  },
  btnLocked: {
    borderColor: '#1e2535',
    backgroundColor: '#13161e',
  },
  btnCooldown: {
    borderColor: colors.border,
    backgroundColor: colors.surface,
    opacity: 0.6,
  },

  shortName: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  lockedText: {
    color: '#3a3f50',
  },
  rankDot: {
    color: colors.accentLight,
    fontSize: 6,
    letterSpacing: 1,
    marginTop: 1,
  },

  status: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusReady: {
    color: colors.accentLight,
  },
  statusLocked: {
    color: '#3a3f50',
  },
  statusCd: {
    color: colors.textMuted,
  },
});
