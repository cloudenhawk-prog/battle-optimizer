import type { Action } from '../../../../../types/action'
import * as values from '../../values'
import { s1_foreclaimed_basic_multiplier } from '../../../../modifiers/hiyuki'

// ========== MA3 ==============================================================================================================

// Default
const hiyuki_foreclaimed_midair_3: Action = {
  tags: ['BASIC_ATTACK', 'GLACIO_CHAFE_APPLIER'],
  name: 'Foreclaimed: Mid-air Attack 3',
  displayName: 'Foreclaimed: Mid-air Attack 3',
  category: 'Basics',
  castTime: values.cast_time_UMHA,
  multiplier: values.foreclaimed_MA3_multiplier,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['LIBERATION'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: values.foreclaimed_MA3_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: values.foreclaimed_MA3_concerto, share: 0 },
    { energyType: 'frostheart', amount: values.foreclaimed_MA3_frostheart, share: 0 }
  ],
  energyCost: [],
  statusModifications: [
    { type: 'negativeStatus', targetName: 'Glacio Chafe', stackChange: values.foreclaimed_MA3_stack, applicationCount: 1 }
  ],
  damageModifiers: [],
  inherentModifiers: [s1_foreclaimed_basic_multiplier],
  sideEffects: [],
  coordinatedAttacks: [],
  castConditions: {
    startState: 'AIR',
    endState: 'GROUND',
    preventsSwapOut: true,
    requiredForms: ['Foreclaimed Self'],
    requiredComboTags: ['Foreclaiming MA2'],
    blockedComboTags: ['Foreclaiming MA Block', 'Foreclaiming MA1' , 'Foreclaiming MA3']
  },
  comboChainTags: ['Foreclaiming MA3'],
  offtune: values.foreclaimed_MA3_offtune,
  hideWhenNotCastable: true,
  groupName: 'Foreclaimed: Mid-air Attack 3',
  variantName: 'Default',
}

// Cancel With Swap
const hiyuki_foreclaimed_midair_3_cancel_with_swap: Action = {
  tags: ['BASIC_ATTACK', 'GLACIO_CHAFE_APPLIER'],
  name: 'Foreclaimed: Mid-air Attack 3 (swap cancel)',
  displayName: 'Foreclaimed: Mid-air Attack 3 (swap cancel)',
  category: 'Basics',
  castTime: values.SWAP_CANCEL_TIME,
  multiplier: values.foreclaimed_MA3_multiplier,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['LIBERATION'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: values.foreclaimed_MA3_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: values.foreclaimed_MA3_concerto, share: 0 },
    { energyType: 'frostheart', amount: values.foreclaimed_MA3_frostheart, share: 0 }
  ],
  energyCost: [],
  statusModifications: [
    { type: 'negativeStatus', targetName: 'Glacio Chafe', stackChange: values.foreclaimed_MA3_stack, applicationCount: 1 }
  ],
  damageModifiers: [],
  inherentModifiers: [s1_foreclaimed_basic_multiplier],
  sideEffects: [],
  coordinatedAttacks: [],
  castConditions: {
    startState: 'AIR',
    swapOutState: 'AIR',
    endState: 'GROUND',
    requiresSwapOut: true,
    persistenceTime: 1000, // TODO
    requiredForms: ['Foreclaimed Self'],
    requiredComboTags: ['Foreclaiming MA2'],
    blockedComboTags: ['Foreclaiming MA Block', 'Foreclaiming MA1' , 'Foreclaiming MA3']
  },
  comboChainTags: ['Foreclaiming MA3'],
  offtune: values.foreclaimed_MA3_offtune,
  hideWhenNotCastable: true,
  groupName: 'Foreclaimed: Mid-air Attack 3',
  variantName: 'Cancel With Swap',
}

export {
  hiyuki_foreclaimed_midair_3,
  hiyuki_foreclaimed_midair_3_cancel_with_swap
}
