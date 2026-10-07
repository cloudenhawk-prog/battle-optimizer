// Cartethyia — Fleurdelys form: Resonance Skill 1 "Sword to Answer Waves' Call" (default / swap cancel).
import type { Action } from '../../../../../types/action'

// ========== Resonance Skill 1 ================================================================================================
export const fleurdelys_skill_1: Action = {
  tags: ['SKILL'],
  name: 'Resonance Skill 1',
  displayName: 'Sword to Answer Waves Call',
  category: 'Skills',
  castTime: 0.9, // TODO
  multiplier: (4 * 1.86 + 17.36) / 100,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['SKILL'],
  cooldown: 14,
  energyGenerated: [
    { energyType: 'energy', amount: 4 * 0.18 + 1.61, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 10, share: 0 },
    { energyType: 'conviction', amount: 13.34, share: 0 },
  ],
  energyCost: [],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Aero Erosion', stackChange: 2 }],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'ANY',
    endState: 'AIR',
  },
  offtune: 4 * 0.06 + 0.51,
  groupName: 'Resonance Skill 1',
  variantName: 'Default',
}

export const fleurdelys_skill_1_cancel_with_swap: Action = {
  tags: ['SKILL'],
  name: 'Resonance Skill 1 (swap cancel)',
  displayName: 'Sword to Answer Waves Call (swap cancel)',
  category: 'Skills',
  castTime: 0.9, // TODO
  multiplier: (4 * 1.86 + 17.36) / 100,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['SKILL'],
  cooldown: 14,
  energyGenerated: [
    { energyType: 'energy', amount: 4 * 0.18 + 1.61, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 10, share: 0 },
    { energyType: 'conviction', amount: 13.34, share: 0 },
  ],
  energyCost: [],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Aero Erosion', stackChange: 2 }],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'ANY',
    swapOutState: 'GROUND', // TODO : Double Check
    endState: 'AIR',
    requiresSwapOut: true,
    persistenceTime: 100, // TODO : Persistence Time
  },
  offtune: 4 * 0.06 + 0.51,
  groupName: 'Resonance Skill 1',
  variantName: 'Cancel With Swap',
}
