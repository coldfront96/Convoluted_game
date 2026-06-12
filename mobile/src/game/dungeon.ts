import type { FloorType } from './types';
import { floorHP } from './constants';

// ─── Floor classification ─────────────────────────────────────────────────────

export const BOSS_EVERY  = 10;
export const ELITE_EVERY = 5;

export function getFloorType(depth: number): FloorType {
  if (depth % BOSS_EVERY  === 0) return 'boss';
  if (depth % ELITE_EVERY === 0) return 'elite';
  return 'normal';
}

// ─── Enemy HP ─────────────────────────────────────────────────────────────────

const HP_MULT: Record<FloorType, number> = { normal: 1, elite: 2.5, boss: 6 };

export function getEnemyMaxHp(depth: number): number {
  return Math.round(floorHP(depth) * HP_MULT[getFloorType(depth)]);
}

// ─── Enemy counterattack ──────────────────────────────────────────────────────

// Damage the enemy deals per counterattack event (0 = no counterattack)
export function getCounterDamage(depth: number): number {
  const t = getFloorType(depth);
  if (t === 'normal') return 0;
  if (t === 'elite')  return 1 + Math.floor(depth / 10);
  return 3 + Math.floor(depth / 5); // boss
}

// How often the enemy counterattacks (every N game ticks; 0 = never)
export function getCounterFreq(depth: number): number {
  const t = getFloorType(depth);
  if (t === 'normal') return 0;
  if (t === 'elite')  return 4;
  return 2; // boss
}

// ─── Rewards ──────────────────────────────────────────────────────────────────

export function getFloorGold(depth: number): number {
  const base = 6 + depth * 2;
  const t = getFloorType(depth);
  if (t === 'elite') return Math.round(base * 1.5);
  if (t === 'boss')  return base * 3;
  return base;
}

export function getFloorShards(depth: number): number {
  const t = getFloorType(depth);
  if (t === 'boss')             return 2;
  if (depth % 5 === 0)          return 1;
  return 0;
}

// Boss floors always drop a chest (in addition to the CHEST_DROP_EVERY cadence)
export function isBossChestFloor(depth: number): boolean {
  return getFloorType(depth) === 'boss';
}

// ─── Enemy names ─────────────────────────────────────────────────────────────

const NORMAL_POOL: string[][] = [
  ['Goblin Scrapper', 'Cave Rat',       'Dark Imp',        'Skeleton Archer',  'Cursed Cultist'],
  ['Orc Marauder',    'Shadow Fiend',   'Bone Knight',     'Plague Wraith',    'Stone Golem'],
  ['Void Stalker',    'Arcane Horror',  'Dusk Revenant',   'Spectral Titan',   'Corrupted Mage'],
  ['Abyss Spawn',     'Void Reaper',    'Chaos Demon',     'Death Colossus',   'Ethereal Horror'],
];

const ELITE_PREFIXES = ['Enraged', 'Cursed', 'Ancient', 'Forsaken', 'Hollow'];

const BOSS_NAMES = [
  'The Dungeon Warden',
  'The Hollow King',
  'The Plague Harbinger',
  'The Void Sentinel',
  'The Abyss Lord',
  'The Forgotten Tyrant',
  'The Bone Colossus',
  'The Shadow Sovereign',
  'The Chaos Engine',
  'The Death Weaver',
  'The Abyssal Throne',
  'The Corrupted Oracle',
];

function tierForDepth(depth: number): number {
  if (depth < 10)  return 0;
  if (depth < 25)  return 1;
  if (depth < 50)  return 2;
  return 3;
}

export function getEnemyName(depth: number): string {
  const t = getFloorType(depth);

  if (t === 'boss') {
    const idx = Math.floor(depth / BOSS_EVERY) - 1;
    return BOSS_NAMES[idx % BOSS_NAMES.length];
  }

  const pool = NORMAL_POOL[tierForDepth(depth)];
  const name = pool[depth % pool.length];

  if (t === 'elite') {
    const pfx = ELITE_PREFIXES[Math.floor(depth / ELITE_EVERY) % ELITE_PREFIXES.length];
    return `${pfx} ${name}`;
  }

  return name;
}

// ─── Floor type UI helpers ────────────────────────────────────────────────────

export const FLOOR_TYPE_COLOR: Record<FloorType, string> = {
  normal: 'transparent',
  elite:  '#a855f7',
  boss:   '#f97316',
};

export const FLOOR_TYPE_LABEL: Record<FloorType, string | null> = {
  normal: null,
  elite:  'ELITE',
  boss:   'BOSS',
};
