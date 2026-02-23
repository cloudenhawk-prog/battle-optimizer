import type { ActionExpanded } from '../../types/action'
import type { EnergyType } from '../../types/baseTypes'
import type { DamageModifier } from '../../types/modifiers'
import type { CharacterStats } from '../../types/stats'
import { baseStats, inherentStats } from '../stats/yangyang'

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
  specialStats: Partial<CharacterStats> // TODO: 4 cost echoes equipped in main slot can have special stats - only 1 per character (consider how to implement this)
}

type CharacterData = {
  name: string
  actions: ActionExpanded[]
  maxEnergies: Partial<Record<EnergyType, number>>
  baseStats: Partial<CharacterStats> // TODO: make sure partial stats are handled
  inherentStats: Partial<CharacterStats>
  gear: Gear
}

export const yangyang: CharacterData = {
  name: 'Yangyang', // Can include 'display name' later if desired
  actions: [], // Can apply status modifications (give them types like buffs/debuffs - and also passive: permanent, timed, other types)
  maxEnergies: { energy: 100, concerto: 100, forte: 3 }, // Can be grabbed from liberation cost later
  baseStats: baseStats,
  inherentStats: inherentStats,
  gear: {
    weapon: null, // Equip weapon
    echoes: [],
  },
}

// TODO: define eapons, echoes
// TODO: the defined characters should use character data, like 'cartehyia: Character = someConvertFunction(characterData: CharacterData)'
// This function should use util function to add stats together / aggregate stats (make sure it works with partial stat objects)

// TODO NEXT: Fix the buff/debuff/damage modifier issue -> We need everything to be handled consistently. Some may be:
// Conditional apply / Universal
// Time-based / Permanent / Next N swaps Character(s) - for example self + 0 swap means (until I change character)
// Self / Current Active / Global
