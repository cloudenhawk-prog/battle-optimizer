import type { Action } from '../../types/action'

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
    { energyType: 'forte', amount: 20, share: 0 }, // TODO Might be 21-22
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
  variantName: 'Cancel With Swap',
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
  castTime: 0.52,
  multiplier: ((22.27 + 2 * 16.71) + (23.86 + 23.86 + 4 * 17.90)) / 100,
  scaling: 'ATK',
  elements: ['FUSION'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: (0.35 + 2 * 0.27) + (0.38 + 0.38 + 4 * 0.29), share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: (1.12 + 2 * 0.84) + (1.20 + 1.20 + 4 * 0.90), share: 0 },
    { energyType: 'forte', amount: 64, share: 0 },
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
  variantName: 'Cancel With Swap',
}

export const mornye_BA_1_2_cancel_with_skill: Action = {
  name: 'Basic Attack 1-2 (skill cancel)',
  displayName: 'Basic Attack 1-2 (skill cancel)',
  category: 'Basics',
  castTime: 0.48,
  multiplier: ((22.27 + 2 * 16.71) + (0)) / 100,
  scaling: 'ATK',
  elements: ['FUSION'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: (0.35 + 2 * 0.27) + (0), share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: (1.12 + 2 * 0.84) + (0), share: 0 },
    { energyType: 'forte', amount: 64, share: 0 },
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
  variantName: 'Cancel With Swap',
}

export const mornye_BA_1_3_cancel_with_skill: Action = {
  name: 'Basic Attack 1-3 (skill cancel)',
  displayName: 'Basic Attack 1-3 (skill cancel)',
  category: 'Basics',
  castTime: 1.34,
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
