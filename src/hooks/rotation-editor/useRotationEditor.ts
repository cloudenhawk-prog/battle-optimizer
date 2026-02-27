import { useSnapshots } from './useSnapshots'
import { useCharacterActions } from './useCharacterActions'
import type { Character } from '../../types/character'
import type { TableConfig } from '../../types/tableDefinitions'
import type { Enemy } from '../../types/enemy'
import type { DamageEvent } from '../../types/events'
import type { Snapshot } from '../../types/snapshot'
import { useState, useEffect } from 'react'

// ========== Hook: useRotationEditor ==========================================================================================

type UseRotationEditorProps = {
  charactersInBattle: Character[]
  tableConfig: TableConfig
  enemy: Enemy
  onSnapshotsChange?: (snapshots: Snapshot[], damageEvents: DamageEvent[]) => void
}

export function useRotationEditor({ charactersInBattle, tableConfig, enemy, onSnapshotsChange }: UseRotationEditorProps) {
  const [damageEvents, setDamageEvents] = useState<DamageEvent[]>([])
  const { snapshots, setSnapshots } = useSnapshots({ charactersInBattle, tableConfig })
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
