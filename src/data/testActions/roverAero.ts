import type { Action } from '../../types/action'

// ========== Test Actions for Form System Demo ===============================================================================
// These actions demonstrate form-specific casting restrictions and form switching

/**
 * Skill that can ONLY be cast in Base form
 * Demonstrates requiredForms cast condition
 */
export const roverAero_test_base_only_skill: Action = {
  name: 'Base Form Exclusive Skill',
  displayName: 'Base Form Exclusive Skill',
  category: 'Testing',
  castTime: 1.0,
  multiplier: 1.0,
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['SKILL'],
  cooldown: 5,
  energyGenerated: [
    { energyType: 'energy', amount: 5, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 5, share: 0 },
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'GROUND',
    endState: 'GROUND',
    requiredForms: ['Base'], // Can ONLY be cast in Base form
  },
  offtune: 0.5,
  toolTip: 'Can only be cast in Base form',
}

/**
 * Skill that can ONLY be cast in TEST FORM
 * Demonstrates requiredForms cast condition
 */
export const roverAero_test_form_only_skill: Action = {
  name: 'Test Form Exclusive Skill',
  displayName: 'Test Form Exclusive Skill',
  category: 'Testing',
  castTime: 1.2,
  multiplier: 1.5,
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['SKILL'],
  cooldown: 8,
  energyGenerated: [
    { energyType: 'energy', amount: 8, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 8, share: 0 },
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'GROUND',
    endState: 'GROUND',
    requiredForms: ['TEST FORM'], // Can ONLY be cast in TEST FORM
  },
  offtune: 0.6,
  toolTip: 'Can only be cast in Test Form',
}

/**
 * Transform action: Base -> TEST FORM
 * Changes character's form and has cooldown
 */
export const roverAero_test_transform_to_test: Action = {
  name: 'Transform to Test Form',
  displayName: 'Transform to Test Form',
  category: 'Testing',
  castTime: 0.5,
  multiplier: 0,
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['SKILL'],
  cooldown: 15,
  energyGenerated: [],
  energyCost: [{ energyType: 'energy', amount: 20 }], // Costs energy to transform
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'GROUND',
    endState: 'GROUND',
    requiredForms: ['Base'], // Can only transform FROM Base form
  },
  offtune: 0,
  formChange: 'TEST FORM', // Changes to TEST FORM
  toolTip: 'Transform from Base to Test Form (costs 20 energy, 15s cooldown)',
}

/**
 * Transform action: TEST FORM -> Base
 * Free transformation back to Base form
 */
export const roverAero_test_transform_to_base: Action = {
  name: 'Transform to Base Form',
  displayName: 'Transform to Base Form',
  category: 'Testing',
  castTime: 0.3,
  multiplier: 0,
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['SKILL'],
  cooldown: 3, // Short cooldown to return to Base
  energyGenerated: [],
  energyCost: [], // Free transformation back
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'GROUND',
    endState: 'GROUND',
    requiredForms: ['TEST FORM'], // Can only transform FROM TEST FORM
  },
  offtune: 0,
  formChange: 'Base', // Changes back to Base form
  toolTip: 'Transform from Test Form back to Base (free, 3s cooldown)',
}

/**
 * Universal skill - can be cast in ANY form
 * No requiredForms = available in all forms
 */
export const roverAero_test_universal_skill: Action = {
  name: 'Universal Skill',
  displayName: 'Universal Skill',
  category: 'Testing',
  castTime: 0.8,
  multiplier: 1.2,
  scaling: 'ATK',
  elements: ['AERO'],
  dmgTypes: ['SKILL'],
  cooldown: 6,
  energyGenerated: [
    { energyType: 'energy', amount: 6, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: 6, share: 0 },
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'GROUND',
    endState: 'GROUND',
    // No requiredForms = can be cast in ANY form
  },
  offtune: 0.4,
  toolTip: 'Can be cast in any form (no form restriction)',
}
