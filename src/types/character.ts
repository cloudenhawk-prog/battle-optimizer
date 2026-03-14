import type { CharacterStats } from './stats'
import type { DamageModifier } from './modifiers'
import type { Action } from './action'
import type { EnergyType } from './baseTypes'
import type { Gear } from './gear'
import type { Form } from './form'

// ========== Type: Character ==================================================================================================

export type Character = {
  name: string
  maxEnergies: Partial<Record<EnergyType, number>>
  actions: Action[]
  damageModifiers: DamageModifier[]
  stats: Partial<CharacterStats>
  inherentStats: Partial<CharacterStats>
  gear: Gear
  defaultForm?: string
  forms?: Form[]
  sequence: 0 | 1 | 2 | 3 | 4 | 5 | 6
}

// A Character whose stats have been fully resolved by resolveCharacter().
// Use this type throughout the runtime calculation pipeline (resolvers, calculators, hooks)
// so that character.stats is guaranteed to be a complete CharacterStats object.
export type ResolvedCharacter = Omit<Character, 'stats'> & { stats: CharacterStats }
