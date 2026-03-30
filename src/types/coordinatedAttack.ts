import type { ScalingType, ElementType, DamageType } from './baseTypes'
import type { EnergyGeneration } from './energy'
import type { StatusModification } from './sideEffect'
import type { StepContext } from './stepContext'
import type { DamageModifier } from './modifiers'
import type { ActionTag } from './action'

// ========== Type: CoordinatedAttack ==========================================================================================

/**
 * A coordinated attack is a persistent, periodic damage effect triggered by an action.
 * Unlike negative statuses (which use a fixed damage-per-stack table), coordinated attacks
 * scale with the OWNER character's stats (ATK / HP / DEF), benefit from the full modifier
 * pipeline, and can generate energy on each hit.
 *
 * Two behavioural variants:
 *   - swapRequired: false – the attack persists for `duration` seconds regardless of who is active.
 *   - swapRequired: true  – the attack persists until the owner character becomes the active
 *                           character again (swap-back ends it). Typically used with actions
 *                           that intentionally force a swap-away after casting.
 */
export type CoordinatedAttack = {
  name: string
  displayName?: string

  /** Damage multiplier, same meaning as Action.multiplier */
  multiplier: number
  /** Stat used as the base for scaling (ATK, HP, DEF). FLAT scaling is not supported. */
  scaling: ScalingType
  elements: ElementType[]
  /** Should include 'COORDINATED'. May also carry element-specific types. */
  dmgTypes: DamageType[]

  /** Seconds between damage ticks */
  frequency: number
  /**
   * Total active duration in seconds.
   * Use Infinity for swap-required attacks that should last until the owner returns.
   */
  duration: number

  /**
   * When true the attack ends as soon as the owner character becomes active again.
   * Pending ticks up to that moment still fire.
   */
  swapRequired: boolean

  /** Energy generated for the owner (and allies via share) on each damage tick */
  energyGenerated: EnergyGeneration[]

  /**
   * Status modifications applied PER TICK.
   * Currently only 'negativeStatus' type is supported here; buff/debuff per-hit
   * modifications are not yet implemented.
   */
  statusModifications: StatusModification[]

  /**
   * Optional per-tick damage multiplier. Return 1 for full damage, 0 to suppress a tick,
   * or any other number to scale it. Evaluated once per tick with the current StepContext.
   * Defaults to 1 (no scaling) when omitted.
   */
  condition?: (ctx: StepContext) => number

  /**
   * Modifiers activated on each damage tick of this coordinated attack.
   * Behaves like Action.damageModifiers — each tick runs activateModifiers on these entries,
   * so time-limited buffs are created or refreshed on every hit.
   *
   * Primary use: gear injects weapon/set-bonus modifiers here via { tag: 'HEAL_PROC' } (or other tags)
   * so effects like "on heal, grant 4s team crit DMG buff" fire on every periodic heal tick.
   *
   * For a "heal-only" periodic field (no damage), set multiplier:0 and elements/dmgTypes to
   * empty/neutral values — the ticks still fire and activate these modifiers.
   */
  damageModifiers?: DamageModifier[]

  /**
   * Modifiers that are active exactly while this coordinated attack is alive.
   * They are injected into modifiersInAction when the attack activates (or refreshes)
   * and removed when the attack expires or is swap-cancelled.
   *
   * Use `targetStrategy: 'all'` for team-wide buffs or `'active'` for on-field-only.
   * Set `durationStrategy: { type: 'permanent' }` — lifetime is managed by the
   * coordinated attack itself, not by time/swap counters.
   */
  linkedModifiers?: DamageModifier[]

  /** Toughness damage per tick, for display / tracking purposes only */
  offtune?: number

  /** Semantic tags describing what role this coordinated attack plays. Used for tag-based gear injection. */
  tags?: ActionTag[]

  /** Explicit icon asset path. When omitted, the icon is derived from `name`. */
  icon?: string

  color?: string
}

// ========== Type: CoordinatedAttackInAction ==================================================================================

/**
 * Runtime tracking state for a single active (or recently expired) coordinated attack.
 * Lives inside StepContext.coordinatedAttacksInAction and is passed through the hook ref.
 */
export type CoordinatedAttackInAction = {
  coordinatedAttack: CoordinatedAttack
  /** Name of the character whose stats are used for damage / energy calculations */
  ownerCharacter: string
  /** Rotation time at which the attack was triggered. -1 means inactive. */
  applicationTime: number
  /** Seconds remaining before the attack expires naturally */
  timeLeft: number
  /** The last time (absolute rotation time) a damage tick was emitted */
  lastDamageTime: number
}
