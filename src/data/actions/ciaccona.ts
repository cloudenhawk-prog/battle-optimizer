import type { Action } from '../../types/action'
import { always } from '../../utils/conditions/damageModifierConditions'
import { ciaccona_singers_triple_cadenza_coordinated } from '../coordinatedAttacks/ciaccona'

// ========== Basic Attack 3-4 =================================================================================================
const ciaccona_BA_3_4_cancel_with_skill: Action = {
  name: 'Basic Attack 3-4 (skill cancel)',
  displayName: 'Basic Attack 3-4 (skill cancel)',
  category: 'Basics',
  castTime: 0.73,
  multiplier: (4 * 33.02 + 4 * 61.14) / 100,
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 4 * 0.51 + 4 * 0.94, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 4 * 1.62 + 4 * 3.0, share: 0 },
    { energyType: 'forte', amount: 1, share: 0 },
  ],
  energyCost: [],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Aero Erosion', stackChange: 1 }],
  damageModifiers: [
    {
      source: 'Ciaconna Ensemble Sylph',
      displayName: 'Ensemble Sylph',
      type: 'buff',
      ownerCharacter: 'Ciaccona',
      condition: always(),
      characterStats: { aeroBonusDMG: 0.24 },
      targetStrategy: 'all',
      durationStrategy: { type: 'permanent' },
      stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 },
    },
  ],
  sideEffects: [],
  castConditions: {
    startState: 'GROUND',
    endState: 'GROUND',
    requiresSwapIn: true, // TODO : Double Check that it's possible
  },
  offtune: 4 * 0.16 + 4 * 0.3,
  toolTip: 'Can be cast after Intro Skill',
  groupName: 'Basic Attack 3-4',
  variantName: 'Cancel With Skill'
}

const ciaccona_BA_3_4_cancel_with_swap: Action = {
  name: 'Basic Attack 3-4 (swap cancel)',
  displayName: 'Basic Attack 3-4 (swap cancel)',
  category: 'Basics',
  castTime: 0.87,
  multiplier: (4 * 33.02 + 4 * 61.14) / 100,
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 4 * 0.51 + 4 * 0.94, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 4 * 1.62 + 4 * 3.0, share: 0 },
    { energyType: 'forte', amount: 1, share: 0 },
  ],
  energyCost: [],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Aero Erosion', stackChange: 1 }],
  damageModifiers: [
    {
      source: 'Ciaconna Ensemble Sylph',
      displayName: 'Ensemble Sylph',
      type: 'buff',
      ownerCharacter: 'Ciaccona',
      condition: always(),
      characterStats: { aeroBonusDMG: 0.24 },
      targetStrategy: 'all',
      durationStrategy: { type: 'permanent' },
      stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 },
    },
  ],
  sideEffects: [],
  castConditions: {
    startState: 'GROUND',
    swapOutState: 'AIR', // TODO : Double Check
    endState: 'GROUND',
    requiresSwapIn: true, // TODO : Double Check that it's possible
    requiresSwapOut: true,
    persistenceTime: 100 // TODO : Persistence Time
  },
  offtune: 4 * 0.16 + 4 * 0.3,
  toolTip: 'Can be cast after Intro Skill',
  groupName: 'Basic Attack 3-4',
  variantName: 'Cancel With Swap'
}

// ========== MA2 -> BA4 =======================================================================================================
const ciaccona_midair_2_BA_4_cancel_with_skill: Action = {
  name: 'Mid Air 2 -> Basic Attack 4 (skill cancel)',
  displayName: 'Mid Air 2 -> Basic Attack 4 (skill cancel)',
  category: 'Basics',
  castTime: 0.82,
  multiplier: (4 * 24.46 + 4 * 61.14) / 100,
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 4 * 0.38 + 4 * 0.94, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 4 * 1.2 + 4 * 3.0, share: 0 },
    { energyType: 'forte', amount: 1, share: 0 },
  ],
  energyCost: [],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Aero Erosion', stackChange: 1 }],
  damageModifiers: [
    {
      source: 'Ciaconna Ensemble Sylph',
      displayName: 'Ensemble Sylph',
      type: 'buff',
      ownerCharacter: 'Ciaccona',
      condition: always(),
      characterStats: { aeroBonusDMG: 0.24 },
      targetStrategy: 'all',
      durationStrategy: { type: 'permanent' },
      stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 },
    },
  ],
  sideEffects: [],
  castConditions: {
    startState: 'GROUND',
    endState: 'GROUND',
    requiresSwapIn: true
  },
  offtune: 4 * 0.12 + 4 * 0.3,
  toolTip: 'Can be cast if swapped in mid-air',
  groupName: 'MA2 -> BA4',
  variantName: 'Cancel With Skill'
}

const ciaccona_midair_2_BA_4_cancel_with_swap: Action = {
  name: 'Mid Air 2 -> Basic Attack 4 (swap cancel)',
  displayName: 'Mid Air 2 -> Basic Attack 4 (swap cancel)',
  category: 'Basics',
  castTime: 0.95,
  multiplier: (4 * 24.46 + 4 * 61.14) / 100,
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 4 * 0.38 + 4 * 0.94, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 4 * 1.2 + 4 * 3.0, share: 0 },
    { energyType: 'forte', amount: 1, share: 0 },
  ],
  energyCost: [],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Aero Erosion', stackChange: 1 }],
  damageModifiers: [
    {
      source: 'Ciaconna Ensemble Sylph',
      displayName: 'Ensemble Sylph',
      type: 'buff',
      ownerCharacter: 'Ciaccona',
      condition: always(),
      characterStats: { aeroBonusDMG: 0.24 },
      targetStrategy: 'all',
      durationStrategy: { type: 'permanent' },
      stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 },
    },
  ],
  sideEffects: [],
  castConditions: {
    startState: 'GROUND',
    swapOutState: 'GROUND', // TODO : Double Check
    endState: 'GROUND',
    requiresSwapIn: true,
    requiresSwapOut: true,
    persistenceTime: 100 // TODO : Persistence Time
  },
  offtune: 4 * 0.12 + 4 * 0.3,
  toolTip: 'Can be cast if swapped in mid-air',
  groupName: 'MA2 -> BA4',
  variantName: 'Cancel With Swap'
}

// ========== Resonance Skill ==================================================================================================
const ciaccona_skill: Action = {
  name: 'Resonance Skill',
  displayName: 'Harmonic Allegro',
  category: 'Skills',
  castTime: 0.65,
  multiplier: (4 * 40.39) / 100,
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['SKILL'],
  cooldown: 10,
  energyGenerated: [
    { energyType: 'energy', amount: 4 * 2.4, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 15, share: 0 },
  ],
  energyCost: [],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Aero Erosion', stackChange: 1 }],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'ANY',
    endState: 'PRESERVE',
  },
  offtune: 4 * 0.13,
  groupName: 'Resonance Skill',
  variantName: 'Default'
}

const ciaccona_skill_cancel_with_swap: Action = {
  name: 'Resonance Skill (swap cancel)',
  displayName: 'Harmonic Allegro (swap cancel)',
  category: 'Skills',
  castTime: 0.15,
  multiplier: (4 * 40.39) / 100,
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['SKILL'],
  cooldown: 10,
  energyGenerated: [
    { energyType: 'energy', amount: 4 * 2.4, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 15, share: 0 },
  ],
  energyCost: [],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Aero Erosion', stackChange: 1 }],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'ANY',
    swapOutState: 'PRESERVE',
    endState: 'PRESERVE',
    requiresSwapOut: true,
    persistenceTime: 100 // TODO : Persistence Time
  },
  offtune: 4 * 0.13,
  groupName: 'Resonance Skill',
  variantName: 'Cancel With Swap'
}

// ========== Liberation =======================================================================================================
const ciaccona_liberation: Action = {
  name: 'Liberation',
  displayName: 'Singers Triple Cadenza',
  category: 'Skills',
  castTime: 1.0, // TODO - test from CAST START to next character can act (cart E)
  multiplier: 1100.42 / 100,
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['LIBERATION'],
  cooldown: 20,
  energyGenerated: [
    { energyType: 'energy', amount: 0, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 20, share: 0 },
  ],
  energyCost: [{ energyType: 'energy', amount: 125 }],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  coordinatedAttacks: [ciaccona_singers_triple_cadenza_coordinated],
  castConditions: {
    startState: 'GROUND',
    endState: 'GROUND',
  },
  offtune: 4.8
}

// ========== Heavy Attack =====================================================================================================
const ciaccona_heavy: Action = {
  name: 'Heavy Attack',
  displayName: 'Quadruple Downbeat',
  category: 'Basics',
  castTime: 1.13,
  multiplier: (1.3 * (10 * 31.41 + 314.03)) / 100,
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['HEAVY'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 10 * 0.75 + 7.47, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 25, share: 0 },
  ],
  energyCost: [],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Aero Erosion', stackChange: 1 }],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'GROUND', // TODO : ANY ?
    endState: 'GROUND', // TODO : PRESERVE ?
  },
  offtune: 10 * 0.05 + 0.47,
  groupName: 'Heavy Attack',
  variantName: 'Default'
}

const ciaccona_heavy_cancel_with_swap: Action = {
  name: 'Heavy Attack (swap cancel)',
  displayName: 'Quadruple Downbeat (swap cancel)',
  category: 'Basics',
  castTime: 0.15,
  multiplier: (1.3 * (10 * 31.41 + 314.03)) / 100,
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['HEAVY'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 10 * 0.75 + 7.47, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 25, share: 0 },
  ],
  energyCost: [],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Aero Erosion', stackChange: 1 }],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'GROUND', // TODO : ANY ?
    swapOutState: 'PRESERVE', // TODO : Double Check
    endState: 'GROUND', // TODO : PRESERVE ?
    requiresSwapOut: true,
    persistenceTime: 100 // TODO : Persistence Time
  },
  offtune: 10 * 0.05 + 0.47,
  groupName: 'Heavy Attack',
  variantName: 'Cancel With Swap'
}

// ========== Intro & Outro ====================================================================================================
const ciaccona_intro: Action = {
  name: 'Intro Skill',
  displayName: 'Roaming with the Wind',
  category: 'Other',
  castTime: 0.95,
  multiplier: 189.11 / 100,
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['INTRO'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 10.0, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 10, share: 0 },
    { energyType: 'forte', amount: 1, share: 0 },
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'ANY',
    endState: 'GROUND',
  },
  offtune: 0.93
}

const ciaccona_outro: Action = {
  name: 'Outro Skill',
  displayName: 'Windcalling Tune',
  category: 'Other',
  castTime: 0,
  multiplier: 0 / 100,
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['OUTRO'],
  cooldown: 0,
  energyGenerated: [],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [
    {
      source: 'Ciaconna Outro Buff',
      displayName: 'Windcalling Tune',
      type: 'buff',
      ownerCharacter: 'Ciaccona',
      condition: always(),
      characterStats: { aeroErosionAmplifyDMG: 1.0 },
      targetStrategy: 'all',
      durationStrategy: { type: 'limited', timeDuration: 30 },
      stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 },
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
const ciaccona_wait_005: Action = {
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

const ciaccona_wait_for_swap: Action = {
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
const ciaccona_energy: Action = {
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

const ciaccona_concerto: Action = {
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

const ciaccona_forte: Action = {
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

export {
  // Basic Attack 3-4
  ciaccona_BA_3_4_cancel_with_skill,
  ciaccona_BA_3_4_cancel_with_swap,

  // Mid Air 2 -> Basic Attack 4
  ciaccona_midair_2_BA_4_cancel_with_skill,
  ciaccona_midair_2_BA_4_cancel_with_swap,

  // Resonance Skill
  ciaccona_skill,
  ciaccona_skill_cancel_with_swap,

  // Liberation
  ciaccona_liberation,

  // Heavy Attack
  ciaccona_heavy,
  ciaccona_heavy_cancel_with_swap,

  // Intro / Outro
  ciaccona_intro,
  ciaccona_outro,

  // Swaps
  ciaccona_wait_005,
  ciaccona_wait_for_swap,

  // Testing
  ciaccona_energy,
  ciaccona_concerto,
  ciaccona_forte
}
