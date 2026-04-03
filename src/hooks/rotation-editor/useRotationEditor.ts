import { useSnapshots } from './useSnapshots'
import { useCharacterActions } from './useCharacterActions'
import { useImportExport } from './useImportExport'
import type { ResolvedCharacter } from '../../types/character'
import type { TableConfig, GlobalColumns } from '../../types/tableDefinitions'
import type { Enemy } from '../../types/enemy'
import type { Settings } from '../useSettings'
import { useState, useEffect } from 'react'

// ========== Hook: useRotationEditor ==========================================================================================

type UseRotationEditorProps = {
  charactersInBattle: ResolvedCharacter[]
  tableConfig: TableConfig
  enemy: Enemy
  gearResetKey?: number
  settings: Settings
}

export function useRotationEditor({ charactersInBattle, tableConfig, enemy, gearResetKey = 0, settings }: UseRotationEditorProps) {
  const [damageEvents, setDamageEvents] = useState<DamageEvent[]>([])
  const { snapshots, setSnapshots, resetTimeline } = useSnapshots({ charactersInBattle, tableConfig, settings })

  useEffect(() => {
    if (gearResetKey === 0) return
    resetTimeline()
    setDamageEvents([])
  }, [gearResetKey])

  const charactersMap: Record<string, ResolvedCharacter> = Object.fromEntries(charactersInBattle.map(c => [c.name, c]))
  const characterColumnsMap: Record<string, string[]> = Object.fromEntries(charactersInBattle.map(c => [c.name, Object.keys(c.maxEnergies)]))

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

  const { handleCharacterSelect, handleActionSelect, coordinatedAttacksInAction, negativeStatusesInAction, modifiersInAction } = useCharacterActions({
    setSnapshots,
    charactersInBattle,
    enemy,
    tableConfig,
    setDamageEvents,
    settings,
  })

  const importExport = useImportExport({
    snapshots,
    setSnapshots,
    setDamageEvents,
    resetTimeline,
    charactersMap,
    characterColumnsMap,
    globalColumns,
    tableConfig,
    enemy,
    settings,
    negativeStatusesInAction,
    modifiersInAction,
    coordinatedAttacksInAction,
  })

  return {
    snapshots,
    damageEvents,
    handleCharacterSelect,
    handleActionSelect,
    tableConfig,
    importExport,
  }
}
