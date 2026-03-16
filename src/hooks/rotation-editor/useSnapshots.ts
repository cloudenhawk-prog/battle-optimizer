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

  // Extract columns from statusEffects group
  const statusEffectsColumns = tableConfig.statusEffects?.columns ?? []
  const buffsCol = statusEffectsColumns.find(col => col.key === 'buffs')
  const debuffsCol = statusEffectsColumns.find(col => col.key === 'debuffs')
  const negativeStatusesCol = statusEffectsColumns.find(col => col.key === 'negativeStatuses')

  const globalColumns: GlobalColumns = {
    basic: tableConfig.basic.columns.map(col => col.key),
    buffs: buffsCol?.statusMetadata?.map(meta => meta.key) ?? [],
    debuffs: debuffsCol?.statusMetadata?.map(meta => meta.key) ?? [],
    negativeStatuses: negativeStatusesCol?.statusMetadata?.map(meta => meta.key) ?? [],
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

  // Get maxStacks from statusEffects columns metadata
  const statusEffectsColumns = tableConfig.statusEffects?.columns ?? []
  const buffsCol = statusEffectsColumns.find(col => col.key === 'buffs')
  const debuffsCol = statusEffectsColumns.find(col => col.key === 'debuffs')

  const buffsMaxStacks = Object.fromEntries((buffsCol?.statusMetadata || []).map(meta => [meta.key, meta.maxStacks || 1]))
  const debuffsMaxStacks = Object.fromEntries((debuffsCol?.statusMetadata || []).map(meta => [meta.key, meta.maxStacks || 1]))

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
    coordinatedAttacks: {},
    coordinatedAttacksTimeLeft: {},
    coordinatedAttacksSwapRequired: {},
    charactersCooldowns: {},
    charactersPositions: {},
    charactersPersistentUntil: {},
    charactersLastAction: {},
    charactersRequiresSwapOut: {},
    charactersForms: {},
    charactersSwapCooldownUntil: {},
    charactersRequiredFollowUp: {},
    charactersComboWindows: {},
  }
}
