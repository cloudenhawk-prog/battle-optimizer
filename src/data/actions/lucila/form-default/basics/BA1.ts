import type { Action } from '../../../../../types/action'
import * as values from '../../values'

const lucila_BA1: Action = {
  tags: ['BASIC_ATTACK'],
  name: 'Basic Attack 1',
  displayName: 'Snapshot: Stage 1',
  category: 'Basics',
  castTime: values.BA1_castTime,
  multiplier: values.BA1_multiplier,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: values.BA1_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: values.BA1_concerto, share: 0 },
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
    blockedComboTags: ['BA Block', 'BA1', 'BA2'],
  },
  comboChainTags: ['BA Block'],
  hideWhenNotCastable: true,
  offtune: values.BA1_offtune,
  groupName: 'Basic Attack 1',
  variantName: 'Default',
}

// ========== BA1-2 ============================================================================================================

const lucila_BA1_2: Action = {
  tags: ['BASIC_ATTACK'],
  name: 'Basic Attack 1-2',
  displayName: 'Snapshot: Stage 1-2',
  category: 'Basics',
  castTime: values.BA1_castTime + values.BA2_castTime,
  multiplier: values.BA1_multiplier + values.BA2_multiplier,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: values.BA1_energy + values.BA2_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: values.BA1_concerto + values.BA2_concerto, share: 0 },
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
    blockedComboTags: ['BA Block', 'BA1', 'BA2'],
  },
  comboChainTags: ['BA Block'],
  hideWhenNotCastable: true,
  offtune: values.BA1_offtune + values.BA2_offtune,
  groupName: 'Basic Attack 1-2',
  variantName: 'Default',
}

// ========== BA1-3 ============================================================================================================

const lucila_BA1_3: Action = {
  tags: ['BASIC_ATTACK'],
  name: 'Basic Attack 1-3',
  displayName: 'Snapshot: Stage 1-3',
  category: 'Basics',
  castTime: values.BA1_castTime + values.BA2_castTime + values.BA3_castTime,
  multiplier: values.BA1_multiplier + values.BA2_multiplier + values.BA3_multiplier,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: values.BA1_energy + values.BA2_energy + values.BA3_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: values.BA1_concerto + values.BA2_concerto + values.BA3_concerto, share: 0 },
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
    blockedComboTags: ['BA Block', 'BA1', 'BA2'],
  },
  comboChainTags: ['BA3'],
  hideWhenNotCastable: true,
  offtune: values.BA1_offtune + values.BA2_offtune + values.BA3_offtune,
  groupName: 'Basic Attack 1-3',
  variantName: 'Default',
}

export { lucila_BA1, lucila_BA1_2, lucila_BA1_3 }
