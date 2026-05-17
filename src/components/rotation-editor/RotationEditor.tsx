import '../../styles/rotation-editor/RotationEditor.css'
import { useState, useEffect, useRef } from 'react'
import { useRotationEditor } from '../../hooks/rotation-editor/useRotationEditor'
import { RotationTable } from './RotationTable'
import DataOverlay from './DataOverlay'
import SummaryOverlay from './SummaryOverlay'
import BuildOptimizerOverlay from './BuildOptimizerOverlay'
import { ImportExportPanel } from './ImportExportPanel'
import type { ResolvedCharacter } from '../../types/character'
import type { Enemy } from '../../types/enemy'
import type { TableConfig, ColumnVisibility } from '../../types/tableDefinitions'
import type { Gear } from '../../types/gear'
import type { Settings } from '../../hooks/useSettings'
import type { Snapshot } from '../../types/snapshot'
import type { DamageEvent } from '../../types/events'
import type { EditModeEntry } from '../../types/editMode'
import { useRotationPageContext } from '../../contexts/RotationPageContext'

// ========== Component: Rotation Editor =======================================================================================

type RotationEditorProps = {
  charactersInBattle: ResolvedCharacter[]
  enemy: Enemy
  tableConfig: TableConfig
  columnVisibility: ColumnVisibility
  setColumnVisibility: React.Dispatch<React.SetStateAction<ColumnVisibility>>
  onGearChange?: (characterName: string, newGear: Gear) => void
  onSequenceChange?: (characterName: string, sequence: 0 | 1 | 2 | 3 | 4 | 5 | 6) => void
  gearResetKey?: number
  settings: Settings
  rotationsOpen: boolean
  setRotationsOpen: React.Dispatch<React.SetStateAction<boolean>>
  summaryOpen: boolean
  setSummaryOpen: React.Dispatch<React.SetStateAction<boolean>>
  buildOptimizerOpen: boolean
  setBuildOptimizerOpen: React.Dispatch<React.SetStateAction<boolean>>
  onHasDataChange?: (hasData: boolean) => void
}

export default function RotationEditor({ charactersInBattle, enemy, tableConfig, columnVisibility, setColumnVisibility, onGearChange, onSequenceChange, gearResetKey, settings, rotationsOpen, setRotationsOpen, summaryOpen, setSummaryOpen, buildOptimizerOpen, setBuildOptimizerOpen, onHasDataChange }: RotationEditorProps) {
  const { snapshots, damageEvents, handleCharacterSelect, handleActionSelect, importExport, editModeEntries, addEditModeEntry, removeEditModeEntry, updateEditModeEntry, clearEditModeEntries } = useRotationEditor({ charactersInBattle, tableConfig, enemy, gearResetKey, settings })
  const [overlayOpen, setOverlayOpen] = useState(false)
  const [overlayData, setOverlayData] = useState<null | { snapshot: Snapshot; previousSnapshot: Snapshot | null; damageEvents: DamageEvent[] }>(null)
  const [overlayIndex, setOverlayIndex] = useState<number>(0)
  const [editModeCheckResult, setEditModeCheckResult] = useState<{ valid: boolean; reason?: string; dps?: number } | null>(null)
  const rotationCtx = useRotationPageContext()
  const optimizerEditMode = rotationCtx?.optimizerEditMode ?? false
  const prevEditModeRef = useRef(optimizerEditMode)

  const { lastImportError, lastImportCompleted } = importExport
  const hasImportStatus = lastImportError !== null || lastImportCompleted !== null

  const charactersMap = Object.fromEntries(charactersInBattle.map(c => [c.name, c]))

  // Action snapshots are the navigable rows (only rows with an action are shown in the overlay)
  const actionSnapshots = snapshots.filter(s => s.action)

  // When the user exits edit mode via the sidebar (without Confirm), discard pending entries
  useEffect(() => {
    if (prevEditModeRef.current === true && optimizerEditMode === false) {
      clearEditModeEntries()
      setEditModeCheckResult(null)
    }
    prevEditModeRef.current = optimizerEditMode
  }, [optimizerEditMode])

  useEffect(() => {
    if (!hasImportStatus) return
    const timer = setTimeout(() => {
      importExport.clearImportStatus()
    }, 6000)
    return () => clearTimeout(timer)
  }, [lastImportError, lastImportCompleted])

  function openOverlayAt(index: number) {
    const s = actionSnapshots[index]
    if (!s) return
    const filtered = (damageEvents ?? []).filter(e => Number(e.snapshotId) === Number(s.id))
    const fullIndex = snapshots.findIndex(snap => snap.id === s.id)
    const prevSnapshot = fullIndex > 0 ? snapshots[fullIndex - 1] : null
    setOverlayIndex(index)
    setOverlayData({ snapshot: s, previousSnapshot: prevSnapshot, damageEvents: filtered })
    setOverlayOpen(true)
  }

  function handleRowClick(snapshot: Snapshot) {
    if (!snapshot.action) return
    const index = actionSnapshots.findIndex(s => s.id === snapshot.id)
    openOverlayAt(index)
  }

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
    const result = importExport.checkEditModeEntries(editModeEntries)
    setEditModeCheckResult(result)
  }

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
    const result = importExport.applyEditModeEntries(editModeEntries)
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

  const hasData = snapshots.some(s => s.action)

  useEffect(() => {
    onHasDataChange?.(hasData)
  }, [hasData])

  return (
    <div className="pageWrapper">
      {hasImportStatus && (
        <div className={`importBanner ${lastImportError ? 'importBannerError' : 'importBannerSuccess'}`}>
          <span className="importBannerIcon">{lastImportError ? '⚠' : '✓'}</span>
          <span className="importBannerText">
            {lastImportError
              ? `Stopped after ${lastImportCompleted} step${lastImportCompleted !== 1 ? 's' : ''} — step ${lastImportError.stepIndex + 1} (${lastImportError.character} / ${lastImportError.action}): ${lastImportError.reason}`
              : `Loaded ${lastImportCompleted} step${lastImportCompleted !== 1 ? 's' : ''} successfully`
            }
          </span>
          <button
            className="importBannerDismiss"
            onClick={() => importExport.clearImportStatus()}
            aria-label="Dismiss"
          >✕</button>
        </div>
      )}

      {optimizerEditMode && (
        <div className="editModeBar">
          <span className="editModeBarLabel">EDIT MODE</span>
          <div className="editModeBarActions">
            <button className="editModeBarBtn" onClick={handleCheckEditMode}>
              Check Rotation
            </button>
            <button className="editModeBarBtn editModeBarBtnConfirm" onClick={handleConfirmEditMode}>
              Confirm
            </button>
            <button className="editModeBarBtn editModeBarBtnDiscard" onClick={handleDiscardEditMode} disabled={editModeEntries.length === 0}>
              Discard Changes
            </button>
          </div>
          {editModeCheckResult !== null && (
            <div className={`editModeBarResult ${editModeCheckResult.valid ? 'editModeBarResultValid' : 'editModeBarResultInvalid'}`}>
              {editModeCheckResult.valid ? (
                <>
                  <span className="editModeBarResultIcon">✓</span>
                  <span>{editModeCheckResult.reason ?? (editModeCheckResult.dps !== undefined ? `Rotation works — ${editModeCheckResult.dps.toFixed(0)} DPS` : 'Rotation works')}</span>
                </>
              ) : (
                <>
                  <span className="editModeBarResultIcon">✗</span>
                  <span>{editModeCheckResult.reason}</span>
                </>
              )}
            </div>
          )}
        </div>
      )}

      <RotationTable
        snapshots={snapshots}
        charactersInBattle={charactersInBattle}
        charactersMap={charactersMap}
        tableConfig={tableConfig}
        onSelectCharacter={handleCharacterSelect}
        onSelectAction={handleActionSelect}
        columnVisibility={columnVisibility}
        setColumnVisibility={setColumnVisibility}
        onRowClick={handleRowClick}
        onGearChange={onGearChange}
        onSequenceChange={onSequenceChange}
        sandboxMode={settings.sandboxMode}
        rowDeletionMode={settings.rowDeletionMode}
        onDeleteRow={settings.rowDeletionMode ? importExport.handleDeleteFromSnapshot : undefined}
        editModeEntries={editModeEntries}
        onUpdateEditModeEntry={updateEditModeEntry}
        onRemoveEditModeEntry={removeEditModeEntry}
        onInsertEditModeEntry={handleInsertEditModeEntry}
        optimizerEditMode={optimizerEditMode}
      />
      <ImportExportPanel
        open={rotationsOpen}
        onClose={() => setRotationsOpen(false)}
        savedRotations={importExport.savedRotations}
        savedSnippets={importExport.savedSnippets}
        hasCurrentRotation={hasData}
        onSave={importExport.handleSave}
        onLoad={importExport.handleLoad}
        onDelete={importExport.handleDelete}
        onSaveSnippet={importExport.handleSaveSnippet}
        onDeleteSnippet={importExport.handleDeleteSnippet}
        onAppend={importExport.handleAppend}
        onDownload={importExport.handleDownload}
        onFileUpload={importExport.handleFileUpload}
        onClearImportStatus={importExport.clearImportStatus}
        ignoreCastConditions={importExport.ignoreCastConditions}
        onToggleIgnoreCastConditions={() => importExport.setIgnoreCastConditions(v => !v)}
      />
      <DataOverlay
        snapshot={overlayData?.snapshot ?? null}
        previousSnapshot={overlayData?.previousSnapshot ?? null}
        startWithFullEnergy={settings.startWithFullEnergy}
        damageEvents={overlayData?.damageEvents ?? []}
        characters={charactersInBattle}
        open={overlayOpen}
        onClose={() => setOverlayOpen(false)}
        onPrev={overlayIndex > 0 ? () => openOverlayAt(overlayIndex - 1) : undefined}
        onNext={overlayIndex < actionSnapshots.length - 1 ? () => openOverlayAt(overlayIndex + 1) : undefined}
        hasPrev={overlayIndex > 0}
        hasNext={overlayIndex < actionSnapshots.length - 1}
        rowInfo={{ current: overlayIndex + 1, total: actionSnapshots.length }}
      />
      <SummaryOverlay open={summaryOpen} onClose={() => setSummaryOpen(false)} snapshots={snapshots} damageEvents={damageEvents ?? []} characters={charactersInBattle} />
      <BuildOptimizerOverlay open={buildOptimizerOpen} onClose={() => setBuildOptimizerOpen(false)} snapshots={snapshots} charactersInBattle={charactersInBattle} enemy={enemy} tableConfig={tableConfig} settings={settings} />
    </div>
  )
}
