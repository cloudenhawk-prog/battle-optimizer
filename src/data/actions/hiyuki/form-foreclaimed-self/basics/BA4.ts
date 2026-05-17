
import type { Action } from '../../../../../types/action'
import * as values from '../../values'
import { s1_foreclaimed_basic_multiplier } from '../../../../modifiers/hiyuki'

// ========== BA4 ==============================================================================================================

// Default
const hiyuki_foreclaimed_BA_4: Action = {
  tags: ['BASIC_ATTACK', 'GLACIO_CHAFE_APPLIER'],
  name: 'Foreclaimed: Basic Attack 4',
  displayName: 'Foreclaimed: Basic Attack 4',
  category: 'Basics',
  castTime: values.cast_time_UBA4,
  multiplier: values.foreclaimed_BA4_multiplier,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['LIBERATION'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: values.foreclaimed_BA4_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: values.foreclaimed_BA4_concerto, share: 0 },
    { energyType: 'frostheart', amount: values.foreclaimed_BA4_frostheart, share: 0 }
  ],
  energyCost: [],
  statusModifications: [
    { type: 'negativeStatus', targetName: 'Glacio Chafe', stackChange: values.foreclaimed_BA4_stack, applicationCount: 1 }
  ],
  damageModifiers: [],
  inherentModifiers: [s1_foreclaimed_basic_multiplier],
  sideEffects: [],
  coordinatedAttacks: [],
  castConditions: {
    startState: 'GROUND',
    endState: 'GROUND',
    preventsSwapOut: true,
    requiredForms: ['Foreclaimed Self'],
    requiredComboTags: ['Foreclaiming BA3'],
    blockedComboTags: ['Foreclaiming BA Block', 'Foreclaiming BA1', 'Foreclaiming BA2', 'Foreclaiming BA4']
  },
  comboChainTags: ['Foreclaiming BA Block'],
  offtune: values.foreclaimed_BA4_offtune,
  hideWhenNotCastable: true,
  groupName: 'Foreclaimed: Basic Attack 4',
  variantName: 'Default',
}

// Cancel With Swap
const hiyuki_foreclaimed_BA_4_cancel_with_swap: Action = {
  tags: ['BASIC_ATTACK', 'GLACIO_CHAFE_APPLIER'],
  name: 'Foreclaimed: Basic Attack 4 (swap cancel)',
  displayName: 'Foreclaimed: Basic Attack 4 (swap cancel)',
  category: 'Basics',
  castTime: values.SWAP_CANCEL_TIME,
  multiplier: values.foreclaimed_BA4_multiplier,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['LIBERATION'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: values.foreclaimed_BA4_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: values.foreclaimed_BA4_concerto, share: 0 },
    { energyType: 'frostheart', amount: values.foreclaimed_BA4_frostheart, share: 0 }
  ],
  energyCost: [],
  statusModifications: [
    { type: 'negativeStatus', targetName: 'Glacio Chafe', stackChange: values.foreclaimed_BA4_stack, applicationCount: 1 }
  ],
  damageModifiers: [],
  inherentModifiers: [s1_foreclaimed_basic_multiplier],
  sideEffects: [],
  coordinatedAttacks: [],
  castConditions: {
    startState: 'GROUND',
    swapOutState: 'GROUND',
    endState: 'GROUND',
    requiresSwapOut: true,
    persistenceTime: 1000, // TODO
    requiredForms: ['Foreclaimed Self'],
    requiredComboTags: ['Foreclaiming BA3'],
    blockedComboTags: ['Foreclaiming BA Block', 'Foreclaiming BA1', 'Foreclaiming BA2', 'Foreclaiming BA4']
  },
  comboChainTags: ['Foreclaiming BA4'],
  offtune: values.foreclaimed_BA4_offtune,
  hideWhenNotCastable: true,
  groupName: 'Foreclaimed: Basic Attack 4',
  variantName: 'Cancel With Swap',
}


// ========== BA4-5 ============================================================================================================

// Default
const hiyuki_foreclaimed_BA_4_5: Action = {
  tags: ['BASIC_ATTACK', 'GLACIO_CHAFE_APPLIER'],
  name: 'Foreclaimed: Basic Attack 4-5',
  displayName: 'Foreclaimed: Basic Attack 4-5',
  category: 'Basics',
  castTime: values.cast_time_UBA4 + values.cast_time_UBA5,
  multiplier: values.foreclaimed_BA4_multiplier + values.foreclaimed_BA5_multiplier,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['LIBERATION'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: values.foreclaimed_BA4_energy + values.foreclaimed_BA5_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: values.foreclaimed_BA4_concerto + values.foreclaimed_BA5_concerto, share: 0 },
    { energyType: 'frostheart', amount: values.foreclaimed_BA4_frostheart + values.foreclaimed_BA5_frostheart, share: 0 }
  ],
  energyCost: [],
  statusModifications: [
    { type: 'negativeStatus', targetName: 'Glacio Chafe', stackChange: values.foreclaimed_BA4_stack + values.foreclaimed_BA5_stack, applicationCount: 2 }
  ],
  damageModifiers: [],
  inherentModifiers: [s1_foreclaimed_basic_multiplier],
  sideEffects: [],
  coordinatedAttacks: [],
  castConditions: {
    startState: 'GROUND',
    endState: 'GROUND',
    preventsSwapOut: true,
    requiredForms: ['Foreclaimed Self'],
    requiredComboTags: ['Foreclaiming BA3'],
    blockedComboTags: ['Foreclaiming BA Block', 'Foreclaiming BA1', 'Foreclaiming BA2', 'Foreclaiming BA4']
  },
  comboChainTags: ['Foreclaiming BA5'],
  offtune: values.foreclaimed_BA4_offtune + values.foreclaimed_BA5_offtune,
  hideWhenNotCastable: true,
  groupName: 'Foreclaimed: Basic Attack 4-5',
  variantName: 'Default',
}

// Cancel With Swap
const hiyuki_foreclaimed_BA_4_5_cancel_with_swap: Action = {
  tags: ['BASIC_ATTACK', 'GLACIO_CHAFE_APPLIER'],
  name: 'Foreclaimed: Basic Attack 4-5 (swap cancel)',
  displayName: 'Foreclaimed: Basic Attack 4-5 (swap cancel)',
  category: 'Basics',
  castTime: values.cast_time_UBA4 + values.SWAP_CANCEL_TIME,
  multiplier: values.foreclaimed_BA4_multiplier + values.foreclaimed_BA5_multiplier,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['LIBERATION'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: values.foreclaimed_BA4_energy + values.foreclaimed_BA5_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: values.foreclaimed_BA4_concerto + values.foreclaimed_BA5_concerto, share: 0 },
    { energyType: 'frostheart', amount: values.foreclaimed_BA4_frostheart + values.foreclaimed_BA5_frostheart, share: 0 }
  ],
  energyCost: [],
  statusModifications: [
    { type: 'negativeStatus', targetName: 'Glacio Chafe', stackChange: values.foreclaimed_BA4_stack + values.foreclaimed_BA5_stack, applicationCount: 2 }
  ],
  damageModifiers: [],
  inherentModifiers: [s1_foreclaimed_basic_multiplier],
  sideEffects: [],
  coordinatedAttacks: [],
  castConditions: {
    startState: 'GROUND',
    swapOutState: 'GROUND',
    endState: 'GROUND',
    requiresSwapOut: true,
    persistenceTime: 1000, // TODO
    requiredForms: ['Foreclaimed Self'],
    requiredComboTags: ['Foreclaiming BA3'],
    blockedComboTags: ['Foreclaiming BA Block', 'Foreclaiming BA1', 'Foreclaiming BA2', 'Foreclaiming BA4']
  },
  comboChainTags: ['Foreclaiming BA5'],
  offtune: values.foreclaimed_BA4_offtune + values.foreclaimed_BA5_offtune,
  hideWhenNotCastable: true,
  groupName: 'Foreclaimed: Basic Attack 4-5',
  variantName: 'Cancel With Swap',
}

// Cancel With Dash
const hiyuki_foreclaimed_BA_4_5_cancel_with_dash: Action = {
  tags: ['BASIC_ATTACK', 'GLACIO_CHAFE_APPLIER'],
  name: 'Foreclaimed: Basic Attack 4-5 (dash cancel)',
  displayName: 'Foreclaimed: Basic Attack 4-5 (dash cancel)',
  category: 'Basics',
  castTime: values.cast_time_UBA4 + values.cast_time_UBA5_dash_cancel,
  multiplier: values.foreclaimed_BA4_multiplier + values.foreclaimed_BA5_multiplier,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['LIBERATION'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: values.foreclaimed_BA4_energy + values.foreclaimed_BA5_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: values.foreclaimed_BA4_concerto + values.foreclaimed_BA5_concerto, share: 0 },
    { energyType: 'frostheart', amount: values.foreclaimed_BA4_frostheart + values.foreclaimed_BA5_frostheart, share: 0 }
  ],
  energyCost: [],
  statusModifications: [
    { type: 'negativeStatus', targetName: 'Glacio Chafe', stackChange: values.foreclaimed_BA4_stack + values.foreclaimed_BA5_stack, applicationCount: 2 }
  ],
  damageModifiers: [],
  inherentModifiers: [s1_foreclaimed_basic_multiplier],
  sideEffects: [],
  coordinatedAttacks: [],
  castConditions: {
    startState: 'GROUND',
    endState: 'GROUND',
    preventsSwapOut: true,
    requiredForms: ['Foreclaimed Self'],
    requiredComboTags: ['Foreclaiming BA3'],
    blockedComboTags: ['Foreclaiming BA Block', 'Foreclaiming BA1', 'Foreclaiming BA2', 'Foreclaiming BA4']
  },
  restrictNextTo(prevSnapshot, characterName) {
    const currentFrostheart = prevSnapshot?.charactersEnergies[characterName]?.frostheart ?? 0
    const frostAfterCast = currentFrostheart + values.foreclaimed_BA4_frostheart + values.foreclaimed_BA5_frostheart
    return frostAfterCast >= 100 ? ['Foreclaimed: Iai'] : undefined
  },
  comboChainTags: ['Foreclaiming BA5', 'Iai Stance Setup'],
  offtune: values.foreclaimed_BA4_offtune + values.foreclaimed_BA5_offtune,
  hideWhenNotCastable: true,
  groupName: 'Foreclaimed: Basic Attack 4-5',
  variantName: 'Cancel With Dash',
}

export {
  hiyuki_foreclaimed_BA_4,
  hiyuki_foreclaimed_BA_4_cancel_with_swap,
  hiyuki_foreclaimed_BA_4_5,
  hiyuki_foreclaimed_BA_4_5_cancel_with_swap,
  hiyuki_foreclaimed_BA_4_5_cancel_with_dash
}

