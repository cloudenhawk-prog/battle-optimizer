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

// TODO - define data that later can be combined into a character object (resolve gear, echoes etc into stats, actions, modifiers)
export type CharacterData = {
  name: string
  actions: Action[]
  maxEnergies: Partial<Record<EnergyType, number>>
  baseStats: Partial<CharacterStats> // TODO: make sure partial stats are handled
  inherentStats: Partial<CharacterStats>
  gear: Gear
}
