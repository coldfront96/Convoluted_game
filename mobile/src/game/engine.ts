import type { GameState } from './types';
import { ENERGY_REGEN_EVERY, floorHP, goldReward, TRAIN_COST, DEEP_REST_COST } from './constants';

export function processTick(state: GameState): GameState {
  const next = { ...state, tickCount: state.tickCount + 1 };

  if (next.tickCount % ENERGY_REGEN_EVERY === 0 && next.energy < next.maxEnergy) {
    next.energy += 1;
  }

  if (next.energy > 0) {
    const damage = next.power + ((next.tickCount + next.depth) % 3);
    next.energy -= 1;
    next.enemyHp -= damage;
  }

  if (next.enemyHp <= 0) {
    next.gold += goldReward(next.depth);
    if (next.depth % 5 === 0) next.shards += 1;
    next.depth += 1;
    next.enemyHp = floorHP(next.depth);
  }

  return next;
}

export function applyTrain(state: GameState): GameState {
  if (state.gold < TRAIN_COST) return state;
  return { ...state, gold: state.gold - TRAIN_COST, power: state.power + 1 };
}

export function applyDeepRest(state: GameState): GameState {
  if (state.shards < DEEP_REST_COST) return state;
  const maxEnergy = state.maxEnergy + 1;
  return { ...state, shards: state.shards - 1, maxEnergy, energy: maxEnergy };
}
