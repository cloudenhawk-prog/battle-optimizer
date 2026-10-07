// Cartethyia — Cartethyia form: Basic Attack 2-4 after swap-in (default / jump / swap cancel).
import type { Action } from '../../../../../types/action'

// ========== Basic Attack 2-4 =================================================================================================
export const cartethyia_BA_2_4: Action = {
  tags: ['BASIC_ATTACK'],
  name: 'Basic Attack 2-4',
  displayName: 'Basic Attack 2-4',
  category: 'Basics',
  castTime: 1.85,
  multiplier: (1.5 * (2 * 3.94 + 5.25 + 4 * 4.28 + (3 * 2.52 + 7.54))) / 100,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 2 * 0.58 + 0.77 + 4 * 0.63 + (3 * 0.37 + 1.11), share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 2 * 0.81 + 1.08 + 4 * 0.88 + (3 * 0.52 + 1.55), share: 0 },
    { energyType: 'forte_divinity', amount: 1, share: 0 },
  ],
  energyCost: [],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Aero Erosion', stackChange: 1 }],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'GROUND',
    endState: 'GROUND',
    requiresSwapIn: true,
  },
  offtune: 2 * 0.18 + 0.25 + 4 * 0.2 + (3 * 0.12 + 0.35),
  toolTip: 'Can be cast after intro',
  groupName: 'Basic Attack 2-4',
  variantName: 'Default',
}

export const cartethyia_BA_2_4_cancel_with_jump: Action = {
  tags: ['BASIC_ATTACK'],
  name: 'Basic Attack 2-4 (jump cancel)',
  displayName: 'Basic Attack 2-4 (jump cancel)',
  category: 'Basics',
  castTime: 2.15,
  multiplier: (1.5 * (2 * 3.94 + 5.25 + 4 * 4.28 + (3 * 2.52 + 7.54))) / 100,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 2 * 0.58 + 0.77 + 4 * 0.63 + (3 * 0.37 + 1.11), share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 2 * 0.81 + 1.08 + 4 * 0.88 + (3 * 0.52 + 1.55), share: 0 },
    { energyType: 'forte_divinity', amount: 1, share: 0 },
  ],
  energyCost: [],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Aero Erosion', stackChange: 1 }],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'GROUND',
    endState: 'AIR',
    requiresSwapIn: true,
  },
  offtune: 2 * 0.18 + 0.25 + 4 * 0.2 + (3 * 0.12 + 0.35),
  toolTip: 'Can be cast after intro',
  groupName: 'Basic Attack 2-4',
  variantName: 'Cancel With Jump',
}

export const cartethyia_BA_2_4_cancel_with_swap: Action = {
  tags: ['BASIC_ATTACK'],
  name: 'Basic Attack 2-4 (swap cancel)',
  displayName: 'Basic Attack 2-4 (swap cancel)',
  category: 'Basics',
  castTime: 1.92,
  multiplier: (1.5 * (2 * 3.94 + 5.25 + 4 * 4.28 + (3 * 2.52 + 7.54))) / 100,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 2 * 0.58 + 0.77 + 4 * 0.63 + (3 * 0.37 + 1.11), share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 2 * 0.81 + 1.08 + 4 * 0.88 + (3 * 0.52 + 1.55), share: 0 },
    { energyType: 'forte_divinity', amount: 1, share: 0 },
  ],
  energyCost: [],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Aero Erosion', stackChange: 1 }],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'GROUND',
    swapOutState: 'GROUND', // TODO : Double Check
    endState: 'GROUND',
    requiresSwapIn: true,
    requiresSwapOut: true,
    persistenceTime: 100, // TODO : Persistence Time
  },
  offtune: 2 * 0.18 + 0.25 + 4 * 0.2 + (3 * 0.12 + 0.35),
  toolTip: 'Can be cast after intro',
  groupName: 'Basic Attack 2-4',
  variantName: 'Cancel With Swap',
}
