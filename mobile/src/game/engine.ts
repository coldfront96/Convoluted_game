import type { GameState } from './types';
import {
  ENERGY_REGEN_EVERY, HP_REGEN_TICKS,
  TRAIN_COST, DEEP_REST_COST,
  CHEST_DROP_EVERY, INVENTORY_CAP,
} from './constants';
import { computeEquipmentStats, generateChestDrop } from './items';
import {
  getEnemyMaxHp, getFloorGold, getFloorShards,
  getCounterDamage, getCounterFreq, isBossChestFloor,
} from './dungeon';

// ─── Derived-stat helpers (used by UI) ────────────────────────────────────────

export function effectivePower(state: Pick<GameState, 'power' | 'equipped'>): number {
  return state.power + computeEquipmentStats(state.equipped).bonusPower;
}

export function effectiveMaxEnergy(state: Pick<GameState, 'maxEnergy' | 'equipped'>): number {
  return state.maxEnergy + computeEquipmentStats(state.equipped).energyBonus;
}

export function effectiveMaxHp(state: Pick<GameState, 'maxPlayerHp' | 'equipped'>): number {
  return state.maxPlayerHp + computeEquipmentStats(state.equipped).maxHpBonus;
}

// ─── Tick ─────────────────────────────────────────────────────────────────────

export function processTick(state: GameState): GameState {
  const next  = { ...state, tickCount: state.tickCount + 1 };
  const eq    = computeEquipmentStats(state.equipped);
  const maxHp = state.maxPlayerHp + eq.maxHpBonus;

  // 1. Energy regen
  const maxEng = state.maxEnergy + eq.energyBonus;
  if (next.tickCount % ENERGY_REGEN_EVERY === 0 && next.energy < maxEng) {
    next.energy += 1;
  }

  // 2. Passive HP regen
  if (next.tickCount % HP_REGEN_TICKS === 0 && next.playerHp < maxHp) {
    next.playerHp = Math.min(maxHp, next.playerHp + 1);
  }

  // 3. Auto-attack
  if (next.energy > 0) {
    const base = (state.power + eq.bonusPower) + ((next.tickCount + state.depth) % 3);
    // NOTE: Math.random() for solo play — tournament sim injects seeded RNG here.
    const isCrit = eq.critChance > 0 && Math.random() * 100 < eq.critChance;
    const dmg    = isCrit ? Math.floor((base * eq.critMultiplier) / 100) : base;
    next.energy  -= 1;
    next.enemyHp -= dmg;
  }

  // 4. Enemy counterattack (elite/boss floors only)
  const freq = getCounterFreq(state.depth);
  if (freq > 0 && next.tickCount % freq === 0 && next.enemyHp > 0) {
    const raw = getCounterDamage(state.depth);
    next.playerHp -= Math.max(1, raw - eq.defense);
  }

  // 5. Player death → retreat one floor, restore HP
  if (next.playerHp <= 0) {
    const retreat = Math.max(1, state.depth - 1);
    next.playerHp = maxHp;
    next.depth    = retreat;
    next.enemyHp  = getEnemyMaxHp(retreat);
    return next;
  }

  // 6. Enemy defeated
  if (next.enemyHp <= 0) {
    next.gold   += getFloorGold(state.depth);
    next.shards += getFloorShards(state.depth);

    const bossDrop      = isBossChestFloor(state.depth);
    const milestoneDrop = !bossDrop && state.depth % CHEST_DROP_EVERY === 0;
    if ((bossDrop || milestoneDrop) && next.inventory.length < INVENTORY_CAP) {
      next.inventory = [...next.inventory, generateChestDrop(state.depth)];
    }

    next.depth   += 1;
    next.enemyHp = getEnemyMaxHp(next.depth);
  }

  return next;
}

// ─── Upgrades ─────────────────────────────────────────────────────────────────

export function applyTrain(state: GameState): GameState {
  if (state.gold < TRAIN_COST) return state;
  return { ...state, gold: state.gold - TRAIN_COST, power: state.power + 1 };
}

export function applyDeepRest(state: GameState): GameState {
  if (state.shards < DEEP_REST_COST) return state;
  const maxEnergy = state.maxEnergy + 1;
  return { ...state, shards: state.shards - 1, maxEnergy, energy: maxEnergy };
}
