// Rover (Aero) — Intro "Relentless Squall" and Outro "Storm's Echo" (Aeolian Realm: +3 Aero Erosion max stacks).
import type { Action } from '../../../../types/action'
import { always } from '../../../helpers/modifierConditions'

// ========== Intro & Outro ====================================================================================================
export const roverAero_intro: Action = {
  tags: ['INTRO_ACTION'],
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

export const roverAero_outro: Action = {
  tags: ['OUTRO_ACTION'],
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
    endState: 'PRESERVE',
  },
  offtune: 0
}
