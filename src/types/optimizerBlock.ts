// ========== Types ===========================================================================================================

/**
 * A required-action constraint: the named action (or groupName) must appear
 * at least `minCount` times and at most `maxCount` times in the generated sequence.
 */
export type RequiredAction = {
  /** Raw action name or groupName as used in the engine. */
  action: string
  /** Minimum number of times this action must appear. */
  minCount: number
  /** Maximum number of times this action may appear. Undefined means no upper limit. */
  maxCount?: number
}

/**
 * Configuration for an optimization block in the rotation timeline.
 * An optimizer block sits at a specific position in the rotation and enumerates all legal
 * action sequences for one character within the given constraints.
 */
export type OptimizerBlock = {
  /** Unique identifier for this block within the rotation. */
  id: string
  /** The character whose actions are being optimized. */
  character: string
  /** Minimum total duration (seconds) the block's action sequence must fill. */
  minDuration: number
  /** Maximum total duration (seconds) the block's action sequence may fill. */
  maxDuration: number
  /** Actions that MUST appear a minimum number of times in the sequence. */
  requiredActions: RequiredAction[]
  /** Action names (or groupNames) that MUST NOT appear in the sequence. */
  bannedActions: string[]
  /**
   * How many user-visible (non-autocast) steps precede this block in the rotation.
   * 0 means the block appears before any actions; N means after the Nth user action.
   * Used to find the correct insertion point in the rendered table and to derive the
   * pre-block engine state by replaying those steps.
   */
  insertAfterStepCount: number
}
