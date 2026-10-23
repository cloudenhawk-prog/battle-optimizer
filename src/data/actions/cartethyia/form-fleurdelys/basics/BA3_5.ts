// Cartethyia — Fleurdelys form: Basic Attack 3-5 after quick swap-in (default / swap cancel).
import type { Action } from '../../../../../types/action'
import { aeroErosionExplosion } from '../../../../sideEffects/sideEffects'

// ========== Basic 3-5 ========================================================================================================
export const fleurdelys_BA_3_5: Action = {
  tags: ['BASIC_ATTACK'],
  name: 'Basic 3-5',
  displayName: 'Basic 3-5',
  category: 'Basics',
  castTime: 2.67, // TODO
  multiplier: (3 * 2.13 + 4.26 + 5 * 2.74 + (7.2 + 28.8)) / 100,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 3 * 0.45 + 0.9 + 5 * 0.45 + (0.4 + 1.59), share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 3 * 0.63 + 1.26 + 5 * 0.63 + (0.56 + 2.22), share: 0 },
    { energyType: 'conviction', amount: 36.67, share: 0 },
  ],
  energyCost: [],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Aero Erosion', stackChange: 2 }],
  damageModifiers: [],
  sideEffects: [aeroErosionExplosion],
  castConditions: {
    startState: 'GROUND',
    endState: 'GROUND',
    requiresSwapIn: true,
  },
  offtune: 3 * 0.14 + 1.26 + 5 * 0.14 + (0.13 + 0.51),
  toolTip: 'Can be cast when quick swapped in without intro',
  groupName: 'Basic 3-5',
  variantName: 'Default',
}

export const fleurdelys_BA_3_5_cancel_with_swap: Action = {
  tags: ['BASIC_ATTACK'],
  name: 'Basic 3-5 (swap cancel)',
  displayName: 'Basic 3-5 (swap cancel)',
  category: 'Basics',
  castTime: 2.67, // TODO
  multiplier: (3 * 2.13 + 4.26 + 5 * 2.74 + (7.2 + 28.8)) / 100,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 3 * 0.45 + 0.9 + 5 * 0.45 + (0.4 + 1.59), share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 3 * 0.63 + 1.26 + 5 * 0.63 + (0.56 + 2.22), share: 0 },
    { energyType: 'conviction', amount: 36.67, share: 0 },
  ],
  energyCost: [],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Aero Erosion', stackChange: 2 }],
  damageModifiers: [],
  sideEffects: [aeroErosionExplosion],
  castConditions: {
    startState: 'GROUND',
    swapOutState: 'GROUND', // TODO : Double Check
    endState: 'GROUND',
    requiresSwapIn: true,
    requiresSwapOut: true,
    persistenceTime: 100, // TODO : Persistence Time
  },
  offtune: 3 * 0.14 + 1.26 + 5 * 0.14 + (0.13 + 0.51),
  toolTip: 'Can be cast when quick swapped in without intro',
  groupName: 'Basic 3-5',
  variantName: 'Cancel With Swap',
}
