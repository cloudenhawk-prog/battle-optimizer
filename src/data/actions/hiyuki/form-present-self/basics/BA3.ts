import type { Action } from "../../../../../types/action"
import * as values from "../../values"
import { hiyuki_skill, hiyuki_skill_cancel_with_swap } from "../skills/resonance"

// ========== Normal ===========================================================================================================
// TODO: Try cancel with dodge

// Default
const hiyuki_BA_3: Action = {
  tags: ['BASIC_ATTACK', 'GLACIO_CHAFE_APPLIER'],
  name: 'Basic Attack 3',
  displayName: 'Basic Attack 3',
  category: 'Basics',
  castTime: 1.00, // TODO
  multiplier: values.BA3_multiplier,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: values.BA3_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: values.BA3_concerto, share: 0 },
    { energyType: 'dedication', amount: values.BA3_dedication, share: 0 }
  ],
  energyCost: [],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Glacio Chafe', stackChange: 1 }],
  damageModifiers: [],
  sideEffects: [],
  coordinatedAttacks: [],
  castConditions: {
    startState: 'GROUND',
    endState: 'GROUND',
    preventsSwapOut: true,
    blockedComboTags: ['BA1', 'BA3'],
    requiredComboTags: ['BA2'],
    requiredForms: ['Present Self']
  },
  comboChainTags: ['BA3'],
  hideWhenNotCastable: true,
  offtune: values.BA3_offtune,
  groupName: 'Basic Attack 3',
  variantName: 'Default',
}

// Cancel With Swap
const hiyuki_BA_3_cancel_with_swap: Action = {
  tags: ['BASIC_ATTACK', 'GLACIO_CHAFE_APPLIER'],
  name: 'Basic Attack 3 (swap cancel)',
  displayName: 'Basic Attack 3 (swap cancel)',
  category: 'Basics',
  castTime: 1.00, // TODO
  multiplier: values.BA3_multiplier,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: values.BA3_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: values.BA3_concerto, share: 0 },
    { energyType: 'dedication', amount: values.BA3_dedication, share: 0 }
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
    blockedComboTags: ['BA1', 'BA3'],
    requiredComboTags: ['BA2'],
    requiredForms: ['Present Self']
  },
  comboChainTags: ['BA3'],
  hideWhenNotCastable: true,
  offtune: values.BA3_offtune,
  groupName: 'Basic Attack 3',
  variantName: 'Cancel With Swap',
}

// ========== Enhanced =========================================================================================================
// TODO: Is this castable after swapping? If not it should require immediate follow up always!
// TODO: Try cancel with dodge

// Default
const hiyuki_BA_3_enhanced: Action = {
  tags: ['BASIC_ATTACK', 'GLACIO_CHAFE_APPLIER'],
  name: 'Enhanced Basic Attack 3',
  displayName: 'Enhanced Basic Attack 3',
  category: 'Basics',
  castTime: 1.00, // TODO
  multiplier: values.BA3_multiplier,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: values.BA3_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: values.BA3_concerto, share: 0 },
    { energyType: 'dedication', amount: values.BA3_dedication + 100, share: 0 }
  ],
  energyCost: [],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Glacio Chafe', stackChange: 1 }],
  damageModifiers: [],
  sideEffects: [],
  coordinatedAttacks: [],
  castConditions: {
    startState: 'GROUND',
    endState: 'GROUND',    preventsSwapOut: true,    requiredForms: ['Present Self'],
    previousActions: [hiyuki_skill, hiyuki_skill_cancel_with_swap], // TODO: if this works after swapping back in, will need a way to persist the "combo"
    customCanCast(prevSnapshot) {
      const dedication = prevSnapshot?.charactersEnergies['Hiyuki']?.dedication ?? 0
      return dedication < 300
    },
  },
  hideWhenNotCastable: true,
  offtune: values.BA3_offtune,
  groupName: 'Basic Attack 3 (Enhanced)',
  variantName: 'Default',
}

// Cancel With Swap
const hiyuki_BA_3_enhanced_cancel_with_swap: Action = {
  tags: ['BASIC_ATTACK', 'GLACIO_CHAFE_APPLIER'],
  name: 'Enhanced Basic Attack 3 (swap cancel)',
  displayName: 'Enhanced Basic Attack 3 (swap cancel)',
  category: 'Basics',
  castTime: 1.00, // TODO
  multiplier: values.BA3_multiplier,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: values.BA3_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: values.BA3_concerto, share: 0 },
    { energyType: 'dedication', amount: values.BA3_dedication + 100, share: 0 }
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
    requiredForms: ['Present Self'],
    previousActions: [hiyuki_skill, hiyuki_skill_cancel_with_swap], // TODO: if this works after swapping back in, will need a way to persist the "combo"
    customCanCast(prevSnapshot) {
      const dedication = prevSnapshot?.charactersEnergies['Hiyuki']?.dedication ?? 0
      return dedication < 300
    },
  },
  hideWhenNotCastable: true,
  offtune: values.BA3_offtune,
  groupName: 'Basic Attack 3 (Enhanced)',
  variantName: 'Cancel With Swap'
}

export {
  hiyuki_BA_3,
  hiyuki_BA_3_cancel_with_swap,
  hiyuki_BA_3_enhanced,
  hiyuki_BA_3_enhanced_cancel_with_swap
}
