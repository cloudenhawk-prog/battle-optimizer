import { useState } from "react"
import type { Character } from "../types/characters"
import type { TableConfig } from "../types/tableDefinitions"

type UseRotationEditorProps = {
  charactersInBattle: Character[]
  tableConfig: TableConfig
}

export function useRotationEditor({ charactersInBattle, tableConfig }: UseRotationEditorProps) {
  const charactersMap = Object.fromEntries(charactersInBattle.map(c => [c.name, c]))
  const characterColumnsMap = Object.fromEntries(tableConfig.characters.map(c => [c.label, c.columns.map(col => col.key.split("_")[1])]))
  const globalColumns = {
    basic: tableConfig.basic.columns.map(col => col.key),
    buffs: tableConfig.buffs.columns.map(col => col.key),
    debuffs: tableConfig.debuffs.columns.map(col => col.key),
    negativeStatuses: tableConfig.negativeStatuses.columns.map(col => col.key)
  }
  const [snapshots, setSnapshots] = useState([createEmptySnapshot(charactersMap, characterColumnsMap, globalColumns)])

  const handleCharacterSelect = (snapshotId: number, characterName: string) => {
    setSnapshots((prev) => {
      const newSnapshots = prev
        .map((s) =>
          s.id === snapshotId ? { ...s, character: characterName, action: "" } : s
        )
        .filter((s) => s.id <= snapshotId)

      return newSnapshots
    })
  }

  // TODO trigger reCalcTimeline when editing previous rows
  const handleActionSelect = (snapshotId: number, actionName: string) => {
    setSnapshots((prevSnapshots) => {
      let updated = [...prevSnapshots]

      if (snapshotId > 0) {
        const prevRow = updated[snapshotId - 1]
        const prevChar = prevRow.character
        const prevConcerto = prevRow.charactersEnergies[prevChar].concerto

        const currChar = updated[snapshotId].character

        if (prevConcerto === 0 && prevChar !== currChar) {
          updated[snapshotId] = {
            ...updated[snapshotId],
            character: prevChar,
          }

          updated = updateSnapshotsWithAction(updated, snapshotId, "Outro", charactersMap, characterColumnsMap, globalColumns)

          const introId = snapshotId + 1

          updated[introId] = {...updated[introId], character: currChar,}

          updated = updateSnapshotsWithAction(updated, introId, "Intro", charactersMap, characterColumnsMap, globalColumns)

          snapshotId += 2

          updated[snapshotId] = {...updated[snapshotId], character: currChar,
          }
        }
      }

      updated = updateSnapshotsWithAction(updated, snapshotId, actionName, charactersMap, characterColumnsMap, globalColumns)

      return updated
    })
  }

  return { snapshots, handleCharacterSelect, handleActionSelect, recalcTimeline }
}

/* =========================
   Internal Helper Functions
   ========================= */

function extractNumericValueByKey(snapshot: unknown, key: string): number {
  if (typeof snapshot !== "object" || snapshot === null) {
    throw new Error(`Invalid snapshot: ${snapshot}`)
  }

  const value = (snapshot as Record<string, unknown>)[key]

  if (typeof value !== "number") {
    throw new Error(`Expected numeric key "${key}" not found on snapshot: ${JSON.stringify(snapshot)}`)
  }

  return value
}

function createEmptySnapshot(
  charactersMap: Record<string, Character>,
  characterColumnsMap: Record<string, string[]>,
  globalColumns: {
    basic: string[]
    buffs: string[]
    debuffs: string[]
    negativeStatuses: string[]
  }
) {
  const charactersEnergies = Object.fromEntries(
    Object.keys(charactersMap).map(charName => [
      charName,
      Object.fromEntries(
        characterColumnsMap[charName].map(col => [col, 0])
      )
    ])
  )

  const basicValues = Object.fromEntries(globalColumns.basic.map(col => [col, 0]))
  const buffs = Object.fromEntries(globalColumns.buffs.map(col => [col, 0]))
  const debuffs = Object.fromEntries(globalColumns.debuffs.map(col => [col, 0]))
  const negativeStatuses = Object.fromEntries(globalColumns.negativeStatuses.map(col => [col, 0]))

  return {
    id: 0,
    character: "",
    action: "",
    ...basicValues,
    charactersEnergies,
    buffs,
    debuffs,
    negativeStatuses
  }
}

const updateSnapshotsWithAction = (
  snapshots: any,
  snapshotId: number,
  actionName: string,
  charactersMap: Record<string, Character>,
  characterColumnsMap: Record<string, string[]>,
  globalColumns: any
) => {
  console.log("Updating snapshot", snapshotId, "with action", actionName)
  const updatedSnapshots = [...snapshots]
  const index = updatedSnapshots.findIndex((s) => s.id === snapshotId)
  if (index === -1) return snapshots

  const snapshot = updatedSnapshots[index]
  const characterData = charactersMap[snapshot.character]
  if (!characterData) return snapshots

  const action = characterData.actions.find((a) => a.name === actionName)
  if (!action) return snapshots

  const previousSnapshot = updatedSnapshots[index - 1] ?? updatedSnapshots[0]

  // Basic calculations
  const fromTime = extractNumericValueByKey(previousSnapshot, "toTime")
  const cumulativeDamage = extractNumericValueByKey(previousSnapshot, "damage") + action.damage
  const toTime = fromTime + action.time
  const dps = cumulativeDamage / toTime

  const newSnapshot = {
    ...snapshot,
    action: action.name,
    fromTime,
    toTime,
    damage: cumulativeDamage,
    dps,
  }

  updatedSnapshots[index] = newSnapshot

  // Add new empty snapshot if this is the last one (TODO: this could be its own function)
  if (index === updatedSnapshots.length - 1) {
    const newEmptySnapshot = createEmptySnapshot(charactersMap, characterColumnsMap, globalColumns)
    newEmptySnapshot.id = updatedSnapshots.length
    updatedSnapshots.push(newEmptySnapshot)
  }

  return updatedSnapshots
}

const recalcTimeline = () => {
    // TODO: Implement timeline recalculation when editing previous rows
  }