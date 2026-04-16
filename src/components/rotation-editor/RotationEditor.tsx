import '../../styles/rotation-editor/RotationEditor.css'
import { useState, useEffect } from 'react'
import { useRotationEditor } from '../../hooks/rotation-editor/useRotationEditor'
import { RotationTable } from './RotationTable'
import DataOverlay from './DataOverlay'
import SummaryOverlay from './SummaryOverlay'
import { ImportExportPanel } from './ImportExportPanel'
import { OptimizerPanel } from './OptimizerPanel'
import type { ResolvedCharacter } from '../../types/character'
import type { Enemy } from '../../types/enemy'
import type { TableConfig, ColumnVisibility } from '../../types/tableDefinitions'
import type { Gear } from '../../types/gear'
import type { Settings } from '../../hooks/useSettings'
import type { Snapshot } from '../../types/snapshot'
import type { DamageEvent } from '../../types/events'
import type { OptimizerBlock } from '../../types/optimizerBlock'
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
  onHasDataChange?: (hasData: boolean) => void
}

export default function RotationEditor({ charactersInBattle, enemy, tableConfig, columnVisibility, setColumnVisibility, onGearChange, onSequenceChange, gearResetKey, settings, rotationsOpen, setRotationsOpen, summaryOpen, setSummaryOpen, onHasDataChange }: RotationEditorProps) {
  const { snapshots, damageEvents, handleCharacterSelect, handleActionSelect, importExport, optimizerBlocks, addOptimizerBlock, removeOptimizerBlock, updateOptimizerBlock, optimizer } = useRotationEditor({ charactersInBattle, tableConfig, enemy, gearResetKey, settings })
  const [overlayOpen, setOverlayOpen] = useState(false)
  const [overlayData, setOverlayData] = useState<null | { snapshot: Snapshot; previousSnapshot: Snapshot | null; damageEvents: DamageEvent[] }>(null)
  const [overlayIndex, setOverlayIndex] = useState<number>(0)
  const [activeOptimizerBlockId, setActiveOptimizerBlockId] = useState<string | null>(null)
  const rotationCtx = useRotationPageContext()
  const optimizerEditMode = rotationCtx?.optimizerEditMode ?? false

  const { lastImportError, lastImportCompleted } = importExport
  const hasImportStatus = lastImportError !== null || lastImportCompleted !== null

  const activeOptimizerBlock = optimizerBlocks.find(b => b.id === activeOptimizerBlockId) ?? null
  const charactersMap = Object.fromEntries(charactersInBattle.map(c => [c.name, c]))

  // Action snapshots are the navigable rows (only rows with an action are shown in the overlay)
  const actionSnapshots = snapshots.filter(s => s.action)

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

  function handleAddOptimizerBlock(insertAfterStepCount: number) {
    const id = `flex-${Date.now()}`
    const newBlock: OptimizerBlock = {
      id,
      insertAfterStepCount,
      draftSteps: [],
    }
    addOptimizerBlock(newBlock)
  }

  function handleOptimizerApply(blockId: string) {
    const block = optimizerBlocks.find(b => b.id === blockId)
    if (!block) return
    importExport.applyOptimizerResult(blockId, block.draftSteps)
    setActiveOptimizerBlockId(null)
    optimizer.reset()
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
      <RotationTable
        snapshots={snapshots}
        charactersInBattle={charactersInBattle}
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
        optimizerBlocks={optimizerBlocks}
        onOptimizerBlockConfigure={setActiveOptimizerBlockId}
        onOptimizerBlockRemove={removeOptimizerBlock}
        onAddOptimizerBlock={handleAddOptimizerBlock}
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
      {activeOptimizerBlock && (
        <OptimizerPanel
          block={activeOptimizerBlock}
          charactersMap={charactersMap}
          result={optimizer.lastBlockId === activeOptimizerBlockId ? optimizer.result : null}
          isRunning={optimizer.isRunning}
          onUpdateBlock={updates => updateOptimizerBlock(activeOptimizerBlock.id, updates)}
          onRun={optimizer.run}
          onApply={handleOptimizerApply}
          onClose={() => setActiveOptimizerBlockId(null)}
        />
      )}
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
    </div>
  )
}
