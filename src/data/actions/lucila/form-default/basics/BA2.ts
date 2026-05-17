import type { Action } from '../../../../../types/action'
import * as values from '../../values'

const lucila_BA2: Action = {
  tags: ['BASIC_ATTACK'],
  name: 'Basic Attack 2',
  displayName: 'Snapshot: Stage 2',
  category: 'Basics',
  castTime: values.BA2_castTime,
  multiplier: values.BA2_multiplier,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: values.BA2_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: values.BA2_concerto, share: 0 },
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  coordinatedAttacks: [],
  castConditions: {
    startState: 'GROUND',
    endState: 'GROUND',
    preventsSwapOut: true,
    requiredForms: ['Default Form'],
    blockedComboTags: ['BA Block', 'BA2', 'BA3'],
    requiredComboTags: ['BA1'],
  },
  comboChainTags: ['BA Block'],
  hideWhenNotCastable: true,
  offtune: values.BA2_offtune,
  groupName: 'Basic Attack 2',
  variantName: 'Default',
}

// ========== BA2-3 ============================================================================================================

const lucila_BA2_3: Action = {
  tags: ['BASIC_ATTACK'],
  name: 'Basic Attack 2-3',
  displayName: 'Snapshot: Stage 2-3',
  category: 'Basics',
  castTime: values.BA2_castTime + values.BA3_castTime,
  multiplier: values.BA2_multiplier + values.BA3_multiplier,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: values.BA2_energy + values.BA3_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: values.BA2_concerto + values.BA3_concerto, share: 0 },
    { energyType: 'traces', amount: values.BA3_traces, share: 0 },
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  coordinatedAttacks: [],
  castConditions: {
    startState: 'GROUND',
    endState: 'GROUND',
    preventsSwapOut: true,
    requiredForms: ['Default Form'],
    blockedComboTags: ['BA Block', 'BA2', 'BA3'],
    requiredComboTags: ['BA1'],
  },
  comboChainTags: ['BA3'],
  hideWhenNotCastable: true,
  offtune: values.BA2_offtune + values.BA3_offtune,
  groupName: 'Basic Attack 2-3',
  variantName: 'Default',
}

export { lucila_BA2, lucila_BA2_3 }
