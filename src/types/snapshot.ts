import type { EnergyType } from './baseTypes'

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
  /** Display name of the resolved action variant (e.g. "Plunge Attack 1 (swap cancel)").
   *  Present only when resolveVariant produced a tier-specific display name that differs
   *  from the selectable action's own displayName. Used by the row display in place of the
   *  parent action's displayName so the exact resolved tier is visible to the user. */
  resolvedDisplayName?: string
}
