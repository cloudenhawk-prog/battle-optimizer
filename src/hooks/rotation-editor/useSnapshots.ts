import { useState } from 'react'
import type { Character } from '../../types/character'
import type { TableConfig, GlobalColumns } from '../../types/tableDefinitions'
import type { Snapshot } from '../../types/snapshot'

// ========== Hook: useSnapshots ===============================================================================================

type UseSnapshotsProps = {
  charactersInBattle: Character[]
  tableConfig: TableConfig
}

export function useSnapshots({ charactersInBattle, tableConfig }: UseSnapshotsProps) {
  const charactersMap = Object.fromEntries(charactersInBattle.map(c => [c.name, c]))
  const characterColumnsMap = Object.fromEntries(charactersInBattle.map(c => [c.name, Object.keys(c.maxEnergies)]))
  const globalColumns: GlobalColumns = {
    basic: tableConfig.basic.columns.map(col => col.key),
    buffs: tableConfig.buffs?.columns.map(col => col.key) ?? [],
    debuffs: tableConfig.debuffs?.columns.map(col => col.key) ?? [],
    negativeStatuses: tableConfig.negativeStatuses?.columns.map(col => col.key) ?? [],
  }

  const [snapshots, setSnapshots] = useState<Snapshot[]>([createEmptySnapshot(charactersMap, characterColumnsMap, globalColumns, tableConfig)])

  return { snapshots, setSnapshots, createEmptySnapshot }
}

// ========== Internal Helpers =================================================================================================

function createEmptySnapshot(charactersMap: Record<string, Character>, characterColumnsMap: Record<string, string[]>, globalColumns: GlobalColumns, tableConfig: TableConfig): Snapshot {
  const charactersEnergies = Object.fromEntries(Object.keys(charactersMap).map(charName => [charName, Object.fromEntries(characterColumnsMap[charName].map(key => [key, 0]))]))

  const basicValues = Object.fromEntries(globalColumns.basic.map(col => [col, 0]))
  const buffs = Object.fromEntries(globalColumns.buffs.map(col => [col, 0]))
  const debuffs = Object.fromEntries(globalColumns.debuffs.map(col => [col, 0]))
  const negativeStatuses = Object.fromEntries(globalColumns.negativeStatuses.map(col => [col, 0]))

  // Get maxStacks from table config columns
  const buffsMaxStacks = Object.fromEntries((tableConfig.buffs?.columns || []).map(col => [col.key, (col as any).maxStacks || 1]))
  const debuffsMaxStacks = Object.fromEntries((tableConfig.debuffs?.columns || []).map(col => [col.key, (col as any).maxStacks || 1]))

  return {
    id: '0',
    character: '',
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
  }
}
