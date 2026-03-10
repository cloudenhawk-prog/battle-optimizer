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
  stats: CharacterStats
  inherentStats: Partial<CharacterStats>
  gear: Gear
  forms?: Form[]
}
