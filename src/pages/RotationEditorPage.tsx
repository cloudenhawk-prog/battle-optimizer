import RotationEditor from '../components/rotation-editor/RotationEditor'
import { DamageTimeline } from '../components/rotation-editor/DamageTimeline'
import { characters } from '../data/characters'
import { enemies } from '../data/enemies.ts'
import { buildTableConfig } from '../utils/table-builders/buildTableConfig'
import { flattenTableColumns } from '../utils/table-builders/helpers.tsx'
import { useState, useCallback } from 'react'
import Topbar from '../components/topbar/Topbar.tsx'
import type { Snapshot } from '../types/snapshot'
import type { DamageEvent } from '../types/events'

// ========== Main Rotation Editor Page ========================================================================================

export default function RotationEditorPage() {
  const tableConfig = buildTableConfig(characters)

  const allColumns = flattenTableColumns(tableConfig)
  const [columnVisibility, setColumnVisibility] = useState(() => Object.fromEntries(allColumns.map(col => [col.key, true])))
  const [snapshots, setSnapshots] = useState<Snapshot[]>([])
  const [damageEvents, setDamageEvents] = useState<DamageEvent[]>([])

  const handleSnapshotsChange = useCallback((newSnapshots: Snapshot[], newDamageEvents: DamageEvent[]) => {
    setSnapshots(newSnapshots)
    setDamageEvents(newDamageEvents)
  }, [])

  return (
    <div>
      <Topbar tableConfig={tableConfig} allColumns={allColumns} columnVisibility={columnVisibility} setColumnVisibility={setColumnVisibility} />

      <RotationEditor charactersInBattle={characters} enemy={enemies[0]} tableConfig={tableConfig} columnVisibility={columnVisibility} setColumnVisibility={setColumnVisibility} onSnapshotsChange={handleSnapshotsChange} />

      <DamageTimeline snapshots={snapshots} damageEvents={damageEvents} />
    </div>
  )
}
