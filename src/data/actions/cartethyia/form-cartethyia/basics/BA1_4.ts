// Cartethyia — Cartethyia form: Basic Attack 1-4 (skill / swap cancel).
import type { Action } from '../../../../../types/action'

// ========== Basic Attack 1-4 =================================================================================================
export const cartethyia_BA_1_4_cancel_with_skill: Action = {
  tags: ['BASIC_ATTACK'],
  name: 'Basic Attack 1-4 (skill cancel)',
  displayName: 'Basic Attack 1-4 (skill cancel)',
  category: 'Basics',
  castTime: 2.32,
  multiplier: (1.5 * (4.78 + (2 * 3.94 + 5.25) + 4 * 4.28 + (3 * 2.52 + 7.54))) / 100,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 0.7 + (2 * 0.58 + 0.77) + 4 * 0.63 + (3 * 0.37 + 1.11), share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 0.98 + (2 * 0.81 + 1.08) + 4 * 0.88 + (3 * 0.52 + 1.55), share: 0 },
    { energyType: 'forte_divinity', amount: 1, share: 0 },
  ],
  energyCost: [],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Aero Erosion', stackChange: 1 }],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'GROUND',
    endState: 'GROUND',
  },
  attemptFollowUp: { actionName: 'Resonance Skill' },
  offtune: 0.22 + (2 * 0.18 + 0.25) + 4 * 0.2 + (3 * 0.12 + 0.35),
  groupName: 'Basic Attack 1-4',
  variantName: 'Cancel With Skill',
}

export const cartethyia_BA_1_4_cancel_with_swap: Action = {
  tags: ['BASIC_ATTACK'],
  name: 'Basic Attack 1-4 (swap cancel)',
  displayName: 'Basic Attack 1-4 (swap cancel)',
  category: 'Basics',
  castTime: 2.26,
  multiplier: (1.5 * (4.78 + (2 * 3.94 + 5.25) + 4 * 4.28 + (3 * 2.52 + 7.54))) / 100,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 0.7 + (2 * 0.58 + 0.77) + 4 * 0.63 + (3 * 0.37 + 1.11), share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 0.98 + (2 * 0.81 + 1.08) + 4 * 0.88 + (3 * 0.52 + 1.55), share: 0 },
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
    requiresSwapOut: true,
    persistenceTime: 100, // TODO : Persistence Time
  },
  offtune: 0.22 + (2 * 0.18 + 0.25) + 4 * 0.2 + (3 * 0.12 + 0.35),
  groupName: 'Basic Attack 1-4',
  variantName: 'Cancel With Swap',
}
