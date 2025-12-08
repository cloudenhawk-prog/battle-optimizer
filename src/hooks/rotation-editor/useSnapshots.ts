import { useState } from "react"
import type { Character } from "../../types/characters"
import type { TableConfig } from "../../types/tableDefinitions"
import type { Snapshot } from "../../types/snapshot"

type GlobalColumns = {
  basic: string[]
  buffs: string[]
  debuffs: string[]
  negativeStatuses: string[]
}

export function useSnapshots(characters: Character[], tableConfig: TableConfig) {
  const charactersMap = Object.fromEntries(characters.map(c => [c.name, c]))

  // Map character -> array of energy keys dynamically from maxEnergies
  const characterColumnsMap = Object.fromEntries(
    characters.map(c => [c.name, Object.keys(c.maxEnergies)])
  )

  const globalColumns: GlobalColumns = {
    basic: tableConfig.basic.columns.map(col => col.key),
    buffs: tableConfig.buffs.columns.map(col => col.key),
    debuffs: tableConfig.debuffs.columns.map(col => col.key),
    negativeStatuses: tableConfig.negativeStatuses.columns.map(col => col.key),
  }

  const [snapshots, setSnapshots] = useState<Snapshot[]>([
    createEmptySnapshot(charactersMap, characterColumnsMap, globalColumns),
  ])

  return { snapshots, setSnapshots, createEmptySnapshot }
}

/* =========================
   Snapshot Creation Helpers
   ========================= */

function createEmptySnapshot(
  charactersMap: Record<string, Character>,
  characterColumnsMap: Record<string, string[]>,
  globalColumns: GlobalColumns
): Snapshot {
  const charactersEnergies = Object.fromEntries(
    Object.keys(charactersMap).map(charName => [
      charName,
      Object.fromEntries(characterColumnsMap[charName].map(key => [key, 0]))
    ])
  )

  const basicValues = Object.fromEntries(globalColumns.basic.map(col => [col, 0]))
  const buffs = Object.fromEntries(globalColumns.buffs.map(col => [col, 0]))
  const debuffs = Object.fromEntries(globalColumns.debuffs.map(col => [col, 0]))
  const negativeStatuses = Object.fromEntries(globalColumns.negativeStatuses.map(col => [col, 0]))

  return {
    id: "0",
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
