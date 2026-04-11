import type { Action } from "../../../../../types/action";
import * as values from "../../values"

// ========== BA1 ==============================================================================================================

// Default
const hiyuki_BA_1: Action = {
  tags: ['BASIC_ATTACK'],
  name: 'Basic Attack 1',
  displayName: 'Basic Attack 1',
  category: 'Basics',
  castTime: 1.00, // TODO
  multiplier: values.BA1_multiplier,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: values.BA1_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: values.BA1_concerto, share: 0 },
    { energyType: 'dedication', amount: values.BA1_dedication, share: 0 }
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  coordinatedAttacks: [],
  castConditions: {
    startState: 'GROUND',
    endState: 'GROUND',
    blockedComboTags: ['BA Block', 'BA1', 'BA2'],
    requiredForms: ['Present Self']
  },
  comboChainTags: ['BA Block'],
  hideWhenNotCastable: true,
  offtune: values.BA1_offtune,
  groupName: 'Basic Attack 1',
  variantName: 'Default'
}

// Cancel With Swap
const hiyuki_BA_1_cancel_with_swap: Action = {
  tags: ['BASIC_ATTACK'],
  name: 'Basic Attack 1 (swap cancel)',
  displayName: 'Basic Attack 1 (swap cancel)',
  category: 'Basics',
  castTime: 1.00, // TODO
  multiplier: values.BA1_multiplier,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: values.BA1_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: values.BA1_concerto, share: 0 },
    { energyType: 'dedication', amount: values.BA1_dedication, share: 0 }
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
    requiresSwapOut: true,
    persistenceTime: values.BA1_persistenceTime,
    blockedComboTags: ['BA Block', 'BA1', 'BA2'],
    requiredForms: ['Present Self']
  },
  comboChainTags: ['BA1'],
  hideWhenNotCastable: true,
  offtune: values.BA1_offtune,
  groupName: 'Basic Attack 1',
  variantName: 'Swap Cancel'
}

// ========== BA1-2 ============================================================================================================

// Default
const hiyuki_BA_1_2: Action = {
  tags: ['BASIC_ATTACK'],
  name: 'Basic Attack 1-2',
  displayName: 'Basic Attack 1-2',
  category: 'Basics',
  castTime: 1.00, // TODO
  multiplier: values.BA1_multiplier + values.BA2_multiplier,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: values.BA1_energy + values.BA2_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: values.BA1_concerto + values.BA2_concerto, share: 0 },
    { energyType: 'dedication', amount: values.BA1_dedication + values.BA2_dedication, share: 0 }
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  coordinatedAttacks: [],
  castConditions: {
    startState: 'GROUND',
    endState: 'GROUND',
    blockedComboTags: ['BA Block', 'BA1', 'BA2'],
    requiredForms: ['Present Self']
  },
  comboChainTags: ['BA Block'],
  hideWhenNotCastable: true,
  offtune: values.BA1_offtune + values.BA2_offtune,
  groupName: 'Basic Attack 1-2',
  variantName: 'Default'
}

// Default
const hiyuki_BA_1_2_cancel_with_swap: Action = {
  tags: ['BASIC_ATTACK'],
  name: 'Basic Attack 1-2 (swap cancel)',
  displayName: 'Basic Attack 1-2 (swap cancel)',
  category: 'Basics',
  castTime: 1.00, // TODO
  multiplier: values.BA1_multiplier + values.BA2_multiplier,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: values.BA1_energy + values.BA2_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: values.BA1_concerto + values.BA2_concerto, share: 0 },
    { energyType: 'dedication', amount: values.BA1_dedication + values.BA2_dedication, share: 0 }
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
    requiresSwapOut: true,
    persistenceTime: values.BA2_persistenceTime,
    blockedComboTags: ['BA Block', 'BA1', 'BA2'],
    requiredForms: ['Present Self']
  },
  comboChainTags: ['BA2'],
  hideWhenNotCastable: true,
  offtune: values.BA1_offtune + values.BA2_offtune,
  groupName: 'Basic Attack 1-2',
  variantName: 'Swap Cancel'
}

// ========== BA1-3 ============================================================================================================

// Default
const hiyuki_BA_1_3: Action = {
  tags: ['BASIC_ATTACK', 'GLACIO_CHAFE_APPLIER'],
  name: 'Basic Attack 1-3',
  displayName: 'Basic Attack 1-3',
  category: 'Basics',
  castTime: 1.00, // TODO
  multiplier: values.BA1_multiplier + values.BA2_multiplier + values.BA3_multiplier,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: values.BA1_energy + values.BA2_energy + values.BA3_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: values.BA1_concerto + values.BA2_concerto + values.BA3_concerto, share: 0 },
    { energyType: 'dedication', amount: values.BA1_dedication + values.BA2_dedication + values.BA3_dedication, share: 0 }
  ],
  energyCost: [],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Glacio Chafe', stackChange: 1 }],
  damageModifiers: [],
  sideEffects: [],
  coordinatedAttacks: [],
  castConditions: {
    startState: 'GROUND',
    endState: 'GROUND',
    blockedComboTags: ['BA Block', 'BA1', 'BA2'],
    requiredForms: ['Present Self']
  },
  comboChainTags: ['BA3'],
  hideWhenNotCastable: true,
  offtune: values.BA1_offtune + values.BA2_offtune + values.BA3_offtune,
  groupName: 'Basic Attack 1-3',
  variantName: 'Default'
}

// Cancel With Swap
const hiyuki_BA_1_3_cancel_with_swap: Action = {
  tags: ['BASIC_ATTACK', 'GLACIO_CHAFE_APPLIER'],
  name: 'Basic Attack 1-3 (swap cancel)',
  displayName: 'Basic Attack 1-3 (swap cancel)',
  category: 'Basics',
  castTime: 1.00, // TODO
  multiplier: values.BA1_multiplier + values.BA2_multiplier + values.BA3_multiplier,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: values.BA1_energy + values.BA2_energy + values.BA3_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: values.BA1_concerto + values.BA2_concerto + values.BA3_concerto, share: 0 },
    { energyType: 'dedication', amount: values.BA1_dedication + values.BA2_dedication + values.BA3_dedication, share: 0 }
  ],
  energyCost: [],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Glacio Chafe', stackChange: 1 }],
  damageModifiers: [],
  sideEffects: [],
  coordinatedAttacks: [],
  castConditions: {
    startState: 'GROUND',
    swapOutState: 'GROUND',
    endState: 'GROUND',
    requiresSwapOut: true,
    persistenceTime: values.BA3_persistenceTime,
    blockedComboTags: ['BA Block', 'BA1', 'BA2'],
    requiredForms: ['Present Self']
  },
  comboChainTags: ['BA3'],
  hideWhenNotCastable: true,
  offtune: values.BA1_offtune + values.BA2_offtune + values.BA3_offtune,
  groupName: 'Basic Attack 1-3',
  variantName: 'Swap Cancel'
}

export {
  hiyuki_BA_1,
  hiyuki_BA_1_cancel_with_swap,
  hiyuki_BA_1_2,
  hiyuki_BA_1_2_cancel_with_swap,
  hiyuki_BA_1_3,
  hiyuki_BA_1_3_cancel_with_swap
}