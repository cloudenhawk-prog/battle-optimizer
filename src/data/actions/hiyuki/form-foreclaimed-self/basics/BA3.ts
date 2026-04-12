
import type { Action } from '../../../../../types/action'
import * as values from '../../values'

// ========== BA3 ==============================================================================================================

// Default
const hiyuki_foreclaimed_BA_3: Action = {
  tags: ['BASIC_ATTACK', 'GLACIO_CHAFE_APPLIER'],
  name: 'Foreclaimed: Basic Attack 3',
  displayName: 'Foreclaimed: Basic Attack 3',
  category: 'Basics',
  castTime: 1.00, // TODO
  multiplier: values.foreclaimed_BA3_multiplier,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['LIBERATION'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: values.foreclaimed_BA3_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: values.foreclaimed_BA3_concerto, share: 0 },
    { energyType: 'frostheart', amount: values.foreclaimed_BA3_frostheart, share: 0 }
  ],
  energyCost: [],
  statusModifications: [
    { type: 'negativeStatus', targetName: 'Glacio Chafe', stackChange: values.foreclaimed_BA3_stack, applicationCount: 1 }
  ],
  damageModifiers: [],
  sideEffects: [],
  coordinatedAttacks: [],
  castConditions: {
    startState: 'GROUND',
    endState: 'GROUND',
    preventsSwapOut: true,
    requiredForms: ['Foreclaimed Self'],
    requiredComboTags: ['Foreclaiming BA2'],
    blockedComboTags: ['Foreclaiming BA Block', 'Foreclaiming BA1', 'Foreclaiming BA3', 'Foreclaiming BA4']
  },
  comboChainTags: ['Foreclaiming BA Block'],
  offtune: values.foreclaimed_BA3_offtune,
  hideWhenNotCastable: true,
  groupName: 'Foreclaimed: Basic Attack 3',
  variantName: 'Default',
  resolveVariant(_prevSnapshot, _characterName, owner) {
    // S1: DMG Multipliers of Basic Attack - Foreclaimed Self are increased by 120%.
    const s1Active = owner.sequence >= 1
    if (!s1Active) return { ...this, resolveVariant: undefined }
    return { ...this, multiplier: this.multiplier * 2.2, resolveVariant: undefined }
  }
}

// Cancel With Swap
const hiyuki_foreclaimed_BA_3_cancel_with_swap: Action = {
  tags: ['BASIC_ATTACK', 'GLACIO_CHAFE_APPLIER'],
  name: 'Foreclaimed: Basic Attack 3 (swap cancel)',
  displayName: 'Foreclaimed: Basic Attack 3 (swap cancel)',
  category: 'Basics',
  castTime: 1.00, // TODO
  multiplier: values.foreclaimed_BA3_multiplier,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['LIBERATION'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: values.foreclaimed_BA3_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: values.foreclaimed_BA3_concerto, share: 0 },
    { energyType: 'frostheart', amount: values.foreclaimed_BA3_frostheart, share: 0 }
  ],
  energyCost: [],
  statusModifications: [
    { type: 'negativeStatus', targetName: 'Glacio Chafe', stackChange: values.foreclaimed_BA3_stack, applicationCount: 1 }
  ],
  damageModifiers: [],
  sideEffects: [],
  coordinatedAttacks: [],
  castConditions: {
    startState: 'GROUND',
    swapOutState: 'GROUND',
    endState: 'GROUND',
    requiresSwapOut: true,
    persistenceTime: 1000, // TODO
    requiredForms: ['Foreclaimed Self'],
    requiredComboTags: ['Foreclaiming BA2'],
    blockedComboTags: ['Foreclaiming BA Block', 'Foreclaiming BA1', 'Foreclaiming BA3', 'Foreclaiming BA4']
  },
  comboChainTags: ['Foreclaiming BA3'],
  offtune: values.foreclaimed_BA3_offtune,
  hideWhenNotCastable: true,
  groupName: 'Foreclaimed: Basic Attack 3',
  variantName: 'Cancel With Swap',
  resolveVariant(_prevSnapshot, _characterName, owner) {
    // S1: DMG Multipliers of Basic Attack - Foreclaimed Self are increased by 120%.
    const s1Active = owner.sequence >= 1
    if (!s1Active) return { ...this, resolveVariant: undefined }
    return { ...this, multiplier: this.multiplier * 2.2, resolveVariant: undefined }
  }
}


// ========== BA3-4 ============================================================================================================

// Default
const hiyuki_foreclaimed_BA_3_4: Action = {
  tags: ['BASIC_ATTACK', 'GLACIO_CHAFE_APPLIER'],
  name: 'Foreclaimed: Basic Attack 3-4',
  displayName: 'Foreclaimed: Basic Attack 3-4',
  category: 'Basics',
  castTime: 1.00, // TODO
  multiplier: values.foreclaimed_BA3_multiplier + values.foreclaimed_BA4_multiplier,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['LIBERATION'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: values.foreclaimed_BA3_energy + values.foreclaimed_BA4_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: values.foreclaimed_BA3_concerto + values.foreclaimed_BA4_concerto, share: 0 },
    { energyType: 'frostheart', amount: values.foreclaimed_BA3_frostheart + values.foreclaimed_BA4_frostheart, share: 0 }
  ],
  energyCost: [],
  statusModifications: [
    { type: 'negativeStatus', targetName: 'Glacio Chafe', stackChange: values.foreclaimed_BA3_stack + values.foreclaimed_BA4_stack, applicationCount: 2 }
  ],
  damageModifiers: [],
  sideEffects: [],
  coordinatedAttacks: [],
  castConditions: {
    startState: 'GROUND',
    endState: 'GROUND',
    preventsSwapOut: true,
    requiredForms: ['Foreclaimed Self'],
    requiredComboTags: ['Foreclaiming BA2'],
    blockedComboTags: ['Foreclaiming BA Block', 'Foreclaiming BA1', 'Foreclaiming BA3', 'Foreclaiming BA4']
  },
  comboChainTags: ['Foreclaiming BA Block'],
  offtune: values.foreclaimed_BA3_offtune + values.foreclaimed_BA4_offtune,
  hideWhenNotCastable: true,
  groupName: 'Foreclaimed: Basic Attack 3-4',
  variantName: 'Default',
  resolveVariant(_prevSnapshot, _characterName, owner) {
    // S1: DMG Multipliers of Basic Attack - Foreclaimed Self are increased by 120%.
    const s1Active = owner.sequence >= 1
    if (!s1Active) return { ...this, resolveVariant: undefined }
    return { ...this, multiplier: this.multiplier * 2.2, resolveVariant: undefined }
  }
}

// Cancel With Swap
const hiyuki_foreclaimed_BA_3_4_cancel_with_swap: Action = {
  tags: ['BASIC_ATTACK', 'GLACIO_CHAFE_APPLIER'],
  name: 'Foreclaimed: Basic Attack 3-4 (swap cancel)',
  displayName: 'Foreclaimed: Basic Attack 3-4 (swap cancel)',
  category: 'Basics',
  castTime: 1.00, // TODO
  multiplier: values.foreclaimed_BA3_multiplier + values.foreclaimed_BA4_multiplier,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['LIBERATION'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: values.foreclaimed_BA3_energy + values.foreclaimed_BA4_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: values.foreclaimed_BA3_concerto + values.foreclaimed_BA4_concerto, share: 0 },
    { energyType: 'frostheart', amount: values.foreclaimed_BA3_frostheart + values.foreclaimed_BA4_frostheart, share: 0 }
  ],
  energyCost: [],
  statusModifications: [
    { type: 'negativeStatus', targetName: 'Glacio Chafe', stackChange: values.foreclaimed_BA3_stack + values.foreclaimed_BA4_stack, applicationCount: 2 }
  ],
  damageModifiers: [],
  sideEffects: [],
  coordinatedAttacks: [],
  castConditions: {
    startState: 'GROUND',
    swapOutState: 'GROUND',
    endState: 'GROUND',
    requiresSwapOut: true,
    persistenceTime: 1000, // TODO
    requiredForms: ['Foreclaimed Self'],
    requiredComboTags: ['Foreclaiming BA2'],
    blockedComboTags: ['Foreclaiming BA Block', 'Foreclaiming BA1', 'Foreclaiming BA3', 'Foreclaiming BA4']
  },
  comboChainTags: ['Foreclaiming BA4'],
  offtune: values.foreclaimed_BA3_offtune + values.foreclaimed_BA4_offtune,
  hideWhenNotCastable: true,
  groupName: 'Foreclaimed: Basic Attack 3-4',
  variantName: 'Cancel With Swap',
  resolveVariant(_prevSnapshot, _characterName, owner) {
    // S1: DMG Multipliers of Basic Attack - Foreclaimed Self are increased by 120%.
    const s1Active = owner.sequence >= 1
    if (!s1Active) return { ...this, resolveVariant: undefined }
    return { ...this, multiplier: this.multiplier * 2.2, resolveVariant: undefined }
  }
}


// ========== BA3-5 ============================================================================================================

// Default
const hiyuki_foreclaimed_BA_3_5: Action = {
  tags: ['BASIC_ATTACK', 'GLACIO_CHAFE_APPLIER'],
  name: 'Foreclaimed: Basic Attack 3-5',
  displayName: 'Foreclaimed: Basic Attack 3-5',
  category: 'Basics',
  castTime: 1.00, // TODO
  multiplier: values.foreclaimed_BA3_multiplier + values.foreclaimed_BA4_multiplier + values.foreclaimed_BA5_multiplier,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['LIBERATION'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: values.foreclaimed_BA3_energy + values.foreclaimed_BA4_energy + values.foreclaimed_BA5_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: values.foreclaimed_BA3_concerto + values.foreclaimed_BA4_concerto + values.foreclaimed_BA5_concerto, share: 0 },
    { energyType: 'frostheart', amount: values.foreclaimed_BA3_frostheart + values.foreclaimed_BA4_frostheart + values.foreclaimed_BA5_frostheart, share: 0 }
  ],
  energyCost: [],
  statusModifications: [
    { type: 'negativeStatus', targetName: 'Glacio Chafe', stackChange: values.foreclaimed_BA3_stack + values.foreclaimed_BA4_stack + values.foreclaimed_BA5_stack, applicationCount: 3 }
  ],
  damageModifiers: [],
  sideEffects: [],
  coordinatedAttacks: [],
  castConditions: {
    startState: 'GROUND',
    endState: 'GROUND',
    preventsSwapOut: true,
    requiredForms: ['Foreclaimed Self'],
    requiredComboTags: ['Foreclaiming BA2'],
    blockedComboTags: ['Foreclaiming BA Block', 'Foreclaiming BA1', 'Foreclaiming BA3', 'Foreclaiming BA4']
  },
  comboChainTags: ['Foreclaiming BA5'],
  offtune: values.foreclaimed_BA3_offtune + values.foreclaimed_BA4_offtune + values.foreclaimed_BA5_offtune,
  hideWhenNotCastable: true,
  groupName: 'Foreclaimed: Basic Attack 3-5',
  variantName: 'Default',
  resolveVariant(_prevSnapshot, _characterName, owner) {
    // S1: DMG Multipliers of Basic Attack - Foreclaimed Self are increased by 120%.
    const s1Active = owner.sequence >= 1
    if (!s1Active) return { ...this, resolveVariant: undefined }
    return { ...this, multiplier: this.multiplier * 2.2, resolveVariant: undefined }
  }
}

// Cancel With Swap
const hiyuki_foreclaimed_BA_3_5_cancel_with_swap: Action = {
  tags: ['BASIC_ATTACK', 'GLACIO_CHAFE_APPLIER'],
  name: 'Foreclaimed: Basic Attack 3-5 (swap cancel)',
  displayName: 'Foreclaimed: Basic Attack 3-5 (swap cancel)',
  category: 'Basics',
  castTime: 1.00, // TODO
  multiplier: values.foreclaimed_BA3_multiplier + values.foreclaimed_BA4_multiplier + values.foreclaimed_BA5_multiplier,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['LIBERATION'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: values.foreclaimed_BA3_energy + values.foreclaimed_BA4_energy + values.foreclaimed_BA5_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: values.foreclaimed_BA3_concerto + values.foreclaimed_BA4_concerto + values.foreclaimed_BA5_concerto, share: 0 },
    { energyType: 'frostheart', amount: values.foreclaimed_BA3_frostheart + values.foreclaimed_BA4_frostheart + values.foreclaimed_BA5_frostheart, share: 0 }
  ],
  energyCost: [],
  statusModifications: [
    { type: 'negativeStatus', targetName: 'Glacio Chafe', stackChange: values.foreclaimed_BA3_stack + values.foreclaimed_BA4_stack + values.foreclaimed_BA5_stack, applicationCount: 3 }
  ],
  damageModifiers: [],
  sideEffects: [],
  coordinatedAttacks: [],
  castConditions: {
    startState: 'GROUND',
    swapOutState: 'GROUND',
    endState: 'GROUND',
    requiresSwapOut: true,
    persistenceTime: 1000, // TODO
    requiredForms: ['Foreclaimed Self'],
    requiredComboTags: ['Foreclaiming BA2'],
    blockedComboTags: ['Foreclaiming BA Block', 'Foreclaiming BA1', 'Foreclaiming BA3', 'Foreclaiming BA4']
  },
  comboChainTags: ['Foreclaiming BA5'],
  offtune: values.foreclaimed_BA3_offtune + values.foreclaimed_BA4_offtune + values.foreclaimed_BA5_offtune,
  hideWhenNotCastable: true,
  groupName: 'Foreclaimed: Basic Attack 3-5',
  variantName: 'Cancel With Swap',
  resolveVariant(_prevSnapshot, _characterName, owner) {
    // S1: DMG Multipliers of Basic Attack - Foreclaimed Self are increased by 120%.
    const s1Active = owner.sequence >= 1
    if (!s1Active) return { ...this, resolveVariant: undefined }
    return { ...this, multiplier: this.multiplier * 2.2, resolveVariant: undefined }
  }
}

export {
  hiyuki_foreclaimed_BA_3,
  hiyuki_foreclaimed_BA_3_cancel_with_swap,
  hiyuki_foreclaimed_BA_3_4,
  hiyuki_foreclaimed_BA_3_4_cancel_with_swap,
  hiyuki_foreclaimed_BA_3_5,
  hiyuki_foreclaimed_BA_3_5_cancel_with_swap
}

