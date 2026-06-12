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

export type GameState = {
  tickCount: number;
  depth: number;
  enemyHp: number;
  playerHp: number;
  maxPlayerHp: number;
  power: number;
  energy: number;
  maxEnergy: number;
  gold: number;
  shards: number;
  essence: number;
  inventory: Item[];
  equipped: EquippedItems;
};
