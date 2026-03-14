import type { CharacterStats } from './stats'
import type { DamageModifier } from './modifiers'
import type { Action } from './action'
import type { EnergyType } from './baseTypes'
import type { Gear } from './gear'
import type { Form } from './form'

// ========== Type: Resource Milestone =========================================================================================

/**
 * Describes a passive that fires one modifier stack each time a character's resource crosses a threshold.
 * The resolver checks prev vs current resource value per step and adds stacks for each newly crossed threshold.
 */
export type ResourceMilestoneDef = {
  /** The energy/resource key to watch (e.g. 'conviction', 'forte'). */
  resourceType: EnergyType
  /** Ordered thresholds. Each one fires at most once per crossing (prev < threshold ≤ curr). */
  milestones: number[]
  /** The modifier that receives one stack per milestone crossed. */
  modifier: DamageModifier
}

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
  /** Passive milestone effects: gain modifier stacks each time the watched resource crosses a threshold. */
  resourceMilestones?: ResourceMilestoneDef[]
}

// A Character whose stats have been fully resolved by resolveCharacter().
// Use this type throughout the runtime calculation pipeline (resolvers, calculators, hooks)
// so that character.stats is guaranteed to be a complete CharacterStats object.
export type ResolvedCharacter = Omit<Character, 'stats'> & { stats: CharacterStats }
