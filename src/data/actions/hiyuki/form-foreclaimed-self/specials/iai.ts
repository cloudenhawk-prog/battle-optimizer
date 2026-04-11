
import type { Action } from "../../../../../types/action"
import * as values from "../../values"
import { hiyuki_foreclaimed_BA_1_5, hiyuki_foreclaimed_BA_1_5_cancel_with_swap } from "../basics/BA1"
import { hiyuki_foreclaimed_BA_2_5, hiyuki_foreclaimed_BA_2_5_cancel_with_swap } from "../basics/BA2"
import { hiyuki_foreclaimed_BA_3_5, hiyuki_foreclaimed_BA_3_5_cancel_with_swap } from "../basics/BA3"
import { hiyuki_foreclaimed_BA_4_5, hiyuki_foreclaimed_BA_4_5_cancel_with_swap } from "../basics/BA4"
import { hiyuki_foreclaimed_BA_5, hiyuki_foreclaimed_BA_5_cancel_with_swap } from "../basics/BA5"
import { hiyuki_foreclaimed_midair_1_3, hiyuki_foreclaimed_midair_1_3_cancel_with_swap } from "../basics/MA1"
import { hiyuki_foreclaimed_midair_2_3, hiyuki_foreclaimed_midair_2_3_cancel_with_swap } from "../basics/MA2"
import { hiyuki_foreclaimed_midair_3, hiyuki_foreclaimed_midair_3_cancel_with_swap } from "../basics/MA3"
import { hiyuki_foreclaimed_skill_1, hiyuki_foreclaimed_skill_1_cancel_with_swap, hiyuki_foreclaimed_skill_2, hiyuki_foreclaimed_skill_2_cancel_with_swap } from "../skills/resonance"

// Default
const hiyuki_foreclaimed_iai: Action = {
  name: 'Foreclaimed: Iai',
  displayName: 'Iai',
  category: 'Skills',
  castTime: 0.625,
  multiplier: values.foreclaimed_iai_multiplier,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['LIBERATION'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: values.foreclaimed_iai_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: values.foreclaimed_iai_concerto, share: 0 }
  ],
  energyCost: [
    { energyType: 'frostheart', amount: 100 }
  ],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  coordinatedAttacks: [],
  castConditions: {
    startState: 'GROUND',
    endState: 'GROUND',
    requiredForms: ['Foreclaimed Self'],
    previousActions: [ // TODO Uncertain
      { name: 'Foreclaimed: Iai' } as Action,
      hiyuki_foreclaimed_BA_1_5,
      hiyuki_foreclaimed_BA_1_5_cancel_with_swap,
      hiyuki_foreclaimed_BA_2_5,
      hiyuki_foreclaimed_BA_2_5_cancel_with_swap,
      hiyuki_foreclaimed_BA_3_5,
      hiyuki_foreclaimed_BA_3_5_cancel_with_swap,
      hiyuki_foreclaimed_BA_4_5,
      hiyuki_foreclaimed_BA_4_5_cancel_with_swap,
      hiyuki_foreclaimed_BA_5,
      hiyuki_foreclaimed_BA_5_cancel_with_swap,
      hiyuki_foreclaimed_midair_1_3,
      hiyuki_foreclaimed_midair_1_3_cancel_with_swap,
      hiyuki_foreclaimed_midair_2_3,
      hiyuki_foreclaimed_midair_2_3_cancel_with_swap,
      hiyuki_foreclaimed_midair_3,
      hiyuki_foreclaimed_midair_3_cancel_with_swap,
      hiyuki_foreclaimed_skill_1,
      hiyuki_foreclaimed_skill_1_cancel_with_swap,
      hiyuki_foreclaimed_skill_2,
      hiyuki_foreclaimed_skill_2_cancel_with_swap
    ]
  },
  offtune: values.foreclaimed_iai_offtune,
  groupName: 'Foreclaimed: Iai',
  variantName: 'Default',
  resolveVariant(prevSnapshot, characterName, owner) {
    const energies = prevSnapshot?.charactersEnergies[characterName]
    const frosthardenIai = energies?.frostharden_iai ?? 0
    // S2: Iai's DMG Multiplier is increased by 140%.
    const s2Multiplier = owner.sequence >= 2 ? 2.4 : 1

    if (frosthardenIai > 0) {
      return {
        ...this,
        tags: ['GLACIO_CHAFE_APPLIER'],
        multiplier: this.multiplier * s2Multiplier,
        energyGenerated: [
          ...this.energyGenerated.map(e => ({ ...e, amount: e.amount })),
          { energyType: 'whiteout_bitterfrost' as const, amount: 1, share: 0 },
        ],
        energyCost: [
          ...this.energyCost,
          { energyType: 'frostharden_iai' as const, amount: 1 },
        ],
        statusModifications: [
          ...this.statusModifications,
          { type: 'negativeStatus' as const, targetName: 'Glacio Chafe', stackChange: 3 },
        ],
        offtune: this.offtune * 2,
        resolveVariant: undefined,
      }
    }
    return { ...this, multiplier: this.multiplier * s2Multiplier, resolveVariant: undefined }
  }
}

// Cancel With Swap
const hiyuki_foreclaimed_iai_cancel_with_swap: Action = {
  name: 'Foreclaimed: Iai (swap cancel)',
  displayName: 'Iai (swap cancel)',
  category: 'Skills',
  castTime: 0.625,
  multiplier: values.foreclaimed_iai_multiplier,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['LIBERATION'],
  cooldown: 0,
  energyGenerated: [
    { energyType: 'energy', amount: values.foreclaimed_iai_energy, share: 0.5, scalingStat: 'energyPercent' },
    { energyType: 'concerto', amount: values.foreclaimed_iai_concerto, share: 0 }
  ],
  energyCost: [
    { energyType: 'frostheart', amount: 100 }
  ],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  coordinatedAttacks: [],
  castConditions: {
    startState: 'GROUND',
    swapOutState: 'GROUND',
    endState: 'GROUND',
    requiresSwapOut: true,
    persistenceTime: 1000, // TODO
    requiredForms: ['Foreclaimed Self'],
    previousActions: [ // TODO Uncertain
      { name: 'Foreclaimed: Iai' } as Action,
      hiyuki_foreclaimed_BA_1_5,
      hiyuki_foreclaimed_BA_1_5_cancel_with_swap,
      hiyuki_foreclaimed_BA_2_5,
      hiyuki_foreclaimed_BA_2_5_cancel_with_swap,
      hiyuki_foreclaimed_BA_3_5,
      hiyuki_foreclaimed_BA_3_5_cancel_with_swap,
      hiyuki_foreclaimed_BA_4_5,
      hiyuki_foreclaimed_BA_4_5_cancel_with_swap,
      hiyuki_foreclaimed_BA_5,
      hiyuki_foreclaimed_BA_5_cancel_with_swap,
      hiyuki_foreclaimed_midair_1_3,
      hiyuki_foreclaimed_midair_1_3_cancel_with_swap,
      hiyuki_foreclaimed_midair_2_3,
      hiyuki_foreclaimed_midair_2_3_cancel_with_swap,
      hiyuki_foreclaimed_midair_3,
      hiyuki_foreclaimed_midair_3_cancel_with_swap,
      hiyuki_foreclaimed_skill_1,
      hiyuki_foreclaimed_skill_1_cancel_with_swap,
      hiyuki_foreclaimed_skill_2,
      hiyuki_foreclaimed_skill_2_cancel_with_swap
    ]
  },
  offtune: values.foreclaimed_iai_offtune,
  groupName: 'Foreclaimed: Iai',
  variantName: 'Cancel With Swap',
  resolveVariant(prevSnapshot, characterName, owner) {
    const energies = prevSnapshot?.charactersEnergies[characterName]
    const frosthardenIai = energies?.frostharden_iai ?? 0
    // S2: Iai's DMG Multiplier is increased by 140%.
    const s2Multiplier = owner.sequence >= 2 ? 2.4 : 1

    if (frosthardenIai > 0) {
      return {
        ...this,
        tags: ['GLACIO_CHAFE_APPLIER'],
        multiplier: this.multiplier * s2Multiplier,
        energyGenerated: [
          ...this.energyGenerated.map(e => ({ ...e, amount: e.amount })),
          { energyType: 'whiteout_bitterfrost' as const, amount: 1, share: 0 },
        ],
        energyCost: [
          ...this.energyCost,
          { energyType: 'frostharden_iai' as const, amount: 1 },
        ],
        statusModifications: [
          ...this.statusModifications,
          { type: 'negativeStatus' as const, targetName: 'Glacio Chafe', stackChange: 3 },
        ],
        offtune: this.offtune * 2,
        resolveVariant: undefined,
      }
    }
    return { ...this, multiplier: this.multiplier * s2Multiplier, resolveVariant: undefined }
  }
}

export {
  hiyuki_foreclaimed_iai,
  hiyuki_foreclaimed_iai_cancel_with_swap
}