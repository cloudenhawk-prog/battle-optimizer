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
import { useRotationPageContext } from '../contexts/RotationPageContext'

// ========== Main Rotation Editor Page ========================================================================================

export default function RotationEditorPage() {
  const tableConfig = buildTableConfig(characters)
  const { settings } = useSettings()

  const allColumns = flattenTableColumns(tableConfig)
  const [columnVisibility, setColumnVisibility] = useState(() => Object.fromEntries(allColumns.map(col => [col.key, true])))
  const [resolvedCharacters, setResolvedCharacters] = useState<ResolvedCharacter[]>(characters)
  const [gearResetKey, setGearResetKey] = useState(0)

  const rotationCtx = useRotationPageContext()!
  const { topbarVisible, rotationsOpen, setRotationsOpen, summaryOpen, setSummaryOpen, onHasDataChange } = rotationCtx

  /**
   * Called when the player swaps weapon or echoes on a character.
   * Re-resolves the character's stats with the new gear, then resets the timeline
   * since past snapshots were computed with the old character stats.
   * Preserves the current sequence level so it survives gear changes.
   */
  const handleGearChange = useCallback((characterName: string, newGear: Gear) => {
    const base = baseCharacters.find(c => c.name === characterName)
    if (!base) return
    setResolvedCharacters(prev => {
      const currentSeq = prev.find(c => c.name === characterName)?.sequence ?? base.sequence
      const reResolved = resolveCharacter({ ...base, sequence: currentSeq }, newGear)
      return prev.map(c => (c.name === characterName ? reResolved : c))
    })
    // Soft-reset the timeline without remounting RotationEditor (remounting would close the profile overlay)
    setGearResetKey(k => k + 1)
  }, [])

  /**
   * Called when the player changes a character's sequence level in the profile overlay.
   * Updates the character in state and resets the timeline since sequence-gated modifiers
   * may now appear or disappear.
   */
  const handleSequenceChange = useCallback((characterName: string, sequence: 0 | 1 | 2 | 3 | 4 | 5 | 6) => {
    setResolvedCharacters(prev => prev.map(c => (c.name === characterName ? { ...c, sequence } : c)))
    setGearResetKey(k => k + 1)
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, gap: 'var(--content-column-width-free-space)' }}>
      {topbarVisible && <Topbar tableConfig={tableConfig} allColumns={allColumns} columnVisibility={columnVisibility} setColumnVisibility={setColumnVisibility} />}

      <RotationEditor gearResetKey={gearResetKey} charactersInBattle={resolvedCharacters} enemy={enemies[0]} tableConfig={tableConfig} columnVisibility={columnVisibility} setColumnVisibility={setColumnVisibility} onGearChange={handleGearChange} onSequenceChange={handleSequenceChange} settings={settings} rotationsOpen={rotationsOpen} setRotationsOpen={setRotationsOpen} summaryOpen={summaryOpen} setSummaryOpen={setSummaryOpen} onHasDataChange={onHasDataChange} />
    </div>
  )
}
  