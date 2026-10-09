// Rotation summary overlay: full-screen report with Overview (dial + resonators), Field Presence and Buff Coverage tabs
import { useState } from 'react'
import { createPortal } from 'react-dom'
import '../../../styles/rotation-editor/SummaryOverlay/01-shell.css'
import '../../../styles/rotation-editor/SummaryOverlay/02-dial.css'
import '../../../styles/rotation-editor/SummaryOverlay/03-plates.css'
import '../../../styles/rotation-editor/SummaryOverlay/04-field-presence.css'
import '../../../styles/rotation-editor/SummaryOverlay/05-buff-coverage.css'
import type { Snapshot } from '../../../types/snapshot'
import type { DamageEvent } from '../../../types/events'
import type { Character } from '../../../types/character'
import { CloseButton, HeaderTabs, Readout } from '../../shared/ui'
import { computeRotationSummary } from './computeSummary'
import { buildCharacterColorMap } from './theme'
import { formatDamage, formatTime } from './format'
import { OverviewTab } from './OverviewTab'
import { FieldPresenceTab } from './FieldPresenceTab'
import { BuffCoverageTab } from './BuffCoverageTab'

const TABS = [
  { value: 'overview', label: 'Overview' },
  { value: 'field', label: 'Field Presence' },
  { value: 'buffs', label: 'Buff Coverage' },
] as const

type Tab = (typeof TABS)[number]['value']

// ========== Main Component ==================================================================================================

type SummaryOverlayProps = {
  open: boolean
  onClose: () => void
  snapshots: Snapshot[]
  damageEvents: DamageEvent[]
  characters: Character[]
}

export default function SummaryOverlay({ open, onClose, snapshots, damageEvents, characters }: SummaryOverlayProps) {
  const [tab, setTab] = useState<Tab>('overview')
  if (!open) return null

  const summary = computeRotationSummary(characters, snapshots, damageEvents)
  const { activeChars, grandTotal, totalDuration } = summary
  // Characters sharing an element get distinct shades, consistent across every panel
  const charColorMap = buildCharacterColorMap(activeChars)

  const hasData = grandTotal > 0

  return createPortal(
    <div className="summaryOverlay">
      <div className="ui-overlay-backdrop" onClick={onClose} role="presentation" />
      <div className="ui-overlay-panel summaryPanel" role="dialog" aria-modal="true" aria-labelledby="summaryTitle">
        {/* Header: title + headline readouts + tabs */}
        <div className="ui-overlay-header">
          <h2 id="summaryTitle" className="ui-overlay-title">Rotation Summary</h2>
          {hasData && (
            <div className="ui-readouts">
              <Readout label="Total Damage" value={formatDamage(grandTotal)} accent />
              {totalDuration > 0 && <Readout label="Team DPS" value={formatDamage(grandTotal / totalDuration)} unit="/s" />}
              <Readout label="Combat Time" value={formatTime(totalDuration)} />
              <Readout label="Resonators" value={activeChars.length} />
            </div>
          )}
          <div className="ui-overlay-header-end">
            {hasData && <HeaderTabs tabs={TABS} value={tab} onChange={setTab} />}
            <CloseButton onClick={onClose} />
          </div>
        </div>

        {/* Body */}
        {!hasData ? (
          <div className="ui-overlay-body summaryEmpty">
            <div className="ui-empty">Awaiting combat data</div>
            <div className="summaryEmptyHint">Add actions to the rotation to generate a summary</div>
          </div>
        ) : (
          <div className="ui-overlay-body">
            {tab === 'overview' && <OverviewTab summary={summary} charColorMap={charColorMap} />}
            {tab === 'field' && <FieldPresenceTab summary={summary} snapshots={snapshots} charColorMap={charColorMap} />}
            {tab === 'buffs' && <BuffCoverageTab summary={summary} charColorMap={charColorMap} />}
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}
