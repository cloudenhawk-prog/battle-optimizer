// Cartethyia — Fleurdelys form: Basic Attack 1-5 (default / swap cancel).
import type { Action } from '../../../../../types/action'
import { aeroErosionExplosion } from '../../../../sideEffects/sideEffects'

// ========== Basic 1-5 ========================================================================================================
export const fleurdelys_BA_1_5: Action = {
  tags: ['BASIC_ATTACK'],
  name: 'Basic 1-5',
  displayName: 'Basic 1-5',
  category: 'Basics',
  castTime: 3.4, // TODO
  multiplier: (6.49 + (3.63 + 3 * 1.82) + (3 * 2.13 + 4.26) + 5 * 2.74 + (7.2 + 28.8)) / 100,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 0.75 + (0.77 + 3 * 0.39) + (3 * 0.45 + 0.9) + 5 * 0.45 + (0.4 + 1.59), share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 1.05 + (1.07 + 3 * 0.54) + (3 * 0.63 + 1.26) + 5 * 0.63 + (0.56 + 2.22), share: 0 },
    { energyType: 'conviction', amount: 45, share: 0 },
  ],
  energyCost: [],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Aero Erosion', stackChange: 2 }],
  damageModifiers: [],
  sideEffects: [aeroErosionExplosion],
  castConditions: {
    startState: 'GROUND',
    endState: 'GROUND',
  },
  offtune: 0.24 + (0.24 + 3 * 0.12) + (3 * 0.14 + 1.26) + 5 * 0.14 + (0.13 + 0.51),
  groupName: 'Basic 1-5',
  variantName: 'Default',
}

export const fleurdelys_BA_1_5_cancel_with_swap: Action = {
  tags: ['BASIC_ATTACK'],
  name: 'Basic 1-5 (swap cancel)',
  displayName: 'Basic 1-5 (swap cancel)',
  category: 'Basics',
  castTime: 3.4, // TODO
  multiplier: (6.49 + (3.63 + 3 * 1.82) + (3 * 2.13 + 4.26) + 5 * 2.74 + (7.2 + 28.8)) / 100,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 0.75 + (0.77 + 3 * 0.39) + (3 * 0.45 + 0.9) + 5 * 0.45 + (0.4 + 1.59), share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 1.05 + (1.07 + 3 * 0.54) + (3 * 0.63 + 1.26) + 5 * 0.63 + (0.56 + 2.22), share: 0 },
    { energyType: 'conviction', amount: 45, share: 0 },
  ],
  energyCost: [],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Aero Erosion', stackChange: 2 }],
  damageModifiers: [],
  sideEffects: [aeroErosionExplosion],
  castConditions: {
    startState: 'GROUND',
    swapOutState: 'GROUND', // TODO : Double Check
    endState: 'GROUND',
    requiresSwapOut: true,
    persistenceTime: 100, // TODO : Persistence Time
  },
  offtune: 0.24 + (0.24 + 3 * 0.12) + (3 * 0.14 + 1.26) + 5 * 0.14 + (0.13 + 0.51),
  groupName: 'Basic 1-5',
  variantName: 'Cancel With Swap',
}
