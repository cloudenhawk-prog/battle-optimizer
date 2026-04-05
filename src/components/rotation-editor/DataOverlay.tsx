import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import '../../styles/rotation-editor/DataOverlay.css'
import type { Snapshot } from '../../types/snapshot'
import type { DamageEvent } from '../../types/events'

// Pie chart colors — tuned to match the cyan/amber/purple palette of the SummaryOverlay
const PIE_CHART_COLORS = [
  'rgba(100, 220, 255, 0.75)', // cyan
  'rgba(255, 190,  60, 0.75)', // amber
  'rgba(200, 120, 255, 0.75)', // violet
  'rgba(100, 220, 175, 0.75)', // teal
  'rgba(255, 130, 100, 0.75)', // coral
]

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
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null)

  if (!open || !snapshot) return null

  const totalDamage = calculateTotalDamage(damageEvents)
  const duration = calculateDuration(snapshot)

  return createPortal(
    <div className="dataOverlay" role="dialog" aria-modal="true">
      <div className="dataPanel">
        {/* HUD decorations */}
        <div className="dataHudScanLine" />
        <div className="dataHudCorner topLeft" />
        <div className="dataHudCorner topRight" />
        <div className="dataHudCorner bottomLeft" />
        <div className="dataHudCorner bottomRight" />
        <div className="dataHudTopBar">
          <span>TETHER // ANALYSIS MODULE</span>
          <span className="dataHudBadge">LIVE FEED</span>
        </div>
        <div className="dataHudBottomBar">
          <span>LINK: ESTABLISHED // PHASE DRIFT: 0.02°</span>
          <span>SYNC INDEX: 0.998 // ECHO SIGNATURE: LOCKED</span>
        </div>

        {/* Header */}
        <div className="dataHeader">
          <div className="dataHeaderLeft">
            <h2 className="dataTitle">RESONANCE FIELD ANALYSIS</h2>
          </div>
          <div className="dataHeaderRight">
            <div className="dataModeGroup">
              <button className={`dataModeButton${mode === 'average' ? ' active' : ''}`} onClick={() => setMode('average')}>
                Average
              </button>
              <button className={`dataModeButton${mode === 'normal' ? ' active' : ''}`} onClick={() => setMode('normal')}>
                Normal
              </button>
              <button className={`dataModeButton${mode === 'crit' ? ' active' : ''}`} onClick={() => setMode('crit')}>
                Critical
              </button>
            </div>
            <button className="dataClose" onClick={onClose}>
              ✕
            </button>
          </div>
        </div>

        {/* 3-column body */}
        <div className="dataColumns">
          {/* Left panel — Combat Metrics */}
          <div className="dataLeftPanel">
            <CombatMetricsSection totalDamage={totalDamage} duration={duration} snapshot={snapshot} />
          </div>

          <div className="dataColDivider" />

          {/* Center — pie chart + damage sources */}
          <div className="dataCenterPanel">
            <div className="dataCenterPieArea">
              <PieChartCenter
                damageEvents={damageEvents}
                totalDamage={totalDamage}
                view={pieChartView}
                highlightedIndex={highlightedIndex}
                onSliceHover={setHighlightedIndex}
              />
            </div>
            <div className="dataCenterSourcesArea">
              <DamageSourcesSection
                damageEvents={damageEvents}
                totalDamage={totalDamage}
                view={pieChartView}
                onViewChange={setPieChartView}
                externalHighlightedIndex={highlightedIndex}
                onRowHighlight={setHighlightedIndex}
              />
            </div>
          </div>

          <div className="dataColDivider" />

          {/* Right panel — Modifier Contributions */}
          <div className="dataRightPanel">
            <ContributionsSection damageEvents={damageEvents} mode={mode} />
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}

// ========== Sub-component: Combat Metrics =====================================================================================

function CombatMetricsSection({ totalDamage, duration, snapshot }: { totalDamage: number; duration: number; snapshot: Snapshot }) {
  const dps = duration > 0 ? totalDamage / duration : 0
  const castTime = `${snapshot.fromTime.toFixed(2)}s – ${snapshot.toTime.toFixed(2)}s`

  return (
    <div className="dataSectionGroup">
      <div className="dataPanelHeader cyan">
        <div className="dataPanelHeaderDot cyan" />
        <span className="dataPanelHeaderLabel">Combat Metrics</span>
        <div className="dataPanelHeaderLine" />
      </div>
      <DataRow label="Total Damage" value={totalDamage.toFixed(0)} />
      <DataRow label="DPS" value={dps > 0 ? dps.toFixed(1) : 'N/A'} />
      <DataRow label="Duration" value={`${duration.toFixed(2)}s`} />
      <DataRow label="Cast Window" value={castTime} />
    </div>
  )
}

function PieChartCenter({ damageEvents, totalDamage, view, highlightedIndex, onSliceHover }: { damageEvents: DamageEvent[]; totalDamage: number; view: 'events' | 'types'; highlightedIndex: number | null; onSliceHover: (index: number | null) => void }) {
  if (damageEvents.length === 0) return null

  // Aggregate damage by type if in 'types' view
  const displayData = view === 'types' ? aggregateDamageByType(damageEvents) : aggregateEventsByName(damageEvents)

  // Format total damage for display
  const formattedDamage = totalDamage >= 1000 ? `${(totalDamage / 1000).toFixed(1)}k` : totalDamage.toFixed(0)

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
        <svg viewBox="0 0 200 200" className="pieChartSvg" style={{ overflow: 'visible' }}>
          <circle
            cx="100" cy="100" r="90"
            fill={PIE_CHART_COLORS[0]}
            stroke="rgba(30, 30, 40, 0.95)"
            strokeWidth="2"
            className={`pieSlice${highlightedIndex === 0 ? ' highlighted' : ''}`}
            style={{ cursor: 'pointer' }}
            onMouseEnter={() => onSliceHover(0)}
            onMouseLeave={() => onSliceHover(null)}
          />
        </svg>
      ) : (
        <svg viewBox="0 0 200 200" className="pieChartSvg" style={{ overflow: 'visible' }}>
          {calculatePieSlices(
            displayData.map(d => d.damage),
            PIE_CHART_COLORS,
          ).map((slice, index) => (
            <path
              key={index}
              d={slice.path}
              fill={slice.color}
              stroke="rgba(30, 30, 40, 0.95)"
              strokeWidth="2"
              className={`pieSlice${highlightedIndex === index ? ' highlighted' : ''}`}
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => onSliceHover(index)}
              onMouseLeave={() => onSliceHover(null)}
            />
          ))}
        </svg>
      )}

      {/* Inner circle with total damage */}
      <div className="pieInnerCircle">
        <div className="pieLabel">Total Damage</div>
        <div className="piePercentage">{formattedDamage}</div>
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
    </div>
  )
}

// ========== Sub-component: Damage Sources helper type ========================================================================

type DisplayItem = { name: string; damage: number; index: number; count?: number; events?: DamageEvent[]; event?: DamageEvent }

function DamageSourcesSection({
  damageEvents,
  totalDamage,
  view,
  onViewChange,
  externalHighlightedIndex,
  onRowHighlight,
}: {
  damageEvents: DamageEvent[]
  totalDamage: number
  view: 'events' | 'types'
  onViewChange: (view: 'events' | 'types') => void
  externalHighlightedIndex: number | null
  onRowHighlight: (index: number | null) => void
}) {
  const [hoveredItem, setHoveredItem] = useState<DisplayItem | null>(null)
  const [showTooltip, setShowTooltip] = useState(false)
  const [pinnedItem, setPinnedItem] = useState<DisplayItem | null>(null)
  const hoverTimeoutRef = useRef<number | null>(null)

  const handleMouseEnter = (item: DisplayItem) => {
    if (pinnedItem) return
    setHoveredItem(item)
    onRowHighlight(item.index)
    if (hoverTimeoutRef.current !== null) clearTimeout(hoverTimeoutRef.current)
    hoverTimeoutRef.current = window.setTimeout(() => setShowTooltip(true), 100)
  }

  const handleMouseLeave = () => {
    if (pinnedItem) return
    if (hoverTimeoutRef.current !== null) clearTimeout(hoverTimeoutRef.current)
    setHoveredItem(null)
    setShowTooltip(false)
    onRowHighlight(null)
  }

  const handleClick = (item: DisplayItem) => {
    if (pinnedItem && pinnedItem.name === item.name && pinnedItem.index === item.index) {
      setPinnedItem(null)
      setHoveredItem(null)
      setShowTooltip(false)
      onRowHighlight(null)
    } else {
      setPinnedItem(item)
      setHoveredItem(item)
      setShowTooltip(true)
      onRowHighlight(item.index)
    }
  }

  const handleClickAway = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.dataSourceRows') === null) {
      setPinnedItem(null)
      setHoveredItem(null)
      setShowTooltip(false)
    }
  }

  const displayData = view === 'types' ? aggregateDamageByType(damageEvents) : aggregateEventsByName(damageEvents)

  return (
    <div className="dataSectionGroup dataSourcesSection" onClick={handleClickAway}>
      <div className="dataPanelHeader silver">
        <div className="dataPanelHeaderDot silver" />
        <span className="dataPanelHeaderLabel">{view === 'events' ? 'Damage Sources' : 'Damage Types'}</span>
        <div className="dataPanelHeaderLine" />
        <div className="dataPieToggle">
          <button className={`dataPieToggleButton${view === 'events' ? ' active' : ''}`} onClick={() => onViewChange('events')}>
            Events
          </button>
          <button className={`dataPieToggleButton${view === 'types' ? ' active' : ''}`} onClick={() => onViewChange('types')}>
            Types
          </button>
        </div>
      </div>

      <div className="dataSourceRows">
        {damageEvents.length === 0 ? (
          <p className="dataEmptyMsg">No damage sources detected</p>
        ) : (
          displayData.map((item, index) => {
            const pct = totalDamage > 0 ? (item.damage / totalDamage) * 100 : 0
            const pieColor = PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]
            const isPinned = pinnedItem && pinnedItem.name === item.name && pinnedItem.index === index
            const isExternallyHighlighted = externalHighlightedIndex === index && hoveredItem?.index !== index && pinnedItem?.index !== index
            const count = 'count' in item ? item.count : undefined
            const label = (
              <>
                {item.name}
                {count !== undefined && count > 1 && <span className="dataCountBadge">×{count}</span>}
              </>
            )
            return (
              <div
                key={index}
                className={`dataSourceRow${isPinned ? ' pinned' : ''}${isExternallyHighlighted ? ' externalHighlight' : ''}`}
                onMouseEnter={() => handleMouseEnter({ ...item, index })}
                onMouseLeave={handleMouseLeave}
                onClick={e => {
                  e.stopPropagation()
                  handleClick({ ...item, index })
                }}>
                <DataRow label={label} value={`${item.damage.toFixed(0)} (${pct.toFixed(1)}%)`} barPct={pct} customColor={pieColor} />
              </div>
            )
          })
        )}
      </div>

      {/* Hover/pin tooltip */}
      {hoveredItem && showTooltip && (
        <div
          className="dataSourceTooltip"
          style={{ '--tooltip-color': PIE_CHART_COLORS[hoveredItem.index % PIE_CHART_COLORS.length] } as React.CSSProperties}>
          <div className="dataTooltipAccent" style={{ background: `linear-gradient(to right, ${PIE_CHART_COLORS[hoveredItem.index % PIE_CHART_COLORS.length]}, transparent)` }} />
          <div className="dataTooltipTitle" style={{ color: PIE_CHART_COLORS[hoveredItem.index % PIE_CHART_COLORS.length] }}>
            {hoveredItem.name}
          </div>
          <div className="dataTooltipDivider" />
          {view === 'events' &&
            (() => {
              const representativeEvent = hoveredItem.events?.[0] ?? hoveredItem.event
              const hitCount = hoveredItem.count ?? 1
              if (!representativeEvent) return null
              const perHit = hitCount > 1 ? hoveredItem.damage / hitCount : null
              return (
                <>
                  {hitCount > 1 && (
                    <div className="dataTooltipRow">
                      <span className="dataTooltipLabel">Hits</span>
                      <span className="dataTooltipValue dataTooltipHighlight" style={{ color: PIE_CHART_COLORS[hoveredItem.index % PIE_CHART_COLORS.length] }}>
                        ×{hitCount}
                      </span>
                    </div>
                  )}
                  <div className="dataTooltipRow">
                    <span className="dataTooltipLabel">Dealer</span>
                    <span className="dataTooltipValue">{representativeEvent.dealer}</span>
                  </div>
                  <div className="dataTooltipRow">
                    <span className="dataTooltipLabel">Target</span>
                    <span className="dataTooltipValue">{representativeEvent.target}</span>
                  </div>
                  <div className="dataTooltipRow">
                    <span className="dataTooltipLabel">{hitCount > 1 ? 'Total Damage' : 'Avg Damage'}</span>
                    <span className="dataTooltipValue dataTooltipHighlight" style={{ color: PIE_CHART_COLORS[hoveredItem.index % PIE_CHART_COLORS.length] }}>
                      {hoveredItem.damage.toFixed(0)}
                    </span>
                  </div>
                  {perHit !== null && (
                    <div className="dataTooltipRow">
                      <span className="dataTooltipLabel">Per Hit</span>
                      <span className="dataTooltipValue">{perHit.toFixed(0)}</span>
                    </div>
                  )}
                  {hitCount === 1 && (
                    <>
                      <div className="dataTooltipRow">
                        <span className="dataTooltipLabel">Normal Hit</span>
                        <span className="dataTooltipValue">{representativeEvent.normalStrike.toFixed(0)}</span>
                      </div>
                      <div className="dataTooltipRow">
                        <span className="dataTooltipLabel">Critical Hit</span>
                        <span className="dataTooltipValue">{representativeEvent.criticalStrike.toFixed(0)}</span>
                      </div>
                    </>
                  )}
                  {representativeEvent.elements.length > 0 && (
                    <div className="dataTooltipRow">
                      <span className="dataTooltipLabel">Elements</span>
                      <span className="dataTooltipValue">{representativeEvent.elements.join(', ')}</span>
                    </div>
                  )}
                  <div className="dataTooltipRow">
                    <span className="dataTooltipLabel">Damage Types</span>
                    <span className="dataTooltipValue">{representativeEvent.dmgTypes.join(', ')}</span>
                  </div>
                </>
              )
            })()}
          {view === 'types' && (
            <>
              <div className="dataTooltipRow">
                <span className="dataTooltipLabel">Total Damage</span>
                <span className="dataTooltipValue dataTooltipHighlight" style={{ color: PIE_CHART_COLORS[hoveredItem.index % PIE_CHART_COLORS.length] }}>
                  {hoveredItem.damage.toFixed(0)}
                </span>
              </div>
              <div className="dataTooltipRow">
                <span className="dataTooltipLabel">Percentage</span>
                <span className="dataTooltipValue dataTooltipHighlight" style={{ color: PIE_CHART_COLORS[hoveredItem.index % PIE_CHART_COLORS.length] }}>
                  {((hoveredItem.damage / totalDamage) * 100).toFixed(1)}%
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

function ContributionsSection({ damageEvents, mode }: { damageEvents: DamageEvent[]; mode: 'average' | 'normal' | 'crit' }) {
  const [hideInherent, setHideInherent] = useState(false)
  const [hideZero, setHideZero] = useState(true)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  // Total damage across all events for the % impact calculation
  const totalDamage = damageEvents.reduce((sum, event) => {
    return sum + (mode === 'average' ? event.average : mode === 'normal' ? event.normalStrike : event.criticalStrike)
  }, 0)

  // Aggregate flat damage contributions from all events
  const allContributions: Record<string, { source: string; displayName?: string; isInherent?: boolean; average: number; normal: number; crit: number }> = {}

  damageEvents.forEach(event => {
    Object.entries(event.contributions).forEach(([source, contrib]) => {
      if (!allContributions[source]) {
        allContributions[source] = {
          source: contrib.source,
          displayName: contrib.displayName,
          isInherent: contrib.isInherent,
          average: contrib.average_damage_contributed,
          normal: contrib.normal_damage_contributed,
          crit: contrib.crit_damage_contributed,
        }
      } else {
        allContributions[source].average += contrib.average_damage_contributed
        allContributions[source].normal += contrib.normal_damage_contributed
        allContributions[source].crit += contrib.crit_damage_contributed
      }
    })
  })

  let contributionsList = Object.values(allContributions)

  // Apply filters
  if (hideInherent) contributionsList = contributionsList.filter(c => !c.isInherent)
  if (hideZero) {
    contributionsList = contributionsList.filter(c => {
      const val = mode === 'average' ? c.average : mode === 'normal' ? c.normal : c.crit
      return val > 0
    })
  }

  // Sort by contribution amount descending
  contributionsList.sort((a, b) => {
    const aVal = mode === 'average' ? a.average : mode === 'normal' ? a.normal : a.crit
    const bVal = mode === 'average' ? b.average : mode === 'normal' ? b.normal : b.crit
    return bVal - aVal
  })

  const maxValue = contributionsList.reduce((max, c) => {
    const val = mode === 'average' ? c.average : mode === 'normal' ? c.normal : c.crit
    return Math.max(max, val)
  }, 0)

  return (
    <div className="dataSectionGroup">
      <div className="dataPanelHeader purple">
        <div className="dataPanelHeaderDot purple" />
        <span className="dataPanelHeaderLabel">Modifier Contributions</span>
        <div className="dataPanelHeaderLine" />
      </div>
      <div className="dataContribFilterBar">
        <span className="dataContribFilterLabel">Show:</span>
        <button
          className={`dataContribFilterBtn${!hideInherent ? ' active amber' : ''}`}
          onClick={() => setHideInherent(p => !p)}
          title={hideInherent ? 'Show inherent modifiers' : 'Hide inherent modifiers'}>
          Inherent
        </button>
        <button
          className={`dataContribFilterBtn${!hideZero ? ' active cyan' : ''}`}
          onClick={() => setHideZero(p => !p)}
          title={hideZero ? 'Show zero-contribution modifiers' : 'Hide zero-contribution modifiers'}>
          Zeros
        </button>
      </div>

      {contributionsList.length === 0 ? (
        <p className="dataEmptyMsg">No modifier contributions detected</p>
      ) : (
        <div className="dataContribList">
          {contributionsList.map((contrib, index) => {
            const damageValue = mode === 'average' ? contrib.average : mode === 'normal' ? contrib.normal : contrib.crit
            const damageWithout = totalDamage - damageValue
            const percentValue = damageWithout > 0 ? (totalDamage / damageWithout - 1) * 100 : 0
            const barPct = maxValue > 0 ? (damageValue / maxValue) * 100 : 0
            const isInherent = !!contrib.isInherent
            const isZero = damageValue === 0 && !isInherent
            const colorClass = isInherent ? ' amber' : isZero ? ' cyan' : ''

            return (
              <div
                key={index}
                className="dataContribRow"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}>
                {hoveredIndex === index && (
                  <div className="dataPillarTooltip">
                    <div className="dataPillarTooltipTitle">{contrib.displayName || contrib.source}</div>
                    {contrib.displayName && contrib.displayName !== contrib.source && (
                      <div className="dataPillarTooltipSource">{contrib.source}</div>
                    )}
                    <div className="dataPillarTooltipDivider" />
                    <div className="dataPillarTooltipRow">
                      <span className="dataPillarTooltipLabel">Avg Damage</span>
                      <span className="dataPillarTooltipValue">{contrib.average.toFixed(0)}</span>
                    </div>
                    <div className="dataPillarTooltipRow">
                      <span className="dataPillarTooltipLabel">Normal Hit</span>
                      <span className="dataPillarTooltipValue">{contrib.normal.toFixed(0)}</span>
                    </div>
                    <div className="dataPillarTooltipRow">
                      <span className="dataPillarTooltipLabel">Critical Hit</span>
                      <span className="dataPillarTooltipValue">{contrib.crit.toFixed(0)}</span>
                    </div>
                    <div className="dataPillarTooltipRow">
                      <span className="dataPillarTooltipLabel">+% Damage</span>
                      <span className="dataPillarTooltipValue dataPillarTooltipHighlight">
                        {percentValue !== 0 ? `+${percentValue.toFixed(1)}%` : '+0.0%'}
                      </span>
                    </div>
                  </div>
                )}
                <div className="dataContribMeta">
                  <span className={`dataContribName${colorClass}`}>
                    {contrib.displayName || contrib.source}
                  </span>
                  <span className={`dataContribPct${colorClass}`}>
                    {percentValue !== 0 ? `+${percentValue.toFixed(1)}%` : '+0.0%'}
                  </span>
                </div>
                <div className="dataContribBarRow">
                  <div className="dataContribBarTrack">
                    <div className={`dataContribBarFill${colorClass}`} style={{ width: `${barPct}%` }} />
                  </div>
                  <span className="dataContribValue">{damageValue.toFixed(0)}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function DataRow({ label, value, barPct, barExcessPct, color = 'cyan', customColor }: { label: React.ReactNode; value: string; barPct?: number; barExcessPct?: number; color?: 'cyan' | 'amber' | 'purple'; customColor?: string }) {
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

function aggregateEventsByName(damageEvents: DamageEvent[]): Array<{ name: string; damage: number; count: number; events: DamageEvent[] }> {
  const map = new Map<string, { damage: number; count: number; events: DamageEvent[] }>()

  for (const e of damageEvents) {
    const existing = map.get(e.actionName)
    if (existing) {
      existing.damage += e.average
      existing.count++
      existing.events.push(e)
    } else {
      map.set(e.actionName, { damage: e.average, count: 1, events: [e] })
    }
  }

  return Array.from(map.entries()).map(([name, data]) => ({ name, ...data }))
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
