import type { Action } from '../types/action'
import { aeroErosionExplosion } from './sideEffects'
import { stacksOfCap } from '../utils/conditions/damageModifierConditions'

// ========== Mage Actions =====================================================================================================

export const fireball: Action = {
  name: 'Fireball',
  castTime: 2,
  multiplier: 0.8,
  scaling: 'ATK',
  elements: ['FUSION'],
  dmgTypes: ['SKILL'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 50, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 10, share: 0 },
    { energyType: 'forte', amount: 10, share: 0 },
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
}

export const iceSpike: Action = {
  name: 'Ice Spike',
  castTime: 1.5,
  multiplier: 1.2,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['SKILL'],
  cooldown: 5,
  energyGenerated: [
    { energyType: 'energy', amount: 30, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 20, share: 0 },
    { energyType: 'forte', amount: 30, share: 0 },
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
}

export const liberatingLightning: Action = {
  name: 'Liberating Lightning',
  castTime: 4.5,
  multiplier: 8.0,
  scaling: 'ATK',
  elements: ['ELECTRO'],
  dmgTypes: ['LIBERATION'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 25, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 50, share: 0 },
    { energyType: 'forte', amount: 50, share: 0 },
  ],
  energyCost: [{ energyType: 'energy', amount: 100 }],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Spectro Frazzle', stackChange: 3 }],
  damageModifiers: [],
  sideEffects: [],
}

export const mageIntro: Action = {
  name: 'Intro',
  castTime: 1,
  multiplier: 1.0,
  scaling: 'ATK',
  elements: ['FUSION'],
  dmgTypes: ['INTRO'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 10, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 10, share: 0 },
    { energyType: 'forte', amount: 10, share: 0 },
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
}

export const mageOutro: Action = {
  name: 'Outro',
  castTime: 0,
  multiplier: 1.0,
  scaling: 'ATK',
  elements: ['FUSION'],
  dmgTypes: ['OUTRO'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 10, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 0, share: 0 },
    { energyType: 'forte', amount: 10, share: 0 },
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
}

// ========== Rogue Actions ====================================================================================================

export const backstab: Action = {
  name: 'Backstab',
  castTime: 1,
  multiplier: 1.0,
  scaling: 'ATK',
  elements: ['HAVOC'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 20, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 25, share: 0 },
    { energyType: 'forte', amount: 40, share: 0 },
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
}

export const poison: Action = {
  name: 'Poison',
  castTime: 2.5,
  multiplier: 3.0,
  scaling: 'ATK',
  elements: ['HAVOC'],
  dmgTypes: ['SKILL'],
  cooldown: 5,
  energyGenerated: [
    { energyType: 'energy', amount: 25, share: 0.5 },
    { energyType: 'concerto', amount: 20, share: 0 },
    { energyType: 'forte', amount: 20, share: 0 },
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
}

export const rogueIntro: Action = {
  name: 'Intro',
  castTime: 1,
  multiplier: 1.0,
  scaling: 'ATK',
  elements: ['HAVOC'],
  dmgTypes: ['INTRO'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 10, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 10, share: 0 },
    { energyType: 'forte', amount: 10, share: 0 },
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
}

export const rogueOutro: Action = {
  name: 'Outro',
  castTime: 0,
  multiplier: 1.0,
  scaling: 'ATK',
  elements: ['HAVOC'],
  dmgTypes: ['OUTRO'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 10, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 0, share: 0 },
    { energyType: 'forte', amount: 10, share: 0 },
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
}

// ========== Cartethyia Actions ===============================================================================================

// export const fleurdelysStrike: Action = {
//   name: 'Fleurdelys Strike',
//   castTime: 0.5,
//   multiplier: 2.0,
//   scaling: 'HP',
//   elements: ['AERO'],
//   dmgTypes: ['BASIC'],
//   cooldown: 0,
//   energyGenerated: [
//     { energyType: 'energy', amount: 50, share: 0.5, scalingStat: 'energyPercent' },
//     { energyType: 'concerto', amount: 25, share: 0 },
//     { energyType: 'forte', amount: 1, share: 0 },
//     { energyType: 'conviction', amount: 50, share: 0 },
//   ],
//   energyCost: [],
//   statusModifications: [{ type: 'negativeStatus', targetName: 'Aero Erosion', stackChange: 1 }],
//   damageModifiers: [
//     {
//       source: 'Fleurdelys Strike - Aero Erosion scaling',
//       displayName: 'Stack Mod',
//       condition: stacksOf('Aero Erosion'),
//       characterStats: {
//         amplifyDMG: 0.1,
//       },
//     },
//   ],
//   sideEffects: [],
// }

// export const liberation: Action = {
//   name: 'Liberation',
//   castTime: 2,
//   multiplier: 15.0,
//   scaling: 'HP',
//   elements: ['AERO'],
//   dmgTypes: ['LIBERATION'],
//   cooldown: 0,
//   energyGenerated: [
//     { energyType: 'energy', amount: 10, share: 0.5, scalingStat: 'energyPercent' },
//     { energyType: 'concerto', amount: 50, share: 0 },
//     { energyType: 'forte', amount: 1, share: 0 },
//   ],
//   energyCost: [{ energyType: 'energy', amount: 100 }],
//   statusModifications: [],
//   damageModifiers: [],
//   sideEffects: [],
// }

// export const explosiveStrike: Action = {
//   name: 'Explosive Strike',
//   castTime: 0.6,
//   multiplier: 0.5,
//   scaling: 'HP',
//   elements: ['AERO'],
//   dmgTypes: ['BASIC'],
//   cooldown: 2,
//   energyGenerated: [
//     { energyType: 'energy', amount: 100, share: 0.5, scalingStat: 'energyPercent' },
//     { energyType: 'concerto', amount: 100, share: 0 },
//     { energyType: 'forte', amount: 3, share: 0 },
//     { energyType: 'conviction', amount: 100, share: 0 },
//   ],
//   energyCost: [],
//   statusModifications: [{ type: 'negativeStatus', targetName: 'Aero Erosion', stackChange: 2 }],
//   damageModifiers: [],
//   sideEffects: [aeroErosionExplosion],
// }

export const cartethyiaBA1_4: Action = {
  name: 'Basic 1-4',
  castTime: 3.2,
  multiplier: (1.5 * ((4.78) + (2*3.94 + 5.25) + (4*4.28) + (3*2.52 + 7.54))) / 100,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: (0.7) + (2*0.58 + 0.77) + (4*0.63) + (3*0.37 + 1.11), share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 10, share: 0 }, // uncertain amount
    { energyType: 'forte', amount: 1, share: 0 } // Needs logic
  ],
  energyCost: [],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Aero Erosion', stackChange: 1 }],
  damageModifiers: [],
  sideEffects: []
}

export const cartethyiaBA2_4: Action = {
  name: 'Basic 2-4',
  castTime: 2.48,
  multiplier: (1.5 * ((2*3.94 + 5.25) + (4*4.28) + (3*2.52 + 7.54))) / 100,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: (2*0.58 + 0.77) + (4*0.63) + (3*0.37 + 1.11), share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 9, share: 0 }, // uncertain amount
    { energyType: 'forte', amount: 1, share: 0 } // Needs logic
  ],
  energyCost: [],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Aero Erosion', stackChange: 1 }],
  damageModifiers: [],
  sideEffects: []
}

export const cartethyiaHeavy: Action = {
  name: 'Heavy Attack',
  castTime: 1,
  multiplier: (1.5 * (3*2.08 + 6.24)) / 100,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 3*0.42 + 1.25, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 5, share: 0 }, // uncertain amount
    { energyType: 'forte', amount: 1, share: 0 } // Needs logic
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: []
}

export const cartethyiaPlunge1: Action = {
  name: 'Plunge Attack (0-1 swords)',
  castTime: 1,
  multiplier: (3 * 2 * (5.65)) / 100,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['BASIC', 'NEGATIVE_STATUS'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 1.33, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 10, share: 0 }, // uncertain amount
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: []
}

export const cartethyiaPlunge2: Action = {
  name: 'Plunge Attack (2 swords)',
  castTime: 1,
  multiplier: (3 * 2 * (3*3.3)) / 100,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['BASIC', 'NEGATIVE_STATUS'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 1.35, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 10, share: 0 }, // uncertain amount
  ],
  energyCost: [
    { energyType: 'forte', amount: 2 } // needs logic
  ],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: []
}

export const cartethyiaPlunge3: Action = {
  name: 'Plunge Attack (3 swords)',
  castTime: 1,
  multiplier: (3 * 2 * (3*11.29)) / 100,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['BASIC', 'NEGATIVE_STATUS'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 1.35, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 10, share: 0 }, // uncertain amount
  ],
  energyCost: [
    { energyType: 'forte', amount: 3 } // needs logic
  ],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: []
}

export const cartethyiaSkill: Action = {
  name: 'Resonance Skill',
  castTime: 1,
  multiplier: (3*6.89 + 8.86) / 100,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 14, // needs logic
  energyGenerated: [
    { energyType: 'energy', amount: 3*3.8 + 4.88, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 10, share: 0 },
    { energyType: 'forte', amount: 1, share: 0 } // Needs logic
  ],
  energyCost: [],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Aero Erosion', stackChange: 2 }],
  damageModifiers: [],
  sideEffects: []
}

// TODO: needs to trigger Manifest and buffs buffs based on swords (or assume always true for simplicity)
export const cartethyiaTransform: Action = {
  name: 'Flerudelys Form',
  castTime: 0.16,
  multiplier: 0, // needs a type for non-dmg actions to skip thes fields?
  scaling: 'HP',
  elements: ['NONE'],
  dmgTypes: ['BASIC'], // Needs a NONE type?
  cooldown: 25,
  energyGenerated: [
    { energyType: 'energy', amount: 0, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 10, share: 0 }, // uncertain amount
  ],
  energyCost: [
    { energyType: 'energy', amount: 125 },
  ],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: []
}

export const fleurdelysBA1_5: Action = {
  name: 'Basic 1-5 (Fleurdelys)',
  castTime: 3.4,
  multiplier: ((6.49) + (3.63 +3*1.82) + (3*2.13 + 4.26) + (5*2.74) + (7.2 + 28.8)) / 100,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: (0.75) + (0.77 + 3*0.39) + (3*0.45 + 0.9) + (5*0.45) + (0.4 + 1.59), share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 10, share: 0 }, // uncertain amount
  ],
  energyCost: [],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Aero Erosion', stackChange: 2 }],
  damageModifiers: [],
  sideEffects: [aeroErosionExplosion],
}

export const fleurdelysBA3_5: Action = {
  name: 'Basic 3-5 (Fleurdelys)',
  castTime: 2.67,
  multiplier: ((3*2.13 + 4.26) + (5*2.74) + (7.2 + 28.8)) / 100,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: (3*0.45 + 0.9) + (5*0.45) + (0.4 + 1.59), share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 7, share: 0 }, // uncertain amount
    { energyType: 'conviction', amount: 40, share: 0 } // needs logic (buff giving cdmg based on current conviction amount)
  ],
  energyCost: [],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Aero Erosion', stackChange: 2 }],
  damageModifiers: [],
  sideEffects: [aeroErosionExplosion],
}

export const fleurdelysHeavy: Action = {
  name: 'Heavy Attack (Fleurdelys)',
  castTime: 0.65,
  multiplier: (4.28 + 9.97) / 100,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 1.76, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 4, share: 0 }, // uncertain amount
    { energyType: 'conviction', amount: 10, share: 0 } // needs logic (buff giving cdmg based on current conviction amount)
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: []
}

export const fleurdelysHeavyEnhanced: Action = {
  name: 'Enhanced Heavy Attack (Fleurdelys)',
  castTime: 0.73,
  multiplier: (2*7.78 + 3.89) / 100,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 2*0.96 + 0.48, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 6, share: 0 }, // uncertain amount
    { energyType: 'conviction', amount: 13.33, share: 0 } // needs logic (buff giving cdmg based on current conviction amount)
  ],
  energyCost: [],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Aero Erosion', stackChange: 2 }],
  damageModifiers: [],
  sideEffects: []
}

export const fleurdelysAerial1_2: Action = {
  name: 'Mid-air Attack 1-2 (Fleurdelys)',
  castTime: 1.63,
  multiplier: ((2*2.99 + 3.08) + (2*7.39 + 14.77)) / 100,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: (2*0.66 + 0.68) + (2*0.52 + 1.03), share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 10, share: 0 }, // uncertain amount
    { energyType: 'conviction', amount: 20, share: 0 } // needs logic (buff giving cdmg based on current conviction amount)
  ],
  energyCost: [],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Aero Erosion', stackChange: 2 }],
  damageModifiers: [],
  sideEffects: [aeroErosionExplosion]
}

export const fleurdelysAerial1_3: Action = {
  name: 'Mid-air Attack 1-3 (Fleurdelys)',
  castTime: 2.47,
  multiplier: ((2*2.99 + 3.08) + (2*7.39 + 14.77) + (2.2)) / 100,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: (2*0.66 + 0.68) + (2*0.52 + 1.03) + (0.48), share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 10, share: 0 }, // uncertain amount
    { energyType: 'conviction', amount: 20, share: 0 } // needs logic (buff giving cdmg based on current conviction amount)
  ],
  energyCost: [],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Aero Erosion', stackChange: 2 }],
  damageModifiers: [],
  sideEffects: [aeroErosionExplosion]
}

export const fleurdelysSkill_1: Action = {
  name: 'Resonance Skill 1 (Fleurdelys)',
  castTime: 0.9,
  multiplier: (4*1.86 + 17.36) / 100,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['SKILL'],
  cooldown: 14,
  energyGenerated: [
    { energyType: 'energy', amount: 5, share: 0.5, scalingStat: 'energyPercent' }, // uncertain amount
    { energyType: 'concerto', amount: 10, share: 0 }, // uncertain amount
    { energyType: 'conviction', amount: 13.34, share: 0 } // needs logic (buff giving cdmg based on current conviction amount)
  ],
  energyCost: [],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Aero Erosion', stackChange: 2 }],
  damageModifiers: [],
  sideEffects: []
}

export const fleurdelysSkill_2: Action = {
  name: 'Resonance Skill 2 (Fleurdelys)',
  castTime: 1.53,
  multiplier: (2*1.86 + 3*7.03) / 100,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['SKILL'],
  cooldown: 14,
  energyGenerated: [
    { energyType: 'energy', amount: 5, share: 0.5, scalingStat: 'energyPercent' }, // uncertain amount
    { energyType: 'concerto', amount: 10, share: 0 }, // uncertain amount
    { energyType: 'conviction', amount: 26.67, share: 0 } // TODO: needs logic (buff giving cdmg based on current conviction amount)
  ],
  energyCost: [],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Aero Erosion', stackChange: 2 }],
  damageModifiers: [],
  sideEffects: [aeroErosionExplosion]
}

export const fleurdelysLiberation: Action = {
  name: 'Liberation (Fleurdelys)',
  castTime: 0.03,
  multiplier: (2*(7*13.12)) / 100,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['LIBERATION'],
  cooldown: 25,
  energyGenerated: [  
    { energyType: 'energy', amount: 10, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 10, share: 0 }, // uncertain amount
  ],
  energyCost: [
    { energyType: 'conviction', amount: 120 },
  ],
  statusModifications: [
    { type: 'negativeStatus', targetName: 'Aero Erosion', stackChange: -100 }, // TODO: does our resolver handle it correctly?
  ],
  damageModifiers: [
    { source: 'Liberation Stacks', displayName: 'Liberation Passive', condition: stacksOfCap('Aero Erosion'), characterStats: { liberationTotalMultiplierDMG: 0.2 } },
  ],
  sideEffects: []
}

export const cartethyiaIntro: Action = {
  name: 'Intro',
  castTime: 0.92,
  multiplier: (1.5 * (3*2.08 + 6.24)) / 100,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['INTRO'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 3 * 1.66666666667 + 5, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 10, share: 0 },
    { energyType: 'forte', amount: 1, share: 0 },
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
}

// Outro should be a none-dmg action that applies a buff:
// Aero DMG dealt by ACTIVE resonators in the team OTHER THAN CARTETHYIA/FLEURDELYS to targets WITH negative statuses
// .. is AMPLIFIED with 17.5 % for 20 seconds
export const cartethyiaOutro: Action = {
  name: 'Outro',
  castTime: 0,
  multiplier: 0,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['OUTRO'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 0, share: 0.5 },
    { energyType: 'concerto', amount: 0, share: 0 },
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
}





export const energiesUp: Action = {
  name: 'Energies Up',
  castTime: 0,
  multiplier: 0,
  scaling: 'HP',
  elements: ['NONE'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 1000, share: 0.5 },
    { energyType: 'concerto', amount: 1000, share: 0 },
    { energyType: 'forte', amount: 1000, share: 0 }
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
}