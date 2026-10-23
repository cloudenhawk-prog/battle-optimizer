// Ciaccona — Heavy Attack "Quadruple Downbeat", spends 3 forte (default / swap cancel).
import type { Action } from '../../../../types/action'

// ========== Heavy Attack =====================================================================================================
export const ciaccona_heavy: Action = {
  tags: ['HEAVY_ATTACK'],
  name: 'Heavy Attack',
  displayName: 'Quadruple Downbeat',
  category: 'Basics',
  castTime: 1.13,
  multiplier: (1.3 * (10 * 31.41 + 314.03)) / 100,
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['HEAVY'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 10 * 0.75 + 7.47, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 25, share: 0 },
  ],
  energyCost: [{ energyType: 'forte', amount: 3 }],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Aero Erosion', stackChange: 1 }],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'GROUND', // TODO : ANY ?
    endState: 'GROUND', // TODO : PRESERVE ?
  },
  offtune: 10 * 0.05 + 0.47,
  groupName: 'Heavy Attack',
  variantName: 'Default'
}

export const ciaccona_heavy_cancel_with_swap: Action = {
  tags: ['HEAVY_ATTACK'],
  name: 'Heavy Attack (swap cancel)',
  displayName: 'Quadruple Downbeat (swap cancel)',
  category: 'Basics',
  castTime: 0.15,
  multiplier: (1.3 * (10 * 31.41 + 314.03)) / 100,
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['HEAVY'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 10 * 0.75 + 7.47, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 25, share: 0 },
  ],
  energyCost: [{ energyType: 'forte', amount: 3 }],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Aero Erosion', stackChange: 1 }],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'GROUND', // TODO : ANY ?
    swapOutState: 'PRESERVE', // TODO : Double Check
    endState: 'GROUND', // TODO : PRESERVE ?
    requiresSwapOut: true,
    persistenceTime: 100 // TODO : Persistence Time
  },
  offtune: 10 * 0.05 + 0.47,
  groupName: 'Heavy Attack',
  variantName: 'Cancel With Swap'
}
