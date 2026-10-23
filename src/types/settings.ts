// User-facing editor settings (toggled on the Settings page, persisted in localStorage).

export type Settings = {
  /** Automatically cast follow-up actions (attemptFollowUp chains) after each user action. */
  autocastFollowUps: boolean
  /** Start every character with a full Resonance Energy bar. */
  startWithFullEnergy: boolean
  /** Skip all cast-condition checks when importing/replaying a rotation. */
  sandboxMode: boolean
  /** Show delete buttons on rotation rows. */
  rowDeletionMode: boolean
  /** Data-level switch read by some kits (e.g. Hiyuki liberation) to use fixed stack counts. */
  useFixedStacks: boolean
  /** Insert Outro/Intro rows as soon as a new character is picked (instead of when the action is picked). */
  triggerOutroIntroOnCharacterSelect: boolean
}
