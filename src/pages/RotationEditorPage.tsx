import RotationEditor from '../components/rotation-editor/RotationEditor'
import { characters, baseCharacters } from '../data/characters'
import { enemies } from '../data/enemies.ts'
import { buildTableConfig } from '../utils/table-builders/buildTableConfig'
import { flattenTableColumns } from '../utils/table-builders/helpers.tsx'
import { useState, useCallback } from 'react'
import Topbar from '../components/topbar/Topbar.tsx'
import type { ResolvedCharacter } from '../types/character'
import type { Gear } from '../types/gear'
import { resolveCharacter } from '../utils/gear/resolveCharacter'
import { useSettings } from '../hooks/useSettings'

// ========== Main Rotation Editor Page ========================================================================================

export default function RotationEditorPage() {
  const tableConfig = buildTableConfig(characters)
  const { settings } = useSettings()

  const allColumns = flattenTableColumns(tableConfig)
  const [columnVisibility, setColumnVisibility] = useState(() => Object.fromEntries(allColumns.map(col => [col.key, true])))
  const [resolvedCharacters, setResolvedCharacters] = useState<ResolvedCharacter[]>(characters)
  // Incrementing this key forces RotationEditor to remount, resetting all timeline state.
  const [timelineKey, setTimelineKey] = useState(0)
  const [gearResetKey, setGearResetKey] = useState(0)
  const [topbarVisible, setTopbarVisible] = useState(true)

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
    // Soft-reset the timeline without remounting RotationEditor (remounting would close the profile overlay)
    setGearResetKey(k => k + 1)
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <button
        type="button"
        className="topbarToggleButton"
        onClick={() => setTopbarVisible(v => !v)}
      >
        {topbarVisible ? '▲ Hide Bar' : '▼ Show Bar'}
      </button>
      {topbarVisible && <Topbar tableConfig={tableConfig} allColumns={allColumns} columnVisibility={columnVisibility} setColumnVisibility={setColumnVisibility} />}

      <RotationEditor key={timelineKey} gearResetKey={gearResetKey} charactersInBattle={resolvedCharacters} enemy={enemies[0]} tableConfig={tableConfig} columnVisibility={columnVisibility} setColumnVisibility={setColumnVisibility} onGearChange={handleGearChange} settings={settings} />
    </div>
  )
}
