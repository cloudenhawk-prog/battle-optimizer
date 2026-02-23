import type { CharacterStats } from './stats'
import type { DamageModifier } from './modifiers'
import type { Buff, Debuff } from './buff'
import type { Action, ActionExpanded } from './action'
import type { EnergyType } from './baseTypes'
import type { Gear } from './gear'

// ========== Type: Character ==================================================================================================

export type Character = {
  name: string
  actions: Action[]
  buffs: Buff[]
  debuffs: Debuff[]
  maxEnergies: Partial<Record<EnergyType, number>>
  stats: CharacterStats
  damageModifiers: DamageModifier[]
}

export type CharacterData = {
  name: string
  actions: ActionExpanded[]
  maxEnergies: Partial<Record<EnergyType, number>>
  baseStats: Partial<CharacterStats> // TODO: make sure partial stats are handled
  inherentStats: Partial<CharacterStats>
  gear: Gear
}

export type CharacterExpanded = {
  name: string
  actions: ActionExpanded[]
  maxEnergies: Partial<Record<EnergyType, number>>
  stats: CharacterStats // Combination of base stats, inherent stats, and gear stats -> no longer partial
  damageModifiers: DamageModifier[] // Buffs, debuffs
}
