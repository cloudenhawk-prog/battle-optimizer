import type { Action } from '../../types/action'
import { always, ownerAtLeast } from '../../utils/conditions/damageModifierConditions'
import { syntony_field, syntony_field_s2 } from '../modifiers/mornye'

// TODO: Make sure all sequence/echo/gear specific things in her kit are defined in one data folder and referenced/rebuilt rather than hardcoding it in every action
// Path: src/data/modifiers/<single mega file, one file per category/character, or what> and similar if we need for sideEffects and other properties with heavy building

// TODO: Selecting an action on Mornye when the previous character has 100 concerto should show her Mode actions.
// -> We need functionality (the following should work automatically, but also consider if it's the most elegant):
//    -> When the active character has 100 concerto
//    -> A different character is chosen
//    -> Check if selected character's Intro Skill triggers a form change; if so use that form as basis for the selectable actions
//       -> If yes: use that form as basis for the selectable actions
//       -> If no: use their current form (this should be how the selector acts by default though)

// TODO: All BA versions should equal in the same cast time for BA1, BA2, BA3. Swapping should penalize by 0.4, skill cancel no penalty


// ========== Values ===========================================================================================================

// BA1
const BA1_multiplier = (22.27 + 2 * 16.71) / 100
const BA1_energy = (0.35 + 2 * 0.27)
const BA1_concerto = (1.12 + 2 * 0.84)
const BA1_rest_mass_energy = 20
const BA1_offtune = (0.11 + 2 * 0.08)
const BA1_persistenceTime = 1.4

// BA2
const BA2_multiplier = (23.86 + 23.86 + 4 * 17.90) / 100
const BA2_energy = (0.38 + 0.38 + 4 * 0.29)
const BA2_concerto = (1.20 + 1.20 + 4 * 0.90)
const BA2_rest_mass_energy = 40
const BA2_offtune = (0.12 + 0.12 + 2 * 0.09)
const BA2_persistenceTime = 2.551

// BA3
const BA3_multiplier = (41.36 + 6 * 10.34) / 100
const BA3_energy = (0.65 + 6 * 0.17)
const BA3_concerto = (2.08 + 6 * 0.52)
const BA3_rest_mass_energy = 40
const BA3_offtune = (0.21 + 6 * 0.05)
const BA3_persistenceTime = 2.92

// Heavy Attack
const heavy_multiplier = (44.14 + 99.02) / 100
const heavy_energy = (0.93 + 2.08)
const heavy_concerto = (2.96 + 6.65)
const heavy_rest_mass_energy_cost = 100
const heavy_offtune = 0.30 + 0.66

// Mode: BA1
const MODE_BA1_multiplier = (4 * 13.92) / 100
const MODE_BA1_energy = (4 * 0.22)
const MODE_BA1_concerto = (4 * 	0.35)
const MODE_BA1_relative_momentum = 8
const MODE_BA1_offtune = (4 * 0.07)

// Mode: BA2
const MODE_BA2_multiplier = (4 * 25.85) / 100
const MODE_BA2_energy = (4 * 0.41)
const MODE_BA2_concerto = (4 * 0.64)
const MODE_BA2_relative_momentum = 14
const MODE_BA2_offtune = (4 * 0.13)

// Mode: BA3
const MODE_BA3_multiplier = (4 * 9.31 + 2 * 33.09) / 100
const MODE_BA3_energy = (4 * 0.15 + 2 * 0.52)
const MODE_BA3_concerto = (4 * 0.23 + 2 * 0.82)
const MODE_BA3_relative_momentum = 18
const MODE_BA3_offtune = (4 * 0.05 + 2 * 0.17)

// ========== Basic Attack 1 ===================================================================================================
const mornye_BA_1_cancel_with_swap: Action = {
  tags: ['BASIC_ATTACK'],
  name: 'Basic Attack 1 (swap cancel)',
  displayName: 'Basic Attack 1 (swap cancel)',
  category: 'Basics',
  castTime: 0.09,
  multiplier: BA1_multiplier,
  scaling: 'ATK',
  elements: ['FUSION'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: BA1_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: BA1_concerto, share: 0 },
    { energyType: 'rest_mass_energy', amount: BA1_rest_mass_energy, share: 0 },
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
    persistenceTime: BA1_persistenceTime,
    requiresSwapOut: true,
    requiredForms: ['Baseline Mode'],
    blockedComboTags: ['BA1', 'BA2', 'BA3']
  },
  offtune: BA1_offtune,
  comboChainTags: ['BA1'],
  hideWhenNotCastable: true,
  groupName: 'Basic Attack 1',
  variantName: 'Cancel With Swap'
}

// ========== Basic Attack 1-2 =================================================================================================
const mornye_BA_1_2_cancel_with_swap: Action = {
  tags: ['BASIC_ATTACK'],
  name: 'Basic Attack 1-2 (swap cancel)',
  displayName: 'Basic Attack 1-2 (swap cancel)',
  category: 'Basics',
  castTime: 0.47,
  multiplier: BA1_multiplier + BA2_multiplier,
  scaling: 'ATK',
  elements: ['FUSION'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: BA1_energy + BA2_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: BA1_concerto + BA2_concerto, share: 0 },
    { energyType: 'rest_mass_energy', amount: BA1_rest_mass_energy + BA2_rest_mass_energy, share: 0 },
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
    persistenceTime: BA2_persistenceTime,
    requiresSwapOut: true,
    requiredForms: ['Baseline Mode'],
    blockedComboTags: ['BA1', 'BA2', 'BA3']
  },
  offtune: BA1_offtune + BA2_offtune,
  comboChainTags: ['BA2'],
  hideWhenNotCastable: true,
  groupName: 'Basic Attack 1-2',
  variantName: 'Cancel With Swap'
}

// ========== Basic Attack 1-3 =================================================================================================
const mornye_BA_1_3_into_heavy: Action = {
  tags: ['BASIC_ATTACK'],
  name: 'Basic Attack 1-3 (into heavy)',
  displayName: 'Basic Attack 1-3 (into heavy)',
  category: 'Basics',
  castTime: 1.83,
  multiplier: BA1_multiplier + BA2_multiplier + BA3_multiplier,
  scaling: 'ATK',
  elements: ['FUSION'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: BA1_energy + BA2_energy + BA3_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: BA1_concerto + BA2_concerto + BA3_concerto, share: 0 },
    { energyType: 'rest_mass_energy', amount: BA1_rest_mass_energy + BA2_rest_mass_energy + BA3_rest_mass_energy, share: 0 },
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
  offtune: BA1_offtune + BA2_offtune + BA3_offtune,
  comboChainTags: ['BA3'],
  hideWhenNotCastable: true,
  groupName: 'Basic Attack 1-3',
  variantName: 'Into Heavy Attack',
  attemptFollowUp: { actionName: 'Heavy Attack', must: true }
}

const mornye_BA_1_3_cancel_with_swap: Action = {
  tags: ['BASIC_ATTACK'],
  name: 'Basic Attack 1-3 (swap cancel)',
  displayName: 'Basic Attack 1-3 (swap cancel)',
  category: 'Basics',
  castTime: 1.34,
  multiplier: BA1_multiplier + BA2_multiplier + BA3_multiplier,
  scaling: 'ATK',
  elements: ['FUSION'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: BA1_energy + BA2_energy + BA3_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: BA1_concerto + BA2_concerto + BA3_concerto, share: 0 },
    { energyType: 'rest_mass_energy', amount: BA1_rest_mass_energy + BA2_rest_mass_energy + BA3_rest_mass_energy, share: 0 },
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
    persistenceTime: BA3_persistenceTime,
    requiresSwapOut: true,
    requiredForms: ['Baseline Mode'],
    blockedComboTags: ['BA1', 'BA2', 'BA3']
  },
  offtune: BA1_offtune + BA2_offtune + BA3_offtune,
  comboChainTags: ['BA3'],
  hideWhenNotCastable: true,
  groupName: 'Basic Attack 1-3',
  variantName: 'Cancel With Swap'
}

const mornye_BA_1_3_cancel_with_skill: Action = {
  tags: ['BASIC_ATTACK'],
  name: 'Basic Attack 1-3 (skill cancel)',
  displayName: 'Basic Attack 1-3 (skill cancel)',
  category: 'Basics',
  castTime: 0.8,
  multiplier: BA1_multiplier + BA2_multiplier,
  scaling: 'ATK',
  elements: ['FUSION'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: BA1_energy + BA2_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: BA1_concerto + BA2_concerto, share: 0 },
    { energyType: 'rest_mass_energy', amount: BA1_rest_mass_energy + BA2_rest_mass_energy + BA3_rest_mass_energy, share: 0 },
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
  offtune: BA1_offtune + BA2_offtune + BA3_offtune,
  comboChainTags: ['BA3'],
  hideWhenNotCastable: true,
  groupName: 'Basic Attack 1-3',
  variantName: 'Cancel With Skill',
  attemptFollowUp: { actionName: 'Resonance Skill', must: true }
}

// ========== Basic Attack 2 ===================================================================================================
const mornye_BA_2_cancel_with_swap: Action = {
  tags: ['BASIC_ATTACK'],
  name: 'Basic Attack 2 (swap cancel)',
  displayName: 'Basic Attack 2 (swap cancel)',
  category: 'Basics',
  castTime: 0.09,
  multiplier: BA2_multiplier,
  scaling: 'ATK',
  elements: ['FUSION'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: BA2_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: BA2_concerto, share: 0 },
    { energyType: 'rest_mass_energy', amount: BA2_rest_mass_energy, share: 0 },
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
    persistenceTime: BA2_persistenceTime,
    requiresSwapOut: true,
    requiredForms: ['Baseline Mode'],
    requiredComboTags: ['BA1'],
    blockedComboTags: ['BA2', 'BA3']
  },
  offtune: BA2_offtune,
  comboChainTags: ['BA2'],
  hideWhenNotCastable: true,
  groupName: 'Basic Attack 2',
  variantName: 'Cancel With Swap'
}

// ========== Basic Attack 2-3 =================================================================================================
const mornye_BA_2_3_into_heavy: Action = {
  tags: ['BASIC_ATTACK'],
  name: 'Basic Attack 2-3 (into heavy)',
  displayName: 'Basic Attack 2-3 (into heavy)',
  category: 'Basics',
  castTime: 1.59,
  multiplier: BA2_multiplier + BA3_multiplier,
  scaling: 'ATK',
  elements: ['FUSION'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: BA2_energy + BA3_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: BA2_concerto + BA3_concerto, share: 0 },
    { energyType: 'rest_mass_energy', amount: BA2_rest_mass_energy + BA3_rest_mass_energy, share: 0 },
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
    requiredComboTags: ['BA1'],
    blockedComboTags: ['BA2', 'BA3']
  },
  offtune: BA2_offtune + BA3_offtune,
  comboChainTags: ['BA3'],
  hideWhenNotCastable: true,
  groupName: 'Basic Attack 2-3',
  variantName: 'Into Heavy',
  attemptFollowUp: { actionName: 'Heavy Attack', must: true }
}

const mornye_BA_2_3_cancel_with_swap: Action = {
  tags: ['BASIC_ATTACK'],
  name: 'Basic Attack 2-3 (swap cancel)',
  displayName: 'Basic Attack 2-3 (swap cancel)',
  category: 'Basics',
  castTime: 1.10,
  multiplier: BA2_multiplier + BA3_multiplier,
  scaling: 'ATK',
  elements: ['FUSION'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: BA2_energy + BA3_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: BA2_concerto + BA3_concerto, share: 0 },
    { energyType: 'rest_mass_energy', amount: BA2_rest_mass_energy + BA3_rest_mass_energy, share: 0 },
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
    persistenceTime: BA3_persistenceTime,
    requiresSwapOut: true,
    requiredForms: ['Baseline Mode'],
    requiredComboTags: ['BA1'],
    blockedComboTags: ['BA2', 'BA3']
  },
  offtune: BA2_offtune + BA3_offtune,
  comboChainTags: ['BA3'],
  hideWhenNotCastable: true,
  groupName: 'Basic Attack 2-3',
  variantName: 'Cancel With Swap'
}

const mornye_BA_2_3_cancel_with_skill: Action = {
  tags: ['BASIC_ATTACK'],
  name: 'Basic Attack 2-3 (skill cancel)',
  displayName: 'Basic Attack 2-3 (skill cancel)',
  category: 'Basics',
  castTime: 0.56,
  multiplier: BA2_multiplier,
  scaling: 'ATK',
  elements: ['FUSION'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: BA2_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: BA2_concerto, share: 0 },
    { energyType: 'rest_mass_energy', amount: BA2_rest_mass_energy + BA3_rest_mass_energy, share: 0 },
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
    requiredComboTags: ['BA1'],
    blockedComboTags: ['BA2', 'BA3']
  },
  offtune: BA2_offtune + BA3_offtune,
  comboChainTags: ['BA3'],
  hideWhenNotCastable: true,
  groupName: 'Basic Attack 2-3',
  variantName: 'Cancel With Skill',
  attemptFollowUp: { actionName: 'Resonance Skill', must: true }
}

// ========== Basic Attack 3 ===================================================================================================
const mornye_BA_3_into_heavy: Action = {
  tags: ['BASIC_ATTACK'],
  name: 'Basic Attack 3 (into heavy)',
  displayName: 'Basic Attack 3 (into heavy)',
  category: 'Basics',
  castTime: 0.58,
  multiplier: BA3_multiplier,
  scaling: 'ATK',
  elements: ['FUSION'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: BA3_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: BA3_concerto, share: 0 },
    { energyType: 'rest_mass_energy', amount: BA3_rest_mass_energy, share: 0 },
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
  offtune: BA3_offtune,
  comboChainTags: ['BA3'],
  hideWhenNotCastable: true,
  groupName: 'Basic Attack 3',
  variantName: 'Into Heavy',
  attemptFollowUp: { actionName: 'Heavy Attack', must: true }
}

const mornye_BA_3_cancel_with_swap: Action = {
  tags: ['BASIC_ATTACK'],
  name: 'Basic Attack 3 (swap cancel)',
  displayName: 'Basic Attack 3 (swap cancel)',
  category: 'Basics',
  castTime: 0.09,
  multiplier: BA3_multiplier,
  scaling: 'ATK',
  elements: ['FUSION'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: BA3_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: BA3_concerto, share: 0 },
    { energyType: 'rest_mass_energy', amount: BA3_rest_mass_energy, share: 0 },
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
    persistenceTime: BA3_persistenceTime,
    requiresSwapOut: true,
    requiredForms: ['Baseline Mode'],
    requiredComboTags: ['BA2'],
    blockedComboTags: ['BA1', 'BA3']
  },
  offtune: BA3_offtune,
  comboChainTags: ['BA3'],
  hideWhenNotCastable: true,
  groupName: 'Basic Attack 3',
  variantName: 'Cancel With Swap'
}

const mornye_BA_3_cancel_with_skill: Action = {
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
    { energyType: 'rest_mass_energy', amount: BA3_rest_mass_energy, share: 0 },
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

// ========== Heavy Attack =====================================================================================================
const mornye_heavy: Action = {
  tags: ['HEAVY_ATTACK', 'HEAL_PROC'],
  name: 'Heavy Attack',
  displayName: 'Heavy Attack',
  category: 'Basics',
  castTime: 1.15,
  multiplier: heavy_multiplier,
  scaling: 'ATK',
  elements: ['FUSION'],
  dmgTypes: ['HEAVY'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: heavy_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: heavy_concerto, share: 0 }
  ],
  energyCost: [{ energyType: 'rest_mass_energy', amount: heavy_rest_mass_energy_cost }],
  statusModifications: [],
  damageModifiers: [syntony_field, syntony_field_s2],
  sideEffects: [
    // TODO: 39.77%*5 FUSION DMG considered LIBERATION DMG (upon entering Wide Field Observation Mode)
  ],
  coordinatedAttacks: [],
  castConditions: {
    startState: 'GROUND',
    endState: 'AIR',
    preventsSwapOut: true,
    requiredForms: ['Baseline Mode']
  },
  offtune: heavy_offtune,
  formChange: 'Wide Field Observation Mode',
  attemptFollowUp: { actionName: 'Mode: Basic Attack 1-3' }
}

const mornye_heavy_swap_in: Action = {
  tags: ['HEAVY_ATTACK', 'HEAL_PROC'],
  name: 'Heavy Attack (Swap In)',
  displayName: 'Heavy Attack',
  category: 'Basics',
  castTime: 1.50,
  multiplier: heavy_multiplier,
  scaling: 'ATK',
  elements: ['FUSION'],
  dmgTypes: ['HEAVY'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: heavy_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: heavy_concerto, share: 0 }
  ],
  energyCost: [{ energyType: 'rest_mass_energy', amount: heavy_rest_mass_energy_cost }],
  statusModifications: [],
  damageModifiers: [syntony_field, syntony_field_s2],
  sideEffects: [
    // TODO: 39.77%*5 FUSION DMG considered LIBERATION DMG (upon entering Wide Field Observation Mode)
  ],
  coordinatedAttacks: [],
  castConditions: {
    startState: 'GROUND',
    endState: 'AIR',
    preventsSwapOut: true,
    requiredForms: ['Baseline Mode'],
  },
  offtune: heavy_offtune,
  formChange: 'Wide Field Observation Mode',
  attemptFollowUp: { actionName: 'Mode: Basic Attack 1-3' }
}

// ========== Resonance Skill ==================================================================================================
const mornye_skill: Action = {
  tags: ['SKILL'],
  name: 'Resonance Skill',
  displayName: 'Expectation Error',
  category: 'Skills',
  castTime: 0.36,
  multiplier: 0,
  scaling: 'ATK',
  elements: ['FUSION'],
  dmgTypes: ['SKILL'],
  cooldown: 5,
  energyGenerated: [],
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
    previousActions: [mornye_BA_1_3_cancel_with_skill, mornye_BA_2_3_cancel_with_skill, mornye_BA_3_cancel_with_skill]
  },
  offtune: 0,
  comboChainTags: ['BA1'],
  groupName: 'Resonance Skill',
  variantName: 'Default',
  attemptFollowUp: {actionName: 'Heavy Attack', must: true }
}

// ========== Mode: Basic Attack 1-3 ===========================================================================================
const mode_mornye_BA_1_3: Action = {
  tags: ['BASIC_ATTACK'],
  name: 'Mode: Basic Attack 1-3',
  displayName: 'Mode: Basic Attack 1-3',
  category: 'Basics',
  castTime: 1.51,
  multiplier: MODE_BA1_multiplier + MODE_BA2_multiplier + MODE_BA3_multiplier,
  scaling: 'ATK',
  elements: ['FUSION'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: MODE_BA1_energy + MODE_BA2_energy + MODE_BA3_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: MODE_BA1_concerto + MODE_BA2_concerto + MODE_BA3_concerto, share: 0 },
    { energyType: 'relative_momentum', amount: MODE_BA1_relative_momentum + MODE_BA2_relative_momentum + MODE_BA3_relative_momentum, share: 0 }
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  coordinatedAttacks: [],
  castConditions: {
    startState: 'AIR',
    endState: 'AIR',
    preventsSwapOut: true,
    requiredForms: ['Wide Field Observation Mode']
  },
  offtune: MODE_BA1_offtune + MODE_BA2_offtune + MODE_BA3_offtune,
  attemptFollowUp: { actionName: 'Mode: Resonance Skill', must: true },
  resolveVariant(prevSnapshot, characterName) {
    const bonusOnCooldown = (prevSnapshot?.charactersCooldowns?.[characterName]?.['Mode: Basic Attack 1-3'] ?? 0) > 0
    if (bonusOnCooldown) return { ...this, resolveVariant: undefined }
    return {
      ...this,
      cooldown: 20,
      energyGenerated: [
        ...this.energyGenerated,
        { energyType: 'concerto', amount: 20, share: 0 },
      ],
      resolveVariant: undefined,
    }
  }
}

// ========== Mode: Resonance Skill ============================================================================================
const mode_mornye_skill: Action = {
  tags: ['SKILL', 'HEAL_PROC'],
  name: 'Mode: Resonance Skill',
  displayName: 'Distributed Array',
  category: 'Skills',
  castTime: 1.05,
  multiplier: (4 * 39.77) / 100,
  scaling: 'ATK',
  elements: ['FUSION'],
  dmgTypes: ['SKILL'],
  cooldown: 16,
  energyGenerated: [
    { energyType: 'energy', amount: 4 * 4.63, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 10, share: 0 },
    { energyType: 'relative_momentum', amount: 60, share: 0 }
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  coordinatedAttacks: [],
  castConditions: {
    startState: 'AIR',
    endState: 'AIR',
    preventsSwapOut: true,
    requiredForms: ['Wide Field Observation Mode']
  },
  offtune: 4 * 0.20,
  attemptFollowUp: { actionName: 'Mode: Heavy Attack', must: true },
  resolveVariant(_prevSnapshot, _characterName, owner) {
    if (owner.sequence < 3) return { ...this, resolveVariant: undefined }
    return {
      ...this,
      energyGenerated: [
        ...this.energyGenerated,
        { energyType: 'concerto', amount: 25, share: 0, cooldownKey: 'Mornye S3: Distributed Array', cooldownDuration: 25 },
        { energyType: 'relative_momentum', amount: 100, share: 0, cooldownKey: 'Mornye S3: Distributed Array', cooldownDuration: 25 },
      ],
      resolveVariant: undefined,
    }
  },
}

// ========== Mode: Heavy Attack ===============================================================================================
const mode_mornye_heavy: Action = {
  tags: ['HEAVY_ATTACK'],
  name: 'Mode: Heavy Attack',
  displayName: 'Mode: Heavy Attack',
  category: 'Basics',
  castTime: 1.32,
  multiplier: (258.46) / 100,
  scaling: 'ATK',
  elements: ['FUSION'],
  dmgTypes: ['HEAVY'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 3.25, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 11.96, share: 0 }
  ],
  energyCost: [{ energyType: 'relative_momentum', amount: 100 }],
  statusModifications: [],
  damageModifiers: [
    {
      source: 'Mornye: Interfered Marker',
      displayName: 'Interfered Marker',
      type: 'buff',
      color: '#B87EFF',
      ownerCharacter: 'Mornye',
      characterStats: { bonusDMG: 0 },
      statsOnActivation: (ctx) => {
        const mornye = ctx.character.name === 'Mornye' ? ctx.character : ctx.allies.find(c => c.name === 'Mornye')
        const excess = Math.min(Math.max(0, ((mornye?.stats.energyPercent ?? 1) - 1) * 100), 160)
        return { bonusDMG: excess * 0.0025 }
      },
      condition: ownerAtLeast('Mornye', 1),
      targetStrategy: 'all',
      durationStrategy: { type: 'limited', timeDuration: 30 },
      stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 },
      description: 'For 20 seconds: Every 1 % of Mornye\'s Energy Regen over 100 % grants 0.25% Damage Bonus to all Resonators, up to 40%.',
      showStats: true
    },
    {
      source: 'Mornye: Interfered Marker (S2)',
      displayName: 'Interfered Marker (S2)',
      type: 'buff',
      color: '#B87EFF',
      ownerCharacter: 'Mornye',
      characterStats: { critDamage: 0 },
      statsOnActivation: (ctx) => {
        const mornye = ctx.character.name === 'Mornye' ? ctx.character : ctx.allies.find(c => c.name === 'Mornye')
        const excess = Math.min(Math.max(0, ((mornye?.stats.energyPercent ?? 1) - 1) * 100), 160)
        return { critDamage: excess * 0.002 }
      },
      condition: ownerAtLeast('Mornye', 2),
      targetStrategy: 'all',
      durationStrategy: { type: 'limited', timeDuration: 30 },
      stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 },
      description: 'For 20 seconds: Every 1 % of Mornye\'s Energy Regen over 100 % grants 0.2% Crit DMG to all Resonators, up to 32%.',
      showStats: true
    },
  ],
  sideEffects: [],
  coordinatedAttacks: [],
  castConditions: {
    startState: 'AIR',
    endState: 'AIR',
    preventsSwapOut: true,
    requiredForms: ['Wide Field Observation Mode']
  },
  offtune: 1.04,
  attemptFollowUp: { actionName: 'Liberation', must: true },
}

// ========== Mode: Liberation =======================================================================================================
const mornye_liberation: Action = {
  tags: ['LIBERATION', 'HEAL_PROC'],
  name: 'Liberation',
  displayName: 'Critical Protocol',
  category: 'Skills',
  castTime: 0.01,
  multiplier: (522.33) / 100,
  scaling: 'DEF',
  elements: ['FUSION'],
  dmgTypes: ['LIBERATION'],
  cooldown: 25,
  energyGenerated: [
    { energyType: 'concerto', amount: 20, share: 0 },
  ],
  energyCost: [{ energyType: 'energy', amount: 175 }],
  statusModifications: [],
  damageModifiers: [
    {
      source: 'Mornye: High Syntony Field',
      displayName: 'High Syntony Field',
      type: 'buff',
      color: '#FF2E3A',
      ownerCharacter: 'Mornye',
      characterStats: { bonusDEF: 0.2, offtuneBuildupRate: 0.5 },
      condition: always(),
      targetStrategy: 'all',
      durationStrategy: { type: 'limited', timeDuration: 25 },
      stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 },
      healProc: {
        frequency: 3,
        procTag: 'HEAL_PROC',
        procModifiers: [],
      },
      activationCondition: (ctx) => ctx.modifiersInAction.some(mia => mia.modifier.source === 'Mornye: Syntony Field'),
      removesModifierSourceOnActivation: 'Mornye: Syntony Field',
      description: 'For 25 seconds: increases the DEF of all Resonators by 20% and Offtune Buildup Rate by 50%. Every 3 seconds, heals the active resonator.',
      showStats: true
    },
    {
      source: 'Mornye: High Syntony Field',
      displayName: 'High Syntony Field (S2)',
      type: 'buff',
      color: '#FF2E3A',
      ownerCharacter: 'Mornye',
      characterStats: { offtuneBuildupRate: 0.2 },
      condition: ownerAtLeast('Mornye', 2),
      targetStrategy: 'all',
      durationStrategy: { type: 'limited', timeDuration: 25 },
      stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 },
      activationCondition: (ctx) => ctx.modifiersInAction.some(mia => mia.modifier.source === 'Mornye: Syntony Field'),
      contributionGroup: 'Mornye: High Syntony Field',
      description: 'High Syntony Field grants an additional 20% Offtune Buildup Rate to all Resonators',
      showStats: true
    },
  ],
  inherentModifiers: [
    {
      displayName: 'Liberation Crit Scaling',
      characterStats: { critRate: 0.005, critDamage: 0.01 },
      condition: (ctx) => Math.min(Math.max(0, (ctx.character.stats.energyPercent - 1) * 100), 160),
    },
  ],
  sideEffects: [],
  coordinatedAttacks: [],
  castConditions: {
    startState: 'ANY',
    endState: 'PRESERVE',
    previousActions: [mode_mornye_heavy],
    requiredForms: ['Wide Field Observation Mode'] // Technically not true, but practically required
  },
  offtune: 7.20,
  attemptFollowUp: { actionName: 'Echo Skill', must: true },
  resolveVariant(_prevSnapshot, _characterName, owner) {
    const s5Multiplier = owner.sequence >= 5 ? 1.4 : 1
    const s6Multiplier = owner.sequence >= 6 ? 5 : 1
    const totalMultiplier = s5Multiplier * s6Multiplier
    if (totalMultiplier === 1) return { ...this, resolveVariant: undefined }
    return {
      ...this,
      multiplier: this.multiplier * totalMultiplier,
      resolveVariant: undefined,
    }
  },
}

// ========== Intro & Outro ====================================================================================================
const mornye_intro: Action = {
  tags: ['INTRO_ACTION', 'HEAL_PROC'],
  name: 'Mornye Intro',
  displayName: 'Convergence',
  category: 'Other',
  castTime: 1.7,
  multiplier: (202.79) / 100,
  scaling: 'ATK',
  elements: ['FUSION'],
  dmgTypes: ['INTRO'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 10, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 10, share: 0 }
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [syntony_field, syntony_field_s2],
  sideEffects: [],
  castConditions: {
    startState: 'ANY',
    endState: 'AIR',
  },
  offtune: 1.36,
  formChange: 'Wide Field Observation Mode',
  resolveVariant(prevSnapshot, characterName) {
    const bonusOnCooldown = (prevSnapshot?.charactersCooldowns?.[characterName]?.['Mornye Intro'] ?? 0) > 0
    if (bonusOnCooldown) return { ...this, resolveVariant: undefined }
    return {
      ...this,
      cooldown: 20,
      energyGenerated: [
        ...this.energyGenerated,
        { energyType: 'concerto', amount: 20, share: 0 },
      ],
      resolveVariant: undefined,
    }
  },
}

const mornye_outro: Action = {
  tags: ['OUTRO_ACTION'],
  name: 'Outro',
  displayName: 'Recursion',
  category: 'Other',
  castTime: 0,
  multiplier: 0,
  scaling: 'ATK',
  elements: ['FUSION'],
  dmgTypes: ['OUTRO'],
  cooldown: 0,
  energyGenerated: [],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [
    {
      source: 'Mornye Outro Buff',
      displayName: 'Recursion',
      type: 'buff',
      ownerCharacter: 'Mornye',
      characterStats: { amplifyDMG: 0.25 },
      condition: always(),
      targetStrategy: 'all',
      durationStrategy: { type: 'limited', timeDuration: 30 },
      stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 },
      color: '#FFD700',
      description: 'For 30 seconds: all Resonators gain 25% All DMG Amplification.',
      showStats: true
    }
  ],
  sideEffects: [],
  castConditions: {
    startState: 'ANY',
    endState: 'PRESERVE',
  },
  offtune: 0,
}

// ========== Swaps ============================================================================================================
const mornye_wait_005: Action = {
  name: 'Wait 0.05s',
  displayName: 'Wait 0.05s',
  category: 'Testing',
  castTime: 0.05,
  multiplier: 0,
  scaling: 'HP',
  elements: [''],
  dmgTypes: [''],
  cooldown: 0,
  energyGenerated: [],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'ANY',
    endState: 'PRESERVE',
    preventsSwapOut: true,
  },
  offtune: 0,
}

const mornye_wait_for_swap: Action = {
  name: 'Wait Until Next Swap Is Available',
  displayName: 'Wait Until Next Swap Is Available',
  category: 'Other',
  castTime: 0,
  multiplier: 0,
  scaling: 'HP',
  elements: [''],
  dmgTypes: [''],
  cooldown: 0,
  energyGenerated: [],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'ANY',
    swapOutState: 'PRESERVE',
    endState: 'PRESERVE',
    requiresSwapOut: true,
    persistenceTime: 0,
    customCanCast(prevSnapshot) {
      if (!prevSnapshot) return false
      const cooldowns = prevSnapshot.charactersSwapCooldownUntil ?? {}
      return Object.values(cooldowns).some(until => until - prevSnapshot.toTime > 0)
    },
  },
  offtune: 0,
  resolveVariant(prevSnapshot) {
    const cooldowns = prevSnapshot?.charactersSwapCooldownUntil ?? {}
    const toTime = prevSnapshot?.toTime ?? 0
    const remaining = Object.values(cooldowns)
      .map(until => until - toTime)
      .filter(r => r > 0)
    const castTime = remaining.length > 0 ? Math.min(...remaining) : 0
    return { ...this, castTime, resolveVariant: undefined }
  },
}

const mornye_wait_for_cooldown: Action = {
  name: 'Wait Until Next Cooldown',
  displayName: 'Wait Until Next Cooldown',
  category: 'Other',
  castTime: 0, // resolved dynamically via resolveVariant
  multiplier: 0,
  scaling: 'DEF',
  elements: [''],
  dmgTypes: [''],
  cooldown: 0,
  energyGenerated: [],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'ANY',
    endState: 'PRESERVE',
    customCanCast(prevSnapshot, characterName) {
      if (!prevSnapshot || !characterName) return false
      const cooldowns = prevSnapshot.charactersCooldowns?.[characterName] ?? {}
      return Object.values(cooldowns).some(remaining => remaining > 0)
    },
  },
  offtune: 0,
  resolveVariant(prevSnapshot, characterName) {
    const cooldowns = prevSnapshot?.charactersCooldowns?.[characterName] ?? {}
    const remaining = Object.values(cooldowns).filter(r => r > 0)
    const castTime = remaining.length > 0 ? Math.min(...remaining) : 0
    return { ...this, castTime, resolveVariant: undefined }
  }
}

// ========== Energies =========================================================================================================
const mornye_energy: Action = {
  name: 'Energy Up',
  displayName: 'Energy Up',
  category: 'Testing',
  castTime: 0,
  multiplier: 0,
  scaling: 'HP',
  elements: [''],
  dmgTypes: [''],
  cooldown: 0,
  energyGenerated: [{ energyType: 'energy', amount: 1000, share: 0 }],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'ANY',
    endState: 'PRESERVE',
  },
  offtune: 0,
}

const mornye_concerto: Action = {
  name: 'Concerto Up',
  displayName: 'Concerto Up',
  category: 'Testing',
  castTime: 0,
  multiplier: 0,
  scaling: 'HP',
  elements: [''],
  dmgTypes: [''],
  cooldown: 0,
  energyGenerated: [{ energyType: 'concerto', amount: 1000, share: 0 }],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'ANY',
    endState: 'PRESERVE',
  },
  offtune: 0,
}

const mornye_rest_mass_energy: Action = {
  name: 'Rest Mass Energy',
  displayName: 'Rest Mass Energy',
  category: 'Testing',
  castTime: 0,
  multiplier: 0,
  scaling: 'HP',
  elements: [''],
  dmgTypes: [''],
  cooldown: 0,
  energyGenerated: [{ energyType: 'rest_mass_energy', amount: 1000, share: 0 }],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'ANY',
    endState: 'PRESERVE',
  },
  offtune: 0,
}

const mornye_relative_momentum: Action = {
  name: 'Relative Momentum',
  displayName: 'Relative Momentum',
  category: 'Testing',
  castTime: 0,
  multiplier: 0,
  scaling: 'HP',
  elements: [''],
  dmgTypes: [''],
  cooldown: 0,
  energyGenerated: [{ energyType: 'relative_momentum', amount: 1000, share: 0 }],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'ANY',
    endState: 'PRESERVE',
  },
  offtune: 0,
}

export const mornye_intro_outro_actions = [mornye_intro, mornye_outro]

export const all_actions = [
  mornye_BA_1_cancel_with_swap,
  mornye_BA_1_2_cancel_with_swap,
  mornye_BA_1_3_into_heavy,
  mornye_BA_1_3_cancel_with_swap,
  mornye_BA_2_cancel_with_swap,
  mornye_BA_2_3_into_heavy,
  mornye_BA_2_3_cancel_with_swap,
  mornye_BA_3_into_heavy,
  mornye_BA_3_cancel_with_swap,
  mornye_BA_3_cancel_with_skill,
  mornye_heavy,
  mornye_heavy_swap_in,
  mornye_skill,
  mode_mornye_BA_1_3,
  mode_mornye_skill,
  mode_mornye_heavy,
  mornye_liberation,
  ...mornye_intro_outro_actions,
  mornye_wait_005,
  //mornye_wait_1,
  mornye_wait_for_swap,
  mornye_wait_for_cooldown,
  mornye_energy,
  mornye_concerto,
  mornye_rest_mass_energy,
  mornye_relative_momentum
]

export {
  // Basic Attacks 1
  mornye_BA_1_cancel_with_swap,
  mornye_BA_1_2_cancel_with_swap,
  mornye_BA_1_3_into_heavy,
  mornye_BA_1_3_cancel_with_swap,
  mornye_BA_1_3_cancel_with_skill,
  
  // Basic Attacks 2
  mornye_BA_2_cancel_with_swap,
  mornye_BA_2_3_into_heavy,
  mornye_BA_2_3_cancel_with_swap,
  mornye_BA_2_3_cancel_with_skill,
  
  // Basic Attacks 3
  mornye_BA_3_into_heavy,
  mornye_BA_3_cancel_with_swap,
  mornye_BA_3_cancel_with_skill,

  // Heavy Attack
  mornye_heavy,
  mornye_heavy_swap_in,

  // Resonance Skill
  mornye_skill,
  
  // Mode: Basic Attack 1-3
  mode_mornye_BA_1_3,

  // Mode: Resonance Skill
  mode_mornye_skill,

  // Mode: Heavy Attack
  mode_mornye_heavy,

  // Mode: Liberation
  mornye_liberation,

  // Intro / Outro
  mornye_intro,
  mornye_outro,

  // Swaps
  mornye_wait_005,
  //mornye_wait_1,
  mornye_wait_for_swap,
  mornye_wait_for_cooldown,

  // Testing
  mornye_energy,
  mornye_concerto,
  mornye_rest_mass_energy,
  mornye_relative_momentum
}

