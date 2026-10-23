// Cartethyia — Fleurdelys form: Mid-air Attack 1-2 (stays airborne; default / swap cancel).
import type { Action } from '../../../../../types/action'
import { aeroErosionExplosion } from '../../../../sideEffects/sideEffects'

// ========== Mid-air Attack 1-2 ===============================================================================================
export const fleurdelys_midair_1_2: Action = {
  tags: ['BASIC_ATTACK'],
  name: 'Mid-air Attack 1-2',
  displayName: 'Mid-air Attack 1-2',
  category: 'Basics',
  castTime: 1.63, // TODO
  multiplier: (2 * 2.99 + 3.08 + (2 * 7.39 + 14.77)) / 100,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 2 * 0.66 + 0.68 + (2 * 0.52 + 1.03), share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 2 * 0.93 + 0.95 + (2 * 0.52 + 1.44), share: 0 },
    { energyType: 'conviction', amount: 20, share: 0 },
  ],
  energyCost: [],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Aero Erosion', stackChange: 2 }],
  damageModifiers: [],
  sideEffects: [aeroErosionExplosion],
  castConditions: {
    startState: 'AIR',
    endState: 'AIR',
  },
  offtune: 2 * 0.21 + 0.22 + (2 * 0.16 + 0.33),
  groupName: 'Mid-air Attack 1-2',
  variantName: 'Default',
}

export const fleurdelys_midair_1_2_cancel_with_swap: Action = {
  tags: ['BASIC_ATTACK'],
  name: 'Mid-air Attack 1-2 (swap cancel)',
  displayName: 'Mid-air Attack 1-2 (swap cancel)',
  category: 'Basics',
  castTime: 1.63, // TODO
  multiplier: (2 * 2.99 + 3.08 + (2 * 7.39 + 14.77)) / 100,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 2 * 0.66 + 0.68 + (2 * 0.52 + 1.03), share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 2 * 0.93 + 0.95 + (2 * 0.52 + 1.44), share: 0 },
    { energyType: 'conviction', amount: 20, share: 0 },
  ],
  energyCost: [],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Aero Erosion', stackChange: 2 }],
  damageModifiers: [],
  sideEffects: [aeroErosionExplosion],
  castConditions: {
    startState: 'AIR',
    swapOutState: 'AIR', // TODO : Double Check
    endState: 'AIR',
    requiresSwapOut: true,
    persistenceTime: 100, // TODO : Persistence Time
  },
  offtune: 2 * 0.21 + 0.22 + (2 * 0.16 + 0.33),
  groupName: 'Mid-air Attack 1-2',
  variantName: 'Cancel With Swap',
}
