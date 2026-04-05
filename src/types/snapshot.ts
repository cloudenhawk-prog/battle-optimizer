import type { EnergyType } from './baseTypes'
import type { CharacterStats } from './stats'

// ========== Type: Snapshot ===================================================================================================

export interface Snapshot {
  id: string
  character?: string
  action?: string
  fromTime: number
  toTime: number
  damage: number
  dps: number
  charactersEnergies: Record<string, Partial<Record<EnergyType, number>>>
  buffs: Record<string, number>
  buffsTimeLeft: Record<string, number>
  buffsSwapsLeft: Record<string, number>
  buffsMaxStacks: Record<string, number>
  /**
   * Frozen stat contributions for limited buff modifiers that use `statsOnActivation`.
   * Keyed by the same space-stripped displayName used in `buffs`.
   * `computeActiveModifierBreakdown` reads this instead of the blueprint's `characterStats`
   * when present, so the stat breakdown reflects what was locked in at application time.
   */
  buffsActivationStats: Record<string, Partial<CharacterStats>>
  /** Runtime target character for 'nextSwap' buffs. Keyed by space-stripped displayName. */
  buffsTargetCharacter: Record<string, string | null>
  debuffs: Record<string, number>
  debuffsTimeLeft: Record<string, number>
  debuffsSwapsLeft: Record<string, number>
  debuffsMaxStacks: Record<string, number>
  negativeStatuses: Record<string, number>
  negativeStatusesTimeLeft: Record<string, number>
  coordinatedAttacks: Record<string, number>
  coordinatedAttacksTimeLeft: Record<string, number>
  coordinatedAttacksSwapRequired: Record<string, boolean>
  charactersCooldowns: Record<string, Record<string, number>>
  /** Resolved position (GROUND or AIR) for each character after their last action. */
  charactersPositions: Record<string, 'GROUND' | 'AIR'>
  /** Absolute time until which each character's persistence is active (0 = no persistence). */
  charactersPersistentUntil: Record<string, number>
  /** Name of the last action each character cast. */
  charactersLastAction: Record<string, string>
  /** Whether each character must be swapped out in the immediately following row. */
  charactersRequiresSwapOut: Record<string, boolean>
  /** The current form name for each character.
   *  Undefined/empty string means the character has no forms or is in their default form. */
  charactersForms: Record<string, string>
  /** Absolute time until which each character's swap cooldown is active.
   *  Missing entries or a value of 0 mean the character currently has no swap cooldown.
   *  Implementations commonly resolve this with `charactersSwapCooldownUntil[char] ?? 0`.
   */
  charactersSwapCooldownUntil: Record<string, number>
  /** Tracks which character must cast which action in the next row (for combo systems).
   *  Key: character name. Value: follow-up action info.
   *  When set, all other actions/characters are locked in the next row (subject to
   *  the `must` flag — see Action.attemptFollowUp for semantics). */
  charactersAttemptFollowUp: Record<string, { actionName: string; must: boolean }>
  /** Tracks active combo windows for time-based combo systems.
   *  Key: character name. Value: info about the last combo starter action. */
  charactersComboWindows: Record<
    string,
    {
      actionName: string // Name of the action that started the combo window
      startTime: number // Time when the combo window started (based on timerStartsAt)
      wasSwapped: boolean // Whether the character was swapped out after the combo action
      formChanged: boolean // Whether the character changed form after the combo action
    }
  >
  /** Display label of the resolved action variant for this snapshot row (e.g. "Plunge Attack 1 (swap cancel)").
   *  This is the resolved action's display name as shown to the user, and may be identical
   *  to or differ from the selectable action's own displayName. When present, UIs should
   *  prefer this over the parent action's displayName so the exact resolved variant is visible. */
  resolvedDisplayName?: string
  /** Active forte-based grants per character (e.g. 'Mandate of Divinity', 'Power of Discord', 'Heart of Virtue').
   *  Grants accumulate as forte sub-energies are consumed (deduplicated) and are cleared
   *  when the associated modifier with clearsForteGrantsOnExpiry expires or is removed. */
  charactersForteGrants: Record<string, string[]>
  /** Combo chain tags left by the most recently cast action for each character.
   *  Set from `Action.comboChainTags` at cast time. Read by `castConditions.requiredComboTags`
   *  checks (honoring the persistence window) to enforce sequential combo ordering. */
  charactersComboChainTags: Record<string, string[]>
  /** When true, this row was automatically inserted by the engine (Outro/Intro swap or
   *  auto-cast follow-up). Autocast rows are excluded from exports so they are not
   *  replayed manually on import (the engine re-generates them from the user-defined steps). */
  isAutocast?: boolean
}
