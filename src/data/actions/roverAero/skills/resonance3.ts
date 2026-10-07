// Rover (Aero) — Resonance Skill 3 "Unbound Flow", spends 120 forte (default / two swap-cancel timings).
import type { Action } from '../../../../types/action'

// ========== Resonance Skill 3 ================================================================================================
export const roverAero_skill_3: Action = {
  tags: ['SKILL', 'HEAL_PROC'],
  name: 'Resonance Skill 3',
  displayName: 'Unbound Flow 1-2',
  category: 'Skills',
  castTime: 1.67,
  multiplier: (1.3 * (5 * 34.3 + 723.03)) / 100,
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['SKILL'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 5 * 2.0 + 20, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 40, share: 0 },
  ],
  energyCost: [{ energyType: 'forte', amount: 120 }],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'GROUND',
    endState: 'GROUND',
  },
  offtune: 5 * 0.6 + 2.83,
  groupName: 'Resonance Skill 3',
  variantName: 'Default'
}

export const roverAero_skill_3_cancel_with_swap_1: Action = {
  tags: ['SKILL', 'HEAL_PROC'],
  name: 'Resonance Skill 3 (swap cancel 1)',
  displayName: 'Unbound Flow 1-2 (swap cancel 1)',
  category: 'Skills',
  castTime: 0.17,
  multiplier: (1.3 * (5 * 34.3 + 723.03)) / 100,
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['SKILL'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 5 * 2.0 + 20, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 40, share: 0 },
  ],
  energyCost: [{ energyType: 'forte', amount: 120 }],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'GROUND',
    swapOutState: 'GROUND',
    endState: 'GROUND',
    requiresSwapOut: true,
    persistenceTime: 1 // TODO
  },
  offtune: 5 * 0.6 + 2.83,
  groupName: 'Resonance Skill 3',
  variantName: 'Cancel With Swap 1'
}

export const roverAero_skill_3_cancel_with_swap_2: Action = {
  tags: ['SKILL', 'HEAL_PROC'],
  name: 'Resonance Skill 3 (swap cancel 2)',
  displayName: 'Unbound Flow 1-2 (swap cancel 2)',
  category: 'Skills',
  castTime: 1.33,
  multiplier: (1.3 * (5 * 34.3 + 723.03)) / 100,
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['SKILL'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 5 * 2.0 + 20, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 40, share: 0 },
  ],
  energyCost: [{ energyType: 'forte', amount: 120 }],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'GROUND',
    swapOutState: 'GROUND',
    endState: 'GROUND',
    requiresSwapOut: true,
    persistenceTime: 1.33 // TODO
  },
  offtune: 5 * 0.6 + 2.83,
  groupName: 'Resonance Skill 3',
  variantName: 'Cancel With Swap 2'
}
