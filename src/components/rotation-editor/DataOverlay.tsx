import "../../styles/rotation-editor/DataOverlay.css"
import type { Snapshot } from "../../types/snapshot"
import type { DamageEvent } from "../../types/events"

type DataOverlayProps = {
  snapshot: Snapshot | null
  damageEvents?: DamageEvent[]
  open: boolean
  onClose: () => void
}

export default function DataOverlay({ snapshot, damageEvents = [], open, onClose }: DataOverlayProps) {
  if (!open) return null

  console.log("DataOverlay snapshot:", snapshot)
  console.log("DataOverlay damageEvents:", damageEvents)

  return (
    <div className="dataOverlay" role="dialog" aria-modal="true">
      <div className="dataOverlayContent">
        <div className="dataOverlayHeader">
          <button className="overlayCloseButton" onClick={onClose}>Close</button>
        </div>
        <div className="dataOverlayBody">
          {/* Placeholder content for future data breakdown. Snapshot and damageEvents are available here. */}
        </div>
      </div>
    </div>
  )
}
