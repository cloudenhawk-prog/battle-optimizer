// Rover (Aero) — Liberation "Omega Storm".
import type { Action } from '../../../../types/action'

// ========== Liberation =======================================================================================================
export const roverAero_liberation: Action = {
  tags: ['LIBERATION', 'HEAL_PROC'],
  name: 'Liberation',
  displayName: 'Omega Storm',
  category: 'Skills',
  castTime: 0.08,
  multiplier: (1.2 * 536.79) / 100,
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['LIBERATION'],
  cooldown: 24,
  energyGenerated: [
    { energyType: 'energy', amount: 0, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 20, share: 0 },
    { energyType: 'forte', amount: 25, share: 0 },
  ],
  energyCost: [{ energyType: 'energy', amount: 150 }],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'ANY',
    endState: 'GROUND',
  },
  offtune: 4.8
}
