import type { CharacterStats, EnemyStats } from './stats'
import type { StepContext } from './stepContext'

// ========== Type: Inherent Modifier ==========================================================================================

/**
 * A conditional stat amplifier that belongs to a specific action and only affects that
 * action's own damage calculation. Unlike DamageModifier, it is never dispatched into
 * modifiersInAction, never appears in the buffs/debuffs table, and leaves no persisted
 * state — it is evaluated once at calculation time and discarded.
 *
 * Use for effects that say "this skill deals X% more damage when condition Y is met",
 * e.g. scaling with the caster's Energy Regen, enemy stacks, etc.
 */
export type InherentModifier = {
  displayName: string
  characterStats?: Partial<CharacterStats>
  enemyStats?: Partial<EnemyStats>
  /** Returns a multiplier applied to each stat value. 0 disables, 1 = full contribution. */
  condition: (ctx: StepContext) => number
}

// ========== Type: Heal Proc ==================================================================================================

/**
 * Periodic heal proc configuration for a DamageModifier.
 * When a modifier carries this, it both grants stats AND emits HEAL_PROC events at `frequency`
 * seconds (with an immediate on-cast proc at applicationTime).
 *
 * Gear injection: set `procTag: 'HEAL_PROC'`. Gear targeting `{ tag: 'HEAL_PROC' }` will push
 * its modifiers into `procModifiers` at startup via resolveGear. Those modifiers are then
 * activated by helpHealProcModifiers on every tick.
 *
 * Example use: Syntony Field modifier on Heavy Attack — heals every 3s, weapon buff fires each tick.
 */
export type HealProc = {
  /** Seconds between heal proc ticks. The first tick fires immediately at applicationTime. */
  frequency: number
  /**
   * Identifies this modifier as a source of heal events for gear tag-based injection.
   * Always set to 'HEAL_PROC'. Gear with target `{ tag: 'HEAL_PROC' }` will inject into procModifiers.
   */
  procTag: string
  /** Modifiers activated on each proc tick. Populated by resolveGear at startup; define [] in data. */
  procModifiers: DamageModifier[]
}

// ========== Type: Damage Modifier ============================================================================================

export type DamageModifier = {
  source: string
  displayName: string
  type: 'buff' | 'debuff'
  ownerCharacter: string | null
  characterStats?: Partial<CharacterStats>
  enemyStats?: Partial<EnemyStats>
  condition: (ctx: StepContext) => number
  targetStrategy: TargetStrategy
  durationStrategy: DurationStrategy
  stackingStrategy: StackingStrategy
  negativeStatusEffects?: NegativeStatusEffect[]
  color?: string
  /** When true, removing this modifier (timer expiry or explicit stack removal to 0)
   *  clears the ownerCharacter's charactersForteGrants in the snapshot.
   *  Use this on the "anchor" modifier of a forte-grant system (e.g. Cartethyia's Mandate). */
  clearsForteGrantsOnExpiry?: boolean
  /** Groups this modifier under another modifier's contribution entry in DataOverlay.
   *  Set to the source string of the anchor modifier. Grouped modifiers are excluded
   *  together when computing the "damage without" baseline, so their combined effect
   *  is reported as a single contribution. */
  contributionGroup?: string
  /**
   * When present, this modifier emits periodic heal procs and accepts gear injection
   * targeting `{ tag: 'HEAL_PROC' }`. The procs fire on cast and then every `frequency` seconds.
   * See HealProc type for details.
   */
  healProc?: HealProc
  /**
   * When present, a limited modifier is only activated (added to modifiersInAction) if this
   * returns truthy at activation time. Unlike `condition` (which scales stat contribution),
   * this gates activation entirely.
   *
   * Use case: High Syntony Field — only activates when Syntony Field was active at cast time.
   */
  activationCondition?: (ctx: StepContext) => boolean
}

// ========== Type: Negative Status Effect =====================================================================================

export type NegativeStatusEffectProperty = 'frequency' | 'maxStacks'

export type NegativeStatusEffect = {
  targetStatus: string
  property: NegativeStatusEffectProperty
  value: number // Percentage modifier: -0.5 = -50% frequency (ticks faster), +0.5 = +50% (ticks slower)
}

// ========== Type: Target Strategy ============================================================================================

export type TargetStrategy = 'self' | 'active' | 'all' | 'nextSwap' | 'activeAlly'

// ========== Type: Duration Strategy ==========================================================================================

export type DurationStrategy = PermanentStrategy | LimitedStrategy

export type PermanentStrategy = {
  type: 'permanent'
}

export type LimitedStrategy = {
  type: 'limited'
  timeDuration?: number
  numberOfSwaps?: number
}

// ========== Type: Stacking Strategy ==========================================================================================

export type StackingStrategy = {
  maxStacks: number
  resetTimerOnApplication: boolean
  stacksRemovedEachTime: number
}

// ========== Type: Modifier In Action ========================================================================================

export type ModifierInAction = {
  modifier: DamageModifier
  applicationTime: number
  timeLeft: number
  swapsLeft: number
  currentStacks: number
  targetCharacter: string | null
  /**
   * For modifiers with `healProc`: the rotation time of the last proc tick.
   * Initialised to `applicationTime - healProc.frequency` so that the first tick fires
   * immediately at applicationTime (on-cast heal). Absent for modifiers without healProc.
   */
  lastHealProcTime?: number
}
