// Owns the timeline (snapshot rows) and the Edit-Mode insertion queue for the rotation editor.
import { useState } from 'react'
import type { Character } from '../../types/character'
import type { TableConfig } from '../../types/tableDefinitions'
import type { Snapshot } from '../../types/snapshot'
import type { Settings } from '../../types/settings'
import type { EditModeEntry } from '../../types/editMode'
import { createEmptySnapshot } from '../../engine/state/createEmptySnapshot'
import { deriveGlobalColumns, energyColumnsByCharacter } from '../../tableConfig/engineColumns'

// ========== Hook: useSnapshots ===============================================================================================

type UseSnapshotsProps = {
  charactersInBattle: Character[]
  tableConfig: TableConfig
  settings: Settings
}

export function useSnapshots({ charactersInBattle, tableConfig, settings }: UseSnapshotsProps) {
  const charactersMap = Object.fromEntries(charactersInBattle.map(c => [c.name, c]))
  const characterColumnsMap = energyColumnsByCharacter(charactersInBattle)
  const globalColumns = deriveGlobalColumns(tableConfig)

  // A timeline always holds at least one row: the blank row the user fills in next.
  const emptyTimeline = (): Snapshot[] => [createEmptySnapshot(charactersMap, characterColumnsMap, globalColumns, tableConfig, settings.startWithFullEnergy)]

  const [snapshots, setSnapshots] = useState<Snapshot[]>(emptyTimeline)
  const [editModeEntries, setEditModeEntries] = useState<EditModeEntry[]>([])

  function resetTimeline() {
    setSnapshots(emptyTimeline())
    setEditModeEntries([])
  }

  function addEditModeEntry(entry: EditModeEntry) {
    setEditModeEntries(prev => [...prev, entry])
  }

  function removeEditModeEntry(id: string) {
    setEditModeEntries(prev => prev.filter(e => e.id !== id))
  }

  function updateEditModeEntry(id: string, updates: Partial<Omit<EditModeEntry, 'id'>>) {
    setEditModeEntries(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e))
  }

  function clearEditModeEntries() {
    setEditModeEntries([])
  }

  return { snapshots, setSnapshots, resetTimeline, editModeEntries, setEditModeEntries, addEditModeEntry, removeEditModeEntry, updateEditModeEntry, clearEditModeEntries }
}
