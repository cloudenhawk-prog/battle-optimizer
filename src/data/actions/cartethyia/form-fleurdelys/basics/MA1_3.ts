// Cartethyia — Fleurdelys form: Mid-air Attack 1-3 (ends on ground; default / swap cancel).
import type { Action } from '../../../../../types/action'
import { aeroErosionExplosion } from '../../../../sideEffects/sideEffects'

// ========== Mid-air Attack 1-3 ===============================================================================================
export const fleurdelys_midair_1_3: Action = {
  tags: ['BASIC_ATTACK'],
  name: 'Mid-air Attack 1-3',
  displayName: 'Mid-air Attack 1-3',
  category: 'Basics',
  castTime: 2.47, // TODO
  multiplier: (2 * 2.99 + 3.08 + (2 * 7.39 + 14.77) + 2.2) / 100,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 2 * 0.66 + 0.68 + (2 * 0.52 + 1.03) + 0.48, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 2 * 0.93 + 0.95 + (2 * 0.52 + 1.44) + 0.67, share: 0 },
    { energyType: 'conviction', amount: 25, share: 0 },
  ],
  energyCost: [],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Aero Erosion', stackChange: 2 }],
  damageModifiers: [],
  sideEffects: [aeroErosionExplosion],
  castConditions: {
    startState: 'AIR',
    endState: 'GROUND',
  },
  offtune: 2 * 0.21 + 0.22 + (2 * 0.16 + 0.33) + 0.15,
  groupName: 'Mid-air Attack 1-3',
  variantName: 'Default',
}

export const fleurdelys_midair_1_3_cancel_with_swap: Action = {
  tags: ['BASIC_ATTACK'],
  name: 'Mid-air Attack 1-3 (swap cancel)',
  displayName: 'Mid-air Attack 1-3 (swap cancel)',
  category: 'Basics',
  castTime: 2.47, // TODO
  multiplier: (2 * 2.99 + 3.08 + (2 * 7.39 + 14.77) + 2.2) / 100,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 2 * 0.66 + 0.68 + (2 * 0.52 + 1.03) + 0.48, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 2 * 0.93 + 0.95 + (2 * 0.52 + 1.44) + 0.67, share: 0 },
    { energyType: 'conviction', amount: 25, share: 0 },
  ],
  energyCost: [],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Aero Erosion', stackChange: 2 }],
  damageModifiers: [],
  sideEffects: [aeroErosionExplosion],
  castConditions: {
    startState: 'AIR',
    swapOutState: 'AIR', // TODO : Double Check
    endState: 'GROUND',
    requiresSwapOut: true,
    persistenceTime: 100, // TODO : Persistence Time
  },
  offtune: 2 * 0.21 + 0.22 + (2 * 0.16 + 0.33) + 0.15,
  groupName: 'Mid-air Attack 1-3',
  variantName: 'Cancel With Swap',
}
