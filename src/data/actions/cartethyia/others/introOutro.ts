// Cartethyia — Intro (per form) and Outro skills.
import type { Action } from '../../../../types/action'
import { always } from '../../../helpers/modifierConditions'

// ========== Intro & Outro ====================================================================================================
export const cartethyia_intro: Action = {
  tags: ['INTRO_ACTION'],
  name: 'Cartethyia Intro',
  displayName: 'Sword to Mark Tides Trace',
  category: 'Other',
  castTime: 0.92, // TODO
  multiplier: (1.5 * (3 * 2.08 + 6.24)) / 100,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['INTRO'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 3 * 1.67 + 5.0, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 10, share: 0 },
    { energyType: 'forte_discord', amount: 1, share: 0 },
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'ANY',
    endState: 'GROUND',
  },
  offtune: 3 * 0.12 + 0.35,
}

export const cartethyia_outro: Action = {
  tags: ['OUTRO_ACTION'],
  name: 'Outro',
  displayName: 'Winds Divine Blessing',
  category: 'Other',
  castTime: 0,
  multiplier: 0,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['OUTRO'],
  cooldown: 0,
  energyGenerated: [],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [
    {
      source: 'Cartethyia Outro Buff',
      displayName: "Wind's Divine Blessing",
      type: 'buff',
      ownerCharacter: 'Cartethyia',
      color: '#1ae070',
      characterStats: { aeroAmplifyDMG: 0.175 },
      condition: always(),
      targetStrategy: 'activeAlly',
      durationStrategy: { type: 'limited', timeDuration: 20 },
      stackingStrategy: { maxStacks: 1, resetTimerOnApplication: true, stacksRemovedEachTime: 1 },
    },
  ],
  sideEffects: [],
  castConditions: {
    startState: 'ANY',
    endState: 'PRESERVE',
  },
  offtune: 0,
}

export const fleurdelys_intro: Action = {
  // TODO: Define Fleyrdelys' real intro
  name: 'Fleurdelys Intro',
  displayName: 'Sword to Mark Tides Trace',
  category: 'Other',
  castTime: 0.92,
  multiplier: (3 * (3 * 2.08 + 6.24)) / 100,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['INTRO'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 3 * 1.67 + 5.0, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 10, share: 0 },
    { energyType: 'forte_discord', amount: 1, share: 0 },
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'ANY',
    endState: 'GROUND',
  },
  offtune: 3 * 0.12 + 0.35,
}
