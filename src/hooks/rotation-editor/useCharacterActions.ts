import type { Snapshot } from "../../types/snapshot"
import type { Character } from "../../types/characters"
import { createSnapshot } from "./useSnapshots"
import type { Dispatch, SetStateAction } from "react"

export function useCharacterActions(
  snapshots: Snapshot[],
  setSnapshots: Dispatch<SetStateAction<Snapshot[]>>,
  characters: Character[],
  tableConfig: {
    basic: { columns: { key: string }[] }
    buffs: { columns: { key: string }[] }
    debuffs: { columns: { key: string }[] }
    negativeStatuses: { columns: { key: string }[] }
    characters: { label: string; columns: { key: string }[] }[]
  }
) {
  const charactersMap: Record<string, Character> = Object.fromEntries(characters.map(c => [c.name, c]))
  const characterColumnsMap: Record<string, string[]> = Object.fromEntries(
    tableConfig.characters.map(c => [c.label, c.columns.map(col => col.key.split("_")[1])])
  )
  const globalColumns = {
    basic: tableConfig.basic.columns.map(col => col.key),
    buffs: tableConfig.buffs.columns.map(col => col.key),
    debuffs: tableConfig.debuffs.columns.map(col => col.key),
    negativeStatuses: tableConfig.negativeStatuses.columns.map(col => col.key)
  }

  const handleCharacterSelect = (snapshotId: number, characterName: string) => {
    setSnapshots((prev) =>
      prev
        .map(s => (Number(s.id) === snapshotId ? { ...s, character: characterName, action: "" } : s))
        .filter(s => Number(s.id) <= snapshotId)
    )
  }

  const handleActionSelect = (snapshotId: number, actionName: string) => {
    setSnapshots((prevSnapshots) => {
      let updated = [...prevSnapshots]

      if (snapshotId > 0) {
        const prevRow = updated[snapshotId - 1]
        const prevChar = prevRow.character
        const prevConcerto = prevChar ? prevRow.charactersEnergies[prevChar]?.concerto ?? 0 : 0

        const currChar = updated[snapshotId].character

        if (prevConcerto === 100 && prevChar && currChar && prevChar !== currChar) {
          updated[snapshotId] = { ...updated[snapshotId], character: prevChar }
          updated = updateSnapshotsWithAction(updated, snapshotId, "Outro", charactersMap, characterColumnsMap, globalColumns)

          const introId = snapshotId + 1
          updated[introId] = { ...updated[introId], character: currChar }
          updated = updateSnapshotsWithAction(updated, introId, "Intro", charactersMap, characterColumnsMap, globalColumns)

          snapshotId += 2
          updated[snapshotId] = { ...updated[snapshotId], character: currChar }
        }
      }

      updated = updateSnapshotsWithAction(updated, snapshotId, actionName, charactersMap, characterColumnsMap, globalColumns)
      return updated
    })
  }

  return { handleCharacterSelect, handleActionSelect }
}

/* =========================
   Internal Helpers
   ========================= */

function extractNumericValueByKey(snapshot: Snapshot, key: string): number {
  const value = (snapshot as any)[key]
  if (typeof value !== "number") throw new Error(`Expected numeric key "${key}" not found on snapshot`)
  return value
}

function updateSnapshotsWithAction(
  snapshots: Snapshot[],
  snapshotId: number,
  actionName: string,
  charactersMap: Record<string, Character>,
  characterColumnsMap: Record<string, string[]>,
  globalColumns: { basic: string[]; buffs: string[]; debuffs: string[]; negativeStatuses: string[] }
): Snapshot[] {
  const updatedSnapshots = [...snapshots]
  const index = updatedSnapshots.findIndex(s => Number(s.id) === snapshotId)
  if (index === -1) return snapshots

  const snapshot = updatedSnapshots[index]
  if (!snapshot.character) return snapshots
  
  const characterData = charactersMap[snapshot.character]
  if (!characterData) return snapshots

  const action = characterData.actions.find(a => a.name === actionName)
  if (!action) return snapshots

  const previousSnapshot = updatedSnapshots[index - 1] ?? updatedSnapshots[0]

  // Basic calculations
  const fromTime = extractNumericValueByKey(previousSnapshot, "toTime")
  const cumulativeDamage = extractNumericValueByKey(previousSnapshot, "damage") + action.damage
  const toTime = fromTime + action.time
  const dps = cumulativeDamage / toTime

  // Energies calculations
  const charName = snapshot.character
  const prevEnergies = previousSnapshot.charactersEnergies[charName]
  const currEnergies = snapshot.charactersEnergies[charName]
  const maxEnergies = characterData.maxEnergies

  for (const [key, generated] of Object.entries(action.energyGenerated)) {
    if (currEnergies[key] !== undefined && maxEnergies[key] !== undefined) {
      currEnergies[key] = Math.min((prevEnergies[key] ?? 0) + generated, maxEnergies[key])
    }
  }

  if (action.name === "Outro" && currEnergies.concerto !== undefined) {
    currEnergies.concerto = 0
  }

  updatedSnapshots[index] = {
    ...snapshot,
    action: action.name,
    fromTime,
    toTime,
    damage: cumulativeDamage,
    dps
  }

  // Add new empty snapshot if last
  if (index === updatedSnapshots.length - 1) {
    updatedSnapshots.push(
      createSnapshot(updatedSnapshots[updatedSnapshots.length - 1], charactersMap, characterColumnsMap, globalColumns)
    )
  }

  return updatedSnapshots
}
