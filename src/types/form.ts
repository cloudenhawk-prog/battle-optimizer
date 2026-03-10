// ========== Type: Form =======================================================================================================

/**
 * Represents a character form/stance.
 * Each form can have its own set of available actions,
 * custom intro/outro actions, and may be locked behind conditions.
 */
export type Form = {
  /** Unique name for this form (e.g., "Base", "Fleurdelys") */
  name: string

  /** Display name shown in the UI */
  displayName?: string

  /** If true, this is the default form the character starts in */
  isDefault?: boolean

  /** Actions that are only available in this form.
   *  If undefined, all character actions are available.
   *  If empty array, no actions are available in this form (use case: locked forms).
   */
  availableActions?: string[]

  /** Custom intro action name for this form.
   *  If undefined, uses the character's default intro action. */
  introAction?: string

  /** Custom outro action name for this form.
   *  If undefined, uses the character's default outro action. */
  outroAction?: string

  /** Icon or visual indicator for this form (optional) */
  icon?: string
}
