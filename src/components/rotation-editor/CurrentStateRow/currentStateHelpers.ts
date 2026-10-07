// Pure helpers for the "current state" header row: compact number format and the blank placeholder snapshot.
import type { Snapshot } from '../../../types/snapshot'

// ========== Number Formatting ================================================================================================

/** Formats damage/DPS to fit ~6 characters: 123, 1.234k, 12.3k, 123k, 1.234M, 12.3M, 123M. */
export function formatNumber(value: number): string {
  // Handle values >= 1 million
  if (value >= 1_000_000) {
    const millions = value / 1_000_000
    if (millions >= 100) {
      return `${millions.toFixed(0)}M`
    } else if (millions >= 10) {
      return `${millions.toFixed(1)}M`
    } else {
      return `${millions.toFixed(3)}M`
    }
  }

  // Handle values >= 1 thousand
  if (value >= 1_000) {
    const thousands = value / 1_000
    if (thousands >= 100) {
      return `${thousands.toFixed(0)}k`
    } else if (thousands >= 10) {
      return `${thousands.toFixed(1)}k`
    } else {
      return `${thousands.toFixed(3)}k`
    }
  }

  // Handle values < 1000
  return value.toFixed(0)
}

// ========== Placeholder Snapshot =============================================================================================

/**
 * Blank snapshot shown when the table has no rows. Display-only: the row reads just character,
 * toTime, damage, dps and the status maps, so every other field is an empty placeholder.
 */
export function createInitialSnapshot(): Snapshot {
  return {
    id: '0',
    character: '',
    action: '',
    fromTime: 0,
    toTime: 0,
    damage: 0,
    dps: 0,
    charactersEnergies: {},
    buffs: {},
    buffsTimeLeft: {},
    buffsSwapsLeft: {},
    buffsMaxStacks: {},
    buffsActivationStats: {},
    buffsTargetCharacter: {},
    debuffs: {},
    debuffsTimeLeft: {},
    debuffsSwapsLeft: {},
    debuffsMaxStacks: {},
    negativeStatuses: {},
    negativeStatusesTimeLeft: {},
    negativeStatusesMaxStacks: {},
    charactersCooldowns: {},
    charactersActionStacks: {},
    charactersActionStacksConfig: {},
    coordinatedAttacks: {},
    coordinatedAttacksTimeLeft: {},
    coordinatedAttacksSwapRequired: {},
    charactersPositions: {},
    charactersPersistentUntil: {},
    charactersLastAction: {},
    charactersRequiresSwapOut: {},
    charactersForms: {},
    charactersSwapCooldownUntil: {},
    charactersAttemptFollowUp: {},
    charactersRestrictNextTo: {},
    charactersComboWindows: {},
    charactersForteGrants: {},
    charactersComboChainTags: {},
    charactersOffFieldSince: {},
    offFieldTriggerEvents: {},
  }
}
