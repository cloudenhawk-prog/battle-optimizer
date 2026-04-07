import type { StepContext } from './stepContext'
import type { DamageEvent } from './events'

// ========== Type: SideEffect =================================================================================================

export type SideEffect = {
  name: string
  damageDealt: (context: StepContext, sideEffectName: string, timeStamp: number) => DamageEvent
  statusModifications: StatusModification[]
}

// ========== Type: StatusModification =========================================================================================

export type StatusModification = {
  type: 'buff' | 'debuff' | 'negativeStatus'
  targetName: string
  stackChange?: number
  durationChange?: number
  refreshDuration?: boolean
  /**
   * For `negativeStatus` type only.
   * How many distinct hit events caused this status to be applied.
   * Defaults to 1. Set explicitly when a single `Action` aggregates multiple hit events
   * (e.g. a combined BA1-5 action where BA3, BA4 and BA5 each apply Glacio Chafe once → 3).
   *
   * Used by `ActionTrigger.fireCount` to fire a triggered side effect the correct number
   * of times when the trigger cares about "how many times applied" rather than "total stacks."
   */
  applicationCount?: number
}

// ========== Type: CooldownReduction ==========================================================================================

export type CooldownReduction = {
  /** The cooldown key to reduce — typically the action's groupName (e.g. 'Resonance Skill'). */
  targetActionKey: string
  /**
   * Amount to reduce in seconds.
   * Use a function for values that depend on runtime state (e.g. resources consumed).
   */
  amount: number | ((ctx: StepContext) => number)
}
