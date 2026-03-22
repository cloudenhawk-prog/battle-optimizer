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
