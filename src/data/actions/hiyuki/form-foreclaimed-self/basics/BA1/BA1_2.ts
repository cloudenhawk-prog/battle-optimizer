// Hiyuki — Foreclaimed Self form: Basic Attack 1-2 (default / swap cancel).
import type { Action } from '../../../../../../types/action'
import * as values from '../../../values'
import { s1_foreclaimed_basic_multiplier } from '../../../../../modifiers/hiyuki'

// ========== BA1-2 ============================================================================================================

// Default
const hiyuki_foreclaimed_BA_1_2: Action = {
  tags: ['BASIC_ATTACK'],
  name: 'Foreclaimed: Basic Attack 1-2',
  displayName: 'Foreclaimed: Basic Attack 1-2',
  category: 'Basics',
  castTime: values.cast_time_UBA1 + values.cast_time_UBA2,
  multiplier: values.foreclaimed_BA1_multiplier + values.foreclaimed_BA2_multiplier,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['LIBERATION'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: values.foreclaimed_BA1_energy + values.foreclaimed_BA2_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: values.foreclaimed_BA1_concerto + values.foreclaimed_BA2_concerto, share: 0 },
    { energyType: 'frostheart', amount: values.foreclaimed_BA1_frostheart + values.foreclaimed_BA2_frostheart, share: 0 }
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  inherentModifiers: [s1_foreclaimed_basic_multiplier],
  sideEffects: [],
  coordinatedAttacks: [],
  castConditions: {
    startState: 'GROUND',
    endState: 'GROUND',
    preventsSwapOut: true,
    requiredForms: ['Foreclaimed Self'],
    blockedComboTags: ['Foreclaiming BA Block', 'Foreclaiming BA1', 'Foreclaiming BA2', 'Foreclaiming BA3', 'Foreclaiming BA4'],
  },
  comboChainTags: ['Foreclaiming BA Block'],
  offtune: values.foreclaimed_BA1_offtune + values.foreclaimed_BA2_offtune,
  hideWhenNotCastable: true,
  groupName: 'Foreclaimed: Basic Attack 1-2',
  variantName: 'Default',
  resolveVariant(prevSnapshot, characterName, owner) {
    // S1: DMG Multipliers of Basic Attack - Foreclaimed Self are increased by 120%.
    // S1: After casting Liberation (Foreclaiming: Inward Vision), the NEXT Basic Attack 1-5
    // has BA1 apply +1 Glacio Chafe, consuming s1_enhanced_ba1 token.
    // Each token present adds +1 stackChange and +1 applicationCount (base is 0).
    const s1Active = owner.sequence >= 1
    if (!s1Active) return { ...this, resolveVariant: undefined }

    const energies = prevSnapshot?.charactersEnergies[characterName]
    const hasToken1 = s1Active && (energies?.s1_enhanced_ba1 ?? 0) >= 1
    const hasToken2 = s1Active && (energies?.s1_enhanced_ba2 ?? 0) >= 1
    const tokenCount = (hasToken1 ? 1 : 0) + (hasToken2 ? 1 : 0)
    const additionalCosts = [
      ...(hasToken1 ? [{ energyType: 's1_enhanced_ba1' as const, amount: 1 }] : []),
      ...(hasToken2 ? [{ energyType: 's1_enhanced_ba2' as const, amount: 1 }] : [])
    ]

    return {
      ...this,
      ...(tokenCount > 0 ? {
        tags: [...this.tags, 'GLACIO_CHAFE_APPLIER'],
        statusModifications: [{ type: 'negativeStatus' as const, targetName: 'Glacio Chafe', stackChange: values.foreclaimed_BA1_stack + values.foreclaimed_BA2_stack + tokenCount, applicationCount: tokenCount }],
        energyCost: [...this.energyCost, ...additionalCosts],
      } : {}),
      resolveVariant: undefined,
    }
  }
}

// Cancel With Swap
const hiyuki_foreclaimed_BA_1_2_cancel_with_swap: Action = {
  tags: ['BASIC_ATTACK'],
  name: 'Foreclaimed: Basic Attack 1-2 (swap cancel)',
  displayName: 'Foreclaimed: Basic Attack 1-2 (swap cancel)',
  category: 'Basics',
  castTime: values.cast_time_UBA1 + values.SWAP_CANCEL_TIME,
  multiplier: values.foreclaimed_BA1_multiplier + values.foreclaimed_BA2_multiplier,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['LIBERATION'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: values.foreclaimed_BA1_energy + values.foreclaimed_BA2_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: values.foreclaimed_BA1_concerto + values.foreclaimed_BA2_concerto, share: 0 },
    { energyType: 'frostheart', amount: values.foreclaimed_BA1_frostheart + values.foreclaimed_BA2_frostheart, share: 0 }
  ],
  energyCost: [],
  statusModifications: [],
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
    blockedComboTags: ['Foreclaiming BA Block', 'Foreclaiming BA1', 'Foreclaiming BA2', 'Foreclaiming BA3', 'Foreclaiming BA4']
  },
  comboChainTags: ['Foreclaiming BA2'],
  offtune: values.foreclaimed_BA1_offtune + values.foreclaimed_BA2_offtune,
  hideWhenNotCastable: true,
  groupName: 'Foreclaimed: Basic Attack 1-2',
  variantName: 'Cancel With Swap',
  resolveVariant(prevSnapshot, characterName, owner) {
    // S1: DMG Multipliers of Basic Attack - Foreclaimed Self are increased by 120%.
    // S1: After casting Liberation (Foreclaiming: Inward Vision), the NEXT Basic Attack 1-5
    // has BA1 apply +1 Glacio Chafe, consuming s1_enhanced_ba1 token.
    // Each token present adds +1 stackChange and +1 applicationCount (base is 0).
    const s1Active = owner.sequence >= 1
    if (!s1Active) return { ...this, resolveVariant: undefined }

    const energies = prevSnapshot?.charactersEnergies[characterName]
    const hasToken1 = s1Active && (energies?.s1_enhanced_ba1 ?? 0) >= 1
    const hasToken2 = s1Active && (energies?.s1_enhanced_ba2 ?? 0) >= 1
    const tokenCount = (hasToken1 ? 1 : 0) + (hasToken2 ? 1 : 0)
    const additionalCosts = [
      ...(hasToken1 ? [{ energyType: 's1_enhanced_ba1' as const, amount: 1 }] : []),
      ...(hasToken2 ? [{ energyType: 's1_enhanced_ba2' as const, amount: 1 }] : [])
    ]

    return {
      ...this,
      ...(tokenCount > 0 ? {
        tags: [...this.tags, 'GLACIO_CHAFE_APPLIER'],
        statusModifications: [{ type: 'negativeStatus' as const, targetName: 'Glacio Chafe', stackChange: values.foreclaimed_BA1_stack + values.foreclaimed_BA2_stack + tokenCount, applicationCount: tokenCount }],
        energyCost: [...this.energyCost, ...additionalCosts],
      } : {}),
      resolveVariant: undefined,
    }
  }
}

export {
  hiyuki_foreclaimed_BA_1_2,
  hiyuki_foreclaimed_BA_1_2_cancel_with_swap,
}
