import type { GameState, SkillId } from './types';
import { computeEquipmentStats } from './items';

// ─── Skill definitions ────────────────────────────────────────────────────────

export type SkillDef = {
  id:              SkillId;
  name:            string;
  shortName:       string; // 3-char label for button
  unlockDepth:     number;
  baseCooldown:    number; // ticks at rank 1
  maxRank:         number;
  describe:        (rank: number) => string;
};

export const ALL_SKILL_IDS: SkillId[] = [
  'rend', 'power_surge', 'shield_ward', 'blood_price', 'battle_focus',
];

export const SKILL_DEFS: Record<SkillId, SkillDef> = {
  rend: {
    id: 'rend', name: 'Rend', shortName: 'RND',
    unlockDepth: 1, baseCooldown: 12, maxRank: 5,
    describe: (r) => `Instant strike for ${(1.5 + r * 0.5).toFixed(1)}× power as damage.`,
  },
  power_surge: {
    id: 'power_surge', name: 'Power Surge', shortName: 'PWR',
    unlockDepth: 5, baseCooldown: 18, maxRank: 5,
    describe: (r) => `+${5 + r * 3} power for ${4 + r} ticks.`,
  },
  shield_ward: {
    id: 'shield_ward', name: 'Shield Ward', shortName: 'SHD',
    unlockDepth: 10, baseCooldown: 20, maxRank: 5,
    describe: (r) => `Block the next ${r} counterattack hit${r > 1 ? 's' : ''}.`,
  },
  blood_price: {
    id: 'blood_price', name: 'Blood Price', shortName: 'BLD',
    unlockDepth: 20, baseCooldown: 25, maxRank: 5,
    describe: (r) => `Sacrifice 20% HP to deal ${(1 + r * 0.4).toFixed(1)}× that as damage.`,
  },
  battle_focus: {
    id: 'battle_focus', name: 'Battle Focus', shortName: 'FCS',
    unlockDepth: 30, baseCooldown: 15, maxRank: 5,
    describe: (r) => `Next ${r} attack${r > 1 ? 's' : ''} guaranteed crit at 2× (stacks with gear).`,
  },
};

// Cooldown shortens slightly as rank increases
export function skillCooldown(id: SkillId, rank: number): number {
  return Math.max(5, SKILL_DEFS[id].baseCooldown - (rank - 1));
}

// Shard cost to upgrade from current rank to next
export function rankUpCost(currentRank: number): number {
  return currentRank; // rank 1→2 = 1 shard, 4→5 = 4 shards
}

// ─── Activation ───────────────────────────────────────────────────────────────

export function activateSkill(state: GameState, id: SkillId): GameState {
  const rank = state.skillRanks[id];
  if (!rank) return state;
  if ((state.skillCooldowns[id] ?? 0) > 0) return state;

  const cd = skillCooldown(id, rank);
  let next = {
    ...state,
    skillCooldowns: { ...state.skillCooldowns, [id]: cd },
  };

  switch (id) {
    case 'rend': {
      const eq  = computeEquipmentStats(state.equipped);
      const pow = state.power + eq.bonusPower +
        (state.activeBuffs.powerSurgeTicks > 0 ? state.activeBuffs.powerSurgeBonus : 0);
      const dmg = Math.floor(pow * (1.5 + rank * 0.5));
      next.enemyHp = state.enemyHp - dmg;
      break;
    }
    case 'power_surge': {
      next.activeBuffs = {
        ...state.activeBuffs,
        powerSurgeTicks: 4 + rank,
        powerSurgeBonus: 5 + rank * 3,
      };
      break;
    }
    case 'shield_ward': {
      next.activeBuffs = {
        ...state.activeBuffs,
        shieldCharges: state.activeBuffs.shieldCharges + rank,
      };
      break;
    }
    case 'blood_price': {
      const sacrifice = Math.floor(state.playerHp * 0.2);
      if (sacrifice < 1) break;
      const dmg = Math.floor(sacrifice * (1 + rank * 0.4));
      next.playerHp = state.playerHp - sacrifice;
      next.enemyHp  = state.enemyHp - dmg;
      break;
    }
    case 'battle_focus': {
      next.activeBuffs = {
        ...state.activeBuffs,
        focusStrikeCharges: state.activeBuffs.focusStrikeCharges + rank,
      };
      break;
    }
  }

  return next;
}

// ─── Per-tick updates ─────────────────────────────────────────────────────────

export function processSkillTick(state: GameState): GameState {
  // Decrement cooldowns
  const skillCooldowns: GameState['skillCooldowns'] = {};
  for (const [id, cd] of Object.entries(state.skillCooldowns) as [SkillId, number][]) {
    if (cd > 1) skillCooldowns[id] = cd - 1;
    // cd === 1 → becomes 0 (ready), so we just omit it
  }

  // Decrement Power Surge duration
  const powerSurgeTicks = Math.max(0, state.activeBuffs.powerSurgeTicks - 1);
  const activeBuffs =
    powerSurgeTicks === state.activeBuffs.powerSurgeTicks
      ? state.activeBuffs
      : {
          ...state.activeBuffs,
          powerSurgeTicks,
          // Clear bonus when surge expires
          powerSurgeBonus: powerSurgeTicks > 0 ? state.activeBuffs.powerSurgeBonus : 0,
        };

  return { ...state, skillCooldowns, activeBuffs };
}

// Unlock skills when depth threshold is reached (called after floor advance)
export function unlockNewSkills(state: GameState): GameState {
  let changed = false;
  const skillRanks = { ...state.skillRanks };
  for (const def of Object.values(SKILL_DEFS)) {
    if (!skillRanks[def.id] && state.depth >= def.unlockDepth) {
      skillRanks[def.id] = 1;
      changed = true;
    }
  }
  return changed ? { ...state, skillRanks } : state;
}

// Auto-fire every ready skill in order — this is "bot" behaviour.
// Human players can outperform the bot by timing skills (e.g. holding
// Shield Ward for when a boss counterattack fires).
export function autoActivateSkills(state: GameState): GameState {
  let next = state;
  for (const id of ALL_SKILL_IDS) {
    if (!next.skillRanks[id]) continue;
    if ((next.skillCooldowns[id] ?? 0) === 0) {
      next = activateSkill(next, id);
    }
  }
  return next;
}

// ─── Upgrade ──────────────────────────────────────────────────────────────────

export function applySkillUpgrade(state: GameState, id: SkillId): GameState {
  const rank = state.skillRanks[id];
  if (!rank) return state;
  const def  = SKILL_DEFS[id];
  if (rank >= def.maxRank) return state;
  const cost = rankUpCost(rank);
  if (state.shards < cost) return state;
  return {
    ...state,
    shards:     state.shards - cost,
    skillRanks: { ...state.skillRanks, [id]: rank + 1 },
  };
}
