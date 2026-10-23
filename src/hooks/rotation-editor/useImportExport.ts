// Rotation library + file I/O + full re-simulations (load, append, delete-row, Edit Mode) for the editor.
import { useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import type { Snapshot } from '../../types/snapshot'
import type { ResolvedCharacter } from '../../types/character'
import type { Enemy } from '../../types/enemy'
import type { GlobalColumns, TableConfig } from '../../types/tableDefinitions'
import type { DamageEvent } from '../../types/events'
import type { NegativeStatusInAction } from '../../types/negativeStatus'
import type { ModifierInAction } from '../../types/modifiers'
import type { CoordinatedAttackInAction } from '../../types/coordinatedAttack'
import type { Settings } from '../../types/settings'
import type { EditModeEntry } from '../../types/editMode'
import type { SavedRotation, RotationStep, ImportError } from '../../types/rotation'
import type { EngineState } from '../../engine/simulation/engineState'
import { initEngineState } from '../../engine/simulation/engineState'
import { createEmptySnapshot } from '../../engine/state/createEmptySnapshot'
import { runImportSteps, type ImportRunParams, type FullImportRunResult } from '../../engine/simulation/runRotation'
import { extractSteps, mergeEditModeSteps, autocastHopsBeforeRow } from '../../engine/simulation/rotationSteps'
import { loadSavedRotations, saveRotationToStorage, deleteRotationFromStorage, loadSavedSnippets, saveSnippetToStorage, deleteSnippetFromStorage } from '../../persistence/rotationStorage'
import { downloadRotationAsJson, parseRotationFromJson } from '../../persistence/rotationFile'

// ========== Hook: useImportExport ============================================================================================

type UseImportExportProps = {
  snapshots: Snapshot[]
  setSnapshots: Dispatch<SetStateAction<Snapshot[]>>
  setDamageEvents: Dispatch<SetStateAction<DamageEvent[]>>
  resetTimeline: () => void
  charactersMap: Record<string, ResolvedCharacter>
  characterColumnsMap: Record<string, string[]>
  globalColumns: GlobalColumns
  tableConfig: TableConfig
  enemy: Enemy
  settings: Settings
  negativeStatusesInAction: React.MutableRefObject<NegativeStatusInAction[]>
  modifiersInAction: React.MutableRefObject<ModifierInAction[]>
  coordinatedAttacksInAction: React.MutableRefObject<CoordinatedAttackInAction[]>
}

export function useImportExport({
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
  negativeStatusesInAction: negativeStatusesInActionRef,
  modifiersInAction: modifiersInActionRef,
  coordinatedAttacksInAction: coordinatedAttacksInActionRef,
}: UseImportExportProps) {
  const [savedRotations, setSavedRotations] = useState<SavedRotation[]>(() => loadSavedRotations())
  const [savedSnippets, setSavedSnippets] = useState<SavedRotation[]>(() => loadSavedSnippets())
  const [lastImportError, setLastImportError] = useState<ImportError | null>(null)
  const [lastImportCompleted, setLastImportCompleted] = useState<number | null>(null)
  const [ignoreCastConditions, setIgnoreCastConditions] = useState(false)

  // ---------- Internal helpers ----------

  /** Re-simulates `steps` from a fresh row 0 with the current team/settings. */
  function replayFromScratch(steps: RotationStep[], overrides: Partial<ImportRunParams> = {}): FullImportRunResult {
    return runImportSteps({
      steps,
      initialSnapshot: createEmptySnapshot(charactersMap, characterColumnsMap, globalColumns, tableConfig, settings.startWithFullEnergy),
      charactersMap,
      characterColumnsMap,
      globalColumns,
      enemy,
      settings,
      ignoreCastConditions: false,
      ...overrides,
    })
  }

  /** The engine refs must follow the timeline, otherwise the next live edit starts from stale buffs/statuses. */
  function setEngineState(state: EngineState) {
    negativeStatusesInActionRef.current = state.negativeStatusesInAction
    modifiersInActionRef.current = state.modifiersInAction
    coordinatedAttacksInActionRef.current = state.coordinatedAttacksInAction
  }

  function commitRun(result: FullImportRunResult) {
    setSnapshots(result.snapshots)
    setDamageEvents(result.damageEvents)
    setEngineState({ negativeStatusesInAction: result.finalNegativeStatuses, modifiersInAction: result.finalModifiers, coordinatedAttacksInAction: result.finalCoordinatedAttacks })
  }

  function clearTimeline() {
    resetTimeline()
    setDamageEvents([])
    setEngineState(initEngineState())
  }

  function describeError(error: ImportError): string {
    return `Step ${error.stepIndex + 1} (${error.character} / ${error.action}): ${error.reason}`
  }

  /** Builds a named SavedRotation from the current timeline, or null when there's nothing to save. */
  function currentRotation(name: string): SavedRotation | null {
    const steps = extractSteps(snapshots)
    if (steps.length === 0) return null
    return { name, createdAt: new Date().toISOString(), steps }
  }

  // ---------- Library (localStorage) ----------

  function handleSave(name: string) {
    const rotation = currentRotation(name.trim())
    if (!rotation) return
    saveRotationToStorage(rotation)
    setSavedRotations(loadSavedRotations())
  }

  function handleDelete(name: string) {
    deleteRotationFromStorage(name)
    setSavedRotations(loadSavedRotations())
  }

  function handleSaveSnippet(name: string) {
    const snippet = currentRotation(name.trim())
    if (!snippet) return
    saveSnippetToStorage(snippet)
    setSavedSnippets(loadSavedSnippets())
  }

  function handleDeleteSnippet(name: string) {
    deleteSnippetFromStorage(name)
    setSavedSnippets(loadSavedSnippets())
  }

  // ---------- Loading / appending ----------

  /** Appends a snippet onto the current timeline, continuing from the live engine state. */
  function handleAppend(snippet: SavedRotation) {
    const result = runImportSteps({
      steps: snippet.steps,
      startingSnapshots: snapshots,
      initialNegativeStatuses: negativeStatusesInActionRef.current,
      initialModifiers: modifiersInActionRef.current,
      initialCoordinatedAttacks: coordinatedAttacksInActionRef.current,
      charactersMap,
      characterColumnsMap,
      globalColumns,
      enemy,
      settings,
      ignoreCastConditions,
    })

    setLastImportError(result.error)
    setLastImportCompleted(result.completedSteps)

    // Do not reset on append error — keep current timeline intact
    if (result.error) return

    setSnapshots(result.snapshots)
    setDamageEvents(prev => [...prev, ...result.damageEvents])
    setEngineState({ negativeStatusesInAction: result.finalNegativeStatuses, modifiersInAction: result.finalModifiers, coordinatedAttacksInAction: result.finalCoordinatedAttacks })
  }

  function handleLoad(rotation: SavedRotation) {
    const result = replayFromScratch(rotation.steps, { ignoreCastConditions })

    setLastImportError(result.error)
    setLastImportCompleted(result.completedSteps)

    // Reset the table to a clean state so the partial import doesn't cause confusion
    if (result.error) {
      clearTimeline()
      return
    }

    commitRun(result)
  }

  function handleFileUpload(content: string) {
    const rotation = parseRotationFromJson(content)
    if (!rotation) {
      setLastImportError({ stepIndex: -1, character: '', action: '', reason: 'Invalid file format' })
      setLastImportCompleted(null)
      return
    }
    handleLoad(rotation)
  }

  // ---------- Downloads ----------

  function handleDownload() {
    const rotation = currentRotation(`Rotation ${new Date().toLocaleDateString()}`)
    if (rotation) downloadRotationAsJson(rotation)
  }

  function handleDownloadNamed(name: string) {
    const rotation = currentRotation(name)
    if (rotation) downloadRotationAsJson(rotation)
  }

  // ---------- Edit Mode ----------

  /**
   * Validates the rotation with the given edit-mode entries merged in.
   * Does NOT modify any state. Returns the result of the validation.
   */
  function checkEditModeEntries(entries: EditModeEntry[]): { valid: boolean; reason?: string; dps?: number } {
    const result = replayFromScratch(mergeEditModeSteps(extractSteps(snapshots), entries))
    if (result.error) return { valid: false, reason: describeError(result.error) }
    const lastSnap = result.snapshots[result.snapshots.length - 2] ?? result.snapshots[result.snapshots.length - 1]
    return { valid: true, dps: lastSnap?.dps ?? 0 }
  }

  /**
   * Applies edit-mode entries into the rotation: merges them in, re-simulates the
   * full timeline, and updates state. Returns whether the rotation is valid.
   */
  function applyEditModeEntries(entries: EditModeEntry[]): { valid: boolean; reason?: string } {
    const result = replayFromScratch(mergeEditModeSteps(extractSteps(snapshots), entries))
    if (result.error) return { valid: false, reason: describeError(result.error) }
    commitRun(result)
    return { valid: true }
  }

  // ---------- Row deletion ----------

  /** Deleting a row = replaying every user step before it (the timeline is append-only otherwise). */
  function handleDeleteFromSnapshot(snapshotId: number) {
    const index = snapshots.findIndex(s => Number(s.id) === snapshotId)
    if (index === -1) return

    const maxAutocasts = autocastHopsBeforeRow(snapshots, index)
    const stepsToKeep = extractSteps(snapshots.slice(0, index))

    if (stepsToKeep.length === 0) {
      clearTimeline()
      return
    }

    commitRun(replayFromScratch(stepsToKeep, { maxAutocasts }))
  }

  return {
    savedRotations,
    savedSnippets,
    lastImportError,
    lastImportCompleted,
    ignoreCastConditions,
    setIgnoreCastConditions,
    handleSave,
    handleDelete,
    handleSaveSnippet,
    handleDeleteSnippet,
    handleAppend,
    handleLoad,
    handleDownload,
    handleDownloadNamed,
    handleFileUpload,
    handleDeleteFromSnapshot,
    checkEditModeEntries,
    applyEditModeEntries,
    clearImportStatus: () => { setLastImportError(null); setLastImportCompleted(null) },
  }
}
