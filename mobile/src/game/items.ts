import type { Item, EquipmentSlot, Rarity, StatType, ItemStat, EquippedItems } from './types';

// ─── Display ──────────────────────────────────────────────────────────────────

export const RARITY_COLOR: Record<Rarity, string> = {
  common:    '#9ca3af',
  uncommon:  '#22c55e',
  rare:      '#3b82f6',
  epic:      '#a855f7',
  legendary: '#f97316',
};

export const RARITY_LABEL: Record<Rarity, string> = {
  common:    'Common',
  uncommon:  'Uncommon',
  rare:      'Rare',
  epic:      'Epic',
  legendary: 'Legendary',
};

export const SLOT_LABEL: Record<EquipmentSlot, string> = {
  weapon:  'Weapon',
  helmet:  'Helmet',
  chest:   'Chest',
  gloves:  'Gloves',
  boots:   'Boots',
  ring:    'Ring',
  amulet:  'Amulet',
};

export const ALL_SLOTS: EquipmentSlot[] = [
  'weapon', 'helmet', 'chest', 'gloves', 'boots', 'ring', 'amulet',
];

// ─── Stat formatting ──────────────────────────────────────────────────────────

export function statLabel(type: StatType): string {
  switch (type) {
    case 'power':          return 'Power';
    case 'critChance':     return 'Crit Chance';
    case 'critMultiplier': return 'Crit Damage';
    case 'energyBonus':    return 'Max Energy';
    case 'defense':        return 'Defense';
    case 'maxHp':          return 'Max HP';
  }
}

export function formatStatValue(type: StatType, value: number): string {
  switch (type) {
    case 'critChance':     return `+${value}%`;
    case 'critMultiplier': return `+${value}%`;
    default:               return `+${value}`;
  }
}

// ─── Generation tables ────────────────────────────────────────────────────────

// Which stats each slot can roll (ordered by weight — first = more likely)
const SLOT_STAT_POOL: Record<EquipmentSlot, StatType[]> = {
  weapon:  ['power', 'critChance', 'critMultiplier'],
  helmet:  ['maxHp', 'defense'],
  chest:   ['maxHp', 'defense', 'energyBonus'],
  gloves:  ['power', 'critChance', 'critMultiplier'],
  boots:   ['energyBonus', 'defense'],
  ring:    ['power', 'critChance', 'energyBonus'],
  amulet:  ['critMultiplier', 'maxHp', 'energyBonus'],
};

// Base stat value ranges at Common tier
const BASE_RANGES: Record<StatType, [number, number]> = {
  power:          [1,  3],
  critChance:     [1,  4],   // percentage points
  critMultiplier: [10, 25],  // percentage bonus on top of 100%
  energyBonus:    [1,  2],
  defense:        [1,  3],
  maxHp:          [10, 30],
};

const RARITY_SCALE: Record<Rarity, number> = {
  common:    1,
  uncommon:  1.6,
  rare:      2.5,
  epic:      4,
  legendary: 6.5,
};

// How many stats an item rolls
const RARITY_STAT_COUNT: Record<Rarity, number> = {
  common:    1,
  uncommon:  2,
  rare:      2,
  epic:      3,
  legendary: 4,
};

const BASE_NAMES: Record<EquipmentSlot, string[]> = {
  weapon:  ['Rusted Blade',  'Iron Sword',    'Steel Edge',     'Dark Fang',    'Void Cleaver'],
  helmet:  ['Rusted Cap',    'Iron Helm',     'Steel Coif',     'Shadow Hood',  'Void Crown'],
  chest:   ['Tattered Mail', 'Iron Plate',    'Steel Cuirass',  'Shadow Vest',  'Void Shroud'],
  gloves:  ['Worn Grips',    'Iron Gauntlets','Steel Grips',    'Shadow Wraps', 'Void Claws'],
  boots:   ['Worn Treads',   'Iron Boots',    'Steel Greaves',  'Shadow Steps', 'Void Striders'],
  ring:    ['Bent Band',     'Iron Ring',     'Silver Loop',    'Shadow Seal',  'Void Circle'],
  amulet:  ['Frayed Cord',   'Iron Pendant',  'Crystal Charm',  'Shadow Token', 'Void Eye'],
};

const RARITY_ORDER: Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

// ─── Generation helpers ───────────────────────────────────────────────────────

// rng defaults to Math.random for solo play.
// Tournament simulation passes a seeded function here for deterministic replays.
type RNG = () => number;

function randInt(min: number, max: number, rng: RNG): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function pickRandom<T>(arr: T[], rng: RNG): T {
  return arr[Math.floor(rng() * arr.length)];
}

const DROP_RARITY_TABLE: Array<{ minDepth: number; weights: number[] }> = [
  { minDepth: 1,  weights: [70, 28,  2,  0,  0] },
  { minDepth: 10, weights: [40, 40, 18,  2,  0] },
  { minDepth: 25, weights: [ 0, 35, 45, 18,  2] },
  { minDepth: 50, weights: [ 0, 10, 40, 35, 15] },
];

// ─── Public API ───────────────────────────────────────────────────────────────

export function generateItem(slot: EquipmentSlot, rarity: Rarity, rng: RNG = Math.random): Item {
  const scale      = RARITY_SCALE[rarity];
  const rarityIndex = RARITY_ORDER.indexOf(rarity);
  const statPool   = [...SLOT_STAT_POOL[slot]];
  const statCount  = Math.min(RARITY_STAT_COUNT[rarity], statPool.length);

  const pickedTypes: StatType[] = [];
  while (pickedTypes.length < statCount) {
    const candidate = pickRandom(statPool, rng);
    if (!pickedTypes.includes(candidate)) pickedTypes.push(candidate);
  }

  const stats: ItemStat[] = pickedTypes.map((type) => {
    const [baseMin, baseMax] = BASE_RANGES[type];
    const min = Math.max(1, Math.round(baseMin * scale));
    const max = Math.round(baseMax * scale);
    return { type, value: randInt(min, max, rng) };
  });

  const nameIndex = Math.min(rarityIndex, BASE_NAMES[slot].length - 1);

  return {
    id: `${slot}-${rarity}-${Date.now()}-${randInt(0, 99999, rng)}`,
    name: BASE_NAMES[slot][nameIndex],
    slot,
    rarity,
    stats,
  };
}

/**
 * Generates a chest drop appropriate for current depth.
 * rng is injectable — pass a seeded PRNG for tournament simulation.
 * Rarity thresholds are intentionally generous: earning gear should feel good.
 */
export function generateChestDrop(depth: number, rng: RNG = Math.random): Item {
  const slot = pickRandom(ALL_SLOTS, rng);

  // Find the highest minDepth tier that applies
  const tier = [...DROP_RARITY_TABLE]
    .reverse()
    .find((t) => depth >= t.minDepth)!;

  const totalWeight = tier.weights.reduce((a, b) => a + b, 0);
  let roll = rng() * totalWeight;
  let rarityIndex = 0;
  for (let i = 0; i < tier.weights.length; i++) {
    roll -= tier.weights[i];
    if (roll <= 0) { rarityIndex = i; break; }
  }

  return generateItem(slot, RARITY_ORDER[rarityIndex], rng);
}

// ─── Stat computation ─────────────────────────────────────────────────────────

export type EffectiveStats = {
  bonusPower: number;
  critChance: number;       // percentage, capped at 75
  critMultiplier: number;   // e.g. 150 means 1.5×
  energyBonus: number;
  defense: number;
  maxHpBonus: number;
};

export function computeEquipmentStats(equipped: EquippedItems): EffectiveStats {
  let bonusPower = 0;
  let critChance = 0;
  let critMultiplier = 0;
  let energyBonus = 0;
  let defense = 0;
  let maxHpBonus = 0;

  for (const item of Object.values(equipped)) {
    if (!item) continue;
    for (const stat of item.stats) {
      switch (stat.type) {
        case 'power':          bonusPower     += stat.value; break;
        case 'critChance':     critChance     += stat.value; break;
        case 'critMultiplier': critMultiplier += stat.value; break;
        case 'energyBonus':    energyBonus    += stat.value; break;
        case 'defense':        defense        += stat.value; break;
        case 'maxHp':          maxHpBonus     += stat.value; break;
      }
    }
  }

  return {
    bonusPower,
    critChance:     Math.min(critChance, 75),
    critMultiplier: 100 + critMultiplier,
    energyBonus,
    defense,
    maxHpBonus,
  };
}
