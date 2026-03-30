import { useSnapshots } from './useSnapshots'
import { useCharacterActions } from './useCharacterActions'
import type { ResolvedCharacter } from '../../types/character'
import type { TableConfig } from '../../types/tableDefinitions'
import type { Enemy } from '../../types/enemy'
import type { DamageEvent } from '../../types/events'
import type { Snapshot } from '../../types/snapshot'
import { useState, useEffect } from 'react'

// ========== Hook: useRotationEditor ==========================================================================================

type UseRotationEditorProps = {
  charactersInBattle: ResolvedCharacter[]
  tableConfig: TableConfig
  enemy: Enemy
  onSnapshotsChange?: (snapshots: Snapshot[], damageEvents: DamageEvent[]) => void
  gearResetKey?: number
}

export function useRotationEditor({ charactersInBattle, tableConfig, enemy, onSnapshotsChange, gearResetKey = 0 }: UseRotationEditorProps) {
  const [damageEvents, setDamageEvents] = useState<DamageEvent[]>([])
  const { snapshots, setSnapshots, resetTimeline } = useSnapshots({ charactersInBattle, tableConfig })

  useEffect(() => {
    if (gearResetKey === 0) return
    resetTimeline()
    setDamageEvents([])
  }, [gearResetKey])
  const { handleCharacterSelect, handleActionSelect } = useCharacterActions({ setSnapshots, charactersInBattle, enemy, tableConfig, setDamageEvents })

  useEffect(() => {
    if (onSnapshotsChange) {
      onSnapshotsChange(snapshots, damageEvents)
    }
  }, [snapshots, damageEvents, onSnapshotsChange])

  return {
    snapshots,
    damageEvents,
    handleCharacterSelect,
    handleActionSelect,
    tableConfig,
  }
}
