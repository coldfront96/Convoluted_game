import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { GameState } from '../game/types';
import { INITIAL_STATE } from '../game/constants';
import { processTick, applyTrain, applyDeepRest } from '../game/engine';

type GameActions = {
  advanceTick: () => void;
  train: () => void;
  deepRest: () => void;
};

type GameStore = GameState & GameActions;

export const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      ...INITIAL_STATE,
      advanceTick: () => set((state) => processTick(state)),
      train: () => set((state) => applyTrain(state)),
      deepRest: () => set((state) => applyDeepRest(state)),
    }),
    {
      name: 'echo-delves-save',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist game state, not action functions
      partialize: (state) => ({
        tickCount: state.tickCount,
        depth: state.depth,
        enemyHp: state.enemyHp,
        power: state.power,
        energy: state.energy,
        maxEnergy: state.maxEnergy,
        gold: state.gold,
        shards: state.shards,
      }),
    }
  )
);
