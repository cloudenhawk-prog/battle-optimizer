import type { DamageModifier } from './modifiers'
import type { CharacterStats } from './stats'

// ========== Type: Gear =======================================================================================================

export type Gear = {
  weapon: Weapon | null
  echoes: Echo[]
}

export type Weapon = {
  name: string
  stats: Partial<CharacterStats>
  damageModifiers: DamageModifier[]
}

export type Echo = {
  name: string
  cost: number
  baseStats: Partial<CharacterStats>
  subStats: Partial<CharacterStats>
  specialStats: Partial<CharacterStats>
}
