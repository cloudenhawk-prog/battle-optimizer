// Ciaccona — Basic Attack 3-4 after Intro (skill / swap cancel); applies the Ensemble Sylph team buff.
import type { Action } from '../../../../types/action'
import { always } from '../../../helpers/modifierConditions'

// ========== Basic Attack 3-4 =================================================================================================
export const ciaccona_BA_3_4_cancel_with_skill: Action = {
  tags: ['BASIC_ATTACK', 'AERO_EROSION_APPLIER'],
  name: 'Basic Attack 3-4 (skill cancel)',
  displayName: 'Basic Attack 3-4 (skill cancel)',
  category: 'Basics',
  castTime: 0.73,
  multiplier: (4 * 33.02 + 4 * 61.14) / 100,
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 4 * 0.51 + 4 * 0.94, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 4 * 1.62 + 4 * 3.0, share: 0 },
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
    requiresSwapIn: true, // TODO : Double Check that it's possible
  },
  offtune: 4 * 0.16 + 4 * 0.3,
  toolTip: 'Can be cast after Intro Skill',
  groupName: 'Basic Attack 3-4',
  variantName: 'Cancel With Skill'
}

export const ciaccona_BA_3_4_cancel_with_swap: Action = {
  tags: ['BASIC_ATTACK', 'AERO_EROSION_APPLIER'],
  name: 'Basic Attack 3-4 (swap cancel)',
  displayName: 'Basic Attack 3-4 (swap cancel)',
  category: 'Basics',
  castTime: 0.87,
  multiplier: (4 * 33.02 + 4 * 61.14) / 100,
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 4 * 0.51 + 4 * 0.94, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 4 * 1.62 + 4 * 3.0, share: 0 },
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
    swapOutState: 'AIR', // TODO : Double Check
    endState: 'GROUND',
    requiresSwapIn: true, // TODO : Double Check that it's possible
    requiresSwapOut: true,
    persistenceTime: 100 // TODO : Persistence Time
  },
  offtune: 4 * 0.16 + 4 * 0.3,
  toolTip: 'Can be cast after Intro Skill',
  groupName: 'Basic Attack 3-4',
  variantName: 'Cancel With Swap'
}
