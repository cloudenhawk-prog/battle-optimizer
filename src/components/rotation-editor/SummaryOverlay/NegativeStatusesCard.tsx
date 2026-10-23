// Summary "Other Sources" plate: damage from non-character dealers per status, plus a timestamped event list
import { useState } from 'react'
import type { DamageEvent } from '../../../types/events'
import type { GlobalDamageEntry } from './summaryTypes'
import { getElementColor } from './theme'
import { formatDamage, formatTime } from './format'
import { TacetMark, accentVar } from '../../shared/ui'

const FIELD_RAW = '215 20% 62%'

export function NegativeStatusesCard({ globalDamage, grandTotal, passiveDamageEvents }: { globalDamage: GlobalDamageEntry[]; grandTotal: number; passiveDamageEvents: DamageEvent[] }) {
  const [expanded, setExpanded] = useState(false)
  const sortedEvents = [...passiveDamageEvents].sort((a, b) => a.timeStamp - b.timeStamp)
  const total = globalDamage.reduce((s, g) => s + g.damage, 0)
  const shareOfTotal = grandTotal > 0 ? (total / grandTotal) * 100 : 0
  const maxDmg = globalDamage.length > 0 ? globalDamage[0].damage : 1
  const statusCount = globalDamage.length
  const statusChipLabel = statusCount === 1 ? globalDamage[0].name : statusCount === 2 ? 'Dual Status' : `${statusCount} Statuses`

  return (
    <div className="ui-plate summaryPlate" style={accentVar(FIELD_RAW)}>
      <TacetMark seed="Other Sources" size={230} className="ui-plate-watermark" />

      <div className="summaryPlateGrid">
        <div className="summaryPlateId">
          <div className="summaryPlateWho">
            <span className="ui-portrait ui-portrait--fallback" style={{ '--ui-portrait-size': '58px' } as React.CSSProperties} aria-hidden="true">◈</span>
            <div className="summaryPlateNameBlock">
              <span className="summaryPlateName">Other Sources</span>
              <span className="summaryPlateTags">
                <span className="ui-chip ui-chip--muted">{statusChipLabel}</span>
              </span>
            </div>
          </div>
          <div className="summaryPlateShare">
            <span className="summaryPlateShareValue">{shareOfTotal.toFixed(1)}<small>%</small></span>
            <span className="summaryPlateShareMeta">
              <span className="ui-readout-label">of team damage</span>
              <span className="summaryPlateShareAbs">{formatDamage(total)}</span>
            </span>
          </div>
        </div>

        <div className="summaryPlateData">
          <div>
            <div className="ui-group-label">By Status</div>
            <div className="summaryTypeRows summaryTypeRows--withValue">
              {globalDamage.map(entry => {
                const barPct = (entry.damage / maxDmg) * 100
                const statusPct = total > 0 ? (entry.damage / total) * 100 : 0
                const elTheme = getElementColor(entry.element)
                return (
                  <div key={entry.name} className="summaryTypeRow">
                    <span className="summaryTypeLabel">{entry.name}</span>
                    <div className="ui-bar">
                      <div className="ui-bar-fill" style={{ width: `${barPct}%`, background: elTheme.primary, boxShadow: `0 0 6px ${elTheme.glow}` }} />
                    </div>
                    <span className="summaryTypeValue">{formatDamage(entry.damage)}</span>
                    <span className="summaryTypePct">{statusPct.toFixed(1)}%</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <button type="button" className={`summaryPlateExpand${expanded ? ' is-open' : ''}`} onClick={() => setExpanded(v => !v)}>
        {expanded ? 'Hide events' : `Events · ${sortedEvents.length}`}
      </button>
      {expanded && (
        <div className="summaryActionTable">
          {sortedEvents.map((e, i) => (
            <div key={i} className="summaryEventRow">
              <span className="summaryActionCount">{formatTime(e.timeStamp)}</span>
              <span className="summaryActionName">{e.actionName}</span>
              <span className="summaryActionValue">{formatDamage(e.average)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
