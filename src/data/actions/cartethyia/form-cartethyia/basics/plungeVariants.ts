// Cartethyia — internal Plunge Attack variants (1 / 2 / 3 swords) picked by plunge.ts resolveVariant.
import type { Action } from '../../../../../types/action'

// Internal Action used as a variant for the main plunge actions
export const cartethyia_plunge_1: Action = {
  tags: ['BASIC_ATTACK'],
  name: 'Plunge Attack (0-1 swords)',
  displayName: 'Plunge Attack 1',
  category: 'Basics',
  castTime: 0,
  multiplier: (3 * 5.65) / 100,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['BASIC', 'NEGATIVE_STATUS'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 1.33, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 1.86, share: 0 },
  ],
  energyCost: [{ energyType: 'forte', amount: 1 }],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'AIR',
    endState: 'GROUND',
  },
  offtune: 0.42,
  toolTip: 'Can be cast with 0-1 swords',
}

// Internal Action used as a variant for the main plunge actions
export const cartethyia_plunge_2: Action = {
  tags: ['BASIC_ATTACK'],
  name: 'Plunge Attack (2 swords)',
  displayName: 'Plunge Attack 2',
  category: 'Basics',
  castTime: 0,
  multiplier: (3 * (3 * 3.3)) / 100,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['BASIC', 'NEGATIVE_STATUS'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 3 * 0.45, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 3 * 0.62, share: 0 },
  ],
  energyCost: [{ energyType: 'forte', amount: 2 }],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'AIR',
    endState: 'GROUND',
  },
  offtune: 3 * 0.14,
  toolTip: 'Can be cast with 2 swords',
}

// Internal Action used as a variant for the main plunge actions
export const cartethyiaPlunge_3: Action = {
  tags: ['BASIC_ATTACK'],
  name: 'Plunge Attack (3 swords)',
  displayName: 'Plunge Attack 3',
  category: 'Basics',
  castTime: 0,
  multiplier: (3 * (3 * 11.29)) / 100,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['BASIC', 'NEGATIVE_STATUS'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: 3 * 0.45, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 3 * 0.62, share: 0 },
  ],
  energyCost: [{ energyType: 'forte', amount: 3 }],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'AIR',
    endState: 'GROUND',
  },
  offtune: 3 * 0.14,
  toolTip: 'Can be cast with 3 swords',
}
