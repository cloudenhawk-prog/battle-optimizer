import { useSnapshots } from './useSnapshots'
import { useCharacterActions } from './useCharacterActions'
import { useImportExport } from './useImportExport'
import { useOptimizer } from './useOptimizer'
import type { ResolvedCharacter } from '../../types/character'
import type { TableConfig, GlobalColumns } from '../../types/tableDefinitions'
import type { Enemy } from '../../types/enemy'
import type { Settings } from '../useSettings'
import { useState } from 'react'
import type { DamageEvent } from '../../types/events'

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
  const { snapshots, setSnapshots, resetTimeline, optimizerBlocks, setOptimizerBlocks, addOptimizerBlock, removeOptimizerBlock, updateOptimizerBlock } = useSnapshots({ charactersInBattle, tableConfig, settings })

  const [prevGearResetKey, setPrevGearResetKey] = useState(gearResetKey)
  if (prevGearResetKey !== gearResetKey) {
    setPrevGearResetKey(gearResetKey)
    resetTimeline()
    setDamageEvents([])
  }

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
    optimizerBlocks,
    setOptimizerBlocks,
  })

  const optimizer = useOptimizer({
    snapshots,
    optimizerBlocks,
    charactersMap,
    characterColumnsMap,
    globalColumns,
    enemy,
    settings,
  })

  return {
    snapshots,
    damageEvents,
    handleCharacterSelect,
    handleActionSelect,
    tableConfig,
    importExport,
    optimizerBlocks,
    addOptimizerBlock,
    removeOptimizerBlock,
    updateOptimizerBlock,
    optimizer,
  }
}
