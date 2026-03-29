import type { Action } from '../../types/action'

// TODO - any swap-away from Mornye should formChange into default form (how to ensure this as not every swap will trigger intro/outros)

// TODO - all versions should equal in the same cast time for BA1, BA2, BA3. Swapping should penalize by 0.4, skill cancel no penalty
// Tests which ways Heavy Attack can be used as follow up to basic combos
// Might need none-swap versions of BA1, BA2, BA3 (used to chain into heavy)

// ========== Basic Attack 1 ===================================================================================================
const mornye_BA_1_cancel_with_swap: Action = {
  name: 'Basic Attack 1 (swap cancel)',
  displayName: 'Basic Attack 1 (swap cancel)',
  category: 'Basics',
  castTime: 0.09,
  multiplier: (22.27 + 2 * 16.71) / 100,
  scaling: 'ATK',
  elements: ['FUSION'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: (0.35 + 2 * 0.27), share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: (1.12 + 2 * 0.84), share: 0 },
    { energyType: 'forte', amount: 20, share: 0 },
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
    persistenceTime: 1.4,
    requiresSwapOut: true,
    requiredForms: ['Baseline Mode'],
    // TODO Can combo into anything starting with BA2 within persistence time
  },
  offtune: (0.11 + 2 * 0.08),
  groupName: 'Basic Attack 1',
  variantName: 'Cancel With Swap'
}

// ========== Basic Attack 1-2 =================================================================================================
const mornye_BA_1_2_cancel_with_swap: Action = {
  name: 'Basic Attack 1-2 (swap cancel)',
  displayName: 'Basic Attack 1-2 (swap cancel)',
  category: 'Basics',
  castTime: 0.47,
  multiplier: ((22.27 + 2 * 16.71) + (23.86 + 23.86 + 4 * 17.90)) / 100,
  scaling: 'ATK',
  elements: ['FUSION'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: (0.35 + 2 * 0.27) + (0.38 + 0.38 + 4 * 0.29), share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: (1.12 + 2 * 0.84) + (1.20 + 1.20 + 4 * 0.90), share: 0 },
    { energyType: 'forte', amount: 60, share: 0 },
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
    persistenceTime: 2.551,
    requiresSwapOut: true,
    requiredForms: ['Baseline Mode']
    // TODO Can combo into anything starting with BA3 within persistence time
  },
  offtune: (0.11 + 2 * 0.08) + (0.12 + 0.12 + 2 * 0.09),
  groupName: 'Basic Attack 1-2',
  variantName: 'Cancel With Swap'
}

// ========== Basic Attack 1-3 =================================================================================================
const mornye_BA_1_3_into_heavy: Action = {
  name: 'Basic Attack 1-3 (into heavy)',
  displayName: 'Basic Attack 1-3 (into heavy)',
  category: 'Basics',
  castTime: 1.83, // 7.47 -> 9.37 -> 10.46
  multiplier: ((22.27 + 2 * 16.71) + (23.86 + 23.86 + 4 * 17.90) + (41.36 + 6 * 10.34)) / 100,
  scaling: 'ATK',
  elements: ['FUSION'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: (0.35 + 2 * 0.27) + (0.38 + 0.38 + 4 * 0.29) + (0.65 + 6 * 0.17), share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: (1.12 + 2 * 0.84) + (1.20 + 1.20 + 4 * 0.90) + (2.08 + 6 * 0.52), share: 0 },
    { energyType: 'forte', amount: 100, share: 0 },
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  coordinatedAttacks: [],
  castConditions: {
    startState: 'GROUND',
    endState: 'GROUND',
    requiredForms: ['Baseline Mode']
  },
  offtune: (0.11 + 2 * 0.08) + (0.12 + 0.12 + 2 * 0.09) + (0.21 + 6 * 0.05),
  groupName: 'Basic Attack 1-3',
  variantName: 'Into Heavy Attack',
  requiredFollowUp: { actionName: 'Heavy Attack' }
}

const mornye_BA_1_3_cancel_with_swap: Action = {
  name: 'Basic Attack 1-3 (swap cancel)',
  displayName: 'Basic Attack 1-3 (swap cancel)',
  category: 'Basics',
  castTime: 1.34,
  multiplier: ((22.27 + 2 * 16.71) + (23.86 + 23.86 + 4 * 17.90) + (41.36 + 6 * 10.34)) / 100,
  scaling: 'ATK',
  elements: ['FUSION'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: (0.35 + 2 * 0.27) + (0.38 + 0.38 + 4 * 0.29) + (0.65 + 6 * 0.17), share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: (1.12 + 2 * 0.84) + (1.20 + 1.20 + 4 * 0.90) + (2.08 + 6 * 0.52), share: 0 },
    { energyType: 'forte', amount: 100, share: 0 },
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
    persistenceTime: 2.92,
    requiresSwapOut: true,
    requiredForms: ['Baseline Mode']
    // TODO Should not allow BA4; within this time only actions available withine persistenceTime should be: skill, heavy, liberation
  },
  offtune: (0.11 + 2 * 0.08) + (0.12 + 0.12 + 2 * 0.09) + (0.21 + 6 * 0.05),
  groupName: 'Basic Attack 1-3',
  variantName: 'Cancel With Swap'
}

// ========== Basic Attack 2 ===================================================================================================
const mornye_BA_2_cancel_with_swap: Action = {
  name: 'Basic Attack 2 (swap cancel)',
  displayName: 'Basic Attack 2 (swap cancel)',
  category: 'Basics',
  castTime: 0.09,
  multiplier: (23.86 + 23.86 + 4 * 17.90) / 100,
  scaling: 'ATK',
  elements: ['FUSION'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: (0.38 + 0.38 + 4 * 0.29), share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: (1.20 + 1.20 + 4 * 0.90), share: 0 },
    { energyType: 'forte', amount: 40, share: 0 },
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
    persistenceTime: 2.551,
    requiresSwapOut: true,
    requiredForms: ['Baseline Mode']
    // TODO Can combo into anything starting with BA3 within persistence time
  },
  offtune: (0.12 + 0.12 + 2 * 0.09),
  groupName: 'Basic Attack 2',
  variantName: 'Cancel With Swap'
}

// ========== Basic Attack 2-3 =================================================================================================
const mornye_BA_2_3_into_heavy: Action = {
  name: 'Basic Attack 2-3 (into heavy)',
  displayName: 'Basic Attack 2-3 (into heavy)',
  category: 'Basics',
  castTime: 1.59,
  multiplier: ((23.86 + 23.86 + 4 * 17.90) + (41.36 + 6 * 10.34)) / 100,
  scaling: 'ATK',
  elements: ['FUSION'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: (0.38 + 0.38 + 4 * 0.29) + (0.65 + 6 * 0.17), share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: (1.20 + 1.20 + 4 * 0.90) + (2.08 + 6 * 0.52), share: 0 },
    { energyType: 'forte', amount: 80, share: 0 },
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  coordinatedAttacks: [],
  castConditions: {
    startState: 'GROUND',
    endState: 'GROUND',
    requiredForms: ['Baseline Mode']
  },
  offtune: (0.12 + 0.12 + 2 * 0.09) + (0.21 + 6 * 0.05),
  groupName: 'Basic Attack 2-3',
  variantName: 'Into Heavy',
  requiredFollowUp: { actionName: 'Heavy Attack' }
}

const mornye_BA_2_3_cancel_with_swap: Action = {
  name: 'Basic Attack 2-3 (swap cancel)',
  displayName: 'Basic Attack 2-3 (swap cancel)',
  category: 'Basics',
  castTime: 1.10,
  multiplier: ((23.86 + 23.86 + 4 * 17.90) + (41.36 + 6 * 10.34)) / 100,
  scaling: 'ATK',
  elements: ['FUSION'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: (0.38 + 0.38 + 4 * 0.29) + (0.65 + 6 * 0.17), share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: (1.20 + 1.20 + 4 * 0.90) + (2.08 + 6 * 0.52), share: 0 },
    { energyType: 'forte', amount: 80, share: 0 },
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
    persistenceTime: 2.92,
    requiresSwapOut: true,
    requiredForms: ['Baseline Mode']
    // TODO Should not allow BA4; within this time only actions available withine persistenceTime should be: skill, heavy, liberation
  },
  offtune: (0.12 + 0.12 + 2 * 0.09) + (0.21 + 6 * 0.05),
  groupName: 'Basic Attack 2-3',
  variantName: 'Cancel With Swap'
}

// ========== Basic Attack 3 ===================================================================================================
const mornye_BA_3_into_heavy: Action = {
  name: 'Basic Attack 3 (into heavy)',
  displayName: 'Basic Attack 3 (into heavy)',
  category: 'Basics',
  castTime: 0.58,
  multiplier: (41.36 + 6 * 10.34) / 100,
  scaling: 'ATK',
  elements: ['FUSION'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: (0.65 + 6 * 0.17), share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: (2.08 + 6 * 0.52), share: 0 },
    { energyType: 'forte', amount: 40, share: 0 },
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  coordinatedAttacks: [],
  castConditions: {
    startState: 'GROUND',
    endState: 'GROUND',
    requiredForms: ['Baseline Mode']
  },
  offtune: (0.21 + 6 * 0.05),
  groupName: 'Basic Attack 3',
  variantName: 'Into Heavy',
  requiredFollowUp: { actionName: 'Heavy Attack' }
}

const mornye_BA_3_cancel_with_swap: Action = {
  name: 'Basic Attack 3 (swap cancel)',
  displayName: 'Basic Attack 3 (swap cancel)',
  category: 'Basics',
  castTime: 0.09,
  multiplier: (41.36 + 6 * 10.34) / 100,
  scaling: 'ATK',
  elements: ['FUSION'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: (0.65 + 6 * 0.17), share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: (2.08 + 6 * 0.52), share: 0 },
    { energyType: 'forte', amount: 40, share: 0 },
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
    persistenceTime: 2.92,
    requiresSwapOut: true,
    requiredForms: ['Baseline Mode']
    // TODO Should not allow BA4; within this time only actions available withine persistenceTime should be: skill, heavy, liberation
  },
  offtune: (0.21 + 6 * 0.05),
  groupName: 'Basic Attack 3',
  variantName: 'Cancel With Swap'
}

const mornye_BA_3_cancel_with_skill: Action = {
  name: 'Basic Attack 3 (skill cancel)',
  displayName: 'Basic Attack 3 (skill cancel)',
  category: 'Basics',
  castTime: 0.04,
  multiplier: (0) / 100,
  scaling: 'ATK',
  elements: ['FUSION'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: (0), share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: (0), share: 0 },
    { energyType: 'forte', amount: 40, share: 0 },
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  coordinatedAttacks: [],
  castConditions: {
    startState: 'GROUND',
    endState: 'GROUND',
    requiredForms: ['Baseline Mode']
  },
  offtune: (0),
  groupName: 'Basic Attack 3',
  variantName: 'Cancel With Skill',
  requiredFollowUp: { actionName: 'Resonance Skill' } // TODO Add liberation as an option as well
}

// ========== Heavy Attack =====================================================================================================
const mornye_heavy: Action = {
  name: 'Heavy Attack',
  displayName: 'Heavy Attack',
  category: 'Basics',
  castTime: 1.15,
  multiplier: (44.14 + 99.02) / 100,
  scaling: 'ATK',
  elements: ['FUSION'],
  dmgTypes: ['HEAVY'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 0.93 + 2.08, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 2.96 + 6.65, share: 0 }
  ],
  energyCost: [{ energyType: 'forte', amount: 100 }],
  statusModifications: [],
  damageModifiers: [
    // TODO: Syntony Field: 25 seconds:
    // Trigger heal every 3 seconds (should trigger echo 5-set effect) (also triggers heal on cast)
    // Off-tune Buildup Rate for all resonators: +70 % (20 % comes from S2)
    // 1 max stack, resets on cast, all allies.
  ],
  sideEffects: [
    // TODO: 39.77%*5 FUSION DMG considered LIBERATION DMG (upon entering Wide Field Observation Mode)
  ],
  coordinatedAttacks: [],
  castConditions: {
    previousActions: [], // TODO: Insert 'into heavy' variants of BA's
    startState: 'GROUND',
    endState: 'AIR',
    requiredForms: ['Baseline Mode']
  },
  offtune: 0.30 + 0.66,
  formChange: 'Wide Field Observation Mode',
  requiredFollowUp: { actionName: 'Mode: Basic Attack 1-3' }
}

const mornye_heavy_swap_in: Action = {
  name: 'Heavy Attack',
  displayName: 'Heavy Attack',
  category: 'Basics',
  castTime: 1.50,
  multiplier: (44.14 + 99.02) / 100,
  scaling: 'ATK',
  elements: ['FUSION'],
  dmgTypes: ['HEAVY'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 0.93 + 2.08, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 2.96 + 6.65, share: 0 }
  ],
  energyCost: [{ energyType: 'forte', amount: 100 }],
  statusModifications: [],
  damageModifiers: [
    // TODO: Syntony Field: 25 seconds:
    // Trigger heal every 3 seconds (should trigger echo 5-set effect) (also triggers heal on cast)
    // Off-tune Buildup Rate for all resonators: +70 % (20 % comes from S2)
    // 1 max stack, resets on cast, all allies.
  ],
  sideEffects: [
    // TODO: 39.77%*5 FUSION DMG considered LIBERATION DMG (upon entering Wide Field Observation Mode)
  ],
  coordinatedAttacks: [],
  castConditions: {
    startState: 'GROUND',
    endState: 'AIR',
    requiredForms: ['Baseline Mode'],
    // TODO Custom Cast: Persistence time needs to exist AND last action cast by mornye has to be any BA that includes BA3
  },
  offtune: 0.30 + 0.66,
  formChange: 'Wide Field Observation Mode',
  requiredFollowUp: { actionName: 'Mode: Basic Attack 1-3' }
}

// ========== Resonance Skill ==================================================================================================
const mornye_skill: Action = {
  name: 'Resonance Skill',
  displayName: 'Expectation Error',
  category: 'Skills',
  castTime: 0.36,
  multiplier: (0) / 100,
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
    requiredForms: ['Baseline Mode']
  },
  offtune: 0,
  groupName: 'Resonance Skill',
  variantName: 'Default',
  requiredFollowUp: { actionName: 'XXX' } // TODO Counts as BA1, requires BA2 or BA2->... as follow up. Was this cast time teste with BA2 follow up in mind?
}

// Add swap out variant with 0.09 cast time (might want to trigger heal)
// TODO - add variant that has Heavy Attack as follow up
  // Is it faster to do BA1-3 -> Heavy Attack OR BA1-3 -> Skill -> Heavy Attack
  // If Skill is slower, then it has no use at all, hence don't add variant

// ========== Mode: Basic Attack 1-3 ===========================================================================================
const mode_mornye_BA_1_3: Action = {
  name: 'Mode: Basic Attack 1-3',
  displayName: 'Mode: Basic Attack 1-3',
  category: 'Basics',
  castTime: 1.51,
  multiplier: ((4 * 13.92) + (4 * 25.85) + (4 * 9.31 + 2 * 33.09)) / 100,
  scaling: 'ATK',
  elements: ['FUSION'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: (4 * 0.22) + (4 * 0.41) + (4 * 0.15 + 2 * 0.52), share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: (4 * 	0.35) + (4 * 0.64) + (4 * 0.23 + 2 * 0.82), share: 0 },
    { energyType: 'relative_momentum', amount: 40, share: 0 }
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  coordinatedAttacks: [],
  castConditions: {
    startState: 'AIR',
    endState: 'AIR',
    requiredForms: ['Wide Field Observation Mode']
  },
  offtune: (4 * 0.07) + (4 * 0.13) + (4 * 0.05 + 2 * 0.17),
  requiredFollowUp: { actionName: 'Mode: Resonance Skill' }
}

// ========== Mode: Resonance Skill ============================================================================================
const mode_mornye_skill: Action = { // TODO: Also triggers healing
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
    requiredForms: ['Wide Field Observation Mode']
  },
  offtune: 4 * 0.20,
  requiredFollowUp: { actionName: 'Mode: Heavy Attack' }
}

// ========== Mode: Heavy Attack ===============================================================================================
const mode_mornye_heavy: Action = {
  name: 'Mode: Heavy Attack',
  displayName: 'Mode: Heavy Attack',
  category: 'Basics',
  castTime: 1.4, // TODO: does it slow time in ToA?
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
    // Interfered Marker
    // Lasts 20 seconds (let them be 2 seperate buffs - Interfered Marker S1 and Interfered Marker S2)
    // S1: All resonators in the team get DMG BONUS equal to 0.25 % per 1 % of Mornye's Energy Regen (stat) exceeding 100 % (up to 40 % DMG BONUS at 260 % Energy Regen)
    // S2: All resonators in the team get Crit DMG equal to 0.2 % per 1 % of Morney's Energy Regen (stat) exceeding 100 % (up to 32 % CRIT DMG at 260 % Energy regen)
  ],
  sideEffects: [],
  coordinatedAttacks: [],
  castConditions: {
    startState: 'AIR',
    endState: 'AIR',
    requiredForms: ['Wide Field Observation Mode']
  },
  offtune: 1.04,
  requiredFollowUp: { actionName: 'Liberation' }
}

// ========== Mode: Liberation =======================================================================================================
const mornye_liberation: Action = {
  name: 'Liberation',
  displayName: 'Critical Protocol',
  category: 'Skills',
  castTime: 1, // TODO
  multiplier: (522.33) / 100,
  scaling: 'DEF',
  elements: ['FUSION'],
  dmgTypes: ['LIBERATION'],
  cooldown: 100,
  energyGenerated: [
    { energyType: 'concerto', amount: 20, share: 0 },
  ],
  energyCost: [{ energyType: 'energy', amount: 175 }],
  statusModifications: [],
  damageModifiers: [
    // Needs Inherent Modifiers (or other name) that only affect the dmg of THIS action RIGHT NOW - not buffs but conditions that amplify damage. Then refactor Fleurdelys Liberation to use it too.
      // - For every 1% of Mornye's Energy Regen exceeding 100%, this skill gains an additional 0.5% Crit. Rate (up to 80%) and 1% Crit. DMG (up to 160%).
    
    // Removes Syntony Field and creates High Syntony Field (if Syntony Field is present)
    // For 25 seconds: Increase DEF of all resonators in the team by 20 %
    // Off-tune Buildup Rate for all resonators: +70 % (20 % comes from S2)
    // Triggers heal every 3 second (including on cast) (should trigger echo 5-set effect)
  ],
  sideEffects: [],
  coordinatedAttacks: [],
  castConditions: {
    startState: 'ANY',
    endState: 'PRESERVE',
    requiredForms: ['Wide Field Observation Mode'] // Technically not true, but practically required
  },
  offtune: 7.20
}

// ========== Intro & Outro ====================================================================================================
const mornye_intro: Action = {
  name: 'Mornye Intro',
  displayName: 'Convergence',
  category: 'Other',
  castTime: 100, // TODO
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
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'ANY',
    endState: 'AIR',
  },
  offtune: 1.36,
  formChange: 'Wide Field Observation Mode'
}

const mornye_outro: Action = {
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
    // TODO: Resonators in the team gain 25% All DMG Amplification for 30s.
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
  category: 'Other',
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
  },
  offtune: 0,
}

const mornye_wait_for_swap: Action = {
  name: 'Wait Until Next Swap Is Available',
  displayName: 'Wait Until Next Swap Is Available',
  category: 'Other',
  castTime: 0, // resolved dynamically via resolveVariant
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

const mornye_forte: Action = {
  name: 'Forte Up',
  displayName: 'Forte Up',
  category: 'Testing',
  castTime: 0,
  multiplier: 0,
  scaling: 'HP',
  elements: [''],
  dmgTypes: [''],
  cooldown: 0,
  energyGenerated: [{ energyType: 'forte', amount: 1000, share: 0 }],
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

export {
  // Basic Attacks 1
  mornye_BA_1_cancel_with_swap,
  mornye_BA_1_2_cancel_with_swap,
  mornye_BA_1_3_into_heavy,
  mornye_BA_1_3_cancel_with_swap,
  
  // Basic Attacks 2
  mornye_BA_2_cancel_with_swap,
  mornye_BA_2_3_into_heavy,
  mornye_BA_2_3_cancel_with_swap,
  
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
  mornye_wait_for_swap,

  // Testing
  mornye_energy,
  mornye_concerto,
  mornye_forte,
  mornye_relative_momentum
}
