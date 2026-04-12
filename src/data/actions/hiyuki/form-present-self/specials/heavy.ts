import type { Action } from '../../../../../types/action'
import * as values from '../../values'

// Default
const hiyuki_heavy_attack_enhanced: Action = {
  tags: ['HEAVY_ATTACK', 'GLACIO_CHAFE_APPLIER'],
  name: 'Enhanced Heavy Attack',
  displayName: 'Frost Splinter: Present Self',
  category: 'Basics',
  castTime: 1.00, // TODO
  multiplier: values.enhanced_heavy_multiplier,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['LIBERATION'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: values.enhanced_heavy_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: values.enhanced_heavy_concerto, share: 0 },
    { energyType: 'foreclaiming', amount: values.enhanced_heavy_foreclaiming, share: 0 }
  ],
  energyCost: [
    { energyType: 'dedication', amount: values.enhanced_heavy_cost_dedication }
  ],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Glacio Chafe', stackChange: values.enhanced_heavy_glacio_chafe_stacks }],
  damageModifiers: [],
  sideEffects: [],
  coordinatedAttacks: [],
  castConditions: {
    startState: 'GROUND',
    endState: 'GROUND',
    preventsSwapOut: true,
    requiredForms: ['Present Self']
  },
  offtune: values.enhanced_heavy_offtune,
  groupName: 'Enhanced Heavy Attack',
  variantName: 'Default',
  resolveVariant(_prevSnapshot, _characterName, owner) {
    // S3: DMG Multiplier of Frost Splinter: Present Self is increased by 160%.
    if (owner.sequence < 3) return { ...this, resolveVariant: undefined }
    return { ...this, multiplier: this.multiplier * 2.6, resolveVariant: undefined }
  }
}

// Cancel With Swap
const hiyuki_heavy_attack_enhanced_cancel_with_swap: Action = {
  tags: ['HEAVY_ATTACK', 'GLACIO_CHAFE_APPLIER'],
  name: 'Enhanced Heavy Attack (swap cancel)',
  displayName: 'Frost Splinter: Present Self (Swap Cancel)',
  category: 'Basics',
  castTime: 1.00, // TODO
  multiplier: values.enhanced_heavy_multiplier,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['LIBERATION'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: values.enhanced_heavy_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: values.enhanced_heavy_concerto, share: 0 },
    { energyType: 'foreclaiming', amount: values.enhanced_heavy_foreclaiming, share: 0 }
  ],
  energyCost: [
    { energyType: 'dedication', amount: values.enhanced_heavy_cost_dedication }
  ],
  statusModifications: [{ type: 'negativeStatus', targetName: 'Glacio Chafe', stackChange: values.enhanced_heavy_glacio_chafe_stacks }],
  damageModifiers: [],
  sideEffects: [],
  coordinatedAttacks: [],
  castConditions: {
    startState: 'GROUND',
    swapOutState: 'GROUND',
    endState: 'GROUND',
    requiresSwapOut: true,
    persistenceTime: values.enhanced_heavy_persistence_time,
    requiredForms: ['Present Self']
  },
  offtune: values.enhanced_heavy_offtune,
  groupName: 'Enhanced Heavy Attack',
  variantName: 'Cancel With Swap',
  resolveVariant(_prevSnapshot, _characterName, owner) {
    // S3: DMG Multiplier of Frost Splinter: Present Self is increased by 160%.
    if (owner.sequence < 3) return { ...this, resolveVariant: undefined }
    return { ...this, multiplier: this.multiplier * 2.6, resolveVariant: undefined }
  }
}

export {
  hiyuki_heavy_attack_enhanced,
  hiyuki_heavy_attack_enhanced_cancel_with_swap,
}