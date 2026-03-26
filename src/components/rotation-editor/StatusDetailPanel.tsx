import { createPortal } from 'react-dom'
import '../../styles/rotation-editor/StatusDetailPanel.css'

// ========== Types ============================================================================================================

export type StatusDetailInfo = {
  key: string
  label: string
  icon: string
  value: number
  maxStacks?: number
  type?: 'buff' | 'debuff' | 'negativeStatus'
  color?: string
  timeLeft?: number
  //
  // TODO: Only the ones in the 'CurrentStateRow.tsx' should be clickable! Not in every row (otherwise they would need logs of every entry)
  // TODO: Future fields to pull into this panel once the data is wired through:
  //
  // source: string
  //   Which character's action applied this effect.
  //   Example: "Carlotta – Glacial Coda (Enhanced)"
  //
  // appliedAt: number
  //   The rotation timestamp (fromTime / toTime of the row where it was applied).
  //   Example: 3.40 → displayed as "3.40s"
  //
  // expiresAt: number
  //   Absolute rotation time when this effect runs out.
  //   Can be derived as (appliedAt + baseDuration) or (currentToTime + timeLeft).
  //   Example: 15.60 → displayed as "15.60s"
  //
  // swapsLeft?: number
  //   For swap-count-based effects (buffsSwapsLeft / debuffsSwapsLeft).
  //   Example: 2 → displayed as "2 swaps"
  //
  // description?: string
  //   Mechanic flavour text pulled from the effect's data definition.
  //   Example: "Increases ATK by 15% for 10s or 3 swaps."
  //
  // history?: Array<{ time: number; event: 'applied' | 'refreshed' | 'stacked' }>
  //   All times during the rotation this effect was applied, refreshed, or gained stacks.
  //   Useful for seeing exactly how a DoT or buff was maintained.
}

type StatusDetailPanelProps = {
  status: StatusDetailInfo | null
  onClose: () => void
}

// ========== Component: Status Detail Panel ===================================================================================

const TYPE_LABELS: Record<string, string> = {
  buff: 'Buff',
  debuff: 'Debuff',
  negativeStatus: 'Negative Status',
}

export function StatusDetailPanel({ status, onClose }: StatusDetailPanelProps) {
  if (!status) return null

  const typeLabel = TYPE_LABELS[status.type ?? ''] ?? 'Effect'

  return createPortal(
    <div className="statusDetailOverlay" onClick={onClose}>
      <div className="statusDetailPanel" onClick={e => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className="statusDetailHeader">
          <img src={status.icon} alt={status.label} className="statusDetailIcon" />
          <div className="statusDetailTitle">
            <span className="statusDetailName">{status.label}</span>
            <span className={`statusDetailType statusDetailType-${status.type ?? 'buff'}`}>{typeLabel}</span>
          </div>
          <button className="statusDetailClose" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* ── Body ── */}
        <div className="statusDetailBody">

          {/* Stacks */}
          <div className="statusDetailRow">
            <span className="statusDetailRowLabel">Stacks</span>
            <span className="statusDetailRowValue">
              {status.value}
              {status.maxStacks && status.maxStacks > 1 ? ` / ${status.maxStacks}` : ''}
            </span>
          </div>

          {/* Time Remaining */}
          <div className="statusDetailRow">
            <span className="statusDetailRowLabel">Time Remaining</span>
            <span className="statusDetailRowValue">
              {status.timeLeft != null && status.timeLeft > 0 ? `${status.timeLeft.toFixed(2)}s` : '—'}
            </span>
          </div>

          {/*
           * TODO: Rows to add once the matching fields are available in StatusDetailInfo:
           *
           *   Source       — "Carlotta – Glacial Coda (Enhanced)"
           *   Applied At   — "3.40s"
           *   Expires At   — "15.60s"   (derived from appliedAt + duration, or currentTime + timeLeft)
           *   Swaps Left   — "2 swaps"  (only when relevant)
           *   Description  — mechanic text from the data definition
           *   History      — timeline of apply / refresh / stack events during the rotation
           */}

        </div>
      </div>
    </div>,
    document.body,
  )
}
