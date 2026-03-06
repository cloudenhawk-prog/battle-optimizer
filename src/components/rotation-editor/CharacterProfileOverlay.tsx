import { createPortal } from 'react-dom'
import '../../styles/rotation-editor/CharacterStateTracker.css'

// ========== Component: Character Profile Overlay =============================================================================

type CharacterProfileOverlayProps = {
  characterName: string
  onClose: () => void
}

export function CharacterProfileOverlay({ characterName, onClose }: CharacterProfileOverlayProps) {
  return createPortal(
    <div className="charProfileOverlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="charProfileContent" onClick={e => e.stopPropagation()}>
        <div className="charProfileHeader">
          <h2 className="charProfileTitle">{characterName}</h2>
          <button className="overlayCloseButton" onClick={onClose}>✕</button>
        </div>
        <div className="charProfileBody" />
      </div>
    </div>,
    document.body,
  )
}
