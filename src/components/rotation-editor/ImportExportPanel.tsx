import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import '../../styles/rotation-editor/ImportExportPanel.css'
import type { SavedRotation } from '../../utils/importExport'

// ========== Component: ImportExportPanel =====================================================================================

type ImportExportPanelProps = {
  open: boolean
  onClose: () => void
  savedRotations: SavedRotation[]
  savedSnippets: SavedRotation[]
  hasCurrentRotation: boolean
  onSave: (name: string) => void
  onLoad: (rotation: SavedRotation) => void
  onDelete: (name: string) => void
  onSaveSnippet: (name: string) => void
  onDeleteSnippet: (name: string) => void
  onAppend: (snippet: SavedRotation) => void
  onDownload: () => void
  onFileUpload: (content: string) => void
  onClearImportStatus: () => void
  ignoreCastConditions: boolean
  onToggleIgnoreCastConditions: () => void
}

export function ImportExportPanel({
  open,
  onClose,
  savedRotations,
  savedSnippets,
  hasCurrentRotation,
  onSave,
  onLoad,
  onDelete,
  onSaveSnippet,
  onDeleteSnippet,
  onAppend,
  onDownload,
  onFileUpload,
  onClearImportStatus,
  ignoreCastConditions,
  onToggleIgnoreCastConditions,
}: ImportExportPanelProps) {
  const [activeTab, setActiveTab] = useState<'rotations' | 'snippets'>('rotations')
  const [saveName, setSaveName] = useState('')
  const [snippetSaveName, setSnippetSaveName] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [confirmDeleteSnippet, setConfirmDeleteSnippet] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!open) return null

  function handleSave() {
    const trimmed = saveName.trim()
    if (!trimmed) return
    onSave(trimmed)
    setSaveName('')
  }

  function handleSaveSnippet() {
    const trimmed = snippetSaveName.trim()
    if (!trimmed) return
    onSaveSnippet(trimmed)
    setSnippetSaveName('')
  }

  function handleLoad(rotation: SavedRotation) {
    onClearImportStatus()
    onLoad(rotation)
    onClose()
  }

  function handleAppend(snippet: SavedRotation) {
    onClearImportStatus()
    onAppend(snippet)
    onClose()
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const content = ev.target?.result as string
      if (content) {
        onClearImportStatus()
        onFileUpload(content)
      }
    }
    reader.readAsText(file)
    // Reset input so the same file can be re-uploaded
    e.target.value = ''
  }

  return createPortal(
    <div className="ieBackdrop" onClick={() => { onClearImportStatus(); onClose() }}>
      <div className="iePanel" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="ieHeader">
          <span className="ieTitle">◈ ROTATIONS</span>
          <button className="ieCloseBtn" onClick={() => { onClearImportStatus(); onClose() }} aria-label="Close">✕</button>
        </div>

        {/* Tab strip */}
        <div className="ieTabStrip">
          <button
            className={`ieTab${activeTab === 'rotations' ? ' ieTabActive' : ''}`}
            onClick={() => setActiveTab('rotations')}
          >
            Full Rotations
          </button>
          <button
            className={`ieTab${activeTab === 'snippets' ? ' ieTabActive' : ''}`}
            onClick={() => setActiveTab('snippets')}
          >
            Snippets
          </button>
        </div>

        {activeTab === 'rotations' && (
          <>
            {/* Saved rotations list */}
            <div className="ieSectionLabel">SAVED ROTATIONS</div>
            <div className="ieSavedList">
              {savedRotations.length === 0 && (
                <div className="ieEmptyState">No saved rotations yet</div>
              )}
              {savedRotations.map(r => (
                <div key={r.name} className="ieSavedItem">
                  <div className="ieSavedItemInfo">
                    <span className="ieSavedName">{r.name}</span>
                    <span className="ieSavedMeta">{r.steps.length} steps · {new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="ieSavedActions">
                    <button className="ieActionBtn ieActionBtnLoad" onClick={() => handleLoad(r)}>Load</button>
                    {confirmDelete === r.name ? (
                      <>
                        <button className="ieActionBtn ieActionBtnConfirmDelete" onClick={() => { onDelete(r.name); setConfirmDelete(null) }}>Confirm</button>
                        <button className="ieActionBtn ieActionBtnCancel" onClick={() => setConfirmDelete(null)}>Cancel</button>
                      </>
                    ) : (
                      <button className="ieActionBtn ieActionBtnDelete" onClick={() => setConfirmDelete(r.name)}>Delete</button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Save current rotation */}
            <div className="ieSectionLabel">SAVE CURRENT</div>
            <div className="ieSaveRow">
              <input
                className="ieSaveInput"
                type="text"
                placeholder="Rotation name…"
                value={saveName}
                maxLength={64}
                onChange={e => setSaveName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSave() }}
              />
              <button
                className="ieActionBtn ieActionBtnSave"
                onClick={handleSave}
                disabled={!saveName.trim() || !hasCurrentRotation}
              >
                Save
              </button>
            </div>

            {/* File I/O */}
            <div className="ieSectionLabel">FILE</div>
            <div className="ieFileRow">
              <button className="ieActionBtn ieActionBtnFile" onClick={onDownload} disabled={!hasCurrentRotation}>
                ↓ Export .json
              </button>
              <button className="ieActionBtn ieActionBtnFile" onClick={() => fileInputRef.current?.click()}>
                ↑ Import .json
              </button>
              <input ref={fileInputRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleFileChange} />
            </div>
            <label className="ieIgnoreConditionsRow">
              <input
                type="checkbox"
                className="ieIgnoreConditionsCheckbox"
                checked={ignoreCastConditions}
                onChange={onToggleIgnoreCastConditions}
              />
              Ignore position &amp; energy requirements on import
            </label>
          </>
        )}

        {activeTab === 'snippets' && (
          <>
            {/* Snippets description */}
            <div className="ieSnippetHint">
              Snippets are short sequences you can append to the current timeline at any time — useful for repeated character combos.
            </div>

            {/* Saved snippets list */}
            <div className="ieSectionLabel">SAVED SNIPPETS</div>
            <div className="ieSavedList">
              {savedSnippets.length === 0 && (
                <div className="ieEmptyState">No saved snippets yet</div>
              )}
              {savedSnippets.map(s => (
                <div key={s.name} className="ieSavedItem">
                  <div className="ieSavedItemInfo">
                    <span className="ieSavedName">{s.name}</span>
                    <span className="ieSavedMeta">{s.steps.length} steps · {new Date(s.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="ieSavedActions">
                    <button className="ieActionBtn ieActionBtnAppend" onClick={() => handleAppend(s)} disabled={!hasCurrentRotation} title="Append these steps to the end of the current timeline">+ Add</button>
                    {confirmDeleteSnippet === s.name ? (
                      <>
                        <button className="ieActionBtn ieActionBtnConfirmDelete" onClick={() => { onDeleteSnippet(s.name); setConfirmDeleteSnippet(null) }}>Confirm</button>
                        <button className="ieActionBtn ieActionBtnCancel" onClick={() => setConfirmDeleteSnippet(null)}>Cancel</button>
                      </>
                    ) : (
                      <button className="ieActionBtn ieActionBtnDelete" onClick={() => setConfirmDeleteSnippet(s.name)}>Delete</button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Save current as snippet */}
            <div className="ieSectionLabel">SAVE CURRENT AS SNIPPET</div>
            <div className="ieSaveRow">
              <input
                className="ieSaveInput"
                type="text"
                placeholder="Snippet name…"
                value={snippetSaveName}
                maxLength={64}
                onChange={e => setSnippetSaveName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSaveSnippet() }}
              />
              <button
                className="ieActionBtn ieActionBtnSave"
                onClick={handleSaveSnippet}
                disabled={!snippetSaveName.trim() || !hasCurrentRotation}
              >
                Save
              </button>
            </div>

            <label className="ieIgnoreConditionsRow">
              <input
                type="checkbox"
                className="ieIgnoreConditionsCheckbox"
                checked={ignoreCastConditions}
                onChange={onToggleIgnoreCastConditions}
              />
              Ignore position &amp; energy requirements on append
            </label>
          </>
        )}
      </div>
    </div>,
    document.body,
  )
}
