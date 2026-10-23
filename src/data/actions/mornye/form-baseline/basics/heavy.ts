// Mornye — Baseline Mode: Heavy Attack, spends Rest Mass Energy and enters Wide Field Observation Mode.
import type { Action } from '../../../../../types/action'
import * as values from '../../values'
import { syntony_field, syntony_field_s2 } from '../../../../modifiers/mornye'

// ========== Heavy Attack =====================================================================================================
export const mornye_heavy: Action = {
  tags: ['HEAVY_ATTACK', 'HEAL_PROC'],
  name: 'Heavy Attack',
  displayName: 'Heavy Attack',
  category: 'Basics',
  castTime: 1.15,
  multiplier: values.heavy_multiplier,
  scaling: 'ATK',
  elements: ['FUSION'],
  dmgTypes: ['HEAVY'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: values.heavy_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: values.heavy_concerto, share: 0 }
  ],
  energyCost: [{ energyType: 'rest_mass_energy', amount: values.heavy_rest_mass_energy_cost }],
  statusModifications: [],
  damageModifiers: [syntony_field, syntony_field_s2],
  sideEffects: [
    // TODO: 39.77%*5 FUSION DMG considered LIBERATION DMG (upon entering Wide Field Observation Mode)
  ],
  coordinatedAttacks: [],
  castConditions: {
    startState: 'GROUND',
    endState: 'AIR',
    preventsSwapOut: true,
    requiredForms: ['Baseline Mode']
  },
  offtune: values.heavy_offtune,
  formChange: 'Wide Field Observation Mode',
  attemptFollowUp: { actionName: 'Mode: Basic Attack 1-3' }
}

export const mornye_heavy_swap_in: Action = {
  tags: ['HEAVY_ATTACK', 'HEAL_PROC'],
  name: 'Heavy Attack (Swap In)',
  displayName: 'Heavy Attack',
  category: 'Basics',
  castTime: 1.50,
  multiplier: values.heavy_multiplier,
  scaling: 'ATK',
  elements: ['FUSION'],
  dmgTypes: ['HEAVY'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: values.heavy_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: values.heavy_concerto, share: 0 }
  ],
  energyCost: [{ energyType: 'rest_mass_energy', amount: values.heavy_rest_mass_energy_cost }],
  statusModifications: [],
  damageModifiers: [syntony_field, syntony_field_s2],
  sideEffects: [
    // TODO: 39.77%*5 FUSION DMG considered LIBERATION DMG (upon entering Wide Field Observation Mode)
  ],
  coordinatedAttacks: [],
  castConditions: {
    startState: 'GROUND',
    endState: 'AIR',
    preventsSwapOut: true,
    requiredForms: ['Baseline Mode'],
  },
  offtune: values.heavy_offtune,
  formChange: 'Wide Field Observation Mode',
  attemptFollowUp: { actionName: 'Mode: Basic Attack 1-3' }
}
