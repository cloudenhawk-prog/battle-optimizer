// Summary "Other Sources" card: damage from non-character dealers per status, plus a timestamped event list
import { useState } from 'react'
import type { DamageEvent } from '../../../types/events'
import type { GlobalDamageEntry } from './summaryTypes'
import { getElementColor } from './theme'
import { formatDamage, formatTime } from './format'

export function NegativeStatusesCard({ globalDamage, grandTotal, passiveDamageEvents }: { globalDamage: GlobalDamageEntry[]; grandTotal: number; passiveDamageEvents: DamageEvent[] }) {
  const [expanded, setExpanded] = useState(false)
  const sortedEvents = [...passiveDamageEvents].sort((a, b) => a.timeStamp - b.timeStamp)
  const total = globalDamage.reduce((s, g) => s + g.damage, 0)
  const shareOfTotal = grandTotal > 0 ? (total / grandTotal) * 100 : 0
  const maxDmg = globalDamage.length > 0 ? globalDamage[0].damage : 1
  const fieldColor = 'hsl(215 20% 62%)'
  const fieldGlow = 'hsl(215 20% 62% / 0.3)'
  const statusCount = globalDamage.length
  const statusChipLabel = statusCount === 1
    ? globalDamage[0].name
    : statusCount === 2
      ? 'Dual Status'
      : `${statusCount} Statuses`

  return (
    <div
      className="summaryCharCard summaryNegativeStatusCard"
      style={{ '--char-color': fieldColor, '--char-glow': fieldGlow } as React.CSSProperties}
    >
      <div className="summaryCharCardAccent" />

      <div className="summaryCharCardHeader">
        <div className="summaryCharCardPortrait">
          <div className="summaryCharCardPortraitFallback" style={{ fontSize: '20px', letterSpacing: 0 }}>◈</div>
          <div className="summaryCharCardPortraitGlow" />
        </div>
        <div className="summaryCharCardInfo">
          <div className="summaryCharCardName">Other Sources</div>
          <div className="summaryCharCardMeta">
            <span className="summaryCharCardTotal">{formatDamage(total)}</span>
            <span className="summaryCharCardShare" style={{ color: fieldColor }}>
              {shareOfTotal.toFixed(1)}%
            </span>
          </div>
        </div>
        <div className="summaryCharCardChips">
          <span
            className="summaryCharCardChip"
            style={{ color: fieldColor, borderColor: `color-mix(in srgb, ${fieldColor} 30%, transparent)`, background: `color-mix(in srgb, ${fieldColor} 8%, transparent)` }}
          >
            {statusChipLabel}
          </span>
        </div>
      </div>

      <div className="summaryCharTypeRows">
        {globalDamage.map(entry => {
          const barPct = (entry.damage / maxDmg) * 100
          const teamPct = total > 0 ? (entry.damage / total) * 100 : 0
          const elTheme = getElementColor(entry.element)
          return (
            <div key={entry.name} className="summaryCharTypeRow">
              <span className="summaryCharTypeLabel">{entry.name}</span>
              <div className="summaryCharTypeBar">
                <div
                  className="summaryCharTypeBarFill"
                  style={{ width: `${barPct}%`, background: elTheme.primary, boxShadow: `0 0 8px ${elTheme.glow}` }}
                />
              </div>
              <span className="summaryCharTypeValue">{formatDamage(entry.damage)}</span>
              <span className="summaryCharTypePct">{teamPct.toFixed(1)}%</span>
            </div>
          )
        })}
      </div>

      <button
        className="summaryCharExpandBtn"
        style={{ color: fieldColor }}
        onClick={() => setExpanded(v => !v)}
      >
        {expanded ? '▲ Hide per-action detail' : '▼ Show per-action breakdown'}
      </button>
      {expanded && (
        <div className="summaryActionBreakdown summaryNsEventList">
          {sortedEvents.map((e, i) => (
            <div key={i} className="summaryNsEventRow">
              <span className="summaryNsEventTime">{formatTime(e.timeStamp)}</span>
              <span className="summaryNsEventName">{e.actionName}</span>
              <span className="summaryNsEventDmg">{formatDamage(e.average)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
