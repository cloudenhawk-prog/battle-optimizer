// Rotation summary overlay: full-screen report (field time, damage/contribution pies, character cards, buff coverage)
import { createPortal } from 'react-dom'
import '../../../styles/rotation-editor/SummaryOverlay/01-base.css'
import '../../../styles/rotation-editor/SummaryOverlay/02-layout.css'
import '../../../styles/rotation-editor/SummaryOverlay/03-pies-and-stat-cards.css'
import '../../../styles/rotation-editor/SummaryOverlay/04-character-cards.css'
import '../../../styles/rotation-editor/SummaryOverlay/05-team-composition-and-efficiency.css'
import '../../../styles/rotation-editor/SummaryOverlay/06-buff-uptime-and-origin.css'
import '../../../styles/rotation-editor/SummaryOverlay/07-action-breakdown-and-other-sources.css'
import '../../../styles/rotation-editor/SummaryOverlay/08-buff-tooltip-and-dual-pies.css'
import type { Snapshot } from '../../../types/snapshot'
import type { DamageEvent } from '../../../types/events'
import type { Character } from '../../../types/character'
import { computeRotationSummary } from './computeSummary'
import { buildCharacterColorMap } from './theme'
import { formatDamage, formatTime } from './format'
import { LeftPanel } from './LeftPanel'
import { CenterPanel } from './CenterPanel'
import { RightPanel } from './RightPanel'

// ========== Main Component ==================================================================================================

type SummaryOverlayProps = {
  open: boolean
  onClose: () => void
  snapshots: Snapshot[]
  damageEvents: DamageEvent[]
  characters: Character[]
}

export default function SummaryOverlay({ open, onClose, snapshots, damageEvents, characters }: SummaryOverlayProps) {
  if (!open) return null

  const {
    activeChars, characterSummaries, globalDamage, totalPassiveDamage, grandTotal, totalDuration, passiveDamageEvents,
    contributionEntries, buffUptime, contributionOrigin, energyFlow, actionBreakdowns, modifierInfoMap,
  } = computeRotationSummary(characters, snapshots, damageEvents)
  // Characters sharing an element get distinct shades, consistent across every panel
  const charColorMap = buildCharacterColorMap(activeChars)

  const hasData = grandTotal > 0

  return createPortal(
    <div className="summaryOverlay" role="dialog" aria-modal="true">
      <div className="summaryPanel">
        {/* Header */}
        <div className="summaryHeader">
          <div className="summaryHeaderLeft">
            <h2 className="summaryTitle">ROTATION SUMMARY</h2>
            <div className="summarySubtitle">
              {hasData ? (
                <>
                  <span className="summaryStatChip accent">{activeChars.length} Resonators</span>
                  <span className="summaryStatChip accent">{formatTime(totalDuration)} Combat</span>
                  {totalDuration > 0 && (
                    <span className="summaryStatChip accent">{formatDamage(grandTotal / totalDuration)} dps</span>
                  )}
                  <span className="summaryStatChip accent">{formatDamage(grandTotal)} Total</span>
                </>
              ) : (
                <span className="summaryNoData">No data — build a rotation first</span>
              )}
            </div>
          </div>
          <button className="summaryClose" onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        {!hasData ? (
          <div className="summaryEmptyOuter">
            <div className="summaryEmptyState">
              <div className="summaryEmptyIcon">◉</div>
              <div className="summaryEmptyText">Awaiting combat data</div>
              <div className="summaryEmptyHint">Add actions to the rotation to generate a field report</div>
            </div>
          </div>
        ) : (
          <div className="summaryColumns">
            <LeftPanel
              characterSummaries={characterSummaries}
              charColorMap={charColorMap}
              energyFlow={energyFlow}
            />
            <div className="summaryColDivider" />
            <CenterPanel
              characterSummaries={characterSummaries}
              globalDamage={globalDamage}
              totalPassiveDamage={totalPassiveDamage}
              grandTotal={grandTotal}
              totalDuration={totalDuration}
              contributionEntries={contributionEntries}
              contributionOrigin={contributionOrigin}
              actionBreakdowns={actionBreakdowns}
              passiveDamageEvents={passiveDamageEvents}
              charColorMap={charColorMap}
            />
            <div className="summaryColDivider" />
            <RightPanel
              buffUptime={buffUptime}
              modifierInfoMap={modifierInfoMap}
              charColorMap={charColorMap}
            />
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}
