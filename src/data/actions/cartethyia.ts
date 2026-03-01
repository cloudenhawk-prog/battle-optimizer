import type { Action } from '../../types/action'
import { always, stacksOfCap } from '../../utils/conditions/damageModifierConditions'
import { aeroErosionExplosion } from '../sideEffects'

export const cartethyia_BA_1_4: Action = {
  name: 'Basic Attack 1-4',
  displayName: 'Basic Attack 1-4',
  castTime: 3.2,
  multiplier: 1.5 * (4.78 + (2 * 3.94 + 5.25) + (4 * 4.28) + (3 * 2.52 + 7.54)) / 100, // CHECK SEQUENCE
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 0.70 + (2 * 0.58 + 0.77) + (4 * 0.63) + (3 * 0.37 + 1.11), share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 0.98 + (2 * 0.81 + 1.08) + (4 * 0.88) + (3 * 0.52 + 1.55), share: 0 },
    { energyType: 'forte', amount: 1, share: 0 },
  ],
  energyCost: [],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Aero Erosion', stackChange: 1 }],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'GROUND',
    endState: 'GROUND'
  },
  offtune: 0.22 + (2 * 0.18 + 0.25) + (4 * 0.20) + (3 * 0.12 + 0.35)
}

export const cartethyia_BA_2_4: Action = {
  name: 'Basic Attack 2-4',
  displayName: 'Basic Attack 2-4',
  castTime: 2.48,
  multiplier: 1.5 * ((2 * 3.94 + 5.25) + (4 * 4.28) + (3 * 2.52 + 7.54)) / 100, // CHECK SEQUENCE
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: (2 * 0.58 + 0.77) + (4 * 0.63) + (3 * 0.37 + 1.11), share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: (2 * 0.81 + 1.08) + (4 * 0.88) + (3 * 0.52 + 1.55), share: 0 },
    { energyType: 'forte', amount: 1, share: 0 },
  ],
  energyCost: [],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Aero Erosion', stackChange: 1 }],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'GROUND',
    endState: 'GROUND'
  },
  offtune: (2 * 0.18 + 0.25) + (4 * 0.20) + (3 * 0.12 + 0.35),
  toolTip:'TODO'
}

export const cartethyia_heavy: Action = {
  name: 'Heavy Attack',
  displayName:'Heavy Attack',
  castTime: 1,
  multiplier: 1.5 * (3 * 2.08 + 6.24) / 100, // CHECK SEQUENCE
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 3 * 0.42 + 1.25, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 3 * 0.59 + 1.75, share: 0 },
    { energyType: 'forte', amount: 1, share: 0 },
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'GROUND',
    endState: 'GROUND'
  },
  offtune: 3 * 0.13 + 0.40
}

export const cartethyia_plunge_1: Action = {
  name: 'Plunge Attack (0-1 swords)',
  displayName: 'Plunge Attack 1',
  castTime: 1,
  multiplier: 3 * (5.65) / 100,  // CHECK SEQUENCE
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['BASIC', 'NEGATIVE_STATUS'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 1.33, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 1.86, share: 0 }
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'AIR',
    endState: 'GROUND'
  },
  offtune: 0.42,
  toolTip: 'TODO'
}

export const cartethyia_lunge_2: Action = {
  name: 'Plunge Attack (2 swords)',
  displayName: 'Plunge Attack 2',
  castTime: 1,
  multiplier: 3 * (3 * 3.3) / 100, // CHECK SEQUENCE
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['BASIC', 'NEGATIVE_STATUS'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 3 * 0.45, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 3 * 0.62, share: 0 }
  ],
  energyCost: [{ energyType: 'forte', amount: 2 }],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'AIR',
    endState: 'GROUND'
  },
  offtune: 3 * 0.14,
  toolTip: 'TODO'
}

export const cartethyiaPlunge_3: Action = {
  name: 'Plunge Attack (3 swords)',
  displayName: 'Plunge Attack 3',
  castTime: 1,
  multiplier: 3 * (3 * 11.29) / 100,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['BASIC', 'NEGATIVE_STATUS'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 3 * 0.45, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 3 * 0.62, share: 0 }
  ],
  energyCost: [{ energyType: 'forte', amount: 3 }],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'AIR',
    endState: 'GROUND'
  },
  offtune: 3 * 0.14,
  toolTip: 'TODO'
}

// TODO - plunge swords lower the cooldown of this skill
export const cartethyia_skill: Action = {
  name: 'Resonance Skill',
  displayName: 'Sword to Bear Their Names',
  castTime: 1,
  multiplier: (3 * 6.89 + 8.86) / 100, // CHECK SEQUENCE???
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 14,
  energyGenerated: [
    { energyType: 'energy', amount: 3 * 3.8 + 4.88, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 10, share: 0 },
    { energyType: 'forte', amount: 1, share: 0 }
  ],
  energyCost: [],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Aero Erosion', stackChange: 2 }],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'ANY',
    endState: 'AIR'
  },
  offtune: 3 * 0.17 + 0.22
}

// TODO : could technically add action: cartehyia_avatar & fleurdelys_avatar (can only be cast during mandate, has a cast time)
export const cartethyia_transform: Action = {
  name: 'Flerudelys Form',
  displayName: 'A Knights Heartfelt Prayers',
  castTime: 0.16,
  multiplier: 0,
  scaling: 'HP',
  elements: [''],
  dmgTypes: [''],
  cooldown: 25,
  energyGenerated: [
    { energyType: 'energy', amount: 0, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 20, share: 0 },
  ],
  energyCost: [{ energyType: 'energy', amount: 125 }],
  statusModifications: [],
  damageModifiers: [
    {
      // TODO : Mandate also does: Basic 5 Fleurdelys, Mid-air 2, Enhanced Heavy, Resonance 2 apply 99 stacks of aero erosion during this time
      // TODO : Mandate also does: Lowers dmg intervals between Aero Erosion by 50 % (TODO : Test if it works when you swap away from her)
      source: 'Cartethyia',
      displayName: 'Mandate',
      type: 'buff',
      ownerCharacter: 'Cartethyia',
      characterStats: { aeroErosionAmplifyDMG: 0.5 },
      condition: always(),
      targetStrategy: 'self', // TODO : Update here if it works when swapped away - Do we need a type for things that also affect negative statuses?
      durationStrategy: { type: 'limited', timeDuration: 12 },
      stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 },
    },
  ],
  sideEffects: [],
  castConditions: {
    startState: 'ANY',
    endState: 'ANY' // TODO : transform technically this preserve the previous state, it doesnt actually allow any following action
  },
  offtune: 0.00
}

export const fleurdelys_BA_1_5: Action = {
  name: 'Basic 1-5 (Fleurdelys)',
  displayName: 'Basic 1-5',
  castTime: 3.4,
  multiplier: (6.49 + (3.63 + 3 * 1.82) + (3 * 2.13 + 4.26) + (5 * 2.74) + (7.2 + 28.8)) / 100,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 0.75 + (0.77 + 3 * 0.39) + (3 * 0.45 + 0.9) + (5 * 0.45) + (0.4 + 1.59), share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 1.05 + (1.07 + 3 * 0.54) + (3 * 0.63 + 1.26) + (5 * 0.63) + (0.56 + 2.22), share: 0 },
    { energyType: 'conviction', amount: 45, share: 0 } // TODO : Uncertain Amount
  ],
  energyCost: [],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Aero Erosion', stackChange: 2 }],
  damageModifiers: [],
  sideEffects: [aeroErosionExplosion],
  castConditions: {
    startState: 'GROUND',
    endState: 'GROUND'
  },
  offtune: 0.24 + (0.24 + 3 * 0.12) + (3 * 	0.14 + 1.26) + (5 * 0.14) + (0.13 + 0.51)
}

export const fleurdelys_BA_3_5: Action = {
  name: 'Basic 3-5 (Fleurdelys)',
  displayName: 'Basic 3-5',
  castTime: 2.67,
  multiplier: ((3 * 2.13 + 4.26) + (5 * 2.74) + (7.2 + 28.8)) / 100,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: (3 * 0.45 + 0.9) + (5 * 0.45) + (0.4 + 1.59), share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: (3 * 0.63 + 1.26) + (5 * 0.63) + (0.56 + 2.22), share: 0 },
    { energyType: 'conviction', amount: 36.67, share: 0 }
  ],
  energyCost: [],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Aero Erosion', stackChange: 2 }],
  damageModifiers: [],
  sideEffects: [aeroErosionExplosion],
  castConditions: {
    startState: 'GROUND',
    endState: 'GROUND'
  },
  offtune: (3 * 	0.14 + 1.26) + (5 * 0.14) + (0.13 + 0.51),
  toolTip: 'TODO'
}

export const fleurdelys_heavy_1: Action = {
  name: 'Heavy Attack (Fleurdelys)',
  displayName: 'Heavy Attack 1',
  castTime: 0.65,
  multiplier: (4.28 + 9.97) / 100,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 0.53 + 1.23, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 0.74 + 1.72, share: 0 },
    { energyType: 'conviction', amount: 10, share: 0 }, // TODO : Uncertain amount
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'GROUND',
    endState: 'GROUND'
  },
  offtune: 0.17 + 0.39
}

export const fleurdelys_heavy_2: Action = {
  name: 'Enhanced Heavy Attack (Fleurdelys)',
  displayName: 'Heavy Attack 2',
  castTime: 0.73,
  multiplier: (2 * 7.78 + 3.89) / 100,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 2 * 0.96 + 0.48, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 2 * 1.35 + 0.68, share: 0 },
    { energyType: 'conviction', amount: 13.33, share: 0 }, // TODO : Uncertain Amount
  ],
  energyCost: [],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Aero Erosion', stackChange: 2 }],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'GROUND',
    endState: 'GROUND'
  },
  offtune: 3 * 0.31 + 0.15
}

export const fleurdelys_midair_1_3: Action = {
  name: 'Mid-air Attack 1-3 (Fleurdelys)',
  displayName: 'Mid-air Attack 1-3',
  castTime: 2.47,
  multiplier: ((2 * 2.99 + 3.08) + (2 * 7.39 + 14.77) + (2.2)) / 100,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: (2 * 0.66 + 0.68) + (2 * 0.52 + 1.03) + (0.48), share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: (2 * 0.93 + 0.95) + (2 * 0.52 + 1.44) + (0.67), share: 0 },
    { energyType: 'conviction', amount: 25, share: 0 } // TODO : Uncertain Amount
  ],
  energyCost: [],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Aero Erosion', stackChange: 2 }],
  damageModifiers: [],
  sideEffects: [aeroErosionExplosion],
  castConditions: {
    startState: 'AIR',
    endState: 'GROUND'
  },
  offtune: (2 * 0.21 + 0.22) + (2 * 0.16 + 0.33) + (0.15)
}

export const fleurdelys_midair_1_2: Action = {
  name: 'Mid-air Attack 1-2 (Fleurdelys)',
  displayName: 'Mid-air Attack 1-2',
  castTime: 1.63,
  multiplier: ((2 * 2.99 + 3.08) + (2 * 7.39 + 14.77)) / 100,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: (2 * 0.66 + 0.68) + (2 * 0.52 + 1.03), share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: (2 * 0.93 + 0.95) + (2 * 0.52 + 1.44), share: 0 },
    { energyType: 'conviction', amount: 20, share: 0 }
  ],
  energyCost: [],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Aero Erosion', stackChange: 2 }],
  damageModifiers: [],
  sideEffects: [aeroErosionExplosion],
  castConditions: {
    startState: 'AIR',
    endState: 'AIR'
  },
  offtune: (2 * 0.21 + 0.22) + (2 * 0.16 + 0.33)
}

export const fleurdelys_skill_1: Action = {
  name: 'Resonance Skill 1 (Fleurdelys)',
  displayName: 'Sword to Answer Waves Call',
  castTime: 0.9,
  multiplier: (4 * 1.86 + 17.36) / 100,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['SKILL'],
  cooldown: 14,
  energyGenerated: [
    { energyType: 'energy', amount: 4 * 0.18 + 1.61, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 10, share: 0 },
    { energyType: 'conviction', amount: 13.34, share: 0 },
  ],
  energyCost: [],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Aero Erosion', stackChange: 2 }],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'ANY',
    endState: 'AIR'
  },
  offtune: 4 * 0.06 + 0.51
}

export const fleurdelys_skill_2: Action = {
  name: 'Resonance Skill 2 (Fleurdelys)',
  displayName: 'May Tempest Break the Tides',
  castTime: 1.53,
  multiplier: (2 * 1.86 + 3 * 7.03) / 100,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['SKILL'],
  cooldown: 14,
  energyGenerated: [
    { energyType: 'energy', amount: (2 * 0.66 + 3 * 2.50), share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 10, share: 0 },
    { energyType: 'conviction', amount: 26.67, share: 0 },
  ],
  energyCost: [],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Aero Erosion', stackChange: 2 }],
  damageModifiers: [],
  sideEffects: [aeroErosionExplosion],
  castConditions: {
    startState: 'ANY',
    endState: 'GROUND'
  },
  offtune: 2 * 0.06 + 3 * 0.21
}

export const fleurdelys_liberation: Action = {
  name: 'Liberation (Fleurdelys)',
  displayName: 'Blade of Howling Squall',
  castTime: 0.03,
  multiplier: 2 * (7 * 13.12) / 100, // CHECK SEQUENCE
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['LIBERATION'],
  cooldown: 25,
  energyGenerated: [
    { energyType: 'energy', amount: 0, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 20, share: 0 },
  ],
  energyCost: [{ energyType: 'conviction', amount: 120 }],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Aero Erosion', stackChange: -100 } ], // TODO : check if resolver can handle this in snapshots + timeline
  damageModifiers: [
    {
      source: 'Liberation Stacks',
      displayName: 'Liberation Passive',
      type: 'buff',
      ownerCharacter: 'Cartethyia',
      condition: stacksOfCap('Aero Erosion'),
      characterStats: { liberationTotalMultiplierDMG: 0.2 },
      targetStrategy: 'self',
      durationStrategy: { type: 'permanent' },
      stackingStrategy: { maxStacks: 1, resetTimerOnApplication: false, stacksRemovedEachTime: 1 },
    },
  ],
  sideEffects: [],
  castConditions: {
    startState: 'ANY',
    endState: 'GROUND'
  },
  offtune: 7 * 2.40
}

// TODO : need fleurdelys intro/outro - and logic in resolver to automatically determine which to use
export const cartethyia_intro: Action = {
  name: 'Intro',
  displayName: 'Sword to Mark Tides Trace',
  castTime: 0.92,
  multiplier: 1.5 * (3 * 2.08 + 6.24) / 100, // CHEKC SEQUENCE
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['INTRO'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 3 * 1.67 +	5.00, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 10, share: 0 },
    { energyType: 'forte', amount: 1, share: 0 },
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'ANY',
    endState: 'GROUND'
  },
  offtune: 3 * 0.12 + 0.35
}

// TODO : Aero DMG dealt by ACTIVE resonators in the team OTHER THAN CARTETHYIA/FLEURDELYS to targets WITH negative statuses is AMPLIFIED with 17.5 % for 20 seconds
export const cartethyia_outro: Action = {
  name: 'Outro',
  displayName: 'Winds Divine Blessing',
  castTime: 0,
  multiplier: 0,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['OUTRO'],
  cooldown: 0,
  energyGenerated: [],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'ANY',
    endState: 'ANY'
  },
  offtune: 0
}

export const cartethyia_energy: Action = {
  name: 'Energy Up',
  displayName: 'Energy Up',
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
    endState: 'ANY'
  },
  offtune: 0
}

export const cartethyia_concerto: Action = {
  name: 'Concerto Up',
  displayName: 'Concerto Up',
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
    endState: 'ANY'
  },
  offtune: 0
}

export const cartethyia_forte: Action = {
  name: 'Forte Up',
  displayName: 'Forte Up',
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
    endState: 'ANY'
  },
  offtune: 0
}

export const cartethyia_conviction: Action = {
  name: 'Conviction Up',
  displayName: 'conviction Up',
  castTime: 0,
  multiplier: 0,
  scaling: 'HP',
  elements: [''],
  dmgTypes: [''],
  cooldown: 0,
  energyGenerated: [{ energyType: 'conviction', amount: 1000, share: 0 }],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'ANY',
    endState: 'ANY'
  },
  offtune: 0
}

// Echo Skill