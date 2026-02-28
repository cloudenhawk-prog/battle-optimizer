import type { Action } from '../../types/action'

export const blueprint: Action = {
  name: 'XXX',
  displayName: 'XXX',
  castTime: 100,
  multiplier: (100) / 100,
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['LIBERATION'],
  cooldown: 100,
  energyGenerated: [
    { energyType: 'energy', amount: 100, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 100, share: 0 },
    { energyType: 'forte', amount: 100, share: 0 },
  ],
  energyCost: [{ energyType: 'energy', amount: 100 }],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'ANY',
    endState: 'GROUND'
  },
  other: {
    hardness: 100,
    toughness: 100,
    offtune: 100
  },
}