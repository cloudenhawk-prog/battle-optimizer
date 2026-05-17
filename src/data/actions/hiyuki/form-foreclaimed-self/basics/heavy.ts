import type { Action } from '../../../../../types/action'
import * as values from '../../values'
import { s1_foreclaimed_basic_multiplier } from '../../../../modifiers/hiyuki'

// Default
const hiyuki_foreclaimed_heavy_BA2_3: Action = {
  tags: ['HEAVY_ATTACK', 'GLACIO_CHAFE_APPLIER'],
  name: 'Foreclaimed: Heavy Attack BA2-3 combo',
  displayName: 'Foreclaimed: Heavy Attack BA2-3 combo',
  category: 'Basics',
  castTime: values.cast_time_heavy + values.cast_time_UBA2 + values.cast_time_UBA3,
  multiplier: values.foreclaimed_heavy_multiplier + values.foreclaimed_BA2_multiplier + values.foreclaimed_BA3_multiplier,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['LIBERATION'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: values.foreclaimed_heavy_energy + values.foreclaimed_BA2_energy + values.foreclaimed_BA3_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: values.foreclaimed_heavy_concerto + values.foreclaimed_BA2_concerto + values.foreclaimed_BA3_concerto, share: 0 },
    { energyType: 'frostheart', amount: values.foreclaimed_heavy_frostheart + values.foreclaimed_BA2_frostheart + values.foreclaimed_BA3_frostheart, share: 0 }
  ],
  energyCost: [],
  statusModifications: [
    { type: 'negativeStatus', targetName: 'Glacio Chafe', stackChange: values.foreclaimed_BA3_stack, applicationCount: 1 }
  ],
  damageModifiers: [],
  inherentModifiers: [s1_foreclaimed_basic_multiplier],
  sideEffects: [],
  coordinatedAttacks: [],
  castConditions: {
    startState: 'GROUND',
    endState: 'GROUND',
    preventsSwapOut: true,
    requiredForms: ['Foreclaimed Self']
  },
  comboChainTags: ['Foreclaiming BA3'],
  offtune: values.foreclaimed_heavy_offtune + values.foreclaimed_BA2_offtune + values.foreclaimed_BA3_offtune,
  hideWhenNotCastable: true,
  groupName: 'Foreclaimed: Heavy Attack BA2-3 combo',
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
const hiyuki_foreclaimed_heavy_BA2_3_cancel_with_swap: Action = {
  tags: ['HEAVY_ATTACK', 'GLACIO_CHAFE_APPLIER'],
  name: 'Foreclaimed: Heavy Attack BA2-3 combo (swap cancel)',
  displayName: 'Foreclaimed: Heavy Attack BA2-3 combo (swap cancel)',
  category: 'Basics',
  castTime: values.cast_time_heavy + values.cast_time_UBA2 + values.SWAP_CANCEL_TIME,
  multiplier: values.foreclaimed_heavy_multiplier + values.foreclaimed_BA2_multiplier + values.foreclaimed_BA3_multiplier,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['LIBERATION'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: values.foreclaimed_heavy_energy + values.foreclaimed_BA2_energy + values.foreclaimed_BA3_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: values.foreclaimed_heavy_concerto + values.foreclaimed_BA2_concerto + values.foreclaimed_BA3_concerto, share: 0 },
    { energyType: 'frostheart', amount: values.foreclaimed_heavy_frostheart + values.foreclaimed_BA2_frostheart + values.foreclaimed_BA3_frostheart, share: 0 }
  ],
  energyCost: [],
  statusModifications: [
    { type: 'negativeStatus', targetName: 'Glacio Chafe', stackChange: values.foreclaimed_BA3_stack, applicationCount: 1 }
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
    requiredForms: ['Foreclaimed Self']
  },
  comboChainTags: ['Foreclaiming BA3'],
  offtune: values.foreclaimed_heavy_offtune + values.foreclaimed_BA2_offtune + values.foreclaimed_BA3_offtune,
  hideWhenNotCastable: true,
  groupName: 'Foreclaimed: Heavy Attack BA2-3 combo',
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
const hiyuki_foreclaimed_heavy_BA2_3_cancel_with_skill: Action = {
  tags: ['HEAVY_ATTACK', 'GLACIO_CHAFE_APPLIER'],
  name: 'Foreclaimed: Heavy Attack BA2-3 combo (skill cancel)',
  displayName: 'Foreclaimed: Heavy Attack BA2-3 combo (skill cancel)',
  category: 'Basics',
  castTime: values.cast_time_heavy + values.cast_time_UBA2 + values.cast_time_UBA3_skill_cancel,
  multiplier: values.foreclaimed_heavy_multiplier + values.foreclaimed_BA2_multiplier + values.foreclaimed_BA3_multiplier,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['LIBERATION'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: values.foreclaimed_heavy_energy + values.foreclaimed_BA2_energy + values.foreclaimed_BA3_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: values.foreclaimed_heavy_concerto + values.foreclaimed_BA2_concerto + values.foreclaimed_BA3_concerto, share: 0 },
    { energyType: 'frostheart', amount: values.foreclaimed_heavy_frostheart + values.foreclaimed_BA2_frostheart + values.foreclaimed_BA3_frostheart, share: 0 }
  ],
  energyCost: [],
  statusModifications: [
    { type: 'negativeStatus', targetName: 'Glacio Chafe', stackChange: values.foreclaimed_BA3_stack, applicationCount: 1 }
  ],
  damageModifiers: [],
  inherentModifiers: [s1_foreclaimed_basic_multiplier],
  sideEffects: [],
  coordinatedAttacks: [],
  castConditions: {
    startState: 'GROUND',
    endState: 'GROUND',
    preventsSwapOut: true,
    requiredForms: ['Foreclaimed Self']
  },
  restrictNextTo: ['Foreclaimed: Resonance Skill 1', 'Foreclaimed: Resonance Skill 1 (swap cancel)'],
  comboChainTags: ['Foreclaiming BA3'],
  offtune: values.foreclaimed_heavy_offtune + values.foreclaimed_BA2_offtune + values.foreclaimed_BA3_offtune,
  hideWhenNotCastable: true,
  groupName: 'Foreclaimed: Heavy Attack BA2-3 combo',
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
const hiyuki_foreclaimed_heavy_BA2_3_cancel_with_heavy: Action = {
  tags: ['HEAVY_ATTACK', 'GLACIO_CHAFE_APPLIER'],
  name: 'Foreclaimed: Heavy Attack BA2-3 combo (heavy cancel)',
  displayName: 'Foreclaimed: Heavy Attack BA2-3 combo (heavy cancel)',
  category: 'Basics',
  castTime: values.cast_time_heavy + values.cast_time_UBA2 + values.cast_time_UBA3_skill_cancel,
  multiplier: values.foreclaimed_heavy_multiplier + values.foreclaimed_BA2_multiplier + values.foreclaimed_BA3_multiplier,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['LIBERATION'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: values.foreclaimed_heavy_energy + values.foreclaimed_BA2_energy + values.foreclaimed_BA3_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: values.foreclaimed_heavy_concerto + values.foreclaimed_BA2_concerto + values.foreclaimed_BA3_concerto, share: 0 },
    { energyType: 'frostheart', amount: values.foreclaimed_heavy_frostheart + values.foreclaimed_BA2_frostheart + values.foreclaimed_BA3_frostheart, share: 0 }
  ],
  energyCost: [],
  statusModifications: [
    { type: 'negativeStatus', targetName: 'Glacio Chafe', stackChange: values.foreclaimed_BA3_stack, applicationCount: 1 }
  ],
  damageModifiers: [],
  inherentModifiers: [s1_foreclaimed_basic_multiplier],
  sideEffects: [],
  coordinatedAttacks: [],
  castConditions: {
    startState: 'GROUND',
    endState: 'GROUND',
    preventsSwapOut: true,
    requiredForms: ['Foreclaimed Self']
  },
  restrictNextTo: [
    'Foreclaimed: Heavy Attack BA2-3 combo',
    'Foreclaimed: Heavy Attack BA2-3 combo (swap cancel)',
    'Foreclaimed: Heavy Attack BA2-3 combo (skill cancel)',
    'Foreclaimed: Heavy Attack BA2-3 combo (dash cancel)',
    'Foreclaimed: Heavy Attack BA2-3 combo (heavy cancel)',
  ],
  comboChainTags: ['Foreclaiming BA3'],
  offtune: values.foreclaimed_heavy_offtune + values.foreclaimed_BA2_offtune + values.foreclaimed_BA3_offtune,
  hideWhenNotCastable: true,
  groupName: 'Foreclaimed: Heavy Attack BA2-3 combo',
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
const hiyuki_foreclaimed_heavy_BA2_3_cancel_with_dash: Action = {
  tags: ['HEAVY_ATTACK', 'GLACIO_CHAFE_APPLIER'],
  name: 'Foreclaimed: Heavy Attack BA2-3 combo (dash cancel)',
  displayName: 'Foreclaimed: Heavy Attack BA2-3 combo (dash cancel)',
  category: 'Basics',
  castTime: values.cast_time_heavy + values.cast_time_UBA2 + values.cast_time_UBA3_dash_cancel,
  multiplier: values.foreclaimed_heavy_multiplier + values.foreclaimed_BA2_multiplier + values.foreclaimed_BA3_multiplier,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['LIBERATION'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: values.foreclaimed_heavy_energy + values.foreclaimed_BA2_energy + values.foreclaimed_BA3_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: values.foreclaimed_heavy_concerto + values.foreclaimed_BA2_concerto + values.foreclaimed_BA3_concerto, share: 0 },
    { energyType: 'frostheart', amount: values.foreclaimed_heavy_frostheart + values.foreclaimed_BA2_frostheart + values.foreclaimed_BA3_frostheart, share: 0 }
  ],
  energyCost: [],
  statusModifications: [
    { type: 'negativeStatus', targetName: 'Glacio Chafe', stackChange: values.foreclaimed_BA3_stack, applicationCount: 1 }
  ],
  damageModifiers: [],
  inherentModifiers: [s1_foreclaimed_basic_multiplier],
  sideEffects: [],
  coordinatedAttacks: [],
  castConditions: {
    startState: 'GROUND',
    endState: 'GROUND',
    preventsSwapOut: true,
    requiredForms: ['Foreclaimed Self']
  },
  restrictNextTo(prevSnapshot, characterName) {
    const currentFrostheart = prevSnapshot?.charactersEnergies[characterName]?.frostheart ?? 0
    const frostAfterCast = currentFrostheart + values.foreclaimed_heavy_frostheart + values.foreclaimed_BA2_frostheart + values.foreclaimed_BA3_frostheart_immediate
    return frostAfterCast >= 100 ? ['Foreclaimed: Iai'] : undefined
  },
  comboChainTags: ['Iai Stance Setup'],
  offtune: values.foreclaimed_heavy_offtune + values.foreclaimed_BA2_offtune + values.foreclaimed_BA3_offtune,
  hideWhenNotCastable: true,
  groupName: 'Foreclaimed: Heavy Attack BA2-3 combo',
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

export {
    hiyuki_foreclaimed_heavy_BA2_3,
    hiyuki_foreclaimed_heavy_BA2_3_cancel_with_swap,
    hiyuki_foreclaimed_heavy_BA2_3_cancel_with_skill,
    hiyuki_foreclaimed_heavy_BA2_3_cancel_with_heavy,
    hiyuki_foreclaimed_heavy_BA2_3_cancel_with_dash,
}

