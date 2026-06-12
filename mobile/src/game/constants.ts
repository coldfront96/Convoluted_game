import type { GameState } from './types';

export const TICK_MS            = 1000;
export const ENERGY_REGEN_EVERY = 3;
export const TRAIN_COST         = 20;
export const DEEP_REST_COST     = 1;
export const BASE_PLAYER_HP     = 100;
export const HP_REGEN_TICKS     = 5;

export const CHEST_DROP_EVERY   = 10;
export const INVENTORY_CAP      = 30;

export const floorHP    = (depth: number) => 8 + depth * 4;
export const goldReward = (depth: number) => 6 + depth * 2;

export const INITIAL_STATE: GameState = {
  tickCount:    0,
  depth:        1,
  enemyHp:      floorHP(1),
  playerHp:     BASE_PLAYER_HP,
  maxPlayerHp:  BASE_PLAYER_HP,
  power:        2,
  energy:       6,
  maxEnergy:    6,
  gold:         0,
  shards:       0,
  essence:      0,
  inventory:    [],
  equipped:     {},
  activeBuffs: {
    powerSurgeTicks:    0,
    powerSurgeBonus:    0,
    shieldCharges:      0,
    focusStrikeCharges: 0,
  },
  skillRanks:     { rend: 1 }, // Rend available from floor 1
  skillCooldowns: {},
};
