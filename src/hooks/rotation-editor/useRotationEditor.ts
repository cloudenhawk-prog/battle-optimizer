// Composes the rotation editor's state: timeline, live-edit handlers, import/export; resets on gear changes.
import { useSnapshots } from './useSnapshots'
import { useCharacterActions } from './useCharacterActions'
import { useImportExport } from './useImportExport'
import type { ResolvedCharacter } from '../../types/character'
import type { TableConfig } from '../../types/tableDefinitions'
import type { Enemy } from '../../types/enemy'
import type { Settings } from '../../types/settings'
import { useState } from 'react'
import type { DamageEvent } from '../../types/events'
import { deriveGlobalColumns, energyColumnsByCharacter } from '../../tableConfig/engineColumns'

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
  const { snapshots, setSnapshots, resetTimeline, editModeEntries, addEditModeEntry, removeEditModeEntry, updateEditModeEntry, clearEditModeEntries } = useSnapshots({ charactersInBattle, tableConfig, settings })

  // Gear/sequence changes bump gearResetKey; reset during render (React's "adjust state on prop change" pattern).
  const [prevGearResetKey, setPrevGearResetKey] = useState(gearResetKey)
  if (prevGearResetKey !== gearResetKey) {
    setPrevGearResetKey(gearResetKey)
    resetTimeline()
    setDamageEvents([])
  }

  const charactersMap: Record<string, ResolvedCharacter> = Object.fromEntries(charactersInBattle.map(c => [c.name, c]))
  const characterColumnsMap = energyColumnsByCharacter(charactersInBattle)
  const globalColumns = deriveGlobalColumns(tableConfig)

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
    editModeEntries,
    addEditModeEntry,
    removeEditModeEntry,
    updateEditModeEntry,
    clearEditModeEntries,
  }
}
