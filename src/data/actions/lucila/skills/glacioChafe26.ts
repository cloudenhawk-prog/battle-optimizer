import type { Action } from '../../../../types/action'

// Applies 26 independent instances of Glacio Chafe (stackChange: 26, applicationCount: 26).
const lucila_glacio_chafe_26: Action = {
  tags: ['SKILL', 'GLACIO_CHAFE_APPLIER'],
  name: 'Glacio Chafe ×26',
  displayName: 'Glacio Chafe ×26',
  category: 'Skills',
  castTime: 0,
  multiplier: 0.001,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['SKILL'],
  cooldown: 0,
  energyGenerated: [],
  energyCost: [],
  statusModifications: [
    { type: 'negativeStatus', targetName: 'Glacio Chafe', stackChange: 26, applicationCount: 26 },
  ],
  damageModifiers: [],
  sideEffects: [],
  coordinatedAttacks: [],
  castConditions: {
    startState: 'ANY',
    endState: 'PRESERVE',
  },
  offtune: 0,
}

export { lucila_glacio_chafe_26 }
