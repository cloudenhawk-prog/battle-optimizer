// Cartethyia — Cartethyia form: Heavy Attack (default / swap cancel).
import type { Action } from '../../../../../types/action'

// ========== Heavy Attack =====================================================================================================
export const cartethyia_heavy: Action = {
  tags: ['HEAVY_ATTACK'],
  name: 'Heavy Attack',
  displayName: 'Heavy Attack',
  category: 'Basics',
  castTime: 1,
  multiplier: (1.5 * (3 * 2.08 + 6.24)) / 100,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 3 * 0.42 + 1.25, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 3 * 0.59 + 1.75, share: 0 },
    { energyType: 'forte_discord', amount: 1, share: 0 },
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'ANY',
    endState: 'PRESERVE',
  },
  offtune: 3 * 0.13 + 0.4,
  groupName: 'Heavy Attack',
  variantName: 'Default',
}

export const cartethyia_heavy_cancel_with_swap: Action = {
  tags: ['HEAVY_ATTACK'],
  name: 'Heavy Attack (swap cancel)',
  displayName: 'Heavy Attack (swap cancel)',
  category: 'Basics',
  castTime: 0.12,
  multiplier: (1.5 * (3 * 2.08 + 6.24)) / 100,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 3 * 0.42 + 1.25, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 3 * 0.59 + 1.75, share: 0 },
    { energyType: 'forte_discord', amount: 1, share: 0 },
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'ANY',
    swapOutState: 'PRESERVE', // TODO : Double Check
    endState: 'PRESERVE',
    requiresSwapOut: true,
    persistenceTime: 100, // TODO : Persistence Time
  },
  offtune: 3 * 0.13 + 0.4,
  groupName: 'Heavy Attack',
  variantName: 'Cancel With Swap',
}
