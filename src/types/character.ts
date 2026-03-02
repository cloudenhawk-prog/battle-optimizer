import type { CharacterStats } from './stats'
import type { DamageModifier } from './modifiers'
import type { Action } from './action'
import type { EnergyType } from './baseTypes'
import type { Gear } from './gear'

// ========== Type: Character ==================================================================================================

export type Character = {
  name: string
  actions: Action[]
  maxEnergies: Partial<Record<EnergyType, number>>
  stats: CharacterStats
  damageModifiers: DamageModifier[]
}

export type CharacterData = {
  name: string
  actions: Action[]
  maxEnergies: Partial<Record<EnergyType, number>>
  baseStats: Partial<CharacterStats>
  inherentStats: Partial<CharacterStats>
  gear: Gear
}
