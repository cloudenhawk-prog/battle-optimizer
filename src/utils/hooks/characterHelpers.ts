import type { Character } from "../../types/character"
import type { Snapshot } from "../../types/snapshot"

// ========== Character Helpers ================================================================================================

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
