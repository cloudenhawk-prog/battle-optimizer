// Ciaccona — Mid-air Attack 2 into Basic Attack 4 after a mid-air swap-in (skill / swap cancel).
import type { Action } from '../../../../types/action'
import { always } from '../../../helpers/modifierConditions'

// ========== MA2 -> BA4 =======================================================================================================
export const ciaccona_midair_2_BA_4_cancel_with_skill: Action = {
  tags: ['BASIC_ATTACK', 'AERO_EROSION_APPLIER'],
  name: 'Mid Air 2 -> Basic Attack 4 (skill cancel)',
  displayName: 'Mid Air 2 -> Basic Attack 4 (skill cancel)',
  category: 'Basics',
  castTime: 0.82,
  multiplier: (4 * 24.46 + 4 * 61.14) / 100,
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 4 * 0.38 + 4 * 0.94, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 4 * 1.2 + 4 * 3.0, share: 0 },
    { energyType: 'forte', amount: 1, share: 0 },
  ],
  energyCost: [],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Aero Erosion', stackChange: 1 }],
  damageModifiers: [
    {
      source: 'Ciaconna Ensemble Sylph',
      displayName: 'Ensemble Sylph',
      type: 'buff',
      ownerCharacter: 'Ciaccona',
      condition: always(),
      characterStats: { aeroBonusDMG: 0.24 },
      targetStrategy: 'all',
      durationStrategy: { type: 'permanent' },
      stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 },
    },
  ],
  sideEffects: [],
  castConditions: {
    startState: 'GROUND',
    endState: 'GROUND',
    requiresSwapIn: true
  },
  offtune: 4 * 0.12 + 4 * 0.3,
  toolTip: 'Can be cast if swapped in mid-air',
  groupName: 'MA2 -> BA4',
  variantName: 'Cancel With Skill'
}

export const ciaccona_midair_2_BA_4_cancel_with_swap: Action = {
  tags: ['BASIC_ATTACK', 'AERO_EROSION_APPLIER'],
  name: 'Mid Air 2 -> Basic Attack 4 (swap cancel)',
  displayName: 'Mid Air 2 -> Basic Attack 4 (swap cancel)',
  category: 'Basics',
  castTime: 0.95,
  multiplier: (4 * 24.46 + 4 * 61.14) / 100,
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 4 * 0.38 + 4 * 0.94, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 4 * 1.2 + 4 * 3.0, share: 0 },
    { energyType: 'forte', amount: 1, share: 0 },
  ],
  energyCost: [],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Aero Erosion', stackChange: 1 }],
  damageModifiers: [
    {
      source: 'Ciaconna Ensemble Sylph',
      displayName: 'Ensemble Sylph',
      type: 'buff',
      ownerCharacter: 'Ciaccona',
      condition: always(),
      characterStats: { aeroBonusDMG: 0.24 },
      targetStrategy: 'all',
      durationStrategy: { type: 'permanent' },
      stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 },
    },
  ],
  sideEffects: [],
  castConditions: {
    startState: 'GROUND',
    swapOutState: 'GROUND', // TODO : Double Check
    endState: 'GROUND',
    requiresSwapIn: true,
    requiresSwapOut: true,
    persistenceTime: 100 // TODO : Persistence Time
  },
  offtune: 4 * 0.12 + 4 * 0.3,
  toolTip: 'Can be cast if swapped in mid-air',
  groupName: 'MA2 -> BA4',
  variantName: 'Cancel With Swap'
}
