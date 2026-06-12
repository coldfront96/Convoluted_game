import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { GameState, Item, EquipmentSlot } from '../game/types';
import { INITIAL_STATE } from '../game/constants';
import { processTick, applyTrain, applyDeepRest } from '../game/engine';

type GameActions = {
  advanceTick: () => void;
  train:       () => void;
  deepRest:    () => void;
  equipItem:   (item: Item) => void;
  unequipItem: (slot: EquipmentSlot) => void;
};

type GameStore = GameState & GameActions;

export const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      ...INITIAL_STATE,

      advanceTick: () => set((s) => processTick(s)),
      train:       () => set((s) => applyTrain(s)),
      deepRest:    () => set((s) => applyDeepRest(s)),

      equipItem: (item: Item) =>
        set((s) => {
          // Remove item from inventory
          const inventory = s.inventory.filter((i) => i.id !== item.id);
          // If something is already in that slot, bump it back to inventory
          const displaced = s.equipped[item.slot];
          if (displaced) inventory.push(displaced);
          return {
            inventory,
            equipped: { ...s.equipped, [item.slot]: item },
          };
        }),

      unequipItem: (slot: EquipmentSlot) =>
        set((s) => {
          const item = s.equipped[slot];
          if (!item) return s;
          const equipped = { ...s.equipped };
          delete equipped[slot];
          return { equipped, inventory: [...s.inventory, item] };
        }),
    }),
    {
      name: 'echo-delves-save',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s): GameState => ({
        tickCount:   s.tickCount,
        depth:       s.depth,
        enemyHp:     s.enemyHp,
        playerHp:    s.playerHp,
        maxPlayerHp: s.maxPlayerHp,
        power:       s.power,
        energy:      s.energy,
        maxEnergy:   s.maxEnergy,
        gold:        s.gold,
        shards:      s.shards,
        essence:     s.essence,
        inventory:   s.inventory,
        equipped:    s.equipped,
      }),
    }
  )
);
