import type { Action } from '../../types/action'

// TODO - all versions should equal in the same cast time for BA1, BA2, BA3. Swapping should penalize by 0.4, skill cancel no penalty
// Tests which ways Heavy Attack can be used as follow up to basic combos
// Might need none-swap versions of BA1, BA2, BA3 (used to chain into heavy)

// ========== Basic Attack 1 ===================================================================================================
export const mornye_BA_1_cancel_with_swap: Action = {
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

export const mornye_BA_1_cancel_with_skill: Action = {
  name: 'Basic Attack 1 (skill cancel)',
  displayName: 'Basic Attack 1 (skill cancel)',
  category: 'Basics',
  castTime: 0.05,
  multiplier: (0) / 100,
  scaling: 'ATK',
  elements: ['FUSION'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: (0), share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: (0), share: 0 },
    { energyType: 'forte', amount: 20, share: 0 },
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
    // TODO Can combo into anything starting with BA2 within persistence time
  },
  offtune: (0),
  groupName: 'Basic Attack 1',
  variantName: 'Cancel With Skill',
  requiredFollowUp: { actionName: 'Resonance Skill' } // TODO Add liberation as an option as well
}

// ========== Basic Attack 1-2 =================================================================================================
export const mornye_BA_1_2_cancel_with_swap: Action = {
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

export const mornye_BA_1_2_cancel_with_skill: Action = {
  name: 'Basic Attack 1-2 (skill cancel)',
  displayName: 'Basic Attack 1-2 (skill cancel)',
  category: 'Basics',
  castTime: 0.43,
  multiplier: ((22.27 + 2 * 16.71) + (0)) / 100,
  scaling: 'ATK',
  elements: ['FUSION'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: (0.35 + 2 * 0.27) + (0), share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: (1.12 + 2 * 0.84) + (0), share: 0 },
    { energyType: 'forte', amount: 60, share: 0 },
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
    // TODO Can combo into anything starting with BA3 within persistence time
  },
  offtune: (0.11 + 2 * 0.08) + (0),
  groupName: 'Basic Attack 1-2',
  variantName: 'Cancel With Skill',
  requiredFollowUp: { actionName: 'Resonance Skill' } // TODO Add liberation as an option as well
}

// ========== Basic Attack 1-3 =================================================================================================
export const mornye_BA_1_3_cancel_with_swap: Action = {
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

export const mornye_BA_1_3_cancel_with_skill: Action = {
  name: 'Basic Attack 1-3 (skill cancel)',
  displayName: 'Basic Attack 1-3 (skill cancel)',
  category: 'Basics',
  castTime: 1.30,
  multiplier: ((22.27 + 2 * 16.71) + (23.86 + 23.86 + 4 * 17.90) + (0)) / 100,
  scaling: 'ATK',
  elements: ['FUSION'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: (0.35 + 2 * 0.27) + (0.38 + 0.38 + 4 * 0.29) + (0), share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: (1.12 + 2 * 0.84) + (1.20 + 1.20 + 4 * 0.90) + (0), share: 0 },
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
  offtune: (0.11 + 2 * 0.08) + (0.12 + 0.12 + 2 * 0.09) + (0),
  groupName: 'Basic Attack 1-3',
  variantName: 'Cancel With Skill',
  requiredFollowUp: { actionName: 'Resonance Skill' } // TODO Add liberation as an option as well
}

// ========== Basic Attack 2 ===================================================================================================
export const mornye_BA_2_cancel_with_swap: Action = {
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

export const mornye_BA_2_cancel_with_skill: Action = {
  name: 'Basic Attack 2 (skill cancel)',
  displayName: 'Basic Attack 2 (skill cancel)',
  category: 'Basics',
  castTime: 0.05,
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
  },
  offtune: (0),
  groupName: 'Basic Attack 2',
  variantName: 'Cancel With Skill',
  requiredFollowUp: { actionName: 'Resonance Skill' } // TODO Add liberation as an option as well
}

// ========== Basic Attack 2-3 =================================================================================================

export const mornye_BA_2_3_cancel_with_swap: Action = {
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

export const mornye_BA_2_3_cancel_with_skill: Action = {
  name: 'Basic Attack 2-3 (skill cancel)',
  displayName: 'Basic Attack 2-3 (skill cancel)',
  category: 'Basics',
  castTime: 1.06,
  multiplier: ((23.86 + 23.86 + 4 * 17.90) + (0)) / 100,
  scaling: 'ATK',
  elements: ['FUSION'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: (0.38 + 0.38 + 4 * 0.29) + (0), share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: (1.20 + 1.20 + 4 * 0.90) + (0), share: 0 },
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
  offtune: (0.12 + 0.12 + 2 * 0.09) + (0),
  groupName: 'Basic Attack 2-3',
  variantName: 'Cancel With Skill',
  requiredFollowUp: { actionName: 'Resonance Skill' } // TODO Add liberation as an option as well
}

// ========== Basic Attack 3 ===================================================================================================
export const mornye_BA_3_cancel_with_swap: Action = {
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

export const mornye_BA_3_cancel_with_skill: Action = {
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
// Version X (check cast time against Swap In)
// Version Y (check cast time against BAs)







// ========== Resonance Skill ==================================================================================================
export const mornye_skill: Action = {
  name: 'Resonance Skill',
  displayName: 'Expectation Error',
  category: 'Skills',
  castTime: 0.36,
  multiplier: (0) / 100,
  scaling: 'DEF',
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
  requiredFollowUp: { actionName: 'XXX' } // TODO Counts as BA1, requires BA2 or BA2->... as follow up 
}

// ========== Liberation =======================================================================================================
export const mornye_liberation: Action = {
  name: 'Liberation',
  displayName: 'Critical Protocol',
  category: 'Basics',
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
    // Dispatches High Syntony Field if Syntony Field is present
  ],
  sideEffects: [],
  coordinatedAttacks: [],
  castConditions: {
    startState: 'ANY',
    endState: 'PRESERVE',
    // TODO Castable for both forms, do we need to explicitely say so? Or leave it out like now?
  },
  offtune: 7.20
}









// ========== Blueprint ========================================================================================================
export const blueprint: Action = {
  name: 'XXX',
  displayName: 'XXX',
  category: 'Basics',
  castTime: 100,
  multiplier: (100) / 100,
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['LIBERATION'],
  cooldown: 100,
  energyGenerated: [
    { energyType: 'energy', amount: 100, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 100, share: 0 },
    { energyType: 'forte', amount: 100, share: 0 },
  ],
  energyCost: [{ energyType: 'energy', amount: 100 }],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  coordinatedAttacks: [], // Optional
  castConditions: {
    previousActions: [], // Optional
    startState: 'ANY',
    swapOutState: undefined, // Optional
    endState: 'PRESERVE',
    persistenceTime: undefined, // Optional
    requiresSwapIn: undefined, // Optional
    requiresSwapOut: undefined, // Optional
    requiredForms: undefined, // Optional
    customCanCast: undefined, // Optional
  },
  offtune: 100,
  toolTip: undefined, // Optional
  groupName: undefined, // Optional
  variantName: undefined, // Optional
  formChange: undefined, // Optional
  resolveVariant: undefined, // Optional
  requiredFollowUp: undefined, // Optional: { actionName: 'XXX' }
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
  // Basic Attack 3-4


  // Mid Air 2 -> Basic Attack 4


  // Resonance Skill


  // Liberation


  // Heavy Attack


  // Intro / Outro


  // Swaps
  mornye_wait_005,
  mornye_wait_for_swap,

  // Testing
  mornye_energy,
  mornye_concerto,
  mornye_forte,
  mornye_relative_momentum
}
