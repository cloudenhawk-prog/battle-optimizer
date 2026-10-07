// Ciaccona — testing actions that top up energy / concerto / forte.
import type { Action } from '../../../../types/action'

// ========== Energies =========================================================================================================
export const ciaccona_energy: Action = {
  name: 'Energy Up',
  displayName: 'Energy Up',
  category: 'Testing',
  castTime: 0,
  multiplier: 0,
  scaling: 'HP',
  elements: [''],
  dmgTypes: [''],
  cooldown: 0,
  energyGenerated: [{ energyType: 'energy', amount: 1000, share: 0 }],
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

export const ciaccona_concerto: Action = {
  name: 'Concerto Up',
  displayName: 'Concerto Up',
  category: 'Testing',
  castTime: 0,
  multiplier: 0,
  scaling: 'HP',
  elements: [''],
  dmgTypes: [''],
  cooldown: 0,
  energyGenerated: [{ energyType: 'concerto', amount: 1000, share: 0 }],
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

export const ciaccona_forte: Action = {
  name: 'Forte Up',
  displayName: 'Forte Up',
  category: 'Testing',
  castTime: 0,
  multiplier: 0,
  scaling: 'HP',
  elements: [''],
  dmgTypes: [''],
  cooldown: 0,
  energyGenerated: [{ energyType: 'forte', amount: 1000, share: 0 }],
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
