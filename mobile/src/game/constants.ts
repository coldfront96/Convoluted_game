import type { GameState } from './types';

export const TICK_MS = 1000;
export const ENERGY_REGEN_EVERY = 3;
export const TRAIN_COST = 20;
export const DEEP_REST_COST = 1;

export const floorHP = (depth: number) => 8 + depth * 4;
export const goldReward = (depth: number) => 6 + depth * 2;

export const INITIAL_STATE: GameState = {
  tickCount: 0,
  depth: 1,
  enemyHp: floorHP(1),
  power: 2,
  energy: 6,
  maxEnergy: 6,
  gold: 0,
  shards: 0,
};
