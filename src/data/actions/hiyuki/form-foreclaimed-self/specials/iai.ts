
import type { Action } from '../../../../../types/action'
import * as values from '../../values'


// Default
const hiyuki_foreclaimed_iai: Action = {
  name: 'Foreclaimed: Iai',
  displayName: 'Iai',
  category: 'Skills',
  castTime: values.cast_time_UHA,
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
  },
  comboChainTags: ['Iai Stance Setup'],
  restrictNextTo(prevSnapshot, characterName) {
    const currentFrostheart = prevSnapshot?.charactersEnergies[characterName]?.frostheart ?? 0
    const frostAfterCast = currentFrostheart - 100 // Iai costs 100 frostheart
    return frostAfterCast >= 100 ? ['Foreclaimed: Iai'] : undefined
  },
  offtune: values.foreclaimed_iai_offtune,
  groupName: 'Foreclaimed: Iai',
  variantName: 'Default',
  resolveVariant(prevSnapshot, characterName, owner) {
    const energies = prevSnapshot?.charactersEnergies[characterName]
    const frosthardenIai = energies?.frostharden_iai ?? 0
    // S2: Iai's DMG Multiplier is increased by 125%.
    const s2Multiplier = owner.sequence >= 2 ? 2.25 : 1
    // Cast time is normal if the previous action was a "setup" (dash cancel or Iai).
    // Otherwise, add stance setup time.
    const prevComboTags = prevSnapshot?.charactersComboChainTags?.[characterName] ?? []
    const castTime = prevComboTags.includes('Iai Stance Setup')
      ? values.cast_time_UHA
      : values.cast_time_UHA + values.cast_time_UHA_stance_setup

    if (frosthardenIai > 0) {
      return {
        ...this,
        castTime,
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
          { type: 'negativeStatus' as const, targetName: 'Glacio Chafe', stackChange: 3, applicationCount: 3 },
        ],
        offtune: this.offtune * 2,
        resolveVariant: undefined,
      }
    }
    return { ...this, castTime, multiplier: this.multiplier * s2Multiplier, resolveVariant: undefined }
  }
}

// Cancel With Swap
const hiyuki_foreclaimed_iai_cancel_with_swap: Action = {
  name: 'Foreclaimed: Iai (swap cancel)',
  displayName: 'Iai (swap cancel)',
  category: 'Skills',
  castTime: values.SWAP_CANCEL_TIME,
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
  },
  comboChainTags: ['Iai Stance Setup'],
  offtune: values.foreclaimed_iai_offtune,
  groupName: 'Foreclaimed: Iai',
  variantName: 'Cancel With Swap',
  resolveVariant(prevSnapshot, characterName, owner) {
    const energies = prevSnapshot?.charactersEnergies[characterName]
    const frosthardenIai = energies?.frostharden_iai ?? 0
    // S2: Iai's DMG Multiplier is increased by 125%.
    const s2Multiplier = owner.sequence >= 2 ? 2.25 : 1
    // Cast time is normal if the previous action was a "setup" (dash cancel or Iai).
    // Otherwise, add stance setup time.
    const prevComboTags = prevSnapshot?.charactersComboChainTags?.[characterName] ?? []
    const castTime = prevComboTags.includes('Iai Stance Setup')
      ? values.SWAP_CANCEL_TIME
      : values.SWAP_CANCEL_TIME + values.cast_time_UHA_stance_setup

    if (frosthardenIai > 0) {
      return {
        ...this,
        castTime,
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
    return { ...this, castTime, multiplier: this.multiplier * s2Multiplier, resolveVariant: undefined }
  }
}

export {
  hiyuki_foreclaimed_iai,
  hiyuki_foreclaimed_iai_cancel_with_swap
}