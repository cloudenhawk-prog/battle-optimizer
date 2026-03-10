import type { CharacterStats } from './stats'
import type { DamageModifier } from './modifiers'
import type { Action } from './action'
import type { EnergyType } from './baseTypes'
import type { Gear } from './gear'
import type { Form } from './form'

// ========== Type: Character ==================================================================================================

export type Character = {
  name: string
  actions: Action[]
  maxEnergies: Partial<Record<EnergyType, number>>
  stats: CharacterStats
  damageModifiers: DamageModifier[]
  /** Forms available to this character. If undefined/empty, character has no forms.
   *  One form should be marked as isDefault: true, otherwise the first form is used as default. */
  forms?: Form[]
}

export type CharacterData = {
  name: string
  actions: Action[]
  maxEnergies: Partial<Record<EnergyType, number>>
  baseStats: Partial<CharacterStats>
  inherentStats: Partial<CharacterStats>
  gear: Gear
}
