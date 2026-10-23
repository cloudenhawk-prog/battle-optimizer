// Rover (Aero) — Plunge attack from the air (default / swap cancel).
import type { Action } from '../../../../types/action'

// ========== Plunge ===========================================================================================================
export const roverAero_plunge: Action = {
  tags: ['BASIC_ATTACK'],
  name: 'Plunge',
  displayName: 'Plunge',
  category: 'Basics',
  castTime: 0.83,
  multiplier: 140.76 / 100,
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 0.52, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 9.6, share: 0 },
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'AIR',
    endState: 'GROUND',
  },
  offtune: 0.96,
  groupName: 'Plunge',
  variantName: 'Default'
}

export const roverAero_plunge_cancel_with_swap: Action = {
  tags: ['BASIC_ATTACK'],
  name: 'Plunge (swap cancel)',
  displayName: 'Plunge (swap cancel)',
  category: 'Basics',
  castTime: 0.18,
  multiplier: 140.76 / 100,
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 0.52, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 9.6, share: 0 },
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'AIR',
    swapOutState: 'AIR',
    endState: 'GROUND',
    requiresSwapOut: true,
    persistenceTime: 1 // TODO
  },
  offtune: 0.96,
  groupName: 'Plunge',
  variantName: 'Cancel With Swap'
}
