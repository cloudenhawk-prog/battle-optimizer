import RotationEditor from '../components/rotation-editor/RotationEditor'
// import { DamageTimeline } from '../components/rotation-editor/DamageTimeline'
import { characters, baseCharacters } from '../data/characters'
import { enemies } from '../data/enemies.ts'
import { buildTableConfig } from '../utils/table-builders/buildTableConfig'
import { flattenTableColumns } from '../utils/table-builders/helpers.tsx'
import { useState, useCallback } from 'react'
import Topbar from '../components/topbar/Topbar.tsx'
import type { Snapshot } from '../types/snapshot'
import type { DamageEvent } from '../types/events'
import type { ResolvedCharacter } from '../types/character'
import type { Gear } from '../types/gear'
import { resolveCharacter } from '../utils/gear/resolveCharacter'
import { DamageTimeline } from '../components/rotation-editor/DamageTimeline.tsx'

// ========== Main Rotation Editor Page ========================================================================================

export default function RotationEditorPage() {
  const tableConfig = buildTableConfig(characters)

  const allColumns = flattenTableColumns(tableConfig)
  const [columnVisibility, setColumnVisibility] = useState(() => Object.fromEntries(allColumns.map(col => [col.key, true])))
  const [snapshots, setSnapshots] = useState<Snapshot[]>([])
  const [damageEvents, setDamageEvents] = useState<DamageEvent[]>([])
  const [resolvedCharacters, setResolvedCharacters] = useState<ResolvedCharacter[]>(characters)
  // Incrementing this key forces RotationEditor to remount, resetting all timeline state.
  const [timelineKey, setTimelineKey] = useState(0)

  const handleSnapshotsChange = useCallback((newSnapshots: Snapshot[], newDamageEvents: DamageEvent[]) => {
    setSnapshots(newSnapshots)
    setDamageEvents(newDamageEvents)
  }, [])

  /**
   * Called when the player swaps weapon or echoes on a character.
   * Re-resolves the character's stats with the new gear, then resets the timeline
   * since past snapshots were computed with the old character stats.
   */
  const handleGearChange = useCallback((characterName: string, newGear: Gear) => {
    const base = baseCharacters.find(c => c.name === characterName)
    if (!base) return
    const reResolved = resolveCharacter(base, newGear)
    setResolvedCharacters(prev => prev.map(c => (c.name === characterName ? reResolved : c)))
    // Reset timeline — past actions are no longer valid with new character stats
    setSnapshots([])
    setDamageEvents([])
    setTimelineKey(k => k + 1)
  }, [])

  return (
    <div>
      <Topbar tableConfig={tableConfig} allColumns={allColumns} columnVisibility={columnVisibility} setColumnVisibility={setColumnVisibility} />

      <RotationEditor key={timelineKey} charactersInBattle={resolvedCharacters} enemy={enemies[0]} tableConfig={tableConfig} columnVisibility={columnVisibility} setColumnVisibility={setColumnVisibility} onSnapshotsChange={handleSnapshotsChange} onGearChange={handleGearChange} />

      <DamageTimeline snapshots={snapshots} damageEvents={damageEvents} selectedCharacters={resolvedCharacters} />
    </div>
  )
}
