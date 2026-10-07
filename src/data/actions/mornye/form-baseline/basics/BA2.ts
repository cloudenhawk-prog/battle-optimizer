// Mornye — Baseline Mode: Basic Attack 2 (swap cancel), continuing a chain started by BA1.
import type { Action } from '../../../../../types/action'
import * as values from '../../values'

// ========== Basic Attack 2 ===================================================================================================
export const mornye_BA_2_cancel_with_swap: Action = {
  tags: ['BASIC_ATTACK'],
  name: 'Basic Attack 2 (swap cancel)',
  displayName: 'Basic Attack 2 (swap cancel)',
  category: 'Basics',
  castTime: 0.09,
  multiplier: values.BA2_multiplier,
  scaling: 'ATK',
  elements: ['FUSION'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: values.BA2_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: values.BA2_concerto, share: 0 },
    { energyType: 'rest_mass_energy', amount: values.BA2_rest_mass_energy, share: 0 },
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
    requiredComboTags: ['BA1'],
    blockedComboTags: ['BA2', 'BA3']
  },
  offtune: values.BA2_offtune,
  comboChainTags: ['BA2'],
  hideWhenNotCastable: true,
  groupName: 'Basic Attack 2',
  variantName: 'Cancel With Swap'
}
