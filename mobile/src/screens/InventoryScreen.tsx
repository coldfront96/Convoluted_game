import React from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useGameStore } from '../store/useGameStore';
import { colors, spacing, radius } from '../theme';
import {
  ALL_SLOTS,
  RARITY_COLOR,
  RARITY_LABEL,
  SLOT_LABEL,
  statLabel,
  formatStatValue,
} from '../game/items';
import type { Item, EquipmentSlot } from '../game/types';

// ─── Sub-components ───────────────────────────────────────────────────────────

function SlotRow({ slot }: { slot: EquipmentSlot }) {
  const equipped = useGameStore((s) => s.equipped[slot]);
  const unequipItem = useGameStore((s) => s.unequipItem);

  return (
    <Pressable
      style={styles.slotRow}
      onPress={() => equipped && unequipItem(slot)}
    >
      <Text style={styles.slotLabel}>{SLOT_LABEL[slot]}</Text>
      {equipped ? (
        <View style={styles.slotFilled}>
          <Text style={[styles.slotItemName, { color: RARITY_COLOR[equipped.rarity] }]}>
            {equipped.name}
          </Text>
          <Text style={styles.slotHint}>tap to unequip</Text>
        </View>
      ) : (
        <Text style={styles.slotEmpty}>— empty —</Text>
      )}
    </Pressable>
  );
}

function ItemCard({ item }: { item: Item }) {
  const equipItem = useGameStore((s) => s.equipItem);
  const rarityColor = RARITY_COLOR[item.rarity];

  return (
    <View style={[styles.itemCard, { borderColor: rarityColor }]}>
      <View style={styles.itemHeader}>
        <Text style={[styles.itemName, { color: rarityColor }]}>{item.name}</Text>
        <Text style={[styles.itemBadge, { color: rarityColor }]}>
          {RARITY_LABEL[item.rarity]}
        </Text>
      </View>
      <Text style={styles.itemSlot}>{SLOT_LABEL[item.slot]}</Text>
      <View style={styles.statsRow}>
        {item.stats.map((stat) => (
          <Text key={stat.type} style={styles.statChip}>
            {statLabel(stat.type)} {formatStatValue(stat.type, stat.value)}
          </Text>
        ))}
      </View>
      <Pressable style={styles.equipBtn} onPress={() => equipItem(item)}>
        <Text style={styles.equipBtnText}>Equip</Text>
      </Pressable>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export function InventoryScreen() {
  const navigation = useNavigation();
  const inventory = useGameStore((s) => s.inventory);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Equipment</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Equipped slots */}
        <Text style={styles.sectionTitle}>Equipped</Text>
        <View style={styles.slotsCard}>
          {ALL_SLOTS.map((slot) => (
            <SlotRow key={slot} slot={slot} />
          ))}
        </View>

        {/* Inventory */}
        <Text style={styles.sectionTitle}>
          Inventory{inventory.length > 0 ? ` (${inventory.length})` : ''}
        </Text>

        {inventory.length === 0 ? (
          <Text style={styles.emptyHint}>
            Defeat enemies to earn gear — chests drop every 10 floors.
          </Text>
        ) : (
          inventory.map((item) => <ItemCard key={item.id} item={item} />)
        )}

        <View style={{ height: spacing.xl }} />
      </ScrollView>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  backBtn: {
    paddingVertical: 4,
  },
  backText: {
    color: colors.accentLight,
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
  },
  sectionTitle: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },

  // Equipped slots
  slotsCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  slotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  slotLabel: {
    color: colors.textMuted,
    width: 68,
    fontSize: 14,
  },
  slotFilled: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  slotItemName: {
    fontSize: 14,
    fontWeight: '600',
  },
  slotHint: {
    color: colors.textMuted,
    fontSize: 11,
  },
  slotEmpty: {
    color: colors.border,
    fontSize: 13,
    fontStyle: 'italic',
  },

  // Inventory item cards
  itemCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
  },
  itemBadge: {
    fontSize: 12,
    fontWeight: '600',
  },
  itemSlot: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  statChip: {
    color: colors.text,
    backgroundColor: '#1e2535',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    fontSize: 12,
    fontWeight: '500',
  },
  equipBtn: {
    backgroundColor: colors.accent,
    borderRadius: radius.sm,
    paddingVertical: 8,
    alignItems: 'center',
  },
  equipBtnText: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 13,
  },

  emptyHint: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    marginTop: spacing.lg,
    lineHeight: 22,
  },
});
