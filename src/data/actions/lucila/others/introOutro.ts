import type { Action } from '../../../../types/action'

// Intro
const lucila_intro: Action = {
  tags: ['INTRO_ACTION', 'GLACIO_CHAFE_APPLIER'],
  name: 'Lucila Intro',
  displayName: 'TODO',
  category: 'Other',
  castTime: 0.0,
  multiplier: (0) / 100,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['INTRO'],
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
  offtune: 0
}

// Outro
const lucila_outro: Action = {
  tags: ['OUTRO_ACTION'],
  name: 'Outro',
  displayName: 'TODO',
  category: 'Other',
  castTime: 0,
  multiplier: 0,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['OUTRO'],
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

export {
  lucila_intro,
  lucila_outro,
}
