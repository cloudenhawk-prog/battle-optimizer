import type { CoordinatedAttack } from '../../types/coordinatedAttack'

export const ciaccona_singers_triple_cadenza_coordinated: CoordinatedAttack = {
  tags: ['AERO_EROSION_APPLIER'],
  name: 'Singers Triple Cadenza (Coordinated)',
  displayName: 'Singers Triple Cadenza (Coordinated)',
  multiplier: 6.12 / 100,
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['LIBERATION'],
  frequency: 1.6, // TODO: test in tower
  duration: 20 * 1.6, // TODO: test in tower
  swapRequired: true,
  energyGenerated: [],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Aero Erosion', stackChange: 1 }],
  offtune: 0.22,
}
