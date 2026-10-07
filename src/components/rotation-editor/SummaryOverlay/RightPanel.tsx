// Summary right column: limited-duration buff list with a coverage/uptime toggle and hover tooltips
import { useState } from 'react'
import type { BuffUptimeEntry, ModifierDisplayInfo } from './summaryTypes'
import { getElementColor } from './theme'
import type { CharColor } from './theme'
import { buffIconPath } from './format'
import { PanelHeader } from './PanelHeader'
import { renderBuffRowTooltip } from './BuffRowTooltip'

export function RightPanel({ buffUptime, modifierInfoMap, charColorMap }: { buffUptime: BuffUptimeEntry[]; modifierInfoMap: Map<string, ModifierDisplayInfo>; charColorMap: Map<string, CharColor> }) {
  const [buffView, setBuffView] = useState<'coverage' | 'uptime'>('coverage')
  const [activeTooltip, setActiveTooltip] = useState<{ entry: BuffUptimeEntry; rect: DOMRect } | null>(null)

  const tooltipPortal = activeTooltip
    ? renderBuffRowTooltip(activeTooltip.entry, activeTooltip.rect, modifierInfoMap, charColorMap)
    : null

  return (
    <div className="summaryRightPanel">

      {/* ── Section 1: Buff Coverage ── */}
      <div className="summarySectionGroup">
        <div className="summaryBuffViewHeader">
          <PanelHeader label="BUFF COVERAGE" accent="cyan" />
          <div className="summaryBuffViewToggle">
            <button
              className={`summaryBuffViewBtn${buffView === 'coverage' ? ' active' : ''}`}
              onClick={() => setBuffView('coverage')}
            >Coverage</button>
            <button
              className={`summaryBuffViewBtn${buffView === 'uptime' ? ' active' : ''}`}
              onClick={() => setBuffView('uptime')}
            >Uptime</button>
          </div>
        </div>
        <div className="summarySectionHint">
          {buffView === 'coverage'
            ? '% of total team damage dealt while buff was active'
            : '% of total rotation time buff was active'}
        </div>
        {buffUptime.length === 0 ? (
          <div className="summaryRightEmpty">No limited-duration buffs detected</div>
        ) : (
          <div className="summaryBuffUptimeRows">
            {buffUptime.map(entry => {
              const ownerTheme = (entry.ownerCharacter ? charColorMap.get(entry.ownerCharacter) : null) ?? getElementColor(entry.ownerElement)
              const iconPath = buffIconPath(entry.displayName)
              return (
                <div
                  key={entry.key}
                  className="summaryBuffUptimeRow summaryBuffUptimeRow--hasTooltip"
                  onMouseEnter={(e) => setActiveTooltip({ entry, rect: e.currentTarget.getBoundingClientRect() })}
                  onMouseLeave={() => setActiveTooltip(null)}
                >
                  <div className="summaryBuffIconBox" style={{ borderColor: `color-mix(in srgb, ${ownerTheme.primary} 55%, transparent)` }}>
                    <img
                      src={iconPath}
                      alt=""
                      className="summaryBuffIconImg"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                        const dot = e.currentTarget.nextElementSibling as HTMLElement
                        if (dot) dot.style.display = 'block'
                      }}
                    />
                    <div
                      className="summaryBuffOwnerDot"
                      style={{ background: ownerTheme.primary, display: 'none' }}
                    />
                  </div>
                  <span className="summaryBuffName">{entry.displayName}</span>
                  <div className="summaryBuffBar">
                    <div
                      className="summaryBuffBarFill"
                      style={{
                        width: `${Math.min(buffView === 'coverage' ? entry.coveragePct : entry.timeUptimePct, 100)}%`,
                        background: ownerTheme.primary,
                        boxShadow: `0 0 4px ${ownerTheme.glow}`,
                      }}
                    />
                  </div>
                  <span className="summaryBuffPct">
                    {buffView === 'coverage' ? entry.coveragePct.toFixed(0) : entry.timeUptimePct.toFixed(0)}%
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {tooltipPortal}
    </div>
  )
}
