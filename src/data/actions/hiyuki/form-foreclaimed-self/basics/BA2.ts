import type { Action } from '../../../../../types/action'
import * as values from '../../values'
import { s1_foreclaimed_basic_multiplier } from '../../../../modifiers/hiyuki'

// ========== BA2 ==============================================================================================================

// Default
const hiyuki_foreclaimed_BA_2: Action = {
  tags: ['BASIC_ATTACK'],
  name: 'Foreclaimed: Basic Attack 2',
  displayName: 'Foreclaimed: Basic Attack 2',
  category: 'Basics',
  castTime: values.cast_time_UBA2,
  multiplier: values.foreclaimed_BA2_multiplier,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['LIBERATION'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: values.foreclaimed_BA2_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: values.foreclaimed_BA2_concerto, share: 0 },
    { energyType: 'frostheart', amount: values.foreclaimed_BA2_frostheart, share: 0 }
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
    requiredComboTags: ['Foreclaiming BA1'],
    blockedComboTags: ['Foreclaiming BA Block', 'Foreclaiming BA2', 'Foreclaiming BA3', 'Foreclaiming BA4']
  },
  comboChainTags: ['Foreclaiming BA Block'],
  offtune: values.foreclaimed_BA2_offtune,
  hideWhenNotCastable: true,
  groupName: 'Foreclaimed: Basic Attack 2',
  variantName: 'Default',
  resolveVariant(prevSnapshot, characterName, owner) {
    // S1: DMG Multipliers of Basic Attack - Foreclaimed Self are increased by 120%.
    // S1: After casting Liberation (Foreclaiming: Inward Vision), the NEXT Basic Attack 1-5
    // has BA2 apply +1 Glacio Chafe, consuming s1_enhanced_ba2 token.
    // Token present adds +1 stackChange and +1 applicationCount (base is 0).
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
        tags: [...this.tags, 'GLACIO_CHAFE_APPLIER'],
        statusModifications: [{ type: 'negativeStatus' as const, targetName: 'Glacio Chafe', stackChange: values.foreclaimed_BA2_stack + tokenCount, applicationCount: tokenCount }],
        energyCost: [...this.energyCost, ...additionalCosts],
      } : {}),
      resolveVariant: undefined,
    }
  }
}

// Cancel With Swap
const hiyuki_foreclaimed_BA_2_cancel_with_swap: Action = {
  tags: ['BASIC_ATTACK'],
  name: 'Foreclaimed: Basic Attack 2 (swap cancel)',
  displayName: 'Foreclaimed: Basic Attack 2 (swap cancel)',
  category: 'Basics',
  castTime: values.SWAP_CANCEL_TIME,
  multiplier: values.foreclaimed_BA2_multiplier,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['LIBERATION'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: values.foreclaimed_BA2_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: values.foreclaimed_BA2_concerto, share: 0 },
    { energyType: 'frostheart', amount: values.foreclaimed_BA2_frostheart, share: 0 }
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
    requiredComboTags: ['Foreclaiming BA1'],
    blockedComboTags: ['Foreclaiming BA Block', 'Foreclaiming BA2', 'Foreclaiming BA3', 'Foreclaiming BA4']
  },
  comboChainTags: ['Foreclaiming BA2'],
  offtune: values.foreclaimed_BA2_offtune,
  hideWhenNotCastable: true,
  groupName: 'Foreclaimed: Basic Attack 2',
  variantName: 'Cancel With Swap',
  resolveVariant(prevSnapshot, characterName, owner) {
    // S1: DMG Multipliers of Basic Attack - Foreclaimed Self are increased by 120%.
    // S1: After casting Liberation (Foreclaiming: Inward Vision), the NEXT Basic Attack 1-5
    // has BA2 apply +1 Glacio Chafe, consuming s1_enhanced_ba2 token.
    // Token present adds +1 stackChange and +1 applicationCount (base is 0).
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
        tags: [...this.tags, 'GLACIO_CHAFE_APPLIER'],
        statusModifications: [{ type: 'negativeStatus' as const, targetName: 'Glacio Chafe', stackChange: values.foreclaimed_BA2_stack + tokenCount, applicationCount: tokenCount }],
        energyCost: [...this.energyCost, ...additionalCosts],
      } : {}),
      resolveVariant: undefined,
    }
  }
}


// ========== BA2-3 ============================================================================================================

// Default
const hiyuki_foreclaimed_BA_2_3: Action = {
  tags: ['BASIC_ATTACK', 'GLACIO_CHAFE_APPLIER'],
  name: 'Foreclaimed: Basic Attack 2-3',
  displayName: 'Foreclaimed: Basic Attack 2-3',
  category: 'Basics',
  castTime: values.cast_time_UBA2 + values.cast_time_UBA3,
  multiplier: values.foreclaimed_BA2_multiplier + values.foreclaimed_BA3_multiplier,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['LIBERATION'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: values.foreclaimed_BA2_energy + values.foreclaimed_BA3_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: values.foreclaimed_BA2_concerto + values.foreclaimed_BA3_concerto, share: 0 },
    { energyType: 'frostheart', amount: values.foreclaimed_BA2_frostheart + values.foreclaimed_BA3_frostheart, share: 0 }
  ],
  energyCost: [],
  statusModifications: [
    {
      type: 'negativeStatus',
      targetName: 'Glacio Chafe',
      stackChange: values.foreclaimed_BA2_stack + values.foreclaimed_BA3_stack,
      applicationCount: 1
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
  offtune: values.foreclaimed_BA2_offtune + values.foreclaimed_BA3_offtune,
  hideWhenNotCastable: true,
  groupName: 'Foreclaimed: Basic Attack 2-3',
  variantName: 'Default',
  resolveVariant(prevSnapshot, characterName, owner) {
    // S1: DMG Multipliers of Basic Attack - Foreclaimed Self are increased by 120%.
    // S1: After casting Liberation (Foreclaiming: Inward Vision), the NEXT Basic Attack 1-5
    // has BA2 apply +1 Glacio Chafe, consuming s1_enhanced_ba2 token.
    // Each token present adds +1 stackChange and +1 applicationCount (base is 1).
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
        statusModifications: [{ type: 'negativeStatus' as const, targetName: 'Glacio Chafe', stackChange: values.foreclaimed_BA2_stack + values.foreclaimed_BA3_stack + tokenCount, applicationCount: 1 + tokenCount }],
        energyCost: [...this.energyCost, ...additionalCosts],
      } : {}),
      resolveVariant: undefined,
    }
  }
}

// Cancel With Swap
const hiyuki_foreclaimed_BA_2_3_cancel_with_swap: Action = {
  tags: ['BASIC_ATTACK', 'GLACIO_CHAFE_APPLIER'],
  name: 'Foreclaimed: Basic Attack 2-3 (swap cancel)',
  displayName: 'Foreclaimed: Basic Attack 2-3 (swap cancel)',
  category: 'Basics',
  castTime: values.cast_time_UBA2 + values.SWAP_CANCEL_TIME,
  multiplier: values.foreclaimed_BA2_multiplier + values.foreclaimed_BA3_multiplier,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['LIBERATION'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: values.foreclaimed_BA2_energy + values.foreclaimed_BA3_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: values.foreclaimed_BA2_concerto + values.foreclaimed_BA3_concerto, share: 0 },
    { energyType: 'frostheart', amount: values.foreclaimed_BA2_frostheart + values.foreclaimed_BA3_frostheart, share: 0 }
  ],
  energyCost: [],
  statusModifications: [
    {
      type: 'negativeStatus',
      targetName: 'Glacio Chafe',
      stackChange: values.foreclaimed_BA2_stack + values.foreclaimed_BA3_stack,
      applicationCount: 1
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
  comboChainTags: ['Foreclaiming BA3'],
  offtune: values.foreclaimed_BA2_offtune + values.foreclaimed_BA3_offtune,
  hideWhenNotCastable: true,
  groupName: 'Foreclaimed: Basic Attack 2-3',
  variantName: 'Cancel With Swap',
  resolveVariant(prevSnapshot, characterName, owner) {
    // S1: DMG Multipliers of Basic Attack - Foreclaimed Self are increased by 120%.
    // S1: After casting Liberation (Foreclaiming: Inward Vision), the NEXT Basic Attack 1-5
    // has BA2 apply +1 Glacio Chafe, consuming s1_enhanced_ba2 token.
    // Each token present adds +1 stackChange and +1 applicationCount (base is 1).
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
        statusModifications: [{ type: 'negativeStatus' as const, targetName: 'Glacio Chafe', stackChange: values.foreclaimed_BA2_stack + values.foreclaimed_BA3_stack + tokenCount, applicationCount: 1 + tokenCount }],
        energyCost: [...this.energyCost, ...additionalCosts],
      } : {}),
      resolveVariant: undefined,
    }
  }
}

// Cancel With Skill
const hiyuki_foreclaimed_BA_2_3_cancel_with_skill: Action = {
  tags: ['BASIC_ATTACK', 'GLACIO_CHAFE_APPLIER'],
  name: 'Foreclaimed: Basic Attack 2-3 (skill cancel)',
  displayName: 'Foreclaimed: Basic Attack 2-3 (skill cancel)',
  category: 'Basics',
  castTime: values.cast_time_UBA2 + values.cast_time_UBA3_skill_cancel,
  multiplier: values.foreclaimed_BA2_multiplier + values.foreclaimed_BA3_multiplier,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['LIBERATION'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: values.foreclaimed_BA2_energy + values.foreclaimed_BA3_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: values.foreclaimed_BA2_concerto + values.foreclaimed_BA3_concerto, share: 0 },
    { energyType: 'frostheart', amount: values.foreclaimed_BA2_frostheart + values.foreclaimed_BA3_frostheart, share: 0 }
  ],
  energyCost: [],
  statusModifications: [
    {
      type: 'negativeStatus',
      targetName: 'Glacio Chafe',
      stackChange: values.foreclaimed_BA2_stack + values.foreclaimed_BA3_stack,
      applicationCount: 1
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
  restrictNextTo: ['Foreclaimed: Resonance Skill 1', 'Foreclaimed: Resonance Skill 1 (swap cancel)'],
  comboChainTags: ['Foreclaiming BA Block'],
  offtune: values.foreclaimed_BA2_offtune + values.foreclaimed_BA3_offtune,
  hideWhenNotCastable: true,
  groupName: 'Foreclaimed: Basic Attack 2-3',
  variantName: 'Cancel With Skill',
  resolveVariant(prevSnapshot, characterName, owner) {
    // S1: DMG Multipliers of Basic Attack - Foreclaimed Self are increased by 120%.
    // S1: After casting Liberation (Foreclaiming: Inward Vision), the NEXT Basic Attack 1-5
    // has BA2 apply +1 Glacio Chafe, consuming s1_enhanced_ba2 token.
    // Each token present adds +1 stackChange and +1 applicationCount (base is 1).
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
        statusModifications: [{ type: 'negativeStatus' as const, targetName: 'Glacio Chafe', stackChange: values.foreclaimed_BA2_stack + values.foreclaimed_BA3_stack + tokenCount, applicationCount: 1 + tokenCount }],
        energyCost: [...this.energyCost, ...additionalCosts],
      } : {}),
      resolveVariant: undefined,
    }
  }
}

// Cancel With Heavy
const hiyuki_foreclaimed_BA_2_3_cancel_with_heavy: Action = {
  tags: ['BASIC_ATTACK', 'GLACIO_CHAFE_APPLIER'],
  name: 'Foreclaimed: Basic Attack 2-3 (heavy cancel)',
  displayName: 'Foreclaimed: Basic Attack 2-3 (heavy cancel)',
  category: 'Basics',
  castTime: values.cast_time_UBA2 + values.cast_time_UBA3_skill_cancel,
  multiplier: values.foreclaimed_BA2_multiplier + values.foreclaimed_BA3_multiplier,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['LIBERATION'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: values.foreclaimed_BA2_energy + values.foreclaimed_BA3_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: values.foreclaimed_BA2_concerto + values.foreclaimed_BA3_concerto, share: 0 },
    { energyType: 'frostheart', amount: values.foreclaimed_BA2_frostheart + values.foreclaimed_BA3_frostheart, share: 0 }
  ],
  energyCost: [],
  statusModifications: [
    {
      type: 'negativeStatus',
      targetName: 'Glacio Chafe',
      stackChange: values.foreclaimed_BA2_stack + values.foreclaimed_BA3_stack,
      applicationCount: 1
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
  restrictNextTo: [
    'Foreclaimed: Heavy Attack BA2-3 combo',
    'Foreclaimed: Heavy Attack BA2-3 combo (swap cancel)',
    'Foreclaimed: Heavy Attack BA2-3 combo (skill cancel)',
    'Foreclaimed: Heavy Attack BA2-3 combo (dash cancel)',
    'Foreclaimed: Heavy Attack BA2-3 combo (heavy cancel)',
  ],
  comboChainTags: ['Foreclaiming BA Block'],
  offtune: values.foreclaimed_BA2_offtune + values.foreclaimed_BA3_offtune,
  hideWhenNotCastable: true,
  groupName: 'Foreclaimed: Basic Attack 2-3',
  variantName: 'Cancel With Heavy',
  resolveVariant(prevSnapshot, characterName, owner) {
    // S1: DMG Multipliers of Basic Attack - Foreclaimed Self are increased by 120%.
    // S1: After casting Liberation (Foreclaiming: Inward Vision), the NEXT Basic Attack 1-5
    // has BA2 apply +1 Glacio Chafe, consuming s1_enhanced_ba2 token.
    // Each token present adds +1 stackChange and +1 applicationCount (base is 1).
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
        statusModifications: [{ type: 'negativeStatus' as const, targetName: 'Glacio Chafe', stackChange: values.foreclaimed_BA2_stack + values.foreclaimed_BA3_stack + tokenCount, applicationCount: 1 + tokenCount }],
        energyCost: [...this.energyCost, ...additionalCosts],
      } : {}),
      resolveVariant: undefined,
    }
  }
}

// Cancel With Dash
const hiyuki_foreclaimed_BA_2_3_cancel_with_dash: Action = {
  tags: ['BASIC_ATTACK', 'GLACIO_CHAFE_APPLIER'],
  name: 'Foreclaimed: Basic Attack 2-3 (dash cancel)',
  displayName: 'Foreclaimed: Basic Attack 2-3 (dash cancel)',
  category: 'Basics',
  castTime: values.cast_time_UBA2 + values.cast_time_UBA3_dash_cancel,
  multiplier: values.foreclaimed_BA2_multiplier + values.foreclaimed_BA3_multiplier,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['LIBERATION'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: values.foreclaimed_BA2_energy + values.foreclaimed_BA3_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: values.foreclaimed_BA2_concerto + values.foreclaimed_BA3_concerto, share: 0 },
    { energyType: 'frostheart', amount: values.foreclaimed_BA2_frostheart + values.foreclaimed_BA3_frostheart, share: 0 }
  ],
  energyCost: [],
  statusModifications: [
    {
      type: 'negativeStatus',
      targetName: 'Glacio Chafe',
      stackChange: values.foreclaimed_BA2_stack + values.foreclaimed_BA3_stack,
      applicationCount: 1
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
    const frostAfterCast = currentFrostheart + values.foreclaimed_BA2_frostheart + values.foreclaimed_BA3_frostheart_immediate
    return frostAfterCast >= 100 ? ['Foreclaimed: Iai'] : undefined
  },
  comboChainTags: ['Iai Stance Setup'],
  offtune: values.foreclaimed_BA2_offtune + values.foreclaimed_BA3_offtune,
  hideWhenNotCastable: true,
  groupName: 'Foreclaimed: Basic Attack 2-3',
  variantName: 'Cancel With Dash',
  resolveVariant(prevSnapshot, characterName, owner) {
    // S1: DMG Multipliers of Basic Attack - Foreclaimed Self are increased by 120%.
    // S1: After casting Liberation (Foreclaiming: Inward Vision), the NEXT Basic Attack 1-5
    // has BA2 apply +1 Glacio Chafe, consuming s1_enhanced_ba2 token.
    // Each token present adds +1 stackChange and +1 applicationCount (base is 1).
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
        statusModifications: [{ type: 'negativeStatus' as const, targetName: 'Glacio Chafe', stackChange: values.foreclaimed_BA2_stack + values.foreclaimed_BA3_stack + tokenCount, applicationCount: 1 + tokenCount }],
        energyCost: [...this.energyCost, ...additionalCosts],
      } : {}),
      resolveVariant: undefined,
    }
  }
}

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
  hiyuki_foreclaimed_BA_2,
  hiyuki_foreclaimed_BA_2_cancel_with_swap,
  hiyuki_foreclaimed_BA_2_3,
  hiyuki_foreclaimed_BA_2_3_cancel_with_swap,
  hiyuki_foreclaimed_BA_2_3_cancel_with_skill,
  hiyuki_foreclaimed_BA_2_3_cancel_with_heavy,
  hiyuki_foreclaimed_BA_2_3_cancel_with_dash,
  hiyuki_foreclaimed_BA_2_4,
  hiyuki_foreclaimed_BA_2_4_cancel_with_swap,
  hiyuki_foreclaimed_BA_2_5,
  hiyuki_foreclaimed_BA_2_5_cancel_with_swap,
  hiyuki_foreclaimed_BA_2_5_cancel_with_dash
}

