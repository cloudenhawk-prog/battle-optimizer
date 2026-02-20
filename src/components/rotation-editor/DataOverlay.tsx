import { useState } from 'react'
import '../../styles/rotation-editor/DataOverlay.css'
import type { Snapshot } from '../../types/snapshot'
import type { DamageEvent, Contribution } from '../../types/events'

// Pie chart colors - shared between pie chart and damage sources
const PIE_CHART_COLORS = ['rgba(100, 150, 255, 0.7)', 'rgba(255, 150, 100, 0.7)', 'rgba(200, 150, 255, 0.7)']

// ========== Main Component =====================================================================================================

type DataOverlayProps = {
  snapshot: Snapshot | null
  damageEvents?: DamageEvent[]
  open: boolean
  onClose: () => void
}

export default function DataOverlay({ snapshot, damageEvents = [], open, onClose }: DataOverlayProps) {
  const [mode, setMode] = useState<'average' | 'normal' | 'crit'>('average')
  const [pieChartView, setPieChartView] = useState<'events' | 'types'>('events')

  if (!open || !snapshot) return null

  console.log('Damage Events: ', damageEvents)

  const totalDamage = calculateTotalDamage(damageEvents)
  const duration = calculateDuration(snapshot)

  return (
    <div className="dataOverlay" role="dialog" aria-modal="true">
      <div className="dataOverlayContent">
        <OverlayHeader onClose={onClose} />
        <div className="dataOverlayBody">
          <HudOverlay mode={mode} onModeChange={setMode} />

          {/* Central Pie Chart */}
          <PieChartCenter damageEvents={damageEvents} totalDamage={totalDamage} view={pieChartView} onViewChange={setPieChartView} />

          {/* Radial Sections */}
          <CombatOverviewSection totalDamage={totalDamage} duration={duration} snapshot={snapshot} />
          <DamageSourcesSection damageEvents={damageEvents} totalDamage={totalDamage} />
          <ContributionsSection damageEvents={damageEvents} mode={mode} />
        </div>
      </div>
    </div>
  )
}

// ========== Components =========================================================================================================

function OverlayHeader({ onClose }: { onClose: () => void }) {
  return (
    <div className="dataOverlayHeader">
      <h2 className="overlayTitle">RESONANCE FIELD ANALYSIS</h2>
      <button className="overlayCloseButton" onClick={onClose}>
        ✕
      </button>
    </div>
  )
}
function HudOverlay({ mode, onModeChange }: { mode: 'average' | 'normal' | 'crit'; onModeChange: (mode: 'average' | 'normal' | 'crit') => void }) {
  return (
    <>
      {/* Scanning line */}
      <div className="hudScanLine" />

      {/* Corner brackets */}
      <div className="hudCorner topLeft" />
      <div className="hudCorner topRight" />
      <div className="hudCorner bottomLeft" />
      <div className="hudCorner bottomRight" />

      {/* Top bar */}
      <div className="hudTopBar">
        <div className="hudTopLeft">
          {/* Mode Selector */}
          <div className="modeSelectorContainer">
            <button className={`modeButton ${mode === 'average' ? 'active' : ''}`} onClick={() => onModeChange('average')}>
              Average
            </button>
            <button className={`modeButton ${mode === 'normal' ? 'active' : ''}`} onClick={() => onModeChange('normal')}>
              Normal
            </button>
            <button className={`modeButton ${mode === 'crit' ? 'active' : ''}`} onClick={() => onModeChange('crit')}>
              Critical
            </button>
          </div>
        </div>
        <div className="hudTopRight">
          <div className="liveIndicator">LIVE FEED</div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="hudBottomBar">
        <div className="hudBottomLeft">
          <div>LINK: ESTABLISHED</div>
          <div>PHASE DRIFT: 0.02°</div>
        </div>
        <div className="hudBottomCenter">
          <div>SYNC INDEX: 0.998</div>
          <div>ECHO SIGNATURE: LOCKED</div>
        </div>
        <div className="hudBottomRight">
          TETHER <span className="separator">//</span> v3.2.17
        </div>
      </div>
    </>
  )
}

function PieChartCenter({ damageEvents, totalDamage, view, onViewChange }: { damageEvents: DamageEvent[]; totalDamage: number; view: 'events' | 'types'; onViewChange: (view: 'events' | 'types') => void }) {
  const [hoveredSlice, setHoveredSlice] = useState<number | null>(null)

  if (damageEvents.length === 0) return null

  // Aggregate damage by type if in 'types' view
  const displayData = view === 'types' ? aggregateDamageByType(damageEvents) : damageEvents.map(e => ({ name: e.actionName, damage: e.average, event: e }))

  // Format total damage for display
  const formattedDamage = totalDamage >= 1000 ? `${(totalDamage / 1000).toFixed(1)}k` : totalDamage.toFixed(0)

  const hoveredData = hoveredSlice !== null ? displayData[hoveredSlice] : null

  return (
    <div className="pieChartCenter">
      {/* Outer rotating rings */}
      <div className="pieOuterRing" />
      <div className="pieOuterRingDashed" />

      {/* Outer notches rotating counter-clockwise */}
      <div className="pieOuterNotchContainer">
        {Array.from({ length: 24 }).map((_, i) => (
          <div
            key={i}
            className="pieOuterNotch"
            style={{
              transform: `rotate(${i * 15}deg) translateY(-${185}px)`,
              height: i % 2 === 0 ? '10px' : '6px',
              marginLeft: '-1px',
              marginTop: i % 2 === 0 ? '-5px' : '-3px',
              backgroundColor: i % 2 === 0 ? `rgba(100, 200, 255, ${0.25})` : `rgba(100, 150, 255, ${0.12})`,
              boxShadow: i % 2 === 0 ? '0 0 4px rgba(100, 200, 255, 0.3)' : 'none',
            }}
          />
        ))}
      </div>

      {/* Pie chart SVG */}
      {displayData.length === 1 ? (
        <svg viewBox="0 0 200 200" className="pieChartSvg" style={{ pointerEvents: 'auto' }}>
          <circle cx="100" cy="100" r="90" fill={PIE_CHART_COLORS[0]} stroke="rgba(30, 30, 40, 0.95)" strokeWidth="2" className="pieSlice" onMouseEnter={() => setHoveredSlice(0)} onMouseLeave={() => setHoveredSlice(null)} />
        </svg>
      ) : (
        <svg viewBox="0 0 200 200" className="pieChartSvg" style={{ pointerEvents: 'auto' }}>
          {calculatePieSlices(
            displayData.map(d => d.damage),
            PIE_CHART_COLORS,
          ).map((slice, index) => (
            <path key={index} d={slice.path} fill={slice.color} stroke="rgba(30, 30, 40, 0.95)" strokeWidth="2" className={`pieSlice ${hoveredSlice === index ? 'hovered' : ''}`} onMouseEnter={() => setHoveredSlice(index)} onMouseLeave={() => setHoveredSlice(null)} />
          ))}
        </svg>
      )}

      {/* Inner circle with total damage */}
      <div className="pieInnerCircle">
        <div className="pieLabel" style={{ pointerEvents: 'none' }}>
          Total Damage
        </div>
        <div className="piePercentage" style={{ pointerEvents: 'none' }}>
          {formattedDamage}
        </div>
        <div className="pieViewToggle">
          <button className={`pieViewButton ${view === 'events' ? 'active' : ''}`} onClick={() => onViewChange('events')}>
            Events
          </button>
          <button className={`pieViewButton ${view === 'types' ? 'active' : ''}`} onClick={() => onViewChange('types')}>
            Types
          </button>
        </div>
      </div>

      {/* Tick marks */}
      <div className="pieTickContainer">
        {Array.from({ length: 36 }).map((_, i) => (
          <div
            key={i}
            className="pieTick"
            style={{
              transform: `rotate(${i * 10}deg) translateY(-${155}px)`,
              height: i % 3 === 0 ? '6px' : '3px',
              marginLeft: '-0.5px',
              marginTop: i % 3 === 0 ? '-3px' : '-1.5px',
              backgroundColor: `rgba(255, 255, 255, ${i % 3 === 0 ? 0.15 : 0.06})`,
            }}
          />
        ))}
      </div>

      {/* Hover tooltip */}
      {hoveredData && hoveredSlice !== null && (
        <div className="pieTooltip" style={{ '--tooltip-color': PIE_CHART_COLORS[hoveredSlice % PIE_CHART_COLORS.length] } as React.CSSProperties}>
          <div className="pieTooltipAccent" style={{ background: `linear-gradient(to right, ${PIE_CHART_COLORS[hoveredSlice % PIE_CHART_COLORS.length]}, transparent)` }} />
          <div className="pieTooltipTitle" style={{ color: PIE_CHART_COLORS[hoveredSlice % PIE_CHART_COLORS.length] }}>
            {hoveredData.name}
          </div>
          <div className="pieTooltipDivider" />
          {view === 'events' && hoveredData.event && (
            <>
              <div className="pieTooltipRow">
                <span className="pieTooltipLabel">Dealer</span>
                <span className="pieTooltipValue">{hoveredData.event.dealer}</span>
              </div>
              <div className="pieTooltipRow">
                <span className="pieTooltipLabel">Target</span>
                <span className="pieTooltipValue">{hoveredData.event.target}</span>
              </div>
            </>
          )}
          <div className="pieTooltipRow">
            <span className="pieTooltipLabel">Damage</span>
            <span className="pieTooltipValue pieTooltipHighlight" style={{ color: PIE_CHART_COLORS[hoveredSlice % PIE_CHART_COLORS.length] }}>
              {hoveredData.damage.toFixed(0)}
            </span>
          </div>
          <div className="pieTooltipRow">
            <span className="pieTooltipLabel">Share</span>
            <span className="pieTooltipValue pieTooltipHighlight" style={{ color: PIE_CHART_COLORS[hoveredSlice % PIE_CHART_COLORS.length] }}>
              {((hoveredData.damage / totalDamage) * 100).toFixed(1)}%
            </span>
          </div>
          {view === 'events' && hoveredData.event && hoveredData.event.elements.length > 0 && (
            <div className="pieTooltipRow">
              <span className="pieTooltipLabel">Elements</span>
              <span className="pieTooltipValue">{hoveredData.event.elements.join(', ')}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function CombatOverviewSection({ totalDamage, duration, snapshot }: { totalDamage: number; duration: number; snapshot: Snapshot }) {
  const dps = duration > 0 ? totalDamage / duration : 0
  const castTime = `${snapshot.fromTime.toFixed(2)}s - ${snapshot.toTime.toFixed(2)}s`

  return (
    <div className="radialSection combatOverview">
      <div className="connectorLine" />
      <div className="sectionCard purple">
        <div className="sectionTopAccent purple" />
        <div className="sectionTitle purple">
          <div className="titleDot purple" />
          <span>Combat Metrics</span>
        </div>
        <div className="sectionContent">
          <DataRow label="Total Damage" value={totalDamage.toFixed(0)} />
          <DataRow label="DPS" value={dps > 0 ? dps.toFixed(1) : 'N/A'} />
          <DataRow label="Duration" value={`${duration.toFixed(2)}s`} />
          <DataRow label="Cast Window" value={castTime} />
        </div>
        <div className="sectionBottomAccent purple" />
      </div>
    </div>
  )
}

function DamageSourcesSection({ damageEvents, totalDamage }: { damageEvents: DamageEvent[]; totalDamage: number }) {
  const [hoveredEvent, setHoveredEvent] = useState<{ event: DamageEvent; index: number } | null>(null)

  if (damageEvents.length === 0) {
    return (
      <div className="radialSection damageSourcesSection">
        <div className="connectorLine" />
        <div className="sectionCard silver">
          <div className="sectionTopAccent silver" />
          <div className="sectionTitle silver">
            <div className="titleDot silver" />
            <span>Damage Sources</span>
          </div>
          <div className="sectionContent">
            <p className="emptyMessage">No damage sources detected</p>
          </div>
          <div className="sectionBottomAccent silver" />
        </div>
      </div>
    )
  }

  return (
    <div className="radialSection damageSourcesSection">
      <div className="connectorLine" />
      <div className="sectionCard silver">
        <div className="sectionTopAccent silver" />
        <div className="sectionTitle silver">
          <div className="titleDot silver" />
          <span>Damage Sources</span>
        </div>
        <div className="sectionContent">
          {damageEvents.map((event, index) => {
            const pct = totalDamage > 0 ? (event.average / totalDamage) * 100 : 0
            const pieColor = PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]
            return (
              <div key={index} className="damageSourceRow" onMouseEnter={() => setHoveredEvent({ event, index })} onMouseLeave={() => setHoveredEvent(null)}>
                <DataRow label={event.actionName} value={`${event.average.toFixed(0)} (${pct.toFixed(1)}%)`} barPct={pct} customColor={pieColor} />
              </div>
            )
          })}
        </div>
        <div className="sectionBottomAccent silver" />
      </div>

      {/* Detail tooltip when hovering over an event */}
      {hoveredEvent && (
        <div className="pieTooltip damageSourceTooltip" style={{ bottom: 'calc(100% + 20px)', left: '50%', transform: 'translateX(-50%)', top: 'auto', '--tooltip-color': PIE_CHART_COLORS[hoveredEvent.index % PIE_CHART_COLORS.length] } as React.CSSProperties}>
          <div className="pieTooltipAccent" style={{ background: `linear-gradient(to right, ${PIE_CHART_COLORS[hoveredEvent.index % PIE_CHART_COLORS.length]}, transparent)` }} />
          <div className="pieTooltipTitle" style={{ color: PIE_CHART_COLORS[hoveredEvent.index % PIE_CHART_COLORS.length] }}>
            {hoveredEvent.event.actionName}
          </div>
          <div className="pieTooltipDivider" />
          <div className="pieTooltipRow">
            <span className="pieTooltipLabel">Dealer</span>
            <span className="pieTooltipValue">{hoveredEvent.event.dealer}</span>
          </div>
          <div className="pieTooltipRow">
            <span className="pieTooltipLabel">Target</span>
            <span className="pieTooltipValue">{hoveredEvent.event.target}</span>
          </div>
          <div className="pieTooltipRow">
            <span className="pieTooltipLabel">Avg Damage</span>
            <span className="pieTooltipValue pieTooltipHighlight" style={{ color: PIE_CHART_COLORS[hoveredEvent.index % PIE_CHART_COLORS.length] }}>
              {hoveredEvent.event.average.toFixed(0)}
            </span>
          </div>
          <div className="pieTooltipRow">
            <span className="pieTooltipLabel">Normal Hit</span>
            <span className="pieTooltipValue">{hoveredEvent.event.normalStrike.toFixed(0)}</span>
          </div>
          <div className="pieTooltipRow">
            <span className="pieTooltipLabel">Critical Hit</span>
            <span className="pieTooltipValue">{hoveredEvent.event.criticalStrike.toFixed(0)}</span>
          </div>
          {hoveredEvent.event.elements.length > 0 && (
            <div className="pieTooltipRow">
              <span className="pieTooltipLabel">Elements</span>
              <span className="pieTooltipValue">{hoveredEvent.event.elements.join(', ')}</span>
            </div>
          )}
          <div className="pieTooltipRow">
            <span className="pieTooltipLabel">Damage Types</span>
            <span className="pieTooltipValue">{hoveredEvent.event.dmgTypes.join(', ')}</span>
          </div>
        </div>
      )}
    </div>
  )
}

function ContributionsSection({ damageEvents, mode }: { damageEvents: DamageEvent[]; mode: 'average' | 'normal' | 'crit' }) {
  // Aggregate all contributions from all damage events
  const allContributions: Record<string, Contribution> = {}

  damageEvents.forEach(event => {
    Object.entries(event.contributions).forEach(([source, contrib]) => {
      if (!allContributions[source]) {
        allContributions[source] = { ...contrib }
      } else {
        // Sum up contributions from the same source
        allContributions[source].average_damage_contributed += contrib.average_damage_contributed
        allContributions[source].normal_damage_contributed += contrib.normal_damage_contributed
        allContributions[source].crit_damage_contributed += contrib.crit_damage_contributed
        // Recalculate percentages later if needed
      }
    })
  })

  const contributionsList = Object.values(allContributions)

  // Sort by contribution amount (descending) based on current mode
  contributionsList.sort((a, b) => {
    const aValue = mode === 'average' ? a.average_damage_contributed : mode === 'normal' ? a.normal_damage_contributed : a.crit_damage_contributed
    const bValue = mode === 'average' ? b.average_damage_contributed : mode === 'normal' ? b.normal_damage_contributed : b.crit_damage_contributed
    return bValue - aValue
  })

  // Find max value for scaling
  const maxValue = contributionsList.reduce((max, contrib) => {
    const value = mode === 'average' ? contrib.average_damage_contributed : mode === 'normal' ? contrib.normal_damage_contributed : contrib.crit_damage_contributed
    return Math.max(max, value)
  }, 0)

  return (
    <div className="radialSection contributions">
      <div className="connectorLine" />
      <div className="sectionCard magenta">
        <div className="sectionTopAccent magenta" />
        <div className="sectionTitle magenta">
          <div className="titleDot magenta" />
          <span>Modifier Contributions</span>
        </div>

        <div className="sectionContent">
          {contributionsList.length === 0 ? (
            <p className="emptyMessage">No modifier contributions detected</p>
          ) : (
            <div className="pillarGraphContainer">
              {contributionsList.map((contrib, index) => {
                const damageValue = mode === 'average' ? contrib.average_damage_contributed : mode === 'normal' ? contrib.normal_damage_contributed : contrib.crit_damage_contributed
                const percentValue = mode === 'average' ? contrib.average_percent_damage_contributed : mode === 'normal' ? contrib.normal_percent_damage_contributed : contrib.crit_percent_damage_contributed

                // Scale height with a minimum of 15% for visibility
                const rawHeightPercent = maxValue > 0 ? (damageValue / maxValue) * 100 : 0
                const heightPercent = Math.max(15, rawHeightPercent)

                return (
                  <div key={index} className="pillarWrapper">
                    <div className="pillarBar">
                      <div className="pillarFill magenta" style={{ height: `${heightPercent}%` }}>
                        <div className="pillarGlow" />
                      </div>
                    </div>
                    <div className="pillarLabel">
                      <div className="pillarSource">{contrib.displayName || contrib.source}</div>
                      <div className="pillarPercent">{percentValue.toFixed(1)}%</div>
                      <div className="pillarValue">{damageValue.toFixed(0)}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
        <div className="sectionBottomAccent magenta" />
      </div>
    </div>
  )
}

function DataRow({ label, value, barPct, barExcessPct, color = 'cyan', customColor }: { label: string; value: string; barPct?: number; barExcessPct?: number; color?: 'cyan' | 'amber' | 'magenta' | 'purple'; customColor?: string }) {
  return (
    <div className="dataRow">
      <div className="dataRowTop">
        <span className="dataRowLabel">{label}</span>
        <span className="dataRowValue" style={customColor ? { color: customColor, textShadow: `0 0 8px ${customColor}` } : undefined}>
          {value}
        </span>
      </div>
      {barPct !== undefined && (
        <div className="dataRowBar">
          {customColor ? (
            <>
              <div className="dataRowBarFill" style={{ width: `${Math.min(barPct, 100)}%`, background: customColor, boxShadow: `0 0 6px ${customColor}` }} />
              {barExcessPct !== undefined && barExcessPct > 0 && <div className="dataRowBarFillExcess" style={{ width: `${barExcessPct}%`, background: customColor, filter: 'brightness(1.3)' }} />}
            </>
          ) : (
            <>
              <div className={`dataRowBarFill ${color}`} style={{ width: `${Math.min(barPct, 100)}%` }} />
              {barExcessPct !== undefined && barExcessPct > 0 && <div className={`dataRowBarFillExcess ${color}`} style={{ width: `${barExcessPct}%` }} />}
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ========== Helper Functions ===================================================================================================

function calculateTotalDamage(damageEvents: DamageEvent[]): number {
  return damageEvents.reduce((sum, e) => sum + e.average, 0)
}

function calculateDuration(snapshot: Snapshot): number {
  return snapshot.toTime - snapshot.fromTime
}

function calculatePieSlices(damageValues: number[], colors: string[]) {
  const total = damageValues.reduce((sum, val) => sum + val, 0)
  let cumulativePercent = 0

  return damageValues.map((damage, index) => {
    const percent = (damage / total) * 100
    const angle = (percent / 100) * 360
    const startAngle = (cumulativePercent / 100) * 360
    const rad = (deg: number) => (deg * Math.PI) / 180

    const x1 = 100 + 90 * Math.cos(rad(startAngle - 90))
    const y1 = 100 + 90 * Math.sin(rad(startAngle - 90))
    const x2 = 100 + 90 * Math.cos(rad(startAngle + angle - 90))
    const y2 = 100 + 90 * Math.sin(rad(startAngle + angle - 90))
    const largeArc = angle > 180 ? 1 : 0

    const path = `M 100 100 L ${x1} ${y1} A 90 90 0 ${largeArc} 1 ${x2} ${y2} Z`

    cumulativePercent += percent

    return {
      path,
      color: colors[index % colors.length],
    }
  })
}

function aggregateDamageByType(damageEvents: DamageEvent[]): Array<{ name: string; damage: number; event?: DamageEvent }> {
  const typeMap = new Map<string, number>()

  damageEvents.forEach(event => {
    event.dmgTypes.forEach(type => {
      const current = typeMap.get(type) || 0
      typeMap.set(type, current + event.average)
    })
  })

  return Array.from(typeMap.entries())
    .map(([type, damage]) => ({ name: type, damage }))
    .sort((a, b) => b.damage - a.damage)
}
