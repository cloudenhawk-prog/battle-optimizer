// ========== Types ===========================================================================================================

/**
 * A draft step inside a flex block — one (character, action) pair the user wants to test.
 */
export type DraftStep = {
  character: string
  action: string
}

/**
 * A flex block is a placeholder slot in the rotation.
 * The block itself takes 0 time and has no effect on the simulation.
 * The user populates `draftSteps` manually, then clicks "Attempt" to validate whether
 * the full rotation still works with those steps inserted. If valid, they can apply the
 * draft to permanently replace the block with real steps.
 */
export type FlexBlock = {
  /** Unique identifier for this block within the rotation. */
  id: string
  /**
   * How many user-visible (non-autocast) steps precede this block in the rotation.
   * 0 means the block appears before any actions; N means after the Nth user action.
   */
  insertAfterStepCount: number
  /** The draft (character, action) pairs the user wants to attempt. */
  draftSteps: DraftStep[]
}

/** Alias kept for backward-compat with serialised rotation data. */
export type OptimizerBlock = FlexBlock
