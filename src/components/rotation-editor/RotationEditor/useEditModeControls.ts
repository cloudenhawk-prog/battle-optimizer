// Edit Mode (insert steps into an existing rotation): check/confirm/discard handlers and the check-result state.
import { useState, useEffect, useRef } from 'react'
import type { EditModeEntry } from '../../../types/editMode'
import { useRotationPageContext } from '../../../contexts/RotationPageContext'

// ========== Hook: useEditModeControls ========================================================================================

export type EditModeCheckResult = { valid: boolean; reason?: string; dps?: number }

type UseEditModeControlsProps = {
  editModeEntries: EditModeEntry[]
  addEditModeEntry: (entry: EditModeEntry) => void
  clearEditModeEntries: () => void
  checkEditModeEntries: (entries: EditModeEntry[]) => EditModeCheckResult
  applyEditModeEntries: (entries: EditModeEntry[]) => { valid: boolean; reason?: string }
}

export function useEditModeControls({ editModeEntries, addEditModeEntry, clearEditModeEntries, checkEditModeEntries, applyEditModeEntries }: UseEditModeControlsProps) {
  const [editModeCheckResult, setEditModeCheckResult] = useState<EditModeCheckResult | null>(null)
  const rotationCtx = useRotationPageContext()
  // Edit mode itself is toggled from the sidebar, so it lives in the page context
  const optimizerEditMode = rotationCtx?.optimizerEditMode ?? false
  const prevEditModeRef = useRef(optimizerEditMode)

  // When the user exits edit mode via the sidebar (without Confirm), discard pending entries
  useEffect(() => {
    if (prevEditModeRef.current === true && optimizerEditMode === false) {
      clearEditModeEntries()
      setEditModeCheckResult(null)
    }
    prevEditModeRef.current = optimizerEditMode
  }, [optimizerEditMode])

  function handleInsertEditModeEntry(insertAfterStepCount: number) {
    const entry: EditModeEntry = {
      id: `edit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      insertAfterStepCount,
      character: '',
      action: '',
    }
    addEditModeEntry(entry)
    setEditModeCheckResult(null)
  }

  // Dry-run: validates the rotation with the pending entries inserted, without applying them
  function handleCheckEditMode() {
    const emptyEntries = editModeEntries.filter(e => !e.character || !e.action)
    if (emptyEntries.length > 0) {
      setEditModeCheckResult({ valid: false, reason: `${emptyEntries.length} step${emptyEntries.length > 1 ? 's are' : ' is'} missing a character or action.` })
      return
    }
    if (editModeEntries.length === 0) {
      setEditModeCheckResult({ valid: true, reason: 'No new steps inserted — rotation is unchanged.' })
      return
    }
    const result = checkEditModeEntries(editModeEntries)
    setEditModeCheckResult(result)
  }

  // Applies the entries and leaves edit mode on success; stays in edit mode with the reason on failure
  function handleConfirmEditMode() {
    const emptyEntries = editModeEntries.filter(e => !e.character || !e.action)
    if (emptyEntries.length > 0) {
      setEditModeCheckResult({ valid: false, reason: `${emptyEntries.length} step${emptyEntries.length > 1 ? 's are' : ' is'} missing a character or action.` })
      return
    }
    if (editModeEntries.length === 0) {
      // Nothing to apply — just exit edit mode
      clearEditModeEntries()
      setEditModeCheckResult(null)
      rotationCtx?.toggleOptimizerEditMode()
      return
    }
    const result = applyEditModeEntries(editModeEntries)
    if (result.valid) {
      clearEditModeEntries()
      setEditModeCheckResult(null)
      rotationCtx?.toggleOptimizerEditMode()
    } else {
      setEditModeCheckResult({ valid: false, reason: result.reason })
    }
  }

  function handleDiscardEditMode() {
    clearEditModeEntries()
    setEditModeCheckResult(null)
  }

  return { optimizerEditMode, editModeCheckResult, handleInsertEditModeEntry, handleCheckEditMode, handleConfirmEditMode, handleDiscardEditMode }
}
