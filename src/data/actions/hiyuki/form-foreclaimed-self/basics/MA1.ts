import type { Action } from '../../../../../types/action'
import * as values from '../../values'
import { s1_foreclaimed_basic_multiplier } from '../../../../modifiers/hiyuki'

// ========== MA1 ==============================================================================================================

// Default
const hiyuki_foreclaimed_midair_1: Action = {
  tags: ['BASIC_ATTACK'],
  name: 'Foreclaimed: Mid-air Attack 1',
  displayName: 'Foreclaimed: Mid-air Attack 1',
  category: 'Basics',
  castTime: values.cast_time_UMA1,
  multiplier: values.foreclaimed_MA1_multiplier,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['LIBERATION'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: values.foreclaimed_MA1_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: values.foreclaimed_MA1_concerto, share: 0 },
    { energyType: 'frostheart', amount: values.foreclaimed_MA1_frostheart, share: 0 }
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  inherentModifiers: [s1_foreclaimed_basic_multiplier],
  sideEffects: [],
  coordinatedAttacks: [],
  castConditions: {
    startState: 'AIR',
    endState: 'AIR',
    preventsSwapOut: true,
    requiredForms: ['Foreclaimed Self'],
    blockedComboTags: ['Foreclaiming MA Block', 'Foreclaiming MA1', 'Foreclaiming MA2']
  },
  comboChainTags: ['Foreclaiming MA1'],
  offtune: values.foreclaimed_MA1_offtune,
  hideWhenNotCastable: true,
  groupName: 'Foreclaimed: Mid-air Attack 1',
  variantName: 'Default',
}

// Cancel With Swap
const hiyuki_foreclaimed_midair_1_cancel_with_swap: Action = {
  tags: ['BASIC_ATTACK'],
  name: 'Foreclaimed: Mid-air Attack 1 (swap cancel)',
  displayName: 'Foreclaimed: Mid-air Attack 1 (swap cancel)',
  category: 'Basics',
  castTime: values.SWAP_CANCEL_TIME,
  multiplier: values.foreclaimed_MA1_multiplier,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['LIBERATION'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: values.foreclaimed_MA1_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: values.foreclaimed_MA1_concerto, share: 0 },
    { energyType: 'frostheart', amount: values.foreclaimed_MA1_frostheart, share: 0 }
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  inherentModifiers: [s1_foreclaimed_basic_multiplier],
  sideEffects: [],
  coordinatedAttacks: [],
  castConditions: {
    startState: 'AIR',
    swapOutState: 'AIR',
    endState: 'AIR',
    requiresSwapOut: true,
    persistenceTime: 1000, // TODO
    requiredForms: ['Foreclaimed Self'],
    blockedComboTags: ['Foreclaiming MA Block', 'Foreclaiming MA1', 'Foreclaiming MA2']
  },
  comboChainTags: ['Foreclaiming MA1'],
  offtune: values.foreclaimed_MA1_offtune,
  hideWhenNotCastable: true,
  groupName: 'Foreclaimed: Mid-air Attack 1',
  variantName: 'Cancel With Swap',
}

// ========== MA1-2 ============================================================================================================

// Default
const hiyuki_foreclaimed_midair_1_2: Action = {
  tags: ['BASIC_ATTACK', 'GLACIO_CHAFE_APPLIER'],
  name: 'Foreclaimed: Mid-air Attack 1-2',
  displayName: 'Foreclaimed: Mid-air Attack 1-2',
  category: 'Basics',
  castTime: values.cast_time_UMA1 + values.cast_time_UMA2,
  multiplier: values.foreclaimed_MA1_multiplier + values.foreclaimed_MA2_multiplier,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['LIBERATION'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: values.foreclaimed_MA1_energy + values.foreclaimed_MA2_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: values.foreclaimed_MA1_concerto + values.foreclaimed_MA2_concerto, share: 0 },
    { energyType: 'frostheart', amount: values.foreclaimed_MA1_frostheart + values.foreclaimed_MA2_frostheart, share: 0 }
  ],
  energyCost: [],
  statusModifications: [
    {
      type: 'negativeStatus',
      targetName: 'Glacio Chafe',
      stackChange: values.foreclaimed_MA1_stack + values.foreclaimed_MA2_stack,
      applicationCount: 1
    }
  ],
  damageModifiers: [],
  inherentModifiers: [s1_foreclaimed_basic_multiplier],
  sideEffects: [],
  coordinatedAttacks: [],
  castConditions: {
    startState: 'AIR',
    endState: 'AIR',
    preventsSwapOut: true,
    requiredForms: ['Foreclaimed Self'],
    blockedComboTags: ['Foreclaiming MA Block', 'Foreclaiming MA1', 'Foreclaiming MA2']
  },
  comboChainTags: ['Foreclaiming MA2'],
  offtune: values.foreclaimed_MA1_offtune + values.foreclaimed_MA2_offtune,
  hideWhenNotCastable: true,
  groupName: 'Foreclaimed: Mid-air Attack 1-2',
  variantName: 'Default',
}

// Cancel With Swap
const hiyuki_foreclaimed_midair_1_2_cancel_with_swap: Action = {
  tags: ['BASIC_ATTACK', 'GLACIO_CHAFE_APPLIER'],
  name: 'Foreclaimed: Mid-air Attack 1-2 (swap cancel)',
  displayName: 'Foreclaimed: Mid-air Attack 1-2 (swap cancel)',
  category: 'Basics',
  castTime: values.cast_time_UMA1 + values.SWAP_CANCEL_TIME,
  multiplier: values.foreclaimed_MA1_multiplier + values.foreclaimed_MA2_multiplier,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['LIBERATION'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: values.foreclaimed_MA1_energy + values.foreclaimed_MA2_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: values.foreclaimed_MA1_concerto + values.foreclaimed_MA2_concerto, share: 0 },
    { energyType: 'frostheart', amount: values.foreclaimed_MA1_frostheart + values.foreclaimed_MA2_frostheart, share: 0 }
  ],
  energyCost: [],
  statusModifications: [
    {
      type: 'negativeStatus',
      targetName: 'Glacio Chafe',
      stackChange: values.foreclaimed_MA1_stack + values.foreclaimed_MA2_stack,
      applicationCount: 1
    }
  ],
  damageModifiers: [],
  inherentModifiers: [s1_foreclaimed_basic_multiplier],
  sideEffects: [],
  coordinatedAttacks: [],
  castConditions: {
    startState: 'AIR',
    swapOutState: 'AIR',
    endState: 'AIR',
    requiresSwapOut: true,
    persistenceTime: 1000, // TODO
    requiredForms: ['Foreclaimed Self'],
    blockedComboTags: ['Foreclaiming MA Block', 'Foreclaiming MA1', 'Foreclaiming MA2']
  },
  comboChainTags: ['Foreclaiming MA2'],
  offtune: values.foreclaimed_MA1_offtune + values.foreclaimed_MA2_offtune,
  hideWhenNotCastable: true,
  groupName: 'Foreclaimed: Mid-air Attack 1-2',
  variantName: 'Cancel With Swap',
}

// ========== MA1-3 ============================================================================================================

// Default
const hiyuki_foreclaimed_midair_1_3: Action = {
  tags: ['BASIC_ATTACK', 'GLACIO_CHAFE_APPLIER'],
  name: 'Foreclaimed: Mid-air Attack 1-3',
  displayName: 'Foreclaimed: Mid-air Attack 1-3',
  category: 'Basics',
  castTime: values.cast_time_UMA1 + values.cast_time_UMA2 + values.cast_time_UMHA,
  multiplier: values.foreclaimed_MA1_multiplier + values.foreclaimed_MA2_multiplier + values.foreclaimed_MA3_multiplier,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['LIBERATION'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: values.foreclaimed_MA1_energy + values.foreclaimed_MA2_energy + values.foreclaimed_MA3_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: values.foreclaimed_MA1_concerto + values.foreclaimed_MA2_concerto + values.foreclaimed_MA3_concerto, share: 0 },
    { energyType: 'frostheart', amount: values.foreclaimed_MA1_frostheart + values.foreclaimed_MA2_frostheart + values.foreclaimed_MA3_frostheart, share: 0 }
  ],
  energyCost: [],
  statusModifications: [
    {
      type: 'negativeStatus',
      targetName: 'Glacio Chafe',
      stackChange: values.foreclaimed_MA1_stack + values.foreclaimed_MA2_stack + values.foreclaimed_MA3_stack,
      applicationCount: 2
    }
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
    blockedComboTags: ['Foreclaiming MA Block', 'Foreclaiming MA1', 'Foreclaiming MA2']
  },
  comboChainTags: ['Foreclaiming MA3'],
  offtune: values.foreclaimed_MA1_offtune + values.foreclaimed_MA2_offtune + values.foreclaimed_MA3_offtune,
  hideWhenNotCastable: true,
  groupName: 'Foreclaimed: Mid-air Attack 1-3',
  variantName: 'Default',
}

// Cancel With Swap
const hiyuki_foreclaimed_midair_1_3_cancel_with_swap: Action = {
  tags: ['BASIC_ATTACK', 'GLACIO_CHAFE_APPLIER'],
  name: 'Foreclaimed: Mid-air Attack 1-3 (swap cancel)',
  displayName: 'Foreclaimed: Mid-air Attack 1-3 (swap cancel)',
  category: 'Basics',
  castTime: values.cast_time_UMA1 + values.cast_time_UMA2 + values.SWAP_CANCEL_TIME,
  multiplier: values.foreclaimed_MA1_multiplier + values.foreclaimed_MA2_multiplier + values.foreclaimed_MA3_multiplier,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['LIBERATION'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: values.foreclaimed_MA1_energy + values.foreclaimed_MA2_energy + values.foreclaimed_MA3_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: values.foreclaimed_MA1_concerto + values.foreclaimed_MA2_concerto + values.foreclaimed_MA3_concerto, share: 0 },
    { energyType: 'frostheart', amount: values.foreclaimed_MA1_frostheart + values.foreclaimed_MA2_frostheart + values.foreclaimed_MA3_frostheart, share: 0 }
  ],
  energyCost: [],
  statusModifications: [
    {
      type: 'negativeStatus',
      targetName: 'Glacio Chafe',
      stackChange: values.foreclaimed_MA1_stack + values.foreclaimed_MA2_stack + values.foreclaimed_MA3_stack,
      applicationCount: 2
    }
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
    blockedComboTags: ['Foreclaiming MA Block', 'Foreclaiming MA1', 'Foreclaiming MA2']
  },
  comboChainTags: ['Foreclaiming MA3'],
  offtune: values.foreclaimed_MA1_offtune + values.foreclaimed_MA2_offtune + values.foreclaimed_MA3_offtune,
  hideWhenNotCastable: true,
  groupName: 'Foreclaimed: Mid-air Attack 1-3',
  variantName: 'Cancel With Swap',
}

export {
  hiyuki_foreclaimed_midair_1,
  hiyuki_foreclaimed_midair_1_cancel_with_swap,
  hiyuki_foreclaimed_midair_1_2,
  hiyuki_foreclaimed_midair_1_2_cancel_with_swap,
  hiyuki_foreclaimed_midair_1_3,
  hiyuki_foreclaimed_midair_1_3_cancel_with_swap
}
