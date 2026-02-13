import type { Action } from '../types/action'
import { stacksOf } from '../utils/conditions/damageModifierConditions'
import { aeroErosionExplosion } from './sideEffects'

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

export const fleurdelysStrike: Action = {
  name: 'Fleurdelys Strike',
  castTime: 0.5,
  multiplier: 2.0,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 50, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 25, share: 0 },
    { energyType: 'forte', amount: 1, share: 0 },
    { energyType: 'conviction', amount: 50, share: 0 },
  ],
  energyCost: [],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Aero Erosion', stackChange: 1 }],
  damageModifiers: [
    {
      source: 'Fleurdelys Strike – Aero Erosion scaling',
      condition: stacksOf('Aero Erosion'),
      characterStats: {
        amplifyDMG: 0.1,
      },
    },
  ],
  sideEffects: [],
}

export const liberation: Action = {
  name: 'Liberation',
  castTime: 2,
  multiplier: 15.0,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['LIBERATION'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 10, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 50, share: 0 },
    { energyType: 'forte', amount: 1, share: 0 },
    { energyType: 'rage', amount: 75, share: 0 },
  ],
  energyCost: [{ energyType: 'energy', amount: 100 }],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
}

export const explosiveStrike: Action = {
  name: 'Explosive Strike',
  castTime: 0.6,
  multiplier: 0.5,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 2,
  energyGenerated: [
    { energyType: 'energy', amount: 100, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 100, share: 0 },
    { energyType: 'forte', amount: 3, share: 0 },
    { energyType: 'conviction', amount: 100, share: 0 },
  ],
  energyCost: [],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Aero Erosion', stackChange: 2 }],
  damageModifiers: [],
  sideEffects: [aeroErosionExplosion],
}

export const cartethyiaIntro: Action = {
  name: 'Intro',
  castTime: 1,
  multiplier: 1.0,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['INTRO'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 10, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 10, share: 0 },
    { energyType: 'forte', amount: 1, share: 0 },
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
}

export const cartethyiaOutro: Action = {
  name: 'Outro',
  castTime: 0,
  multiplier: 1.0,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['OUTRO'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 10, share: 0.5 },
    { energyType: 'concerto', amount: 0, share: 0 },
    { energyType: 'forte', amount: 0, share: 0, scalingStat: 'energyPercent' },
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
}
