import type { EnergyType } from '../../types/baseTypes'
import type { DamageModifier } from '../../types/modifiers'
import type { CharacterStats } from '../../types/stats'
import type { Action } from '../actions/cartethyia'
import { baseStats, inherentStats } from '../stats/cartethyia'

type Gear = {
  weapon: Weapon | null
  echoes: Echo[]
}

type Weapon = {
  name: string
  stats: Partial<CharacterStats>
  damageModifiers: DamageModifier[]
}

type Echo = {
  name: string
  cost: number
  baseStats: Partial<CharacterStats>
  subStats: Partial<CharacterStats>
  specialStats: Partial<CharacterStats>
}

type CharacterData = {
    name: string
    actions: Action[]
    maxEnergies: Partial<Record<EnergyType, number>>
    baseStats: Partial<CharacterStats>
    inherentStats: Partial<CharacterStats>
    gear: Gear
}

export const cartethyia: CharacterData = {
  name: 'Cartethyia',
  actions: [],
  maxEnergies: { },
  baseStats: baseStats,
  inherentStats: inherentStats,
  gear: {
    weapon: null,
    echoes: [],
  }
}
