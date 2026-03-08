import type { Action } from '../../types/action'
import { always } from '../../utils/conditions/damageModifierConditions'

// ========== Resonance Skill 1 ================================================================================================
const roverAero_skill_1: Action = {
  name: 'Resonance Skill 1',
  displayName: 'Awakening Gale',
  category: 'Skills',
  castTime: 1.0,
  multiplier: (66.44 + 99.66) / 100,
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['SKILL'],
  cooldown: 3,
  energyGenerated: [
    { energyType: 'energy', amount: 2.0 + 3.0, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 10, share: 0 },
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'GROUND',
    endState: 'AIR',
  },
  offtune: 0.76,
  groupName: 'Resonance Skill 1',
  variantName: 'Default'
}

const roverAero_skill_1_cancel_with_swap: Action = {
  name: 'Resonance Skill 1 (swap cancel)',
  displayName: 'Awakening Gale (swap cancel)',
  category: 'Skills',
  castTime: 0.15,
  multiplier: (66.44 + 99.66) / 100,
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['SKILL'],
  cooldown: 3,
  energyGenerated: [
    { energyType: 'energy', amount: 2.0 + 3.0, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 10, share: 0 },
  ],
  energyCost: [],
  statusModifications: [],
    damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'GROUND',
    endState: 'GROUND',
  },
  offtune: 0.76,
  groupName: 'Resonance Skill 1',
  variantName: 'Cancel With Swap'
}

// ========== Resonance Skill 2 ================================================================================================
const roverAero_skill_2: Action = {
  name: 'Resonance Skill 2',
  displayName: 'Skyfall Severance',
  category: 'Skills',
  castTime: 0.84,
  multiplier: (3 * 23.37 + 105.15) / 100,
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['SKILL'],
  cooldown: 12,
  energyGenerated: [
    { energyType: 'energy', amount: 3 * 0.34 + 1.5, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 5, share: 0 },
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'AIR',
    endState: 'AIR',
  },
  offtune: 3 * 0.11 + 0.48,
  groupName: 'Resonance Skill 2',
  variantName: 'Default'
}

const roverAero_skill_2_cancel_with_swap: Action = {
  name: 'Resonance Skill 2 (swap cancel)',
  displayName: 'Skyfall Severance (swap cancel)',
  category: 'Skills',
  castTime: 0.19,
  multiplier: (3 * 23.37 + 105.15) / 100,
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['SKILL'],
  cooldown: 12,
  energyGenerated: [
    { energyType: 'energy', amount: 3 * 0.34 + 1.5, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 5, share: 0 },
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'AIR',
    endState: 'AIR',
  },
  offtune: 3 * 0.11 + 0.48,
  groupName: 'Resonance Skill 2',
  variantName: 'Cancel With Swap'
}

// ========== Resonance Skill 3 ================================================================================================
const roverAero_skill_3: Action = {
  name: 'Resonance Skill 3',
  displayName: 'Unbound Flow 1-2',
  category: 'Skills',
  castTime: 1.67,
  multiplier: (1.3 * (5 * 34.3 + 723.03)) / 100,
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['SKILL'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 5 * 2.0 + 20, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 40, share: 0 },
  ],
  energyCost: [{ energyType: 'forte', amount: 120 }],
  statusModifications: [],
  damageModifiers: [
    {
      source: 'Bloodpacts Pledge Unbound',
      displayName: 'Bloodpacts Pledge Unbound',
      type: 'buff',
      ownerCharacter: 'Rover',
      condition: always(),
      characterStats: { aeroAmplifyDMG: 0.26 },
      targetStrategy: 'all',
      durationStrategy: { type: 'limited', timeDuration: 30 },
      stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 },
    },
  ],
  sideEffects: [],
  castConditions: {
    startState: 'GROUND',
    endState: 'GROUND',
  },
  offtune: 5 * 0.6 + 2.83,
  groupName: 'Resonance Skill 3',
  variantName: 'Default'
}

const roverAero_skill_3_cancel_with_swap_1: Action = {
  name: 'Resonance Skill 3 (swap cancel 1)',
  displayName: 'Unbound Flow 1-2 (swap cancel 1)',
  category: 'Skills',
  castTime: 0.17,
  multiplier: (1.3 * (5 * 34.3 + 723.03)) / 100,
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['SKILL'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 5 * 2.0 + 20, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 40, share: 0 },
  ],
  energyCost: [{ energyType: 'forte', amount: 120 }],
  statusModifications: [],
  damageModifiers: [
    {
      source: 'Bloodpacts Pledge Unbound',
      displayName: 'Bloodpacts Pledge Unbound',
      type: 'buff',
      ownerCharacter: 'Rover',
      condition: always(),
      characterStats: { aeroAmplifyDMG: 0.26 },
      targetStrategy: 'all',
      durationStrategy: { type: 'limited', timeDuration: 30 },
      stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 },
    },
  ],
  sideEffects: [],
  castConditions: {
    startState: 'GROUND',
    endState: 'GROUND',
  },
  offtune: 5 * 0.6 + 2.83,
  groupName: 'Resonance Skill 3',
  variantName: 'Cancel With Swap 1'
}

const roverAero_skill_3_cancel_with_swap_2: Action = {
  name: 'Resonance Skill 3 (swap cancel 2)',
  displayName: 'Unbound Flow 1-2 (swap cancel 2)',
  category: 'Skills',
  castTime: 1.33,
  multiplier: (1.3 * (5 * 34.3 + 723.03)) / 100,
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['SKILL'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 5 * 2.0 + 20, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 40, share: 0 },
  ],
  energyCost: [{ energyType: 'forte', amount: 120 }],
  statusModifications: [],
  damageModifiers: [
    {
      source: 'Bloodpacts Pledge Unbound',
      displayName: 'Bloodpacts Pledge Unbound',
      type: 'buff',
      ownerCharacter: 'Rover',
      condition: always(),
      characterStats: { aeroAmplifyDMG: 0.26 },
      targetStrategy: 'all',
      durationStrategy: { type: 'limited', timeDuration: 30 },
      stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 },
    },
  ],
  sideEffects: [],
  castConditions: {
    startState: 'GROUND',
    endState: 'GROUND',
  },
  offtune: 5 * 0.6 + 2.83,
  groupName: 'Resonance Skill 3',
  variantName: 'Cancel With Swap 2'
}

// ========== Liberation =======================================================================================================
const roverAero_liberation: Action = {
  name: 'Liberation',
  displayName: 'Omega Storm',
  category: 'Skills',
  castTime: 0.08,
  multiplier: (1.2 * 536.79) / 100,
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['LIBERATION'],
  cooldown: 24,
  energyGenerated: [
    { energyType: 'energy', amount: 0, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 20, share: 0 },
    { energyType: 'forte', amount: 25, share: 0 },
  ],
  energyCost: [{ energyType: 'energy', amount: 150 }],
  statusModifications: [],
  damageModifiers: [
    {
      source: 'Bloodpacts Pledge Heal',
      displayName: 'Bloodpacts Pledge Heal',
      type: 'buff',
      ownerCharacter: 'Rover',
      condition: always(),
      characterStats: { skillBonusDMG: 0.26 },
      targetStrategy: 'self',
      durationStrategy: { type: 'limited', timeDuration: 12 },
      stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 },
    },
  ],
  sideEffects: [],
  castConditions: {
    startState: 'ANY',
    endState: 'GROUND',
  },
  offtune: 4.8
}

// ========== Mid Air 1-2 ======================================================================================================
const roverAero_midair_1_2: Action = {
  name: 'Mid Air 1-2',
  displayName: 'Cloudburst Dance 1-2',
  category: 'Skills',
  castTime: 0.8,
  multiplier: (128.8 + 141.47) / 100,
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['SKILL'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 0.92 + 1.01, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 2.93 + 3.22, share: 0 },
    { energyType: 'forte', amount: 50, share: 0 },
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [
    {
      source: 'Bloodpacts Pledge Heal',
      displayName: 'Bloodpacts Pledge Heal',
      type: 'buff',
      ownerCharacter: 'Rover',
      condition: always(),
      characterStats: { skillBonusDMG: 0.26 },
      targetStrategy: 'self',
      durationStrategy: { type: 'limited', timeDuration: 12 },
      stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 },
    },
    {
      source: 'Rover S4',
      displayName: 'Rover S4',
      type: 'buff',
      ownerCharacter: 'Rover',
      condition: always(),
      characterStats: { skillBonusDMG: 0.15 },
      targetStrategy: 'self',
      durationStrategy: { type: 'limited', timeDuration: 6 },
      stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 },
    },
  ],
  sideEffects: [],
  castConditions: {
    startState: 'AIR',
    previousActions: [roverAero_skill_1],
    endState: 'AIR',
  },
  offtune: 0.29 + 0.32,
  groupName: 'Mid Air 1-2',
  variantName: 'Default'
}

const roverAero_midair_1_2_cancel_with_swap: Action = {
  name: 'Mid Air 1-2 (swap cancel)',
  displayName: 'Cloudburst Dance 1-2 (swap cancel)',
  category: 'Skills',
  castTime: 0.55,
  multiplier: (128.8 + 141.47) / 100,
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['SKILL'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 0.92 + 1.01, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 2.93 + 3.22, share: 0 },
    { energyType: 'forte', amount: 50, share: 0 },
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [
    {
      source: 'Bloodpacts Pledge Heal',
      displayName: 'Bloodpacts Pledge Heal',
      type: 'buff',
      ownerCharacter: 'Rover',
      condition: always(),
      characterStats: { skillBonusDMG: 0.26 },
      targetStrategy: 'self',
      durationStrategy: { type: 'limited', timeDuration: 12 },
      stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 },
    },
    {
      source: 'Rover S4',
      displayName: 'Rover S4',
      type: 'buff',
      ownerCharacter: 'Rover',
      condition: always(),
      characterStats: { skillBonusDMG: 0.15 },
      targetStrategy: 'self',
      durationStrategy: { type: 'limited', timeDuration: 6 },
      stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 },
    },
  ],
  sideEffects: [],
  castConditions: {
    startState: 'AIR',
    previousActions: [roverAero_skill_1],
    endState: 'AIR',
  },
  offtune: 0.29 + 0.32,
  groupName: 'Mid Air 1-2',
  variantName: 'Cancel With Swap'
}

// ========== Plunge ===========================================================================================================
const roverAero_plunge: Action = {
  name: 'Plunge',
  displayName: 'Plunge',
  category: 'Basics',
  castTime: 0.83,
  multiplier: 140.76 / 100,
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 0.52, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 9.6, share: 0 },
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'AIR',
    endState: 'GROUND',
  },
  offtune: 0.96,
  groupName: 'Plunge',
  variantName: 'Default'
}

const roverAero_plunge_cancel_with_swap: Action = {
  name: 'Plunge (swap cancel)',
  displayName: 'Plunge (swap cancel)',
  category: 'Basics',
  castTime: 0.18,
  multiplier: 140.76 / 100,
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 0.52, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 9.6, share: 0 },
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'AIR',
    endState: 'AIR',
  },
  offtune: 0.96,
  groupName: 'Plunge',
  variantName: 'Cancel With Swap'
}

// ========== Basic Attack 4 ===================================================================================================
const roverAero_BA_4: Action = {
  name: 'Basic Attack 4',
  displayName: 'Basic Attack 4',
  category: 'Basics',
  castTime: 0.43,
  multiplier: 76.72 / 100,
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 1.64, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 5.24, share: 0 },
    { energyType: 'forte', amount: 10, share: 0 },
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'GROUND',
    previousActions: [roverAero_plunge],
    endState: 'GROUND',
  },
  offtune: 0.52,
  groupName: 'Basic Attack 4',
  variantName: 'Default'
}

const roverAero_BA_4_cancel_with_swap: Action = {
  name: 'Basic Attack 4 (swap cancel)',
  displayName: 'Basic Attack 4 (swap cancel)',
  category: 'Basics',
  castTime: 0.2,
  multiplier: 76.72 / 100,
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 1.64, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 5.24, share: 0 },
    { energyType: 'forte', amount: 10, share: 0 },
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'GROUND',
    previousActions: [roverAero_plunge],
    endState: 'GROUND',
  },
  offtune: 0.52,
  groupName: 'Basic Attack 4',
  variantName: 'Cancel With Swap'
}

// ========== Intro & Outro ====================================================================================================
const roverAero_intro: Action = {
  name: 'Intro Skill',
  displayName: 'Relentless Squall',
  category: 'Other',
  castTime: 1.42,
  multiplier: (79.53 + 119.29) / 100,
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['INTRO'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 4.0 + 6.0, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 10, share: 0 },
    { energyType: 'forte', amount: 20, share: 0 },
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [
    {
      source: 'Rover Intro Buff',
      displayName: 'Rover Intro Buff',
      type: 'buff',
      ownerCharacter: 'Rover',
      condition: always(),
      characterStats: { bonusATK: 0.2 },
      targetStrategy: 'self',
      durationStrategy: { type: 'limited', timeDuration: 10 },
      stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 },
    },
  ],
  sideEffects: [],
  castConditions: {
    startState: 'ANY',
    endState: 'AIR',
  },
  offtune: 0.46 + 0.69,
}

const roverAero_outro: Action = {
  name: 'Outro Skill',
  displayName: 'Storms Echo',
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
      source: 'Rover Outro Buff',
      displayName: 'Aeolian Realm',
      type: 'buff',
      ownerCharacter: 'Rover',
      condition: always(),
      negativeStatusEffects: [{ targetStatus: 'Aero Erosion', property: 'maxStacks', value: 3 }],
      targetStrategy: 'all',
      durationStrategy: { type: 'limited', timeDuration: 40 },
      stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 },
    },
  ],
  sideEffects: [],
  castConditions: {
    startState: 'ANY',
    endState: 'ANY',
  },
  offtune: 0
}

// ========== Echo Skill =======================================================================================================
const roverAero_echo: Action = {
  name: 'Rover Echo Skill',
  displayName: 'Reminence: Fleurdelys',
  category: 'Other',
  castTime: 0,
  multiplier: (8 * 27.36 + 136.8) / 100,
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['ECHO'],
  cooldown: 20,
  energyGenerated: [{ energyType: 'energy', amount: 8 * 0.38 + 1.9, share: 0.5, scalingStat: 'energyPercent' }],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'ANY',
    endState: 'ANY',
  },
  offtune: 0
}

// ========== Energies =========================================================================================================
const roverAero_energy: Action = {
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
    endState: 'ANY',
  },
  offtune: 0
}

const roverAero_concerto: Action = {
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
    endState: 'ANY',
  },
  offtune: 0
}

const roverAero_forte: Action = {
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
    endState: 'ANY',
  },
  offtune: 0
}

export {
  roverAero_skill_1,
  roverAero_skill_1_cancel_with_swap,
  roverAero_skill_2,
  roverAero_skill_2_cancel_with_swap,
  roverAero_skill_3,
  roverAero_skill_3_cancel_with_swap_1,
  roverAero_skill_3_cancel_with_swap_2,
  roverAero_liberation,
  roverAero_midair_1_2,
  roverAero_midair_1_2_cancel_with_swap,
  roverAero_plunge,
  roverAero_plunge_cancel_with_swap,
  roverAero_BA_4,
  roverAero_BA_4_cancel_with_swap,
  roverAero_intro,
  roverAero_outro,
  roverAero_echo,
  roverAero_energy,
  roverAero_concerto,
  roverAero_forte
}
