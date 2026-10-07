// Rover (Aero) — Resonance Skill 1 "Awakening Gale": launches into the air (default / swap cancel).
import type { Action } from '../../../../types/action'

// ========== Resonance Skill 1 ================================================================================================
export const roverAero_skill_1: Action = {
  tags: ['SKILL'],
  name: 'Resonance Skill 1',
  displayName: 'Awakening Gale',
  category: 'Skills',
  castTime: 1.0,
  multiplier: (66.44 + 99.66) / 100,
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['SKILL'],
  cooldown: 3,
  energyGenerated: [
    { energyType: 'energy', amount: 2.0 + 3.0, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 10, share: 0 },
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'GROUND',
    endState: 'AIR',
  },
  offtune: 0.76,
  groupName: 'Resonance Skill 1',
  variantName: 'Default'
}

export const roverAero_skill_1_cancel_with_swap: Action = {
  tags: ['SKILL'],
  name: 'Resonance Skill 1 (swap cancel)',
  displayName: 'Awakening Gale (swap cancel)',
  category: 'Skills',
  castTime: 0.15,
  multiplier: (66.44 + 99.66) / 100,
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['SKILL'],
  cooldown: 3,
  energyGenerated: [
    { energyType: 'energy', amount: 2.0 + 3.0, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 10, share: 0 },
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'GROUND',
    swapOutState: 'GROUND',
    endState: 'AIR',
    requiresSwapOut: true,
    persistenceTime: 1.4
  },
  offtune: 0.76,
  groupName: 'Resonance Skill 1',
  variantName: 'Cancel With Swap'
}
