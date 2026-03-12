import type { Action } from '../../types/action'

export const blueprint: Action = {
  name: 'XXX',
  displayName: 'XXX',
  category: 'Basics',
  castTime: 100,
  multiplier: 100 / 100,
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
  coordinatedAttacks: [], // Optional
  castConditions: {
    previousActions: [], // Optional
    startState: 'ANY',
    swapOutState: null, // Optional
    endState: 'PRESERVE',
    persistenceTime: null, // Optional
    requiresSwapIn: null, // Optional
    requiresSwapOut: null, // Optional
    requiredForms: null, // Optional
    customCanCast: null // Optional
  },
  offtune: 100,
  toolTip: null, // Optional
  groupName: null, // Optional
  variantName: null, // Optional
  formChange: null, // Optional
  resolveVariant: null // Optional
}

