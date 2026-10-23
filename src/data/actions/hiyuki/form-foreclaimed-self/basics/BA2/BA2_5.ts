// Hiyuki — Foreclaimed Self form: Basic Attack 2-5 after BA1 (default / swap / dash cancel).
import type { Action } from '../../../../../../types/action'
import * as values from '../../../values'
import { s1_foreclaimed_basic_multiplier } from '../../../../../modifiers/hiyuki'

// ========== BA2-5 ============================================================================================================

// Default
const hiyuki_foreclaimed_BA_2_5: Action = {
  tags: ['BASIC_ATTACK', 'GLACIO_CHAFE_APPLIER'],
  name: 'Foreclaimed: Basic Attack 2-5',
  displayName: 'Foreclaimed: Basic Attack 2-5',
  category: 'Basics',
  castTime: values.cast_time_UBA2 + values.cast_time_UBA3 + values.cast_time_UBA4 + values.cast_time_UBA5,
  multiplier: values.foreclaimed_BA2_multiplier + values.foreclaimed_BA3_multiplier + values.foreclaimed_BA4_multiplier + values.foreclaimed_BA5_multiplier,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['LIBERATION'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: values.foreclaimed_BA2_energy + values.foreclaimed_BA3_energy + values.foreclaimed_BA4_energy + values.foreclaimed_BA5_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: values.foreclaimed_BA2_concerto + values.foreclaimed_BA3_concerto + values.foreclaimed_BA4_concerto + values.foreclaimed_BA5_concerto, share: 0 },
    { energyType: 'frostheart', amount: values.foreclaimed_BA2_frostheart + values.foreclaimed_BA3_frostheart + values.foreclaimed_BA4_frostheart + values.foreclaimed_BA5_frostheart, share: 0 }
  ],
  energyCost: [],
  statusModifications: [
    {
      type: 'negativeStatus',
      targetName: 'Glacio Chafe',
      stackChange: values.foreclaimed_BA2_stack + values.foreclaimed_BA3_stack + values.foreclaimed_BA4_stack + values.foreclaimed_BA5_stack,
      applicationCount: 3
    }
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
    requiredComboTags: ['Foreclaiming BA1'],
    blockedComboTags: ['Foreclaiming BA Block', 'Foreclaiming BA2', 'Foreclaiming BA3', 'Foreclaiming BA4']
  },
  comboChainTags: ['Foreclaiming BA5'],
  offtune: values.foreclaimed_BA2_offtune + values.foreclaimed_BA3_offtune + values.foreclaimed_BA4_offtune + values.foreclaimed_BA5_offtune,
  hideWhenNotCastable: true,
  groupName: 'Foreclaimed: Basic Attack 2-5',
  variantName: 'Default',
  resolveVariant(prevSnapshot, characterName, owner) {
    // S1: DMG Multipliers of Basic Attack - Foreclaimed Self are increased by 120%.
    // S1: After casting Liberation (Foreclaiming: Inward Vision), the NEXT Basic Attack 1-5
    // has BA2 apply +1 Glacio Chafe, consuming s1_enhanced_ba2 token.
    // Each token present adds +1 stackChange and +1 applicationCount (base is 3).
    const s1Active = owner.sequence >= 1
    if (!s1Active) return { ...this, resolveVariant: undefined }

    const energies = prevSnapshot?.charactersEnergies[characterName]
    const hasToken2 = s1Active && (energies?.s1_enhanced_ba2 ?? 0) >= 1
    const tokenCount = (hasToken2 ? 1 : 0)
    const additionalCosts = [
      ...(hasToken2 ? [{ energyType: 's1_enhanced_ba2' as const, amount: 1 }] : [])
    ]

    return {
      ...this,
      ...(tokenCount > 0 ? {
        statusModifications: [{ type: 'negativeStatus' as const, targetName: 'Glacio Chafe', stackChange: values.foreclaimed_BA2_stack + values.foreclaimed_BA3_stack + values.foreclaimed_BA4_stack + values.foreclaimed_BA5_stack + tokenCount, applicationCount: 3 + tokenCount }],
        energyCost: [...this.energyCost, ...additionalCosts],
      } : {}),
      resolveVariant: undefined,
    }
  },
}

// Cancel With Swap
const hiyuki_foreclaimed_BA_2_5_cancel_with_swap: Action = {
  tags: ['BASIC_ATTACK', 'GLACIO_CHAFE_APPLIER'],
  name: 'Foreclaimed: Basic Attack 2-5 (swap cancel)',
  displayName: 'Foreclaimed: Basic Attack 2-5 (swap cancel)',
  category: 'Basics',
  castTime: values.cast_time_UBA2 + values.cast_time_UBA3 + values.cast_time_UBA4 + values.SWAP_CANCEL_TIME,
  multiplier: values.foreclaimed_BA2_multiplier + values.foreclaimed_BA3_multiplier + values.foreclaimed_BA4_multiplier + values.foreclaimed_BA5_multiplier,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['LIBERATION'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: values.foreclaimed_BA2_energy + values.foreclaimed_BA3_energy + values.foreclaimed_BA4_energy + values.foreclaimed_BA5_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: values.foreclaimed_BA2_concerto + values.foreclaimed_BA3_concerto + values.foreclaimed_BA4_concerto + values.foreclaimed_BA5_concerto, share: 0 },
    { energyType: 'frostheart', amount: values.foreclaimed_BA2_frostheart + values.foreclaimed_BA3_frostheart + values.foreclaimed_BA4_frostheart + values.foreclaimed_BA5_frostheart, share: 0 }
  ],
  energyCost: [],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Glacio Chafe', stackChange: values.foreclaimed_BA2_stack + values.foreclaimed_BA3_stack + values.foreclaimed_BA4_stack + values.foreclaimed_BA5_stack, applicationCount: 3 }],
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
    requiredComboTags: ['Foreclaiming BA1'],
    blockedComboTags: ['Foreclaiming BA Block', 'Foreclaiming BA2', 'Foreclaiming BA3', 'Foreclaiming BA4']
  },
  comboChainTags: ['Foreclaiming BA5'],
  offtune: values.foreclaimed_BA2_offtune + values.foreclaimed_BA3_offtune + values.foreclaimed_BA4_offtune + values.foreclaimed_BA5_offtune,
  hideWhenNotCastable: true,
  groupName: 'Foreclaimed: Basic Attack 2-5',
  variantName: 'Cancel With Swap',
  resolveVariant(prevSnapshot, characterName, owner) {
    // S1: DMG Multipliers of Basic Attack - Foreclaimed Self are increased by 120%.
    // S1: After casting Liberation (Foreclaiming: Inward Vision), the NEXT Basic Attack 1-5
    // has BA2 apply +1 Glacio Chafe, consuming s1_enhanced_ba2 token.
    // Each token present adds +1 stackChange and +1 applicationCount (base is 3).
    const s1Active = owner.sequence >= 1
    if (!s1Active) return { ...this, resolveVariant: undefined }

    const energies = prevSnapshot?.charactersEnergies[characterName]
    const hasToken2 = s1Active && (energies?.s1_enhanced_ba2 ?? 0) >= 1
    const tokenCount = (hasToken2 ? 1 : 0)
    const additionalCosts = [
      ...(hasToken2 ? [{ energyType: 's1_enhanced_ba2' as const, amount: 1 }] : [])
    ]

    return {
      ...this,
      ...(tokenCount > 0 ? {
        statusModifications: [{ type: 'negativeStatus' as const, targetName: 'Glacio Chafe', stackChange: values.foreclaimed_BA2_stack + values.foreclaimed_BA3_stack + values.foreclaimed_BA4_stack + values.foreclaimed_BA5_stack + tokenCount, applicationCount: 3 + tokenCount }],
        energyCost: [...this.energyCost, ...additionalCosts],
      } : {}),
      resolveVariant: undefined,
    }
  },
}

// Cancel With Dash
const hiyuki_foreclaimed_BA_2_5_cancel_with_dash: Action = {
  tags: ['BASIC_ATTACK', 'GLACIO_CHAFE_APPLIER'],
  name: 'Foreclaimed: Basic Attack 2-5 (dash cancel)',
  displayName: 'Foreclaimed: Basic Attack 2-5 (dash cancel)',
  category: 'Basics',
  castTime: values.cast_time_UBA2 + values.cast_time_UBA3 + values.cast_time_UBA4 + values.cast_time_UBA5_dash_cancel,
  multiplier: values.foreclaimed_BA2_multiplier + values.foreclaimed_BA3_multiplier + values.foreclaimed_BA4_multiplier + values.foreclaimed_BA5_multiplier,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['LIBERATION'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: values.foreclaimed_BA2_energy + values.foreclaimed_BA3_energy + values.foreclaimed_BA4_energy + values.foreclaimed_BA5_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: values.foreclaimed_BA2_concerto + values.foreclaimed_BA3_concerto + values.foreclaimed_BA4_concerto + values.foreclaimed_BA5_concerto, share: 0 },
    { energyType: 'frostheart', amount: values.foreclaimed_BA2_frostheart + values.foreclaimed_BA3_frostheart + values.foreclaimed_BA4_frostheart + values.foreclaimed_BA5_frostheart, share: 0 }
  ],
  energyCost: [],
  statusModifications: [
    {
      type: 'negativeStatus',
      targetName: 'Glacio Chafe',
      stackChange: values.foreclaimed_BA2_stack + values.foreclaimed_BA3_stack + values.foreclaimed_BA4_stack + values.foreclaimed_BA5_stack,
      applicationCount: 3
    }
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
    requiredComboTags: ['Foreclaiming BA1'],
    blockedComboTags: ['Foreclaiming BA Block', 'Foreclaiming BA2', 'Foreclaiming BA3', 'Foreclaiming BA4']
  },
  restrictNextTo(prevSnapshot, characterName) {
    const currentFrostheart = prevSnapshot?.charactersEnergies[characterName]?.frostheart ?? 0
    const frostAfterCast = currentFrostheart + values.foreclaimed_BA2_frostheart + values.foreclaimed_BA3_frostheart_immediate + values.foreclaimed_BA4_frostheart + values.foreclaimed_BA5_frostheart
    return frostAfterCast >= 100 ? ['Foreclaimed: Iai'] : undefined
  },
  comboChainTags: ['Foreclaiming BA5', 'Iai Stance Setup'],
  offtune: values.foreclaimed_BA2_offtune + values.foreclaimed_BA3_offtune + values.foreclaimed_BA4_offtune + values.foreclaimed_BA5_offtune,
  hideWhenNotCastable: true,
  groupName: 'Foreclaimed: Basic Attack 2-5',
  variantName: 'Cancel With Dash',
  resolveVariant(prevSnapshot, characterName, owner) {
    // S1: DMG Multipliers of Basic Attack - Foreclaimed Self are increased by 120%.
    // S1: After casting Liberation (Foreclaiming: Inward Vision), the NEXT Basic Attack 1-5
    // has BA2 apply +1 Glacio Chafe, consuming s1_enhanced_ba2 token.
    // Each token present adds +1 stackChange and +1 applicationCount (base is 3).
    const s1Active = owner.sequence >= 1
    if (!s1Active) return { ...this, resolveVariant: undefined }

    const energies = prevSnapshot?.charactersEnergies[characterName]
    const hasToken2 = s1Active && (energies?.s1_enhanced_ba2 ?? 0) >= 1
    const tokenCount = (hasToken2 ? 1 : 0)
    const additionalCosts = [
      ...(hasToken2 ? [{ energyType: 's1_enhanced_ba2' as const, amount: 1 }] : [])
    ]

    return {
      ...this,
      ...(tokenCount > 0 ? {
        statusModifications: [{ type: 'negativeStatus' as const, targetName: 'Glacio Chafe', stackChange: values.foreclaimed_BA2_stack + values.foreclaimed_BA3_stack + values.foreclaimed_BA4_stack + values.foreclaimed_BA5_stack + tokenCount, applicationCount: 3 + tokenCount }],
        energyCost: [...this.energyCost, ...additionalCosts],
      } : {}),
      resolveVariant: undefined,
    }
  },
}

export {
  hiyuki_foreclaimed_BA_2_5,
  hiyuki_foreclaimed_BA_2_5_cancel_with_swap,
  hiyuki_foreclaimed_BA_2_5_cancel_with_dash,
}
