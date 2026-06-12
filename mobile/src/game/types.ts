export type FloorType = 'normal' | 'elite' | 'boss';

export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export type EquipmentSlot = 'weapon' | 'helmet' | 'chest' | 'gloves' | 'boots' | 'ring' | 'amulet';

export type StatType =
  | 'power'
  | 'critChance'
  | 'critMultiplier'
  | 'energyBonus'
  | 'defense'
  | 'maxHp';

export type ItemStat = {
  type: StatType;
  value: number;
};

export type Item = {
  id: string;
  name: string;
  slot: EquipmentSlot;
  rarity: Rarity;
  stats: ItemStat[];
};

export type EquippedItems = Partial<Record<EquipmentSlot, Item>>;

// ─── Skills ───────────────────────────────────────────────────────────────────

export type SkillId =
  | 'rend'
  | 'power_surge'
  | 'shield_ward'
  | 'blood_price'
  | 'battle_focus';

export type ActiveBuffs = {
  powerSurgeTicks:    number;  // ticks remaining on Power Surge
  powerSurgeBonus:    number;  // flat power added while surge is active
  shieldCharges:      number;  // counterattack hits still absorbed
  focusStrikeCharges: number;  // guaranteed-crit attacks remaining
};

// ─── GameState ────────────────────────────────────────────────────────────────

export type GameState = {
  tickCount:      number;
  depth:          number;
  enemyHp:        number;
  playerHp:       number;
  maxPlayerHp:    number;
  power:          number;
  energy:         number;
  maxEnergy:      number;
  gold:           number;
  shards:         number;
  essence:        number;
  inventory:      Item[];
  equipped:       EquippedItems;
  activeBuffs:    ActiveBuffs;
  skillRanks:     Partial<Record<SkillId, number>>;
  skillCooldowns: Partial<Record<SkillId, number>>;
};
