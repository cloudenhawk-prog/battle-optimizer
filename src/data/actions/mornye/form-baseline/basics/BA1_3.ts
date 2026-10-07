// Mornye — Baseline Mode: Basic Attack 1-3 (into heavy / swap cancel / skill cancel).
import type { Action } from '../../../../../types/action'
import * as values from '../../values'

// ========== Basic Attack 1-3 =================================================================================================
export const mornye_BA_1_3_into_heavy: Action = {
  tags: ['BASIC_ATTACK'],
  name: 'Basic Attack 1-3 (into heavy)',
  displayName: 'Basic Attack 1-3 (into heavy)',
  category: 'Basics',
  castTime: 1.83,
  multiplier: values.BA1_multiplier + values.BA2_multiplier + values.BA3_multiplier,
  scaling: 'ATK',
  elements: ['FUSION'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: values.BA1_energy + values.BA2_energy + values.BA3_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: values.BA1_concerto + values.BA2_concerto + values.BA3_concerto, share: 0 },
    { energyType: 'rest_mass_energy', amount: values.BA1_rest_mass_energy + values.BA2_rest_mass_energy + values.BA3_rest_mass_energy, share: 0 },
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
    blockedComboTags: ['BA1', 'BA2', 'BA3'],
  },
  offtune: values.BA1_offtune + values.BA2_offtune + values.BA3_offtune,
  comboChainTags: ['BA3'],
  hideWhenNotCastable: true,
  groupName: 'Basic Attack 1-3',
  variantName: 'Into Heavy Attack',
  attemptFollowUp: { actionName: 'Heavy Attack', must: true }
}

export const mornye_BA_1_3_cancel_with_swap: Action = {
  tags: ['BASIC_ATTACK'],
  name: 'Basic Attack 1-3 (swap cancel)',
  displayName: 'Basic Attack 1-3 (swap cancel)',
  category: 'Basics',
  castTime: 1.34,
  multiplier: values.BA1_multiplier + values.BA2_multiplier + values.BA3_multiplier,
  scaling: 'ATK',
  elements: ['FUSION'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: values.BA1_energy + values.BA2_energy + values.BA3_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: values.BA1_concerto + values.BA2_concerto + values.BA3_concerto, share: 0 },
    { energyType: 'rest_mass_energy', amount: values.BA1_rest_mass_energy + values.BA2_rest_mass_energy + values.BA3_rest_mass_energy, share: 0 },
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
    blockedComboTags: ['BA1', 'BA2', 'BA3']
  },
  offtune: values.BA1_offtune + values.BA2_offtune + values.BA3_offtune,
  comboChainTags: ['BA3'],
  hideWhenNotCastable: true,
  groupName: 'Basic Attack 1-3',
  variantName: 'Cancel With Swap'
}

export const mornye_BA_1_3_cancel_with_skill: Action = {
  tags: ['BASIC_ATTACK'],
  name: 'Basic Attack 1-3 (skill cancel)',
  displayName: 'Basic Attack 1-3 (skill cancel)',
  category: 'Basics',
  castTime: 0.8,
  multiplier: values.BA1_multiplier + values.BA2_multiplier,
  scaling: 'ATK',
  elements: ['FUSION'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: values.BA1_energy + values.BA2_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: values.BA1_concerto + values.BA2_concerto, share: 0 },
    { energyType: 'rest_mass_energy', amount: values.BA1_rest_mass_energy + values.BA2_rest_mass_energy + values.BA3_rest_mass_energy, share: 0 },
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
    blockedComboTags: ['BA1', 'BA2', 'BA3'],
  },
  offtune: values.BA1_offtune + values.BA2_offtune + values.BA3_offtune,
  comboChainTags: ['BA3'],
  hideWhenNotCastable: true,
  groupName: 'Basic Attack 1-3',
  variantName: 'Cancel With Skill',
  attemptFollowUp: { actionName: 'Resonance Skill', must: true }
}
