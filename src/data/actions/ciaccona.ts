import type { Action } from '../../types/action'
import { always } from '../../utils/conditions/damageModifierConditions'
import { nightmareKelpieOutroTrigger } from '../sideEffects'

// TODO - cast times and cancel versions cast times

export const ciaccona_BA_3_4_cancel: Action = {
  // TODO : Always cancel
  name: 'Basic Attack 3-4',
  displayName: 'Basic Attack 3-4',
  category: 'Basics',
  castTime: 1.0, // TODO
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
  },
  offtune: 4 * 0.16 + 4 * 0.3,
  toolTip: 'Can be cast after Intro Skill',
}

export const ciaccona_midair_2_BA_4_cancel: Action = {
  // TODO : Always cancel
  name: 'Mid Air 1-2 -> Basic Attack 4',
  displayName: 'Mid Air 1-2 -> Basic Attack 4',
  category: 'Basics',
  castTime: 1.0, // TODO
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
  },
  offtune: 4 * 0.12 + 4 * 0.3,
  toolTip: 'Can be cast if swapped in after a plunge swap cancel attack',
}

export const ciaccona_midair_1_2_BA_4_cancel: Action = {
  // TODO : Always cancel
  name: 'Mid Air 1-2 -> Basic Attack 4',
  displayName: 'Mid Air 1-2 -> Basic Attack 4',
  category: 'Basics',
  castTime: 1.0, // TODO
  multiplier: (2 * 55.43 + 4 * 24.46 + 4 * 61.14) / 100,
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 2 * 0.85 + 4 * 0.38 + 4 * 0.94, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 2 * 2.72 + 4 * 1.2 + 4 * 3.0, share: 0 },
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
  },
  offtune: 2 * 0.27 + 4 * 0.12 + 4 * 0.3,
  toolTip: 'Can be cast if swapped in mid-air',
}

export const ciaccona_jump_midair_1_2_BA_4_cancel: Action = {
  // TODO : Always cancel
  name: 'Jump -> Mid Air 1-2 -> Basic Attack 4',
  displayName: 'Jump -> Mid Air 1-2 -> Basic Attack 4',
  category: 'Basics',
  castTime: 1.0, // TODO
  multiplier: (2 * 55.43 + 4 * 24.46 + 4 * 61.14) / 100,
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 2 * 0.85 + 4 * 0.38 + 4 * 0.94, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 2 * 2.72 + 4 * 1.2 + 4 * 3.0, share: 0 },
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
  },
  offtune: 2 * 0.27 + 4 * 0.12 + 4 * 0.3,
}

export const ciaccona_skill: Action = {
  // TODO : Create animation cancel version
  name: 'Resonance Skill',
  displayName: 'Harmonic Allegro',
  category: 'Skills',
  castTime: 1.0, // TODO
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
    endState: 'ANY', // TODO : technically preserves the previous state
  },
  offtune: 4 * 0.13,
}

export const ciaccona_liberation: Action = {
  name: 'Liberation',
  displayName: 'Singers Triple Cadenza',
  category: 'Skills',
  castTime: 1.0, // TODO
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
  coordinatedAttacks: [
    {
      // Singers Triple Cadenza: 20 coordinated hits, each 6.12% ATK, AERO LIBERATION
      // Ends immediately when Ciaccona swaps back in
      // TODO: confirm exact frequency and total duration from frame data
      name: 'Singers Triple Cadenza (Coordinated)',
      displayName: "Singers Triple Cadenza (Coordinated)",
      multiplier: 6.12 / 100,
      scaling: 'ATK',
      elements: ['AERO'],
      dmgTypes: ['LIBERATION'],
      frequency: 1.0, // TODO: frequency unknown
      duration: 20 * 0.5,       // 20 ticks * frequency = 10s; capped by swapRequired as well
      swapRequired: true,
      energyGenerated: [],
      statusModifications: [{ type: 'negativeStatus', targetName: 'Aero Erosion', stackChange: 1 }],
      offtune: 0.22,
    },
  ],
  castConditions: {
    startState: 'GROUND',
    endState: 'GROUND',
  },
  offtune: 4.8,
}

export const ciaccona_heavy: Action = {
  // TODO : Create animation cancel version
  name: 'Heavy Attack',
  displayName: 'Quadruple Downbeat',
  category: 'Basics',
  castTime: 1.0, // TODO
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
    startState: 'GROUND',
    endState: 'GROUND',
  },
  offtune: 10 * 0.05 + 0.47,
}

export const ciaccona_intro: Action = {
  name: 'Intro Skill',
  displayName: 'Roaming with the Wind',
  category: 'Other',
  castTime: 1.002, // TODO
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
  offtune: 0.93,
}

export const ciaccona_outro: Action = {
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
    },
    // 14 seconds: 10 % ATK bonus to incoming resonator
    {
      source: 'Static Mist Outro Buff',
      displayName: 'Static Mist Outro Buff',
      type: 'buff',
      ownerCharacter: 'Ciaccona',
      condition: always(),
      characterStats: { bonusATK: 0.1 },
      targetStrategy: 'nextSwap',
      durationStrategy: { type: 'limited', timeDuration: 14, numberOfSwaps: 1 }, // TODO : should this be 0 or 1 if I want it to only work on the incoming character (nextSwap) then disappear instantly if you swap away from the character
      stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 },
    },
  ],
  sideEffects: [nightmareKelpieOutroTrigger],
  castConditions: {
    startState: 'ANY',
    endState: 'ANY',
  },
  offtune: 0,
}

export const ciaccona_echo: Action = {
  name: 'Ciaccona Echo Skill',
  displayName: 'Nightmare: Kelpie',
  category: 'Other',
  castTime: 0,
  multiplier: 405 / 100,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['ECHO'],
  cooldown: 25,
  energyGenerated: [{ energyType: 'energy', amount: 2.81, share: 0.5, scalingStat: 'energyPercent' }],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'GROUND',
    endState: 'ANY',
  },
  offtune: 0,
}


export const ciaccona_energy: Action = {
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
  offtune: 0,
}

export const ciaccona_concerto: Action = {
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
  offtune: 0,
}

export const ciaccona_forte: Action = {
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
  offtune: 0,
}
