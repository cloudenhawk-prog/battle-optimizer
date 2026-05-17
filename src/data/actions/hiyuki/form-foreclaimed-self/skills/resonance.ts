import type { Action } from '../../../../../types/action'
import { s4_skill_buff } from '../../../../modifiers/hiyuki'
import * as values from '../../values'

// ========== Resonance 1 ======================================================================================================
const hiyuki_foreclaimed_skill_1: Action = {
  tags: ['SKILL'],
  name: 'Foreclaimed: Resonance Skill 1',
  displayName: 'Frostblight: Jade Cleave',
  category: 'Skills',
  castTime: values.cast_time_USkill1,
  multiplier: values.foreclaimed_skill_1_multiplier,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['SKILL'],
  cooldown: 12,
  maxStacks: 2,
  energyGenerated: [
    { energyType: 'energy', amount: values.foreclaimed_skill_1_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: values.foreclaimed_skill_1_concerto, share: 0 },
    { energyType: 'frostheart', amount: values.foreclaimed_skill_1_frostheart, share: 0 }
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  coordinatedAttacks: [],
  castConditions: {
    startState: 'GROUND',
    endState: 'AIR',
    preventsSwapOut: true,
    requiredForms: ['Foreclaimed Self']
  },
  offtune: values.foreclaimed_skill_1_offtune,
  groupName: 'Foreclaimed Resonance Skill',
  variantName: 'Jade Cleave',
  resolveVariant(prevSnapshot, characterName, owner) {
    // S2: Restore an additional 50 Frostheart for the next 2 casts of Jade Cleave or Petalfall.
    // Each cast consumes 1 s2_frostheart_token (max 2) to grant the bonus.
    const hasToken = owner.sequence >= 2 && (prevSnapshot?.charactersEnergies[characterName]?.s2_frostheart_token ?? 0) >= 1
    // S4: +20% DMG for all team for 30s; HEAL_PROC tag.
    const s4Active = owner.sequence >= 4
    const s4Tags = s4Active ? [...(this.tags ?? []), 'HEAL_PROC' as const] : this.tags
    const s4Modifiers = s4Active ? [...this.damageModifiers, s4_skill_buff] : this.damageModifiers
    // S5: DMG Multiplier increased by 80%.
    const s5Multiplier = owner.sequence >= 5 ? 1.8 : 1
    if (!hasToken) return { ...this, tags: s4Tags, damageModifiers: s4Modifiers, multiplier: this.multiplier * s5Multiplier, resolveVariant: undefined }
    return {
      ...this,
      tags: s4Tags,
      damageModifiers: s4Modifiers,
      multiplier: this.multiplier * s5Multiplier,
      energyGenerated: [
        ...this.energyGenerated,
        { energyType: 'frostheart' as const, amount: 50, share: 0 },
      ],
      energyCost: [
        ...this.energyCost,
        { energyType: 's2_frostheart_token' as const, amount: 1 },
      ],
      resolveVariant: undefined,
    }
  }
}

const hiyuki_foreclaimed_skill_1_cancel_with_swap: Action = {
  tags: ['SKILL'],
  name: 'Foreclaimed: Resonance Skill 1 (swap cancel)',
  displayName: 'Frostblight: Jade Cleave (swap cancel)',
  category: 'Skills',
  castTime: values.SWAP_CANCEL_TIME,
  multiplier: values.foreclaimed_skill_1_multiplier,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['SKILL'],
  cooldown: 12,
  maxStacks: 2,
  energyGenerated: [
    { energyType: 'energy', amount: values.foreclaimed_skill_1_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: values.foreclaimed_skill_1_concerto, share: 0 },
    { energyType: 'frostheart', amount: values.foreclaimed_skill_1_frostheart, share: 0 }
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  coordinatedAttacks: [],
  castConditions: {
    startState: 'GROUND',
    swapOutState: 'GROUND',
    endState: 'AIR',
    requiresSwapOut: true,
    persistenceTime: 1000, // TODO
    requiredForms: ['Foreclaimed Self']
  },
  offtune: values.foreclaimed_skill_1_offtune,
  groupName: 'Foreclaimed Resonance Skill',
  variantName: 'Jade Cleave (swap cancel)',
  resolveVariant(prevSnapshot, characterName, owner) {
    // S2: Restore an additional 50 Frostheart for the next 2 casts of Jade Cleave or Petalfall.
    // Each cast consumes 1 s2_frostheart_token (max 2) to grant the bonus.
    const hasToken = owner.sequence >= 2 && (prevSnapshot?.charactersEnergies[characterName]?.s2_frostheart_token ?? 0) >= 1
    // S4: +20% DMG for all team for 30s; HEAL_PROC tag.
    const s4Active = owner.sequence >= 4
    const s4Tags = s4Active ? [...(this.tags ?? []), 'HEAL_PROC' as const] : this.tags
    const s4Modifiers = s4Active ? [...this.damageModifiers, s4_skill_buff] : this.damageModifiers
    // S5: DMG Multiplier increased by 80%.
    const s5Multiplier = owner.sequence >= 5 ? 1.8 : 1
    if (!hasToken) return { ...this, tags: s4Tags, damageModifiers: s4Modifiers, multiplier: this.multiplier * s5Multiplier, resolveVariant: undefined }
    return {
      ...this,
      tags: s4Tags,
      damageModifiers: s4Modifiers,
      multiplier: this.multiplier * s5Multiplier,
      energyGenerated: [
        ...this.energyGenerated,
        { energyType: 'frostheart' as const, amount: 50, share: 0 },
      ],
      energyCost: [
        ...this.energyCost,
        { energyType: 's2_frostheart_token' as const, amount: 1 },
      ],
      resolveVariant: undefined,
    }
  }
}

// ========== Foreclaimed Self: Resonance Skill 2 ==============================================================================

const hiyuki_foreclaimed_skill_2: Action = {
  tags: ['SKILL'],
  name: 'Foreclaimed: Resonance Skill 2',
  displayName: 'Frostblight: Petalfall',
  category: 'Skills',
  castTime: values.cast_time_USkill2,
  multiplier: values.foreclaimed_skill_2_multiplier,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['SKILL'],
  cooldown: 12,
  maxStacks: 2,
  energyGenerated: [
    { energyType: 'energy', amount: values.foreclaimed_skill_2_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: values.foreclaimed_skill_2_concerto, share: 0 },
    { energyType: 'frostheart', amount: values.foreclaimed_skill_2_frostheart, share: 0 }
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  coordinatedAttacks: [],
  castConditions: {
    startState: 'AIR',
    endState: 'GROUND',
    preventsSwapOut: true,
    requiredForms: ['Foreclaimed Self']
  },
  offtune: values.foreclaimed_skill_2_offtune,
  groupName: 'Foreclaimed Resonance Skill',
  variantName: 'Petalfall',
  resolveVariant(prevSnapshot, characterName, owner) {
    // S2: Restore an additional 50 Frostheart for the next 2 casts of Jade Cleave or Petalfall.
    // Each cast consumes 1 s2_frostheart_token (max 2) to grant the bonus.
    const hasToken = owner.sequence >= 2 && (prevSnapshot?.charactersEnergies[characterName]?.s2_frostheart_token ?? 0) >= 1
    // S4: +20% DMG for all team for 30s; HEAL_PROC tag.
    const s4Active = owner.sequence >= 4
    const s4Tags = s4Active ? [...(this.tags ?? []), 'HEAL_PROC' as const] : this.tags
    const s4Modifiers = s4Active ? [...this.damageModifiers, s4_skill_buff] : this.damageModifiers
    // S5: DMG Multiplier increased by 80%.
    const s5Multiplier = owner.sequence >= 5 ? 1.8 : 1
    if (!hasToken) return { ...this, tags: s4Tags, damageModifiers: s4Modifiers, multiplier: this.multiplier * s5Multiplier, resolveVariant: undefined }
    return {
      ...this,
      tags: s4Tags,
      damageModifiers: s4Modifiers,
      multiplier: this.multiplier * s5Multiplier,
      energyGenerated: [
        ...this.energyGenerated,
        { energyType: 'frostheart' as const, amount: 50, share: 0 },
      ],
      energyCost: [
        ...this.energyCost,
        { energyType: 's2_frostheart_token' as const, amount: 1 },
      ],
      resolveVariant: undefined,
    }
  },
}

const hiyuki_foreclaimed_skill_2_cancel_with_swap: Action = {
  tags: ['SKILL'],
  name: 'Foreclaimed: Resonance Skill 2 (swap cancel)',
  displayName: 'Frostblight: Petalfall (swap cancel)',
  category: 'Skills',
  castTime: values.SWAP_CANCEL_TIME,
  multiplier: values.foreclaimed_skill_2_multiplier,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['SKILL'],
  cooldown: 12,
  maxStacks: 2,
  energyGenerated: [
    { energyType: 'energy', amount: values.foreclaimed_skill_2_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: values.foreclaimed_skill_2_concerto, share: 0 },
    { energyType: 'frostheart', amount: values.foreclaimed_skill_2_frostheart, share: 0 }
  ],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  coordinatedAttacks: [],
  castConditions: {
    startState: 'AIR',
    swapOutState: 'AIR',
    endState: 'GROUND',
    requiresSwapOut: true,
    persistenceTime: 1000, // TODO
    requiredForms: ['Foreclaimed Self']
  },
  offtune: values.foreclaimed_skill_2_offtune,
  groupName: 'Foreclaimed Resonance Skill',
  variantName: 'Petalfall (swap cancel)',
  resolveVariant(prevSnapshot, characterName, owner) {
    // S2: Restore an additional 50 Frostheart for the next 2 casts of Jade Cleave or Petalfall.
    // Each cast consumes 1 s2_frostheart_token (max 2) to grant the bonus.
    const hasToken = owner.sequence >= 2 && (prevSnapshot?.charactersEnergies[characterName]?.s2_frostheart_token ?? 0) >= 1
    // S4: +20% DMG for all team for 30s; HEAL_PROC tag.
    const s4Active = owner.sequence >= 4
    const s4Tags = s4Active ? [...(this.tags ?? []), 'HEAL_PROC' as const] : this.tags
    const s4Modifiers = s4Active ? [...this.damageModifiers, s4_skill_buff] : this.damageModifiers
    // S5: DMG Multiplier increased by 80%.
    const s5Multiplier = owner.sequence >= 5 ? 1.8 : 1
    if (!hasToken) return { ...this, tags: s4Tags, damageModifiers: s4Modifiers, multiplier: this.multiplier * s5Multiplier, resolveVariant: undefined }
    return {
      ...this,
      tags: s4Tags,
      damageModifiers: s4Modifiers,
      multiplier: this.multiplier * s5Multiplier,
      energyGenerated: [
        ...this.energyGenerated,
        { energyType: 'frostheart' as const, amount: 50, share: 0 },
      ],
      energyCost: [
        ...this.energyCost,
        { energyType: 's2_frostheart_token' as const, amount: 1 },
      ],
      resolveVariant: undefined,
    }
  },
}

export {
  hiyuki_foreclaimed_skill_1,
  hiyuki_foreclaimed_skill_1_cancel_with_swap,
  hiyuki_foreclaimed_skill_2,
  hiyuki_foreclaimed_skill_2_cancel_with_swap
}
