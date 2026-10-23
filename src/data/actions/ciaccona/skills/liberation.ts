// Ciaccona — Liberation "Singer's Triple Cadenza": summons a coordinated attack that keeps hitting while she is off-field.
import type { Action } from '../../../../types/action'
import { ciaccona_singers_triple_cadenza_coordinated } from '../../../coordinatedAttacks/ciaccona'

// ========== Liberation =======================================================================================================
export const ciaccona_liberation: Action = {
  tags: ['LIBERATION'],
  name: 'Liberation',
  displayName: 'Singers Triple Cadenza',
  category: 'Skills',
  castTime: 1.0, // TODO - test from CAST START to next character can act (cart E)
  multiplier: 1100.42 / 100,
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['LIBERATION'],
  cooldown: 20,
  energyGenerated: [
    { energyType: 'energy', amount: 0, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 20, share: 0 },
  ],
  energyCost: [{ energyType: 'energy', amount: 125 }],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  coordinatedAttacks: [ciaccona_singers_triple_cadenza_coordinated],
  castConditions: {
    startState: 'GROUND',
    endState: 'GROUND',
  },
  offtune: 4.8
}
