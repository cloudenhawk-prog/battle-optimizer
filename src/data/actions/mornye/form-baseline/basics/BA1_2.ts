// Mornye — Baseline Mode: Basic Attack 1-2 (swap cancel).
import type { Action } from '../../../../../types/action'
import * as values from '../../values'

// ========== Basic Attack 1-2 =================================================================================================
export const mornye_BA_1_2_cancel_with_swap: Action = {
  tags: ['BASIC_ATTACK'],
  name: 'Basic Attack 1-2 (swap cancel)',
  displayName: 'Basic Attack 1-2 (swap cancel)',
  category: 'Basics',
  castTime: 0.47,
  multiplier: values.BA1_multiplier + values.BA2_multiplier,
  scaling: 'ATK',
  elements: ['FUSION'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: values.BA1_energy + values.BA2_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: values.BA1_concerto + values.BA2_concerto, share: 0 },
    { energyType: 'rest_mass_energy', amount: values.BA1_rest_mass_energy + values.BA2_rest_mass_energy, share: 0 },
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  coordinatedAttacks: [],
  castConditions: {
    startState: 'GROUND',
    swapOutState: 'GROUND',
    endState: 'GROUND',
    persistenceTime: values.BA2_persistenceTime,
    requiresSwapOut: true,
    requiredForms: ['Baseline Mode'],
    blockedComboTags: ['BA1', 'BA2', 'BA3']
  },
  offtune: values.BA1_offtune + values.BA2_offtune,
  comboChainTags: ['BA2'],
  hideWhenNotCastable: true,
  groupName: 'Basic Attack 1-2',
  variantName: 'Cancel With Swap'
}
