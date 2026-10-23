// Rover (Aero) — Resonance Skill 2 "Skyfall Severance", cast mid-air (default / swap cancel).
import type { Action } from '../../../../types/action'

// ========== Resonance Skill 2 ================================================================================================
export const roverAero_skill_2: Action = {
  tags: ['SKILL'],
  name: 'Resonance Skill 2',
  displayName: 'Skyfall Severance',
  category: 'Skills',
  castTime: 0.84,
  multiplier: (3 * 23.37 + 105.15) / 100,
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['SKILL'],
  cooldown: 12,
  energyGenerated: [
    { energyType: 'energy', amount: 3 * 0.34 + 1.5, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 5, share: 0 },
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'AIR',
    endState: 'AIR',
  },
  offtune: 3 * 0.11 + 0.48,
  groupName: 'Resonance Skill 2',
  variantName: 'Default'
}

export const roverAero_skill_2_cancel_with_swap: Action = {
  tags: ['SKILL'],
  name: 'Resonance Skill 2 (swap cancel)',
  displayName: 'Skyfall Severance (swap cancel)',
  category: 'Skills',
  castTime: 0.19,
  multiplier: (3 * 23.37 + 105.15) / 100,
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['SKILL'],
  cooldown: 12,
  energyGenerated: [
    { energyType: 'energy', amount: 3 * 0.34 + 1.5, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 5, share: 0 },
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'AIR',
    swapOutState: 'AIR',
    endState: 'AIR',
    requiresSwapOut: true,
    persistenceTime: 1 // TODO
  },
  offtune: 3 * 0.11 + 0.48,
  groupName: 'Resonance Skill 2',
  variantName: 'Cancel With Swap'
}
