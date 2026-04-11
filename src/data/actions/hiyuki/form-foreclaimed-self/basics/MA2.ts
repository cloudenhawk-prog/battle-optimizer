import type { Action } from "../../../../../types/action"
import * as values from "../../values"

// ========== MA2 ==============================================================================================================

// Default
const hiyuki_foreclaimed_midair_2: Action = {
  tags: ['BASIC_ATTACK', 'GLACIO_CHAFE_APPLIER'],
  name: 'Foreclaimed: Mid-air Attack 2',
  displayName: 'Foreclaimed: Mid-air Attack 2',
  category: 'Basics',
  castTime: 1.00, // TODO
  multiplier: values.foreclaimed_MA2_multiplier,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['LIBERATION'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: values.foreclaimed_MA2_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: values.foreclaimed_MA2_concerto, share: 0 },
    { energyType: 'frostheart', amount: values.foreclaimed_MA2_frostheart, share: 0 }
  ],
  energyCost: [],
  statusModifications: [
    { type: 'negativeStatus', targetName: 'Glacio Chafe', stackChange: values.foreclaimed_MA2_stack, applicationCount: 1 }
  ],
  damageModifiers: [],
  sideEffects: [],
  coordinatedAttacks: [],
  castConditions: {
    startState: 'AIR',
    endState: 'AIR',
    requiredForms: ['Foreclaimed Self'],
    requiredComboTags: ['Foreclaiming MA1'],
    blockedComboTags: ['Foreclaiming MA Block', 'Foreclaiming MA2']
  },
  comboChainTags: ['Foreclaiming MA Block'],
  offtune: values.foreclaimed_MA2_offtune,
  hideWhenNotCastable: true,
  groupName: 'Foreclaimed: Mid-air Attack 2',
  variantName: 'Default',
  resolveVariant(_prevSnapshot, _characterName, owner) {
    // S1: DMG Multipliers of Mid-air Attack - Foreclaimed Self are increased by 120%.
    const s1Active = owner.sequence >= 1
    if (!s1Active) return { ...this, resolveVariant: undefined }
    return { ...this, multiplier: this.multiplier * 2.2, resolveVariant: undefined }
  }
}

// Cancel With Swap
const hiyuki_foreclaimed_midair_2_cancel_with_swap: Action = {
  tags: ['BASIC_ATTACK', 'GLACIO_CHAFE_APPLIER'],
  name: 'Foreclaimed: Mid-air Attack 2 (swap cancel)',
  displayName: 'Foreclaimed: Mid-air Attack 2 (swap cancel)',
  category: 'Basics',
  castTime: 1.00, // TODO
  multiplier: values.foreclaimed_MA2_multiplier,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['LIBERATION'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: values.foreclaimed_MA2_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: values.foreclaimed_MA2_concerto, share: 0 },
    { energyType: 'frostheart', amount: values.foreclaimed_MA2_frostheart, share: 0 }
  ],
  energyCost: [],
  statusModifications: [
    { type: 'negativeStatus', targetName: 'Glacio Chafe', stackChange: values.foreclaimed_MA2_stack, applicationCount: 1 }
  ],
  damageModifiers: [],
  sideEffects: [],
  coordinatedAttacks: [],
  castConditions: {
    startState: 'AIR',
    swapOutState: 'AIR',
    endState: 'AIR',
    requiresSwapOut: true,
    persistenceTime: 1000, // TODO
    requiredForms: ['Foreclaimed Self'],
    requiredComboTags: ['Foreclaiming MA1'],
    blockedComboTags: ['Foreclaiming MA Block', 'Foreclaiming MA2']
  },
  comboChainTags: ['Foreclaiming MA2'],
  offtune: values.foreclaimed_MA2_offtune,
  hideWhenNotCastable: true,
  groupName: 'Foreclaimed: Mid-air Attack 2',
  variantName: 'Cancel With Swap',
  resolveVariant(_prevSnapshot, _characterName, owner) {
    // S1: DMG Multipliers of Mid-air Attack - Foreclaimed Self are increased by 120%.
    const s1Active = owner.sequence >= 1
    if (!s1Active) return { ...this, resolveVariant: undefined }
    return { ...this, multiplier: this.multiplier * 2.2, resolveVariant: undefined }
  }
}


// ========== MA2-3 ============================================================================================================

// Default
const hiyuki_foreclaimed_midair_2_3: Action = {
  tags: ['BASIC_ATTACK', 'GLACIO_CHAFE_APPLIER'],
  name: 'Foreclaimed: Mid-air Attack 2-3',
  displayName: 'Foreclaimed: Mid-air Attack 2-3',
  category: 'Basics',
  castTime: 1.00, // TODO
  multiplier: values.foreclaimed_MA2_multiplier + values.foreclaimed_MA3_multiplier,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['LIBERATION'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: values.foreclaimed_MA2_energy + values.foreclaimed_MA3_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: values.foreclaimed_MA2_concerto + values.foreclaimed_MA3_concerto, share: 0 },
    { energyType: 'frostheart', amount: values.foreclaimed_MA2_frostheart + values.foreclaimed_MA3_frostheart, share: 0 }
  ],
  energyCost: [],
  statusModifications: [
    { type: 'negativeStatus', targetName: 'Glacio Chafe', stackChange: values.foreclaimed_MA2_stack + values.foreclaimed_MA3_stack, applicationCount: 2 }
  ],
  damageModifiers: [],
  sideEffects: [],
  coordinatedAttacks: [],
  castConditions: {
    startState: 'AIR',
    endState: 'GROUND',
    requiredForms: ['Foreclaimed Self'],
    requiredComboTags: ['Foreclaiming MA1'],
    blockedComboTags: ['Foreclaiming MA Block', 'Foreclaiming MA2']
  },
  comboChainTags: ['Foreclaiming MA Block'],
  offtune: values.foreclaimed_MA2_offtune + values.foreclaimed_MA3_offtune,
  hideWhenNotCastable: true,
  groupName: 'Foreclaimed: Mid-air Attack 2-3',
  variantName: 'Default',
  resolveVariant(_prevSnapshot, _characterName, owner) {
    // S1: DMG Multipliers of Mid-air Attack - Foreclaimed Self are increased by 120%.
    const s1Active = owner.sequence >= 1
    if (!s1Active) return { ...this, resolveVariant: undefined }
    return { ...this, multiplier: this.multiplier * 2.2, resolveVariant: undefined }
  }
}

// Cancel With Swap
const hiyuki_foreclaimed_midair_2_3_cancel_with_swap: Action = {
  tags: ['BASIC_ATTACK', 'GLACIO_CHAFE_APPLIER'],
  name: 'Foreclaimed: Mid-air Attack 2-3 (swap cancel)',
  displayName: 'Foreclaimed: Mid-air Attack 2-3 (swap cancel)',
  category: 'Basics',
  castTime: 1.00, // TODO
  multiplier: values.foreclaimed_MA2_multiplier + values.foreclaimed_MA3_multiplier,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['LIBERATION'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: values.foreclaimed_MA2_energy + values.foreclaimed_MA3_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: values.foreclaimed_MA2_concerto + values.foreclaimed_MA3_concerto, share: 0 },
    { energyType: 'frostheart', amount: values.foreclaimed_MA2_frostheart + values.foreclaimed_MA3_frostheart, share: 0 }
  ],
  energyCost: [],
  statusModifications: [
    { type: 'negativeStatus', targetName: 'Glacio Chafe', stackChange: values.foreclaimed_MA2_stack + values.foreclaimed_MA3_stack, applicationCount: 2 }
  ],
  damageModifiers: [],
  sideEffects: [],
  coordinatedAttacks: [],
  castConditions: {
    startState: 'AIR',
    swapOutState: 'AIR',
    endState: 'GROUND',
    requiresSwapOut: true,
    persistenceTime: 1000, // TODO
    requiredForms: ['Foreclaimed Self'],
    requiredComboTags: ['Foreclaiming MA1'],
    blockedComboTags: ['Foreclaiming MA Block', 'Foreclaiming MA2']
  },
  comboChainTags: ['Foreclaiming MA3'],
  offtune: values.foreclaimed_MA2_offtune + values.foreclaimed_MA3_offtune,
  hideWhenNotCastable: true,
  groupName: 'Foreclaimed: Mid-air Attack 2-3',
  variantName: 'Cancel With Swap',
  resolveVariant(_prevSnapshot, _characterName, owner) {
    // S1: DMG Multipliers of Mid-air Attack - Foreclaimed Self are increased by 120%.
    const s1Active = owner.sequence >= 1
    if (!s1Active) return { ...this, resolveVariant: undefined }
    return { ...this, multiplier: this.multiplier * 2.2, resolveVariant: undefined }
  }
}

export {
  hiyuki_foreclaimed_midair_2,
  hiyuki_foreclaimed_midair_2_cancel_with_swap,
  hiyuki_foreclaimed_midair_2_3,
  hiyuki_foreclaimed_midair_2_3_cancel_with_swap
}
