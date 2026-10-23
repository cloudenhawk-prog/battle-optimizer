// Rover (Aero) — Basic Attack 4, available right after Plunge (default / swap cancel).
import type { Action } from '../../../../types/action'
import { roverAero_plunge } from './plunge'

// ========== Basic Attack 4 ===================================================================================================
export const roverAero_BA_4: Action = {
  tags: ['BASIC_ATTACK'],
  name: 'Basic Attack 4',
  displayName: 'Basic Attack 4',
  category: 'Basics',
  castTime: 0.43,
  multiplier: 76.72 / 100,
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 1.64, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 5.24, share: 0 },
    { energyType: 'forte', amount: 10, share: 0 },
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'GROUND',
    previousActions: [roverAero_plunge],
    endState: 'GROUND',
  },
  offtune: 0.52,
  groupName: 'Basic Attack 4',
  variantName: 'Default'
}

export const roverAero_BA_4_cancel_with_swap: Action = {
  tags: ['BASIC_ATTACK'],
  name: 'Basic Attack 4 (swap cancel)',
  displayName: 'Basic Attack 4 (swap cancel)',
  category: 'Basics',
  castTime: 0.2,
  multiplier: 76.72 / 100,
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 1.64, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 5.24, share: 0 },
    { energyType: 'forte', amount: 10, share: 0 },
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'GROUND',
    previousActions: [roverAero_plunge],
    swapOutState: 'GROUND',
    endState: 'GROUND',
    requiresSwapOut: true,
    persistenceTime: 1 // TODO
  },
  offtune: 0.52,
  groupName: 'Basic Attack 4',
  variantName: 'Cancel With Swap'
}
