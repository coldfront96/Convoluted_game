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
import {
  processSkillTick, unlockNewSkills, autoActivateSkills,
} from './skills';

// ─── Derived-stat helpers (used by UI) ────────────────────────────────────────

export function effectivePower(
  state: Pick<GameState, 'power' | 'equipped' | 'activeBuffs'>,
): number {
  const eq    = computeEquipmentStats(state.equipped);
  const surge = state.activeBuffs.powerSurgeTicks > 0 ? state.activeBuffs.powerSurgeBonus : 0;
  return state.power + eq.bonusPower + surge;
}

export function effectiveMaxEnergy(
  state: Pick<GameState, 'maxEnergy' | 'equipped'>,
): number {
  return state.maxEnergy + computeEquipmentStats(state.equipped).energyBonus;
}

export function effectiveMaxHp(
  state: Pick<GameState, 'maxPlayerHp' | 'equipped'>,
): number {
  return state.maxPlayerHp + computeEquipmentStats(state.equipped).maxHpBonus;
}

// ─── Tick ─────────────────────────────────────────────────────────────────────

export function processTick(state: GameState): GameState {
  // 0. Skill cooldowns + auto-activate (bot fires as soon as cooldown = 0)
  let next = processSkillTick({ ...state, tickCount: state.tickCount + 1 });
  next = autoActivateSkills(next);

  const eq    = computeEquipmentStats(next.equipped);
  const maxHp = next.maxPlayerHp + eq.maxHpBonus;

  // 1. Energy regen
  const maxEng = next.maxEnergy + eq.energyBonus;
  if (next.tickCount % ENERGY_REGEN_EVERY === 0 && next.energy < maxEng) {
    next = { ...next, energy: next.energy + 1 };
  }

  // 2. Passive HP regen
  if (next.tickCount % HP_REGEN_TICKS === 0 && next.playerHp < maxHp) {
    next = { ...next, playerHp: Math.min(maxHp, next.playerHp + 1) };
  }

  // 3. Auto-attack
  if (next.energy > 0) {
    const hasFocus = next.activeBuffs.focusStrikeCharges > 0;
    const pow      = effectivePower(next);
    const base     = pow + ((next.tickCount + next.depth) % 3);
    // NOTE: Math.random() for solo play — tournament sim injects seeded RNG.
    const isCrit   = hasFocus || (eq.critChance > 0 && Math.random() * 100 < eq.critChance);
    const critMult = hasFocus ? Math.max(200, eq.critMultiplier) : eq.critMultiplier;
    const dmg      = isCrit ? Math.floor((base * critMult) / 100) : base;

    next = {
      ...next,
      energy:  next.energy - 1,
      enemyHp: next.enemyHp - dmg,
      activeBuffs: hasFocus
        ? { ...next.activeBuffs, focusStrikeCharges: next.activeBuffs.focusStrikeCharges - 1 }
        : next.activeBuffs,
    };
  }

  // 4. Enemy counterattack (elite/boss only)
  const freq = getCounterFreq(next.depth);
  if (freq > 0 && next.tickCount % freq === 0 && next.enemyHp > 0) {
    const raw = getCounterDamage(next.depth);

    if (next.activeBuffs.shieldCharges > 0) {
      // Shield Ward absorbs the hit
      next = {
        ...next,
        activeBuffs: { ...next.activeBuffs, shieldCharges: next.activeBuffs.shieldCharges - 1 },
      };
    } else {
      next = { ...next, playerHp: next.playerHp - Math.max(1, raw - eq.defense) };
    }
  }

  // 5. Player death → retreat one floor, restore HP
  if (next.playerHp <= 0) {
    const retreat = Math.max(1, next.depth - 1);
    next = {
      ...next,
      playerHp: maxHp,
      depth:    retreat,
      enemyHp:  getEnemyMaxHp(retreat),
    };
    return next;
  }

  // 6. Enemy defeated
  if (next.enemyHp <= 0) {
    const clearedDepth = next.depth;
    next = {
      ...next,
      gold:   next.gold + getFloorGold(clearedDepth),
      shards: next.shards + getFloorShards(clearedDepth),
    };

    const bossDrop      = isBossChestFloor(clearedDepth);
    const milestoneDrop = !bossDrop && clearedDepth % CHEST_DROP_EVERY === 0;
    if ((bossDrop || milestoneDrop) && next.inventory.length < INVENTORY_CAP) {
      next = { ...next, inventory: [...next.inventory, generateChestDrop(clearedDepth)] };
    }

    const newDepth = clearedDepth + 1;
    next = { ...next, depth: newDepth, enemyHp: getEnemyMaxHp(newDepth) };
    next = unlockNewSkills(next);
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
