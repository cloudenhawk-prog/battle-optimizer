import type { CharacterStats } from './stats'
import type { DamageModifier } from './modifiers'
import type { Action, ActionTag } from './action'
import type { ElementType, EnergyType } from './baseTypes'
import type { EnergyCost } from './energy'
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
  /**
   * How many times to fire `sideEffect` when the trigger activates.
   * Absent = fire once.
   *
   * Use this when the trigger should fire once per *application event* of a status rather
   * than once per action cast. Typically reads `StatusModification.applicationCount` from
   * the action's `statusModifications` to derive the count.
   *
   * Example:
   * ```ts
   * fireCount: (ctx) =>
   *   (ctx.action.statusModifications ?? [])
   *     .filter(m => m.type === 'negativeStatus' && m.targetName === 'Glacio Chafe')
   *     .reduce((sum, m) => sum + (m.applicationCount ?? 1), 0)
   * ```
   */
  fireCount?: (ctx: StepContext) => number
}

// ========== Type: Team Action Trigger =======================================================================================

/**
 * Like `ActionTrigger`, but fires for **any team member's** action that matches the tags —
 * not just the trigger owner's own actions.
 *
 * When the resolver fires a `TeamActionTrigger`, `ctx.character` is substituted with the
 * trigger-owning character so that the side effect's `damageDealt` function sees the owner
 * as the actor (correct dealer attribution, correct owner stats).
 *
 * Example: Hiyuki's Everfrost Dominion — fires a Glacio Chafe damage proc at max stacks
 * whenever any Resonator in the team applies Glacio Chafe, attributed to Hiyuki.
 */
export type TeamActionTrigger = {
  /** All of these tags must be present on the cast action. */
  requiredTags: ActionTag[]
  /**
   * Optional extra runtime condition. Called with the owner-substituted context
   * (`ctx.character` = trigger owner), so `ctx.character.sequence` etc. refer to the owner.
   * Absent = always fire when tags match.
   */
  condition?: (ctx: StepContext) => boolean
  /** The side effect to execute when the trigger fires. Damage is attributed to the trigger owner. */
  sideEffect: SideEffect
  /**
   * How many times to fire `sideEffect` per matching action cast. Absent = 1.
   * Called with the owner-substituted context. See `ActionTrigger.fireCount` for usage pattern.
   */
  fireCount?: (ctx: StepContext) => number
  /**
   * Energy to deduct from the trigger owner once per trigger activation (not per fireCount repetition).
   * Deducted at the moment the trigger fires, before the side effect executes.
   */
  energyCost?: EnergyCost[]
  /**
   * When set, after this trigger fires, a secondary pass of all OTHER team members'
   * `teamActionTriggers` is run, treating the fired side effect's `statusModifications`
   * as if an action with these tags was cast.
   *
   * This allows a chain: e.g. Lucila's film_roll_proc applies Glacio Chafe (tags here),
   * which in turn lets Hiyuki's GLACIO_CHAFE_APPLIER triggers react to those stacks.
   * The owner of this trigger is excluded from the secondary pass to prevent reflexive firing.
   */
  propagateTags?: ActionTag[]
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
   *  Receives the in-progress current snapshot, the character's name, and the character object. Return true to allow firing. */
  condition?: (snapshot: Snapshot, charName: string, char: Character) => boolean
  /** Resources to restore when the trigger fires. Values are clamped to each resource's max. */
  energyRestore: Partial<Record<EnergyType, number>>
  /**
   * Charge stacks to restore when this trigger fires. Each entry specifies the action's
   * `groupName` and the exact number of charges to add. The result is clamped to the
   * configured max so the trigger remains correct even if maxStacks later changes.
   * If the restored count reaches max, the cooldown timer is also cleared (no regen needed).
   */
  chargesRestore?: Array<{ groupName: string; amount: number }>
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
  /**
   * Returns energy values to seed into the initial snapshot instead of 0, based on the
   * character's current sequence level. Called at snapshot-creation time so that runtime
   * sequence changes (via CharacterProfileOverlay) are reflected immediately on reset.
   * Returned values are clamped to maxEnergies.
   *
   * Example: Hiyuki starts at max Snow Rust when sequence >= 3.
   */
  startingEnergies?: (sequence: number) => Partial<Record<EnergyType, number>> | undefined
  /** Human-readable descriptions for energy types, shown as hover tooltips on the energy bars.
   *  Keyed by EnergyType. Only needs to be provided for energies worth explaining. */
  energyDescriptions?: Partial<Record<EnergyType, string>>
  /** Energy types that act as internal bookkeeping tokens rather than visible game resources.
   *  They are excluded from the CharacterStateTracker energy bar section and table columns,
   *  but rendered as compact named rows alongside the energy table. */
  hiddenEnergies?: EnergyType[]
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
  /**
   * Side effects that fire whenever **any** team member casts a matching tagged action
   * (including this character themselves). The side effect damage is attributed to this
   * character regardless of who cast the triggering action.
   */
  teamActionTriggers?: TeamActionTrigger[]
}

// A Character whose stats have been fully resolved by resolveCharacter().
// Use this type throughout the runtime calculation pipeline (resolvers, calculators, hooks)
// so that character.stats is guaranteed to be a complete CharacterStats object.
export type ResolvedCharacter = Omit<Character, 'stats'> & { stats: CharacterStats }
