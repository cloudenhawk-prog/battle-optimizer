import type { Action } from '../../types/action'
import { always } from '../../utils/conditions/damageModifierConditions'
import { nightmareKelpieOutroTrigger } from '../sideEffects'

// TODO - cast times and cancel versions cast times

export const ciaccona_BA_3_4_cancel: Action = { // TODO : Always cancel
  name: 'Basic Attack 3-4',
  displayName: 'Basic Attack 3-4',
  castTime: 1.00, // TODO
  multiplier: (4 * 33.02 + 4 * 61.14) / 100,
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 4 * 0.51 + 4 * 0.94, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 4 * 1.62 + 4 * 3.00, share: 0 },
    { energyType: 'forte', amount: 1, share: 0 }
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
      stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 }
    }
  ],
  sideEffects: [],
  castConditions: {
    startState: 'GROUND',
    endState: 'GROUND'
  },
  offtune: 4 * 0.16 + 4 * 0.30,
  toolTip: 'Can be cast after Intro Skill'
}

export const ciaccona_midair_2_BA_4_cancel: Action = { // TODO : Always cancel
  name: 'Mid Air 1-2 -> Basic Attack 4',
  displayName: 'Mid Air 1-2 -> Basic Attack 4',
  castTime: 1.00, // TODO
  multiplier: ((4 * 24.46) + (4 * 61.14)) / 100,
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: (4 * 0.38) + (4 * 0.94), share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: (4 * 1.20) + (4 * 3.00), share: 0 },
    { energyType: 'forte', amount: 1, share: 0 }
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
      stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 }
    }
  ],
  sideEffects: [],
  castConditions: {
    startState: 'GROUND',
    endState: 'GROUND'
  },
  offtune: (4 * 0.12) + (4 * 0.30),
  toolTip: 'Can be cast if swapped in after a plunge swap cancel attack'
}

export const ciaccona_midair_1_2_BA_4_cancel: Action = { // TODO : Always cancel
  name: 'Mid Air 1-2 -> Basic Attack 4',
  displayName: 'Mid Air 1-2 -> Basic Attack 4',
  castTime: 1.00, // TODO
  multiplier: ((2 * 55.43) + (4 * 24.46) + (4 * 61.14)) / 100,
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: (2 * 0.85) + (4 * 0.38) + (4 * 0.94), share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: (2 * 2.72) + (4 * 1.20) + (4 * 3.00), share: 0 },
    { energyType: 'forte', amount: 1, share: 0 }
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
      stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 }
    }
  ],
  sideEffects: [],
  castConditions: {
    startState: 'GROUND',
    endState: 'GROUND'
  },
  offtune: (2 * 0.27) + (4 * 0.12) + (4 * 0.30),
  toolTip: 'Can be cast if swapped in mid-air'
}

export const ciaccona_jump_midair_1_2_BA_4_cancel: Action = { // TODO : Always cancel
  name: 'Jump -> Mid Air 1-2 -> Basic Attack 4',
  displayName: 'Jump -> Mid Air 1-2 -> Basic Attack 4',
  castTime: 1.00, // TODO
  multiplier: ((2 * 55.43) + (4 * 24.46) + (4 * 61.14)) / 100,
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: (2 * 0.85) + (4 * 0.38) + (4 * 0.94), share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: (2 * 2.72) + (4 * 1.20) + (4 * 3.00), share: 0 },
    { energyType: 'forte', amount: 1, share: 0 }
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
      stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 }
    }
  ],
  sideEffects: [],
  castConditions: {
    startState: 'GROUND',
    endState: 'GROUND'
  },
  offtune: (2 * 0.27) + (4 * 0.12) + (4 * 0.30),
}

export const ciaccona_skill: Action = { // TODO : Create animation cancel version
  name: 'Resonance Skill',
  displayName: 'Harmonic Allegro',
  castTime: 1.00, // TODO
  multiplier: (4 * 	40.39) / 100,
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['SKILL'],
  cooldown: 10,
  energyGenerated: [
    { energyType: 'energy', amount: 4 * 2.40, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 15, share: 0 },
  ],
  energyCost: [],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Aero Erosion', stackChange: 1 }],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'ANY',
    endState: 'ANY' // TODO : technically preserves the previous state
  },
  offtune: 4 * 0.13
}

export const ciaccona_liberation: Action = {
  name: 'Liberation',
  displayName: 'Singers Triple Cadenza',
  castTime: 1.00, // TODO
  multiplier: (1100.42) / 100,
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
  sideEffects: [
    // TODO : Need a way to dispatch:
        // Coordinated Attacks (similar to a dot effect, but owned by a character - they do attack at certain intervals)
        // Off-field actions like Phrolova/Ciaconna liberation (ends when swapping back to the character) (should we treat these as coordinated attacks too?)
        // Use boolean to determine if the effect ends when swapping back to the character or not
        // Use some kind of condition function to allow dynamic damage dealt (for example when certain conditions are true, deals more damage or whatever), but can also be static
        // Should show up on the timeline

    // 6.12%*20 (20 hits doing 6.12 % each and applying 1 stack of aero erosion) (20 times 0.22 offtune) (uncertain damage frequency/duration, might apply aero buff meanwhile too)
  ],
  castConditions: {
    startState: 'GROUND',
    endState: 'GROUND'
  },
  offtune: 4.80
}

export const ciaccona_heavy: Action = { // TODO : Create animation cancel version
  name: 'Heavy Attack',
  displayName: 'Quadruple Downbeat',
  castTime: 1.00, // TODO
  multiplier: 1.30 * (10 * 31.41 + 314.03) / 100,
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
    endState: 'GROUND'
  },
  offtune: 10 * 0.05 + 0.47
}

export const ciaccona_intro: Action = {
  name: 'Intro Skill',
  displayName: 'Roaming with the Wind',
  castTime: 1.002, // TODO
  multiplier: (189.11) / 100,
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['INTRO'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 10.00, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 10, share: 0 },
    { energyType: 'forte', amount: 1, share: 0 }
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'ANY',
    endState: 'GROUND'
  },
  offtune: 0.93
}

export const ciaccona_outro: Action = {
  name: 'Outro Skill',
  displayName: 'Windcalling Tune',
  castTime: 0,
  multiplier: (0) / 100,
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
      characterStats: { aeroErosionAmplifyDMG: 1.00 },
      targetStrategy: 'all',
      durationStrategy: { type: 'limited', timeDuration: 30 },
      stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 }
    },
    // 14 seconds: 10 % ATK bonus to incoming resonator
    {
      source: 'Static Mist Outro Buff',
      displayName: 'Static Mist Outro Buff',
      type: 'buff',
      ownerCharacter: 'Ciaccona',
      condition: always(),
      characterStats: { bonusATK: 0.10 },
      targetStrategy: 'nextSwap',
      durationStrategy: { type: 'limited', timeDuration: 14, numberOfSwaps: 1 }, // TODO : should this be 0 or 1 if I want it to only work on the incoming character (nextSwap) then disappear instantly if you swap away from the character
      stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 }
    },
  ],
  sideEffects: [nightmareKelpieOutroTrigger],
  castConditions: {
    startState: 'ANY',
    endState: 'ANY'
  },
  offtune: 0
}

export const ciaccona_echo: Action = {
  name: 'Ciaccona Echo Skill',
  displayName: 'Nightmare: Kelpie',
  castTime: 0,
  multiplier: (405) / 100,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['ECHO'],
  cooldown: 25,
  energyGenerated: [
    { energyType: 'energy', amount: 2.81, share: 0.5, scalingStat: 'energyPercent' }
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'GROUND',
    endState: 'ANY'
  },
  offtune: 0
}

// TODO - energies up