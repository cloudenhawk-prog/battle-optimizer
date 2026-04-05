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
    swapOutState: undefined, // Optional
    endState: 'PRESERVE',
    persistenceTime: undefined, // Optional
    requiresSwapIn: undefined, // Optional
    requiresSwapOut: undefined, // Optional
    requiredForms: undefined, // Optional
    customCanCast: undefined, // Optional
  },
  offtune: 100,
  toolTip: undefined, // Optional
  groupName: undefined, // Optional
  variantName: undefined, // Optional
  formChange: undefined, // Optional
  resolveVariant: undefined, // Optional
  attemptFollowUp: undefined, // Optional: { actionName: 'XXX' }
}
