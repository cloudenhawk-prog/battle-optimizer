// Cartethyia — Fleurdelys form: Enhanced Heavy Attack (Heavy Attack 2), chained from Heavy Attack 1.
import type { Action } from '../../../../../types/action'
import { fleurdelys_heavy_1, fleurdelys_heavy_1_cancel_with_swap } from './heavy1'

// ========== Heavy Attack 2 ===================================================================================================
export const fleurdelys_heavy_2: Action = {
  tags: ['HEAVY_ATTACK'],
  name: 'Enhanced Heavy Attack',
  displayName: 'Heavy Attack 2',
  category: 'Basics',
  castTime: 0.73, // TODO
  multiplier: (2 * 7.78 + 3.89) / 100,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 2 * 0.96 + 0.48, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 2 * 1.35 + 0.68, share: 0 },
    { energyType: 'conviction', amount: 13.33, share: 0 },
  ],
  energyCost: [],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Aero Erosion', stackChange: 2 }],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    previousActions: [fleurdelys_heavy_1, fleurdelys_heavy_1_cancel_with_swap],
    startState: 'GROUND',
    endState: 'GROUND',
  },
  offtune: 3 * 0.31 + 0.15,
  groupName: 'Heavy Attack 2',
  variantName: 'Default',
}

export const fleurdelys_heavy_2_cancel_with_swap: Action = {
  tags: ['HEAVY_ATTACK'],
  name: 'Enhanced Heavy Attack (swap cancel)',
  displayName: 'Heavy Attack 2 (swap cancel)',
  category: 'Basics',
  castTime: 0.73, // TODO
  multiplier: (2 * 7.78 + 3.89) / 100,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 2 * 0.96 + 0.48, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 2 * 1.35 + 0.68, share: 0 },
    { energyType: 'conviction', amount: 13.33, share: 0 },
  ],
  energyCost: [],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Aero Erosion', stackChange: 2 }],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    previousActions: [fleurdelys_heavy_1, fleurdelys_heavy_1_cancel_with_swap],
    startState: 'GROUND',
    swapOutState: 'GROUND', // TODO : Double Check
    endState: 'GROUND',
    requiresSwapOut: true,
    persistenceTime: 100, // TODO : Persistence Time
  },
  offtune: 3 * 0.31 + 0.15,
  groupName: 'Heavy Attack 2',
  variantName: 'Cancel With Swap',
}
