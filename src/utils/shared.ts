import type { Snapshot } from "../types/snapshot"
import type { Character } from "../types/character"


/* ============================
   SNAPSHOT HELPERS
   ============================ */

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


/* ============================
   CHARACTER HELPERS
   ============================ */

export function getCharacter(charactersMap: Record<string, Character>, characterName: string): Character | undefined {
  return charactersMap[characterName]
}

export function getCharacterActions(character: Character) {
  return character.actions
}

export function getCharacterMaxEnergies(character: Character) {
  return character.maxEnergies
}

export function getPrevCharacter(snapshots: Snapshot[], snapshotId: number): string | null {
  return snapshotId > 0 ? snapshots[snapshotId - 1].character ?? null : null
}

export function getConcertoValue(snapshot: Snapshot, character: string): number {
  return snapshot.charactersEnergies[character]?.concerto ?? 0
}


/* ============================
   ACTION HELPERS
   ============================ */

export function getActionFromCharacter(
  charactersMap: Record<string, Character>,
  characterName: string,
  actionName: string
) {
  const character = getCharacter(charactersMap, characterName)
  if (!character) return undefined
  return character.actions.find(a => a.name === actionName)
}


/* ============================
   COLUMN HELPERS
   ============================ */

export function getCharacterColumnKeys(characterColumnsMap: Record<string, string[]>, characterName: string) {
  return characterColumnsMap[characterName] ?? []
}

export function getGlobalColumnKeys(globalColumns: {
  basic: string[]
  buffs: string[]
  debuffs: string[]
  negativeStatuses: string[]
}) {
  return [
    ...globalColumns.basic,
    ...globalColumns.buffs,
    ...globalColumns.debuffs,
    ...globalColumns.negativeStatuses
  ]
}


/* ============================
   ENERGY STATE HELPERS
   ============================ */

export function getCharacterEnergyState(snapshot: Snapshot, characterName: string) {
  return snapshot.charactersEnergies[characterName]
}

export function updateEnergyValue(
  prev: number | undefined,
  generated: number,
  max: number
) {
  return Math.min((prev ?? 0) + generated, max)
}
