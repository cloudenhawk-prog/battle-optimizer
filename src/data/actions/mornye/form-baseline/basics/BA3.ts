// Mornye — Baseline Mode: Basic Attack 3 after BA2 (into heavy / swap cancel / skill cancel).
import type { Action } from '../../../../../types/action'
import * as values from '../../values'

// ========== Basic Attack 3 ===================================================================================================
export const mornye_BA_3_into_heavy: Action = {
  tags: ['BASIC_ATTACK'],
  name: 'Basic Attack 3 (into heavy)',
  displayName: 'Basic Attack 3 (into heavy)',
  category: 'Basics',
  castTime: 0.58,
  multiplier: values.BA3_multiplier,
  scaling: 'ATK',
  elements: ['FUSION'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: values.BA3_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: values.BA3_concerto, share: 0 },
    { energyType: 'rest_mass_energy', amount: values.BA3_rest_mass_energy, share: 0 },
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  coordinatedAttacks: [],
  castConditions: {
    startState: 'GROUND',
    endState: 'GROUND',
    preventsSwapOut: true,
    requiredForms: ['Baseline Mode'],
    requiredComboTags: ['BA2'],
    blockedComboTags: ['BA1', 'BA3']
  },
  offtune: values.BA3_offtune,
  comboChainTags: ['BA3'],
  hideWhenNotCastable: true,
  groupName: 'Basic Attack 3',
  variantName: 'Into Heavy',
  attemptFollowUp: { actionName: 'Heavy Attack', must: true }
}

export const mornye_BA_3_cancel_with_swap: Action = {
  tags: ['BASIC_ATTACK'],
  name: 'Basic Attack 3 (swap cancel)',
  displayName: 'Basic Attack 3 (swap cancel)',
  category: 'Basics',
  castTime: 0.09,
  multiplier: values.BA3_multiplier,
  scaling: 'ATK',
  elements: ['FUSION'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: values.BA3_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: values.BA3_concerto, share: 0 },
    { energyType: 'rest_mass_energy', amount: values.BA3_rest_mass_energy, share: 0 },
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  coordinatedAttacks: [],
  castConditions: {
    startState: 'GROUND',
    swapOutState: 'GROUND',
    endState: 'GROUND',
    persistenceTime: values.BA3_persistenceTime,
    requiresSwapOut: true,
    requiredForms: ['Baseline Mode'],
    requiredComboTags: ['BA2'],
    blockedComboTags: ['BA1', 'BA3']
  },
  offtune: values.BA3_offtune,
  comboChainTags: ['BA3'],
  hideWhenNotCastable: true,
  groupName: 'Basic Attack 3',
  variantName: 'Cancel With Swap'
}

export const mornye_BA_3_cancel_with_skill: Action = {
  tags: ['BASIC_ATTACK'],
  name: 'Basic Attack 3 (skill cancel)',
  displayName: 'Basic Attack 3 (skill cancel)',
  category: 'Basics',
  castTime: 0.04,
  multiplier: 0,
  scaling: 'ATK',
  elements: ['FUSION'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: (0), share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: (0), share: 0 },
    { energyType: 'rest_mass_energy', amount: values.BA3_rest_mass_energy, share: 0 },
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  coordinatedAttacks: [],
  castConditions: {
    startState: 'GROUND',
    endState: 'GROUND',
    requiredForms: ['Baseline Mode'],
    requiredComboTags: ['BA2'],
    blockedComboTags: ['BA1', 'BA3']
  },
  offtune: (0),
  comboChainTags: ['BA3'],
  hideWhenNotCastable: true,
  groupName: 'Basic Attack 3',
  variantName: 'Cancel With Skill',
  attemptFollowUp: { actionName: 'Resonance Skill', must: true }
}
