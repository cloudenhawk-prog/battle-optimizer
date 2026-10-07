// Cartethyia — Cartethyia form: Resonance Skill "Sword to Bear Their Names" (default / swap cancel).
import type { Action } from '../../../../../types/action'

// ========== Resonance Skill ==================================================================================================
export const cartethyia_skill: Action = {
  tags: ['SKILL'],
  name: 'Resonance Skill',
  displayName: 'Sword to Bear Their Names',
  category: 'Skills',
  castTime: 1, // TODO : Cast Time
  multiplier: (3 * 6.89 + 8.86) / 100,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 14,
  energyGenerated: [
    { energyType: 'energy', amount: 3 * 3.8 + 4.88, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 10, share: 0 },
    { energyType: 'forte_virtue', amount: 1, share: 0 },
  ],
  energyCost: [],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Aero Erosion', stackChange: 2 }],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'ANY',
    endState: 'AIR',
  },
  offtune: 3 * 0.17 + 0.22,
  groupName: 'Resonance Skill',
  variantName: 'Default',
}

export const cartethyia_skill_cancel_with_swap: Action = {
  tags: ['SKILL'],
  name: 'Resonance Skill (swap cancel)',
  displayName: 'Sword to Bear Their Names (swap cancel)',
  category: 'Skills',
  castTime: 0.09,
  multiplier: (3 * 6.89 + 8.86) / 100,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 14,
  energyGenerated: [
    { energyType: 'energy', amount: 3 * 3.8 + 4.88, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 10, share: 0 },
    { energyType: 'forte_virtue', amount: 1, share: 0 },
  ],
  energyCost: [],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Aero Erosion', stackChange: 2 }],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'ANY',
    swapOutState: 'PRESERVE', // TODO : Double Check
    endState: 'AIR',
    requiresSwapOut: true,
    persistenceTime: 1.05,
  },
  offtune: 3 * 0.17 + 0.22,
  groupName: 'Resonance Skill',
  variantName: 'Cancel With Swap',
}
