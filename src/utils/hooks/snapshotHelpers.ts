import type { Snapshot } from "../../types/snapshot"
import type { Character } from "../../types/character"
import type { GlobalColumns } from "../../types/tableDefinitions"

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

export function createSnapshot(
  previousSnapshot: Snapshot,
  charactersMap: Record<string, Character>,
  characterColumnsMap: Record<string, string[]>,
  globalColumns: GlobalColumns
): Snapshot {
  const charactersEnergies = Object.fromEntries(
    Object.keys(charactersMap).map(charName => [
      charName,
      { ...previousSnapshot.charactersEnergies[charName] }
    ])
  )

  const basicValues = Object.fromEntries(globalColumns.basic.map(col => [col, 0]))
  const buffs = Object.fromEntries(globalColumns.buffs.map(col => [col, 0]))
  const debuffs = Object.fromEntries(globalColumns.debuffs.map(col => [col, 0]))
  const negativeStatuses = Object.fromEntries(globalColumns.negativeStatuses.map(col => [col, 0]))

  return {
    id: String(Number(previousSnapshot.id) + 1),
    character: "",
    action: "",
    fromTime: 0,
    toTime: 0,
    damage: 0,
    dps: 0,
    ...basicValues,
    charactersEnergies,
    buffs,
    debuffs,
    negativeStatuses,
  }
}
