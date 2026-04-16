// ========== Types ===========================================================================================================

/**
 * A single step inserted by the user during Edit Mode.
 * These live alongside the existing rotation and are merged into the timeline on Confirm.
 */
export type EditModeEntry = {
  /** Unique identifier for this inserted step. */
  id: string
  /**
   * Insertion position: how many user-visible (non-autocast) steps precede this entry.
   * 0 = insert before all actions; N = insert after the Nth user action.
   */
  insertAfterStepCount: number
  /** Character name. Empty string when not yet selected. */
  character: string
  /** Action name (raw / group name). Empty string when not yet selected. */
  action: string
}
