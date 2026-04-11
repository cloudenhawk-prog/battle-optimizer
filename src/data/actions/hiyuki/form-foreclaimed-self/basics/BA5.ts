
import type { Action } from "../../../../../types/action"
import * as values from "../../values"

// ========== BA5 ==============================================================================================================

// Default
const hiyuki_foreclaimed_BA_5: Action = {
  tags: ['BASIC_ATTACK', 'GLACIO_CHAFE_APPLIER'],
  name: 'Foreclaimed: Basic Attack 5',
  displayName: 'Foreclaimed: Basic Attack 5',
  category: 'Basics',
  castTime: 1.00, // TODO
  multiplier: values.foreclaimed_BA5_multiplier,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['LIBERATION'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: values.foreclaimed_BA5_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: values.foreclaimed_BA5_concerto, share: 0 },
    { energyType: 'frostheart', amount: values.foreclaimed_BA5_frostheart, share: 0 }
  ],
  energyCost: [],
  statusModifications: [
    { type: 'negativeStatus', targetName: 'Glacio Chafe', stackChange: values.foreclaimed_BA5_stack, applicationCount: 1 }
  ],
  damageModifiers: [],
  sideEffects: [],
  coordinatedAttacks: [],
  castConditions: {
    startState: 'GROUND',
    endState: 'GROUND',
    requiredForms: ['Foreclaimed Self'],
    requiredComboTags: ['Foreclaiming BA4'],
    blockedComboTags: ['Foreclaiming BA Block', 'Foreclaiming BA1', 'Foreclaiming BA2', 'Foreclaiming BA3', 'Foreclaiming BA5']
  },
  comboChainTags: ['Foreclaiming BA5'],
  offtune: values.foreclaimed_BA5_offtune,
  hideWhenNotCastable: true,
  groupName: 'Foreclaimed: Basic Attack 5',
  variantName: 'Default',
  resolveVariant(_prevSnapshot, _characterName, owner) {
    // S1: DMG Multipliers of Basic Attack - Foreclaimed Self are increased by 120%.
    const s1Active = owner.sequence >= 1
    if (!s1Active) return { ...this, resolveVariant: undefined }
    return { ...this, multiplier: this.multiplier * 2.2, resolveVariant: undefined }
  }
}

// Cancel With Swap
const hiyuki_foreclaimed_BA_5_cancel_with_swap: Action = {
  tags: ['BASIC_ATTACK', 'GLACIO_CHAFE_APPLIER'],
  name: 'Foreclaimed: Basic Attack 5 (swap cancel)',
  displayName: 'Foreclaimed: Basic Attack 5 (swap cancel)',
  category: 'Basics',
  castTime: 1.00, // TODO
  multiplier: values.foreclaimed_BA5_multiplier,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['LIBERATION'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: values.foreclaimed_BA5_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: values.foreclaimed_BA5_concerto, share: 0 },
    { energyType: 'frostheart', amount: values.foreclaimed_BA5_frostheart, share: 0 }
  ],
  energyCost: [],
  statusModifications: [
    { type: 'negativeStatus', targetName: 'Glacio Chafe', stackChange: values.foreclaimed_BA5_stack, applicationCount: 1 }
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
    requiredComboTags: ['Foreclaiming BA4'],
    blockedComboTags: ['Foreclaiming BA Block', 'Foreclaiming BA1', 'Foreclaiming BA2', 'Foreclaiming BA3', 'Foreclaiming BA5']
  },
  comboChainTags: ['Foreclaiming BA5'],
  offtune: values.foreclaimed_BA5_offtune,
  hideWhenNotCastable: true,
  groupName: 'Foreclaimed: Basic Attack 5',
  variantName: 'Cancel With Swap',
  resolveVariant(_prevSnapshot, _characterName, owner) {
    // S1: DMG Multipliers of Basic Attack - Foreclaimed Self are increased by 120%.
    const s1Active = owner.sequence >= 1
    if (!s1Active) return { ...this, resolveVariant: undefined }
    return { ...this, multiplier: this.multiplier * 2.2, resolveVariant: undefined }
  }
}

export {
  hiyuki_foreclaimed_BA_5,
  hiyuki_foreclaimed_BA_5_cancel_with_swap
}