import type { Snapshot } from '../../types/snapshot'
import type { Character } from '../../types/character'
import type { GlobalColumns } from '../../types/tableDefinitions'
import { parseCoordinatedAttackKey } from './coordinatedAttackHelpers'

// ========== Snapshot Helpers ================================================================================================

export function getSnapshotById(snapshots: Snapshot[], id: number): Snapshot | undefined {
  return snapshots.find(s => Number(s.id) === id)
}

export function getSnapshotIndex(snapshots: Snapshot[], id: number): number {
  return snapshots.findIndex(s => Number(s.id) === id)
}

export function getPrevSnapshot(snapshots: Snapshot[], index: number): Snapshot {
  return snapshots[index - 1] ?? snapshots[0]
}

export function isLastSnapshot(snapshots: Snapshot[], index: number): boolean {
  return index === snapshots.length - 1
}

export function copySnapshots(snapshots: Snapshot[]): Snapshot[] {
  return [...snapshots]
}

export function assignCharacterToRow(row: Snapshot, character: string): Snapshot {
  return { ...row, character }
}

/**
 * Returns true if the given character has at least one active swap-required coordinated
 * attack in the snapshot
 * In this context, "swap-required" means the attack's owner is required to swap away
 * After casting and cannot be selected as the active character in the next snapshot row.
 */
export function isSwapRequiredLocked(snapshot: Snapshot, characterName: string): boolean {
  const hasRequiresSwapOut = snapshot.charactersRequiresSwapOut?.[characterName] === true
  const hasCoordinatedSwapRequired = Object.entries(snapshot.coordinatedAttacks ?? {}).some(([key, active]) => {
    if (active !== 1) return false
    return parseCoordinatedAttackKey(key).owner === characterName && (snapshot.coordinatedAttacksSwapRequired?.[key] ?? false)
  })
  return hasRequiresSwapOut || hasCoordinatedSwapRequired
}

export function createSnapshot(previousSnapshot: Snapshot, charactersMap: Record<string, Character>, _characterColumnsMap: Record<string, string[]>, globalColumns: GlobalColumns, fillInCharacter: boolean = true): Snapshot {
  const charactersEnergies = Object.fromEntries(Object.keys(charactersMap).map(charName => [charName, { ...previousSnapshot.charactersEnergies[charName] }]))

  // Copy cooldowns from previous snapshot to carry them forward
  const charactersCooldowns = Object.fromEntries(Object.keys(charactersMap).map(charName => [charName, { ...(previousSnapshot.charactersCooldowns?.[charName] ?? {}) }]))

  // Copy cast-state fields from previous snapshot to carry them forward
  const charactersPositions = { ...(previousSnapshot.charactersPositions ?? {}) }
  const charactersPersistentUntil = { ...(previousSnapshot.charactersPersistentUntil ?? {}) }
  const charactersLastAction = { ...(previousSnapshot.charactersLastAction ?? {}) }
  const charactersForms = { ...(previousSnapshot.charactersForms ?? {}) }
  const charactersSwapCooldownUntil = { ...(previousSnapshot.charactersSwapCooldownUntil ?? {}) }

  const basicValues = Object.fromEntries(globalColumns.basic.map(col => [col, 0]))
  const buffs = Object.fromEntries(globalColumns.buffs.map(col => [col, 0]))
  const debuffs = Object.fromEntries(globalColumns.debuffs.map(col => [col, 0]))
  const negativeStatuses = Object.fromEntries(globalColumns.negativeStatuses.map(col => [col, 0]))

  // Copy maxStacks from previous snapshot to preserve them
  const buffsMaxStacks = { ...previousSnapshot.buffsMaxStacks }
  const debuffsMaxStacks = { ...previousSnapshot.debuffsMaxStacks }

  const prevChar = previousSnapshot.character ?? ''
  const isPrevCharLocked = fillInCharacter && prevChar !== '' && isSwapRequiredLocked(previousSnapshot, prevChar)

  return {
    id: String(Number(previousSnapshot.id) + 1),
    character: fillInCharacter && !isPrevCharLocked ? previousSnapshot.character : '',
    action: '',
    fromTime: 0,
    toTime: 0,
    damage: 0,
    dps: 0,
    ...basicValues,
    charactersEnergies,
    buffs,
    buffsTimeLeft: Object.fromEntries(globalColumns.buffs.map(col => [col, 0])),
    buffsSwapsLeft: Object.fromEntries(globalColumns.buffs.map(col => [col, 0])),
    buffsMaxStacks,
    debuffs,
    debuffsTimeLeft: Object.fromEntries(globalColumns.debuffs.map(col => [col, 0])),
    debuffsSwapsLeft: Object.fromEntries(globalColumns.debuffs.map(col => [col, 0])),
    debuffsMaxStacks,
    negativeStatuses,
    negativeStatusesTimeLeft: Object.fromEntries(globalColumns.negativeStatuses.map(col => [col, 0])),
    coordinatedAttacks: {},
    coordinatedAttacksTimeLeft: {},
    coordinatedAttacksSwapRequired: {},
    charactersCooldowns,
    charactersPositions,
    charactersPersistentUntil,
    charactersLastAction,
    charactersRequiresSwapOut: {},
    charactersForms,
    charactersSwapCooldownUntil,
  }
}
