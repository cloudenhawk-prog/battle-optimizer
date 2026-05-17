import type { Action } from '../../../../../types/action'
import { s4_skill_buff } from '../../../../modifiers/hiyuki'
import * as values from '../../values'

// TODO: Try cancel with dodge
// TODO: use attemptFollowUp, MUST: TRUE if it's not possible to swap in/out quickly with persist time to chain it with BA3 enhanced

// Default
const hiyuki_skill: Action = {
  tags: ['SKILL'],
  name: 'Resonance Skill',
  displayName: 'Frostblight',
  category: 'Skills',
  castTime: values.cast_time_Skill,
  multiplier: values.skill_multiplier,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['SKILL'],
  cooldown: values.skill_cooldown,
  energyGenerated: [
    { energyType: 'energy', amount: values.skill_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: values.skill_concerto, share: 0 },
    { energyType: 'dedication', amount: values.skill_dedication, share: 0 }
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
    requiredForms: ['Present Self']
  },
  offtune: values.skill_offtune,
  groupName: 'Resonance Skill',
  variantName: 'Default',
  resolveVariant(_prevSnapshot, _characterName, owner) {
    if (owner.sequence < 4) return { ...this, resolveVariant: undefined }
    // S5: DMG Multiplier increased by 80%.
    const s5Multiplier = owner.sequence >= 5 ? 1.8 : 1
    return {
      ...this,
      multiplier: this.multiplier * s5Multiplier,
      damageModifiers: [...this.damageModifiers, s4_skill_buff],
      resolveVariant: undefined,
    }
  }
}

// Cancel With Swap
const hiyuki_skill_cancel_with_swap: Action = {
  tags: ['SKILL'],
  name: 'Resonance Skill (swap cancel)',
  displayName: 'Frostblight (swap cancel)',
  category: 'Skills',
  castTime: values.SWAP_CANCEL_TIME,
  multiplier: values.skill_multiplier,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['SKILL'],
  cooldown: values.skill_cooldown,
  energyGenerated: [
    { energyType: 'energy', amount: values.skill_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: values.skill_concerto, share: 0 },
    { energyType: 'dedication', amount: values.skill_dedication, share: 0 }
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
    persistenceTime: values.skill_persistenceTime,
    requiredForms: ['Present Self']
  },
  offtune: values.skill_offtune,
  groupName: 'Resonance Skill',
  variantName: 'Cancel With Swap',
  resolveVariant(_prevSnapshot, _characterName, owner) {
    if (owner.sequence < 4) return { ...this, resolveVariant: undefined }
    // S5: DMG Multiplier increased by 80%.
    const s5Multiplier = owner.sequence >= 5 ? 1.8 : 1
    return {
      ...this,
      multiplier: this.multiplier * s5Multiplier,
      damageModifiers: [...this.damageModifiers, s4_skill_buff],
      resolveVariant: undefined,
    }
  }
}

export {
  hiyuki_skill,
  hiyuki_skill_cancel_with_swap
}
