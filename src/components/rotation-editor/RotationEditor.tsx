import '../../styles/rotation-editor/RotationEditor.css'
import { useState, useEffect } from 'react'
import { useRotationEditor } from '../../hooks/rotation-editor/useRotationEditor'
import { RotationTable } from './RotationTable'
import DataOverlay from './DataOverlay'
import SummaryOverlay from './SummaryOverlay'
import { ImportExportPanel } from './ImportExportPanel'
import type { ResolvedCharacter } from '../../types/character'
import type { Enemy } from '../../types/enemy'
import type { TableConfig, ColumnVisibility } from '../../types/tableDefinitions'
import type { Gear } from '../../types/gear'
import type { Settings } from '../../hooks/useSettings'

// ========== Component: Rotation Editor =======================================================================================

type RotationEditorProps = {
  charactersInBattle: ResolvedCharacter[]
  enemy: Enemy
  tableConfig: TableConfig
  columnVisibility: ColumnVisibility
  setColumnVisibility: React.Dispatch<React.SetStateAction<ColumnVisibility>>
  onGearChange?: (characterName: string, newGear: Gear) => void
  gearResetKey?: number
  settings: Settings
}

export default function RotationEditor({ charactersInBattle, enemy, tableConfig, columnVisibility, setColumnVisibility, onGearChange, gearResetKey, settings }: RotationEditorProps) {
  const { snapshots, damageEvents, handleCharacterSelect, handleActionSelect, importExport } = useRotationEditor({ charactersInBattle, tableConfig, enemy, gearResetKey, settings })
  const [overlayOpen, setOverlayOpen] = useState(false)
  const [overlayData, setOverlayData] = useState<null | { snapshot: Snapshot; damageEvents: DamageEvent[] }>(null)
  const [summaryOpen, setSummaryOpen] = useState(false)
  const [rotationsOpen, setRotationsOpen] = useState(false)
  const [bannerVisible, setBannerVisible] = useState(false)

  const { lastImportError, lastImportCompleted } = importExport

  useEffect(() => {
    if (lastImportError || lastImportCompleted !== null) {
      setBannerVisible(true)
      const timer = setTimeout(() => {
        setBannerVisible(false)
        importExport.clearImportStatus()
      }, 6000)
      return () => clearTimeout(timer)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastImportError, lastImportCompleted])

  function handleRowClick(snapshot: Snapshot) {
    if (!snapshot.action) return
    const filtered = (damageEvents ?? []).filter(e => Number(e.snapshotId) === Number(snapshot.id))
    setOverlayData({ snapshot, damageEvents: filtered })
    setOverlayOpen(true)
  }

  const hasData = snapshots.some(s => s.action)

  return (
    <div className="pageWrapper">
      <h1 className="heading"></h1>
      {bannerVisible && (lastImportError || lastImportCompleted !== null) && (
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
            onClick={() => { setBannerVisible(false); importExport.clearImportStatus() }}
            aria-label="Dismiss"
          >✕</button>
        </div>
      )}
      <RotationTable snapshots={snapshots} charactersInBattle={charactersInBattle} tableConfig={tableConfig} onSelectCharacter={handleCharacterSelect} onSelectAction={handleActionSelect} columnVisibility={columnVisibility} setColumnVisibility={setColumnVisibility} onRowClick={handleRowClick} onGearChange={onGearChange} />
      <div className="editorFloatingButtons">
        <button className="summaryOpenButton" onClick={() => setRotationsOpen(true)} title="Save / load rotations">
          ◈ ROTATIONS
        </button>
        {hasData && (
          <button className="summaryOpenButton" onClick={() => setSummaryOpen(true)} title="Open full team summary">
            ◈ FIELD REPORT
          </button>
        )}
      </div>
      <ImportExportPanel
        open={rotationsOpen}
        onClose={() => setRotationsOpen(false)}
        savedRotations={importExport.savedRotations}
        hasCurrentRotation={hasData}
        onSave={importExport.handleSave}
        onLoad={importExport.handleLoad}
        onDelete={importExport.handleDelete}
        onDownload={importExport.handleDownload}
        onFileUpload={importExport.handleFileUpload}
        onClearImportStatus={importExport.clearImportStatus}
        ignoreCastConditions={importExport.ignoreCastConditions}
        onToggleIgnoreCastConditions={() => importExport.setIgnoreCastConditions(v => !v)}
      />
      <DataOverlay snapshot={overlayData?.snapshot ?? null} damageEvents={overlayData?.damageEvents ?? []} open={overlayOpen} onClose={() => setOverlayOpen(false)} />
      <SummaryOverlay open={summaryOpen} onClose={() => setSummaryOpen(false)} snapshots={snapshots} damageEvents={damageEvents ?? []} characters={charactersInBattle} />
    </div>
  )
}
