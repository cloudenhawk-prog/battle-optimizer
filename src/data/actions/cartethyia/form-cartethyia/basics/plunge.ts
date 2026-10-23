// Cartethyia — Cartethyia form: Plunge Attack, resolved by the number of Sword Shadows (forte_*) held.
import type { Action } from '../../../../../types/action'
import { cartethyia_plunge_1, cartethyia_plunge_2, cartethyiaPlunge_3 } from './plungeVariants'

// ========== Plunge Attack ====================================================================================================
export const cartethyia_plunge: Action = {
  // TODO: If the sub actions aren't necessary in full, could simply define the rows we need to update (multipliers & offtune & substring to append to name...?)
  tags: ['BASIC_ATTACK'],
  name: 'Plunge Attack',
  displayName: 'Plunge Attack',
  category: 'Basics',
  castTime: 1.0, // TODO : Cast Time
  multiplier: 0,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'AIR',
    endState: 'GROUND',
  },
  offtune: 0,
  groupName: 'Plunge Attack',
  variantName: 'Default',
  // Each held Sword Shadow type (divinity / discord / virtue) counts once: 1 / 2 / 3 held picks the matching
  // internal variant (0 held = 1-sword variant, free). All held swords are consumed, each granting its Mandate
  // buff, and the Resonance Skill cooldown drops by 1s per sword. Timing/conditions stay those of this wrapper.
  resolveVariant(prevSnapshot, characterName) {
    const energies = prevSnapshot?.charactersEnergies[characterName]
    const divinity = (energies?.forte_divinity ?? 0) > 0 ? 1 : 0
    const discord = (energies?.forte_discord ?? 0) > 0 ? 1 : 0
    const virtue = (energies?.forte_virtue ?? 0) > 0 ? 1 : 0
    const total = divinity + discord + virtue
    const base = total >= 3 ? cartethyiaPlunge_3 : total >= 2 ? cartethyia_plunge_2 : total >= 1 ? cartethyia_plunge_1 : { ...cartethyia_plunge_1, energyCost: [] }
    const energyCost: Action['energyCost'] = []
    if (energies?.forte_divinity) energyCost.push({ energyType: 'forte_divinity', amount: 1, grantsOnConsume: ['Mandate of Divinity'] })
    if (energies?.forte_discord) energyCost.push({ energyType: 'forte_discord', amount: 1, grantsOnConsume: ['Power of Discord'] })
    if (energies?.forte_virtue) energyCost.push({ energyType: 'forte_virtue', amount: 1, grantsOnConsume: ['Heart of Virtue'] })
    return {
      ...base,
      energyCost,
      cooldownReductions: total > 0 ? [{ targetActionKey: 'Resonance Skill', amount: total }] : undefined,
      name: this.name,
      groupName: this.groupName,
      variantName: this.variantName,
      castTime: this.castTime,
      castConditions: this.castConditions,
      cooldown: this.cooldown,
      offtune: this.offtune,
    }
  },
}

export const cartethyia_plunge_cancel_with_swap: Action = {
  tags: ['BASIC_ATTACK'],
  name: 'Plunge Attack (swap cancel)',
  displayName: 'Plunge Attack (swap cancel)',
  category: 'Basics',
  castTime: 0.33, // TODO : Cast Time
  multiplier: 0,
  scaling: 'HP',
  elements: ['AERO'],
  dmgTypes: ['BASIC'],
  cooldown: 0,
  energyGenerated: [],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: {
    startState: 'AIR',
    swapOutState: 'AIR', // TODO : Double Check
    endState: 'GROUND',
    requiresSwapOut: true,
    persistenceTime: 100, // TODO : Persistence Time
  },
  offtune: 0,
  groupName: 'Plunge Attack',
  variantName: 'Cancel With Swap',
  // Each held Sword Shadow type (divinity / discord / virtue) counts once: 1 / 2 / 3 held picks the matching
  // internal variant (0 held = 1-sword variant, free). All held swords are consumed, each granting its Mandate
  // buff, and the Resonance Skill cooldown drops by 1s per sword. Timing/conditions stay those of this wrapper.
  resolveVariant(prevSnapshot, characterName) {
    const energies = prevSnapshot?.charactersEnergies[characterName]
    const divinity = (energies?.forte_divinity ?? 0) > 0 ? 1 : 0
    const discord = (energies?.forte_discord ?? 0) > 0 ? 1 : 0
    const virtue = (energies?.forte_virtue ?? 0) > 0 ? 1 : 0
    const total = divinity + discord + virtue
    const base = total >= 3 ? cartethyiaPlunge_3 : total >= 2 ? cartethyia_plunge_2 : total >= 1 ? cartethyia_plunge_1 : { ...cartethyia_plunge_1, energyCost: [] }
    const energyCost: Action['energyCost'] = []
    if (energies?.forte_divinity) energyCost.push({ energyType: 'forte_divinity', amount: 1, grantsOnConsume: ['Mandate of Divinity'] })
    if (energies?.forte_discord) energyCost.push({ energyType: 'forte_discord', amount: 1, grantsOnConsume: ['Power of Discord'] })
    if (energies?.forte_virtue) energyCost.push({ energyType: 'forte_virtue', amount: 1, grantsOnConsume: ['Heart of Virtue'] })
    return {
      ...base,
      energyCost,
      cooldownReductions: total > 0 ? [{ targetActionKey: 'Resonance Skill', amount: total }] : undefined,
      name: this.name,
      displayName: `${base.displayName} (swap cancel)`,
      groupName: this.groupName,
      variantName: this.variantName,
      castTime: this.castTime,
      castConditions: this.castConditions,
      cooldown: this.cooldown,
      offtune: this.offtune,
    }
  },
}
