// Ciaccona — Resonance Skill "Harmonic Allegro" (default / swap cancel).
import type { Action } from '../../../../types/action'

// ========== Resonance Skill ==================================================================================================
export const ciaccona_skill: Action = {
  tags: ['SKILL', 'AERO_EROSION_APPLIER'],
  name: 'Resonance Skill',
  displayName: 'Harmonic Allegro',
  category: 'Skills',
  castTime: 0.65,
  multiplier: (4 * 40.39) / 100,
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['SKILL'],
  cooldown: 10,
  energyGenerated: [
    { energyType: 'energy', amount: 4 * 2.4, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 15, share: 0 },
  ],
  energyCost: [],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Aero Erosion', stackChange: 1 }],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'ANY',
    endState: 'PRESERVE',
  },
  offtune: 4 * 0.13,
  groupName: 'Resonance Skill',
  variantName: 'Default'
}

export const ciaccona_skill_cancel_with_swap: Action = {
  tags: ['SKILL', 'AERO_EROSION_APPLIER'],
  name: 'Resonance Skill (swap cancel)',
  displayName: 'Harmonic Allegro (swap cancel)',
  category: 'Skills',
  castTime: 0.15,
  multiplier: (4 * 40.39) / 100,
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['SKILL'],
  cooldown: 10,
  energyGenerated: [
    { energyType: 'energy', amount: 4 * 2.4, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 15, share: 0 },
  ],
  energyCost: [],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Aero Erosion', stackChange: 1 }],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'ANY',
    swapOutState: 'PRESERVE',
    endState: 'PRESERVE',
    requiresSwapOut: true,
    persistenceTime: 100 // TODO : Persistence Time
  },
  offtune: 4 * 0.13,
  groupName: 'Resonance Skill',
  variantName: 'Cancel With Swap'
}
