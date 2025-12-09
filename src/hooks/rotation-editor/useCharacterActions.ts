import type { Snapshot } from "../../types/snapshot"
import type { Character } from "../../types/character"
import { createSnapshot } from "./useSnapshots"
import type { Dispatch, SetStateAction } from "react"
import type { Enemy } from "../../types/enemy"
import { getSnapshotIndex, getPrevSnapshot, getNumeric, getCharacter, getActionFromCharacter, getCharacterEnergyState, updateEnergyValue, copySnapshots, getPrevCharacter, getSnapshotById, getConcertoValue, assignCharacterToRow } from "../../utils/shared"

type UseCharacterActionsProps = {
  snapshots: Snapshot[]
  setSnapshots: Dispatch<SetStateAction<Snapshot[]>>
  charactersInBattle: Character[]
  enemy: Enemy
  tableConfig: {
    basic: { columns: { key: string }[] }
    buffs: { columns: { key: string }[] }
    debuffs: { columns: { key: string }[] }
    negativeStatuses: { columns: { key: string }[] }
    characters: { label: string; columns: { key: string }[] }[]
  }
}

export function useCharacterActions({ snapshots, setSnapshots, charactersInBattle, enemy, tableConfig }: UseCharacterActionsProps) {
  const charactersMap: Record<string, Character> = Object.fromEntries(charactersInBattle.map(c => [c.name, c]))
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
      let updated = copySnapshots(prevSnapshots)

      if (shouldTriggerOutroIntro(updated, snapshotId)) {
        updated = handleOutroIntroFlow(updated, snapshotId, charactersMap, characterColumnsMap, globalColumns)
        snapshotId += 2
      }

      updated = updateSnapshotsWithAction(updated, snapshotId, actionName, charactersMap, characterColumnsMap, globalColumns)

      return updated
    })
  }

  return { handleCharacterSelect, handleActionSelect }
}


/* =============================================================================================================================
   Internal Helpers
   ========================================================================================================================== */

function updateSnapshotsWithAction(
  snapshots: Snapshot[],
  snapshotId: number,
  actionName: string,
  charactersMap: Record<string, Character>,
  characterColumnsMap: Record<string, string[]>,
  globalColumns: { basic: string[]; buffs: string[]; debuffs: string[]; negativeStatuses: string[] }
): Snapshot[] {
  // -------- Check if expected state --------
  const updated = copySnapshots(snapshots)
  const index = getSnapshotIndex(updated, snapshotId)
  if (index === -1) return snapshots

  const snapshot = updated[index]
  if (!snapshot.character) return snapshots

  const character = getCharacter(charactersMap, snapshot.character)
  if (!character) return snapshots

  const action = getActionFromCharacter(charactersMap, snapshot.character, actionName)
  if (!action) return snapshots

  const prev = getPrevSnapshot(updated, index)

  // -------- Time & Damage --------
  const fromTime = getNumeric(prev, "toTime")
  const cumulativeDamage = getNumeric(prev, "damage") + action.damage
  const toTime = fromTime + action.time
  const dps = cumulativeDamage / toTime

  // -------- Energy Updates --------
  const energiesPrev = getCharacterEnergyState(prev, snapshot.character)
  const energiesCurr = getCharacterEnergyState(snapshot, snapshot.character)
  const maxEnergies = character.maxEnergies

  for (const [key, generated] of Object.entries(action.energyGenerated)) {
    if (key in energiesCurr) {
      energiesCurr[key] = updateEnergyValue(energiesPrev[key], generated, maxEnergies[key])
    }
  }

  if (action.name === "Outro" && energiesCurr.concerto !== undefined) {
    energiesCurr.concerto = 0
  }

  updated[index] = {...snapshot, action: action.name, fromTime, toTime, damage: cumulativeDamage, dps}

  // -------- Create Next Blank Snapshot --------
  if (index === updated.length - 1) {
    updated.push(createSnapshot(updated[updated.length - 1], charactersMap, characterColumnsMap, globalColumns))
  }

  return updated
}

// =============================================================================================================================

function shouldTriggerOutroIntro(snapshots: Snapshot[], snapshotId: number): boolean {
  if (snapshotId === 0) return false

  const prevChar = getPrevCharacter(snapshots, snapshotId)
  const currChar = getSnapshotById(snapshots, snapshotId)?.character ?? null

  if (!prevChar || !currChar || prevChar === currChar) return false

  const prevSnapshot = getPrevSnapshot(snapshots, snapshotId)
  const prevConcerto = getConcertoValue(prevSnapshot, prevChar)

  return prevConcerto === 100
}

function handleOutroIntroFlow(
  snapshots: Snapshot[],
  snapshotId: number,
  charactersMap: Record<string, Character>,
  characterColumnsMap: Record<string, string[]>,
  globalColumns: any
): Snapshot[] {
  let updated = copySnapshots(snapshots)

  const prevChar = getPrevCharacter(updated, snapshotId)!
  const currChar = getSnapshotById(updated, snapshotId)!.character!

  // Force Outro row
  updated[snapshotId] = assignCharacterToRow(updated[snapshotId], prevChar)
  updated = updateSnapshotsWithAction(updated, snapshotId, "Outro", charactersMap, characterColumnsMap, globalColumns)

  // Insert Intro row
  const introId = snapshotId + 1
  updated[introId] = assignCharacterToRow(updated[introId], currChar)
  updated = updateSnapshotsWithAction( updated, introId, "Intro", charactersMap, characterColumnsMap, globalColumns)

  // Prepare the next blank row for the real action
  const nextId = introId + 1
  updated[nextId] = assignCharacterToRow(updated[nextId], currChar)

  return updated
}

