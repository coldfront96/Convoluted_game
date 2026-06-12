import type { GameState } from './types';
import { ENERGY_REGEN_EVERY, floorHP, goldReward, TRAIN_COST, DEEP_REST_COST, CHEST_DROP_EVERY, INVENTORY_CAP } from './constants';
import { computeEquipmentStats, generateChestDrop } from './items';

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function effectivePower(state: GameState): number {
  return state.power + computeEquipmentStats(state.equipped).bonusPower;
}

export function effectiveMaxEnergy(state: GameState): number {
  return state.maxEnergy + computeEquipmentStats(state.equipped).energyBonus;
}

// ─── Tick ─────────────────────────────────────────────────────────────────────

export function processTick(state: GameState): GameState {
  const next = { ...state, tickCount: state.tickCount + 1 };
  const eq = computeEquipmentStats(state.equipped);

  // Energy regen
  const maxEng = state.maxEnergy + eq.energyBonus;
  if (next.tickCount % ENERGY_REGEN_EVERY === 0 && next.energy < maxEng) {
    next.energy += 1;
  }

  // Auto-attack
  if (next.energy > 0) {
    const base = (state.power + eq.bonusPower) + ((next.tickCount + next.depth) % 3);
    // NOTE: Math.random() used here for solo play.
    // Tournament simulation replaces this path with seeded RNG.
    const isCrit = eq.critChance > 0 && Math.random() * 100 < eq.critChance;
    const damage = isCrit ? Math.floor((base * eq.critMultiplier) / 100) : base;
    next.energy   -= 1;
    next.enemyHp  -= damage;
  }

  // Enemy defeated
  if (next.enemyHp <= 0) {
    next.gold += goldReward(next.depth);
    if (next.depth % 5 === 0) next.shards += 1;

    // Chest drop at depth milestone (silently skip if inventory is full)
    if (next.depth % CHEST_DROP_EVERY === 0 && next.inventory.length < INVENTORY_CAP) {
      next.inventory = [...next.inventory, generateChestDrop(next.depth)];
    }

    next.depth   += 1;
    next.enemyHp = floorHP(next.depth);
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
