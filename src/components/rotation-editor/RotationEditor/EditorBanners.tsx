// Bars above the rotation table: the import result banner and the Edit Mode action bar.
import type { ImportError } from '../../../types/rotation'
import type { EditModeCheckResult } from './useEditModeControls'

// ========== Component: Import Status Banner ==================================================================================

type ImportStatusBannerProps = {
  lastImportError: ImportError | null
  lastImportCompleted: number | null
  onDismiss: () => void
}

export function ImportStatusBanner({ lastImportError, lastImportCompleted, onDismiss }: ImportStatusBannerProps) {
  return (
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
        onClick={onDismiss}
        aria-label="Dismiss"
      >✕</button>
    </div>
  )
}

// ========== Component: Edit Mode Bar =========================================================================================

type EditModeBarProps = {
  editModeCheckResult: EditModeCheckResult | null
  hasEntries: boolean
  onCheck: () => void
  onConfirm: () => void
  onDiscard: () => void
}

export function EditModeBar({ editModeCheckResult, hasEntries, onCheck, onConfirm, onDiscard }: EditModeBarProps) {
  return (
    <div className="editModeBar">
      <span className="editModeBarLabel">EDIT MODE</span>
      <div className="editModeBarActions">
        <button className="editModeBarBtn" onClick={onCheck}>
          Check Rotation
        </button>
        <button className="editModeBarBtn editModeBarBtnConfirm" onClick={onConfirm}>
          Confirm
        </button>
        <button className="editModeBarBtn editModeBarBtnDiscard" onClick={onDiscard} disabled={!hasEntries}>
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
  )
}
