// Hiyuki — Foreclaimed Self form: Basic Attack 2-4 after BA1 (default / swap cancel).
import type { Action } from '../../../../../../types/action'
import * as values from '../../../values'
import { s1_foreclaimed_basic_multiplier } from '../../../../../modifiers/hiyuki'

// ========== BA2-4 ============================================================================================================

// Default
const hiyuki_foreclaimed_BA_2_4: Action = {
  tags: ['BASIC_ATTACK', 'GLACIO_CHAFE_APPLIER'],
  name: 'Foreclaimed: Basic Attack 2-4',
  displayName: 'Foreclaimed: Basic Attack 2-4',
  category: 'Basics',
  castTime: values.cast_time_UBA2 + values.cast_time_UBA3 + values.cast_time_UBA4,
  multiplier: values.foreclaimed_BA2_multiplier + values.foreclaimed_BA3_multiplier + values.foreclaimed_BA4_multiplier,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['LIBERATION'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: values.foreclaimed_BA2_energy + values.foreclaimed_BA3_energy + values.foreclaimed_BA4_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: values.foreclaimed_BA2_concerto + values.foreclaimed_BA3_concerto + values.foreclaimed_BA4_concerto, share: 0 },
    { energyType: 'frostheart', amount: values.foreclaimed_BA2_frostheart + values.foreclaimed_BA3_frostheart + values.foreclaimed_BA4_frostheart, share: 0 }
  ],
  energyCost: [],
  statusModifications: [
    {
      type: 'negativeStatus',
      targetName: 'Glacio Chafe',
      stackChange: values.foreclaimed_BA2_stack + values.foreclaimed_BA3_stack + values.foreclaimed_BA4_stack,
      applicationCount: 2
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
  comboChainTags: ['Foreclaiming BA Block'],
  offtune: values.foreclaimed_BA2_offtune + values.foreclaimed_BA3_offtune + values.foreclaimed_BA4_offtune,
  hideWhenNotCastable: true,
  groupName: 'Foreclaimed: Basic Attack 2-4',
  variantName: 'Default',
  resolveVariant(prevSnapshot, characterName, owner) {
    // S1: DMG Multipliers of Basic Attack - Foreclaimed Self are increased by 120%.
    // S1: After casting Liberation (Foreclaiming: Inward Vision), the NEXT Basic Attack 1-5
    // has BA2 apply +1 Glacio Chafe, consuming s1_enhanced_ba2 token.
    // Each token present adds +1 stackChange and +1 applicationCount (base is 2).
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
        statusModifications: [{ type: 'negativeStatus' as const, targetName: 'Glacio Chafe', stackChange: values.foreclaimed_BA2_stack + values.foreclaimed_BA3_stack + values.foreclaimed_BA4_stack + tokenCount, applicationCount: 2 + tokenCount }],
        energyCost: [...this.energyCost, ...additionalCosts],
      } : {}),
      resolveVariant: undefined,
    }
  }
}

// Cancel With Swap
const hiyuki_foreclaimed_BA_2_4_cancel_with_swap: Action = {
  tags: ['BASIC_ATTACK', 'GLACIO_CHAFE_APPLIER'],
  name: 'Foreclaimed: Basic Attack 2-4 (swap cancel)',
  displayName: 'Foreclaimed: Basic Attack 2-4 (swap cancel)',
  category: 'Basics',
  castTime: values.cast_time_UBA2 + values.cast_time_UBA3 + values.SWAP_CANCEL_TIME,
  multiplier: values.foreclaimed_BA2_multiplier + values.foreclaimed_BA3_multiplier + values.foreclaimed_BA4_multiplier,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['LIBERATION'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: values.foreclaimed_BA2_energy + values.foreclaimed_BA3_energy + values.foreclaimed_BA4_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: values.foreclaimed_BA2_concerto + values.foreclaimed_BA3_concerto + values.foreclaimed_BA4_concerto, share: 0 },
    { energyType: 'frostheart', amount: values.foreclaimed_BA2_frostheart + values.foreclaimed_BA3_frostheart + values.foreclaimed_BA4_frostheart, share: 0 }
  ],
  energyCost: [],
  statusModifications: [
    {
      type: 'negativeStatus',
      targetName: 'Glacio Chafe',
      stackChange: values.foreclaimed_BA2_stack + values.foreclaimed_BA3_stack + values.foreclaimed_BA4_stack,
      applicationCount: 2
    }
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
    requiredComboTags: ['Foreclaiming BA1'],
    blockedComboTags: ['Foreclaiming BA Block', 'Foreclaiming BA2', 'Foreclaiming BA3', 'Foreclaiming BA4']
  },
  comboChainTags: ['Foreclaiming BA4'],
  offtune: values.foreclaimed_BA2_offtune + values.foreclaimed_BA3_offtune + values.foreclaimed_BA4_offtune,
  hideWhenNotCastable: true,
  groupName: 'Foreclaimed: Basic Attack 2-4',
  variantName: 'Cancel With Swap',
  resolveVariant(prevSnapshot, characterName, owner) {
    // S1: DMG Multipliers of Basic Attack - Foreclaimed Self are increased by 120%.
    // S1: After casting Liberation (Foreclaiming: Inward Vision), the NEXT Basic Attack 1-5
    // has BA2 apply +1 Glacio Chafe, consuming s1_enhanced_ba2 token.
    // Each token present adds +1 stackChange and +1 applicationCount (base is 2).
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
        statusModifications: [{ type: 'negativeStatus' as const, targetName: 'Glacio Chafe', stackChange: values.foreclaimed_BA2_stack + values.foreclaimed_BA3_stack + values.foreclaimed_BA4_stack + tokenCount, applicationCount: 2 + tokenCount }],
        energyCost: [...this.energyCost, ...additionalCosts],
      } : {}),
      resolveVariant: undefined,
    }
  }
}

export {
  hiyuki_foreclaimed_BA_2_4,
  hiyuki_foreclaimed_BA_2_4_cancel_with_swap,
}
