import type { Snapshot } from "../../types/snapshot"

// ========== Energy Helpers ===================================================================================================

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

export function getConcertoValue(snapshot: Snapshot, character: string): number {
  return snapshot.charactersEnergies[character]?.concerto ?? 0
}
