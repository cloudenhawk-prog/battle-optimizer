import { createPortal } from 'react-dom'
import '../../styles/rotation-editor/CharacterStateTracker.css'

// ========== Component: Character Profile Overlay =============================================================================

type CharacterProfileOverlayProps = {
  characterName: string
  onClose: () => void
}

export function CharacterProfileOverlay({ characterName, onClose }: CharacterProfileOverlayProps) {
  return createPortal(
    <div className="charProfileOverlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="charProfileTitle">
      <div className="charProfileContent" onClick={e => e.stopPropagation()}>
        <div className="charProfileHeader">
          <h2 id="charProfileTitle" className="charProfileTitle">{characterName}</h2>
          <button className="overlayCloseButton" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="charProfileBody" />
      </div>
    </div>,
    document.body,
  )
}
