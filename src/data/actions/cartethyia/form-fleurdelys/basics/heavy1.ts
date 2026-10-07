// Cartethyia — Fleurdelys form: Heavy Attack 1 (default / swap cancel).
import type { Action } from '../../../../../types/action'

// ========== Heavy Attack 1 ===================================================================================================
export const fleurdelys_heavy_1: Action = {
  tags: ['HEAVY_ATTACK'],
  name: 'Heavy Attack 1',
  displayName: 'Heavy Attack 1',
  category: 'Basics',
  castTime: 0.65, // TODO
  multiplier: (4.28 + 9.97) / 100,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 0.53 + 1.23, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 0.74 + 1.72, share: 0 },
    { energyType: 'conviction', amount: 10, share: 0 },
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'GROUND',
    endState: 'GROUND',
  },
  offtune: 0.17 + 0.39,
  groupName: 'Heavy Attack 1',
  variantName: 'Default',
}

export const fleurdelys_heavy_1_cancel_with_swap: Action = {
  tags: ['HEAVY_ATTACK'],
  name: 'Heavy Attack 1 (swap cancel)',
  displayName: 'Heavy Attack 1 (swap cancel)',
  category: 'Basics',
  castTime: 0.65, // TODO
  multiplier: (4.28 + 9.97) / 100,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 0.53 + 1.23, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 0.74 + 1.72, share: 0 },
    { energyType: 'conviction', amount: 10, share: 0 },
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'GROUND',
    swapOutState: 'GROUND', // TODO : Double Check
    endState: 'GROUND',
    requiresSwapOut: true,
    persistenceTime: 100, // TODO : Persistence Time
  },
  offtune: 0.17 + 0.39,
  groupName: 'Heavy Attack 1',
  variantName: 'Cancel With Swap',
}
