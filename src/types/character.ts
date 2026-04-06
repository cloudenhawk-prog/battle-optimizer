import type { CharacterStats } from './stats'
import type { DamageModifier } from './modifiers'
import type { Action, ActionTag } from './action'
import type { ElementType, EnergyType } from './baseTypes'
import type { Gear, WeaponType } from './gear'
import type { Form } from './form'
import type { Snapshot } from './snapshot'
import type { SideEffect } from './sideEffect'
import type { StepContext } from './stepContext'

// ========== Type: Action Trigger ============================================================================================

/**
 * Fires a side effect automatically whenever this character casts an action that has all
 * of the specified tags, and the optional runtime condition passes.
 *
 * Evaluated in `helpSideEffectsDamage` after the action's own side effects. This avoids
 * having to manually add a side effect to every current and future tagged action.
 *
 * Example: Hiyuki's Fine Snow proc — fires on every GLACIO_CHAFE_APPLIER cast when snow_rust >= 2.
 */
export type ActionTrigger = {
  /** All of these tags must be present on the cast action. */
  requiredTags: ActionTag[]
  /** Optional extra runtime condition. Absent = always fire when tags match. */
  condition?: (ctx: StepContext) => boolean
  /** The side effect to execute when the trigger fires. */
  sideEffect: SideEffect
}

// ========== Type: Off-Field Trigger ==========================================================================================

/**
 * Fires once per continuous off-field stretch when the character's off-field duration
 * crosses `minOffFieldDuration`. Typically used to restore resources after a character
 * has been sitting off-field long enough (e.g. Hiyuki's Snowforged Blade recovery).
 */
export type OffFieldTrigger = {
  /** Minimum continuous off-field duration (seconds) before this trigger fires. Fires once per off-field stretch. */
  minOffFieldDuration: number
  /** Optional extra condition evaluated at the moment the threshold is crossed.
   *  Receives the in-progress current snapshot and the character's name. Return true to allow firing. */
  condition?: (snapshot: Snapshot, charName: string) => boolean
  /** Resources to restore when the trigger fires. Values are clamped to each resource's max. */
  energyRestore: Partial<Record<EnergyType, number>>
  /** Human-readable description shown in DataOverlay when this trigger fires.
   *  Falls back to "Off-field ≥Xs: <energy list>" if omitted. */
  description?: string
}

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
  element: ElementType
  /** The weapon category this character can equip. Must match Weapon.weaponType. */
  weaponType: WeaponType
  maxEnergies: Partial<Record<EnergyType, number>>
  actions: Action[]
  damageModifiers: DamageModifier[]
  /** Permanent self/always modifiers that were flattened into stats at resolution time. Stored for breakdown reference only — not used in runtime calculations. */
  flattenedPassiveModifiers?: DamageModifier[]
  stats: Partial<CharacterStats>
  inherentStats: Partial<CharacterStats>
  gear: Gear
  defaultForm?: string
  forms?: Form[]
  sequence: 0 | 1 | 2 | 3 | 4 | 5 | 6
  sequence_nodes: string[]
  sequence_nodes_icons: string[]
  /** Path to the character's portrait image (e.g. '/assets/characters/ciaccona.png'). */
  image?: string
  /** Passive milestone effects: gain modifier stacks each time the watched resource crosses a threshold. */
  resourceMilestones?: ResourceMilestoneDef[]
  /** One-shot triggers that fire when a character has been off-field for a minimum continuous duration. */
  offFieldTriggers?: OffFieldTrigger[]
  /** Side effects that fire automatically when this character casts a matching tagged action. */
  actionTriggers?: ActionTrigger[]
}

// A Character whose stats have been fully resolved by resolveCharacter().
// Use this type throughout the runtime calculation pipeline (resolvers, calculators, hooks)
// so that character.stats is guaranteed to be a complete CharacterStats object.
export type ResolvedCharacter = Omit<Character, 'stats'> & { stats: CharacterStats }
