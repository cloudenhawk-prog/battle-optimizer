import type { Action } from './action'

// ========== Type: Form =======================================================================================================

/**
 * Represents a character form/stance.
 * Each form can have its own set of available actions,
 * custom intro/outro actions, and may be locked behind conditions.
 * Whether a form is the default is determined by the Character, not the Form itself.
 */
export type Form = {
  /** Unique name for this form (e.g., "Base", "Fleurdelys") */
  name: string

  /** Display name shown in the UI */
  displayName?: string

  /** Actions available in this form.
   *  If undefined, all character actions are available.
   *  If empty array, no actions are available in this form (use case: locked forms).
   */
  availableActions?: Action[]

  /** Intro action for this form.
   *  If undefined, falls back to the default form's intro action. */
  introAction?: Action

  /** Outro action for this form.
   *  If undefined, falls back to the default form's outro action. */
  outroAction?: Action

  /** Icon or visual indicator for this form */
  icon: string
}
