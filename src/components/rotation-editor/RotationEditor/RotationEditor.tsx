// Rotation editor page body: wires the editor hook to the table, banners and all overlays/panels.
import '../../../styles/rotation-editor/RotationEditor.css'
import { useEffect } from 'react'
import { useRotationEditor } from '../../../hooks/rotation-editor/useRotationEditor'
import { RotationTable } from '../RotationTable'
import DataOverlay from '../DataOverlay'
import SummaryOverlay from '../SummaryOverlay'
import BuildOptimizerOverlay from '../BuildOptimizerOverlay'
import { ImportExportPanel } from '../ImportExportPanel'
import type { ResolvedCharacter } from '../../../types/character'
import type { Enemy } from '../../../types/enemy'
import type { TableConfig, ColumnVisibility } from '../../../types/tableDefinitions'
import type { Gear } from '../../../types/gear'
import type { Settings } from '../../../types/settings'
import { useRowOverlay } from './useRowOverlay'
import { useEditModeControls } from './useEditModeControls'
import { ImportStatusBanner, EditModeBar } from './EditorBanners'

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
  const { overlayOpen, setOverlayOpen, overlayData, overlayIndex, actionSnapshots, openOverlayAt, handleRowClick } = useRowOverlay(snapshots, damageEvents)
  const { optimizerEditMode, editModeCheckResult, handleInsertEditModeEntry, handleCheckEditMode, handleConfirmEditMode, handleDiscardEditMode } = useEditModeControls({
    editModeEntries,
    addEditModeEntry,
    clearEditModeEntries,
    checkEditModeEntries: importExport.checkEditModeEntries,
    applyEditModeEntries: importExport.applyEditModeEntries,
  })

  const { lastImportError, lastImportCompleted } = importExport
  const hasImportStatus = lastImportError !== null || lastImportCompleted !== null

  const charactersMap = Object.fromEntries(charactersInBattle.map(c => [c.name, c]))

  // Auto-dismiss the import banner after 6s (timer restarts on every new import result)
  useEffect(() => {
    if (!hasImportStatus) return
    const timer = setTimeout(() => {
      importExport.clearImportStatus()
    }, 6000)
    return () => clearTimeout(timer)
  }, [lastImportError, lastImportCompleted])

  // The sidebar enables Rotation Stats / Build Optimizer only once the rotation has data
  const hasData = snapshots.some(s => s.action)

  useEffect(() => {
    onHasDataChange?.(hasData)
  }, [hasData])

  return (
    <div className="pageWrapper">
      {hasImportStatus && (
        <ImportStatusBanner lastImportError={lastImportError} lastImportCompleted={lastImportCompleted} onDismiss={() => importExport.clearImportStatus()} />
      )}

      {optimizerEditMode && (
        <EditModeBar editModeCheckResult={editModeCheckResult} hasEntries={editModeEntries.length !== 0} onCheck={handleCheckEditMode} onConfirm={handleConfirmEditMode} onDiscard={handleDiscardEditMode} />
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
