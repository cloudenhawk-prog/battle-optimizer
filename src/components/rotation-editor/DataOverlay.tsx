import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import '../../styles/rotation-editor/DataOverlay.css'
import type { Snapshot } from '../../types/snapshot'
import type { DamageEvent } from '../../types/events'

// Pie chart colors - shared between pie chart and damage sources
const PIE_CHART_COLORS = [
  'rgba(100, 150, 255, 0.7)', // blue
  'rgba(255, 150, 100, 0.7)', // orange
  'rgba(100, 220, 175, 0.7)', // teal
  'rgba(255, 200, 80,  0.7)', // gold
  'rgba(200, 100, 255, 0.7)', // violet
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
      <div className="dataOverlayContent">
        <OverlayHeader onClose={onClose} />
        <div className="dataOverlayBody">
          <HudOverlay mode={mode} onModeChange={setMode} />

          {/* Central Pie Chart */}
          <PieChartCenter damageEvents={damageEvents} totalDamage={totalDamage} view={pieChartView} highlightedIndex={highlightedIndex} onSliceHover={setHighlightedIndex} />

          {/* Radial Sections */}
          <CombatOverviewSection totalDamage={totalDamage} duration={duration} snapshot={snapshot} />
          <DamageSourcesSection damageEvents={damageEvents} totalDamage={totalDamage} view={pieChartView} onViewChange={setPieChartView} externalHighlightedIndex={highlightedIndex} onRowHighlight={setHighlightedIndex} />
          <ContributionsSection damageEvents={damageEvents} mode={mode} />
        </div>
      </div>
    </div>,
    document.body,
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
        <div className="pieLabel" style={{ pointerEvents: 'none' }}>
          Total Damage
        </div>
        <div className="piePercentage" style={{ pointerEvents: 'none' }}>
          {formattedDamage}
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

type DisplayItem = { name: string; damage: number; index: number; count?: number; events?: DamageEvent[]; event?: DamageEvent }

function DamageSourcesSection({ damageEvents, totalDamage, view, onViewChange, externalHighlightedIndex, onRowHighlight }: { damageEvents: DamageEvent[]; totalDamage: number; view: 'events' | 'types'; onViewChange: (view: 'events' | 'types') => void; externalHighlightedIndex: number | null; onRowHighlight: (index: number | null) => void }) {
  const [hoveredItem, setHoveredItem] = useState<DisplayItem | null>(null)
  const [showTooltip, setShowTooltip] = useState(false)
  const [pinnedItem, setPinnedItem] = useState<DisplayItem | null>(null)
  const hoverTimeoutRef = useRef<number | null>(null)

  const handleMouseEnter = (item: DisplayItem) => {
    // Don't change hover state if an item is pinned
    if (pinnedItem) return

    setHoveredItem(item)
    onRowHighlight(item.index)
    // Small delay to ensure layout is stable before showing tooltip
    if (hoverTimeoutRef.current !== null) {
      clearTimeout(hoverTimeoutRef.current)
    }
    hoverTimeoutRef.current = window.setTimeout(() => {
      setShowTooltip(true)
    }, 100)
  }

  const handleMouseLeave = () => {
    // Don't hide tooltip if an item is pinned
    if (pinnedItem) return

    if (hoverTimeoutRef.current !== null) {
      clearTimeout(hoverTimeoutRef.current)
    }
    setHoveredItem(null)
    setShowTooltip(false)
    onRowHighlight(null)
  }

  const handleClick = (item: DisplayItem) => {
    if (pinnedItem && pinnedItem.name === item.name && pinnedItem.index === item.index) {
      // Unpin if clicking the same item
      setPinnedItem(null)
      setHoveredItem(null)
      setShowTooltip(false)
      onRowHighlight(null)
    } else {
      // Pin the clicked item
      setPinnedItem(item)
      setHoveredItem(item)
      setShowTooltip(true)
      onRowHighlight(item.index)
    }
  }

  const handleClickAway = (e: React.MouseEvent) => {
    // Only unpin if clicking outside the section content
    if ((e.target as HTMLElement).closest('.sectionContent') === null) {
      setPinnedItem(null)
      setHoveredItem(null)
      setShowTooltip(false)
    }
  }

  if (damageEvents.length === 0) {
    return (
      <div className="radialSection damageSourcesSection">
        <div className="connectorLine" />
        <div className="sectionCard silver">
          <div className="sectionTopAccent silver" />
          <div className="sectionTitle silver">
            <div className="titleDot silver" />
            <span>{view === 'events' ? 'Damage Sources' : 'Damage Types'}</span>
          </div>
          <div className="sectionContent">
            <p className="emptyMessage">No damage sources detected</p>
          </div>
          <div className="sectionBottomAccent silver" />
        </div>
        <div className="damageSourcesHeader">
          <div className="pieViewToggle">
            <button className={`pieViewButton ${view === 'events' ? 'active' : ''}`} onClick={() => onViewChange('events')}>
              Events
            </button>
            <button className={`pieViewButton ${view === 'types' ? 'active' : ''}`} onClick={() => onViewChange('types')}>
              Types
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Prepare display data based on view
  const displayData = view === 'types' ? aggregateDamageByType(damageEvents) : aggregateEventsByName(damageEvents)

  return (
    <div className="radialSection damageSourcesSection" onClick={handleClickAway}>
      <div className="connectorLine" />
      <div className="sectionCard silver">
        <div className="sectionTopAccent silver" />
        <div className="sectionTitle silver">
          <div className="titleDot silver" />
          <span>{view === 'events' ? 'Damage Sources' : 'Damage Types'}</span>
        </div>
        <div className="sectionContent">
          {displayData.map((item, index) => {
            const pct = totalDamage > 0 ? (item.damage / totalDamage) * 100 : 0
            const pieColor = PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]
            const isPinned = pinnedItem && pinnedItem.name === item.name && pinnedItem.index === index
            // externalHighlight: pie slice is hovered over this row's index, but the row isn't already internally hovered/pinned
            const isExternallyHighlighted = externalHighlightedIndex === index && hoveredItem?.index !== index && pinnedItem?.index !== index
            const count = 'count' in item ? item.count : undefined
            const label = (
              <>
                {item.name}
                {count !== undefined && count > 1 && <span className="eventCountBadge">×{count}</span>}
              </>
            )
            return (
              <div
                key={index}
                className={`damageSourceRow ${isPinned ? 'pinned' : ''} ${isExternallyHighlighted ? 'externalHighlight' : ''}`}
                onMouseEnter={() => handleMouseEnter({ ...item, index })}
                onMouseLeave={handleMouseLeave}
                onClick={e => {
                  e.stopPropagation()
                  handleClick({ ...item, index })
                }}>
                <DataRow label={label} value={`${item.damage.toFixed(0)} (${pct.toFixed(1)}%)`} barPct={pct} customColor={pieColor} />
              </div>
            )
          })}
        </div>
        <div className="sectionBottomAccent silver" />
      </div>
      <div className="damageSourcesHeader">
        <div className="pieViewToggle">
          <button className={`pieViewButton ${view === 'events' ? 'active' : ''}`} onClick={() => onViewChange('events')}>
            Events
          </button>
          <button className={`pieViewButton ${view === 'types' ? 'active' : ''}`} onClick={() => onViewChange('types')}>
            Types
          </button>
        </div>
      </div>

      {/* Detail tooltip when hovering over an item */}
      {hoveredItem && showTooltip && (
        <div className="pieTooltip damageSourceTooltip" style={{ bottom: 'calc(100% + 20px)', left: '50%', transform: 'translateX(-50%)', top: 'auto', '--tooltip-color': PIE_CHART_COLORS[hoveredItem.index % PIE_CHART_COLORS.length] } as React.CSSProperties}>
          <div className="pieTooltipAccent" style={{ background: `linear-gradient(to right, ${PIE_CHART_COLORS[hoveredItem.index % PIE_CHART_COLORS.length]}, transparent)` }} />
          <div className="pieTooltipTitle" style={{ color: PIE_CHART_COLORS[hoveredItem.index % PIE_CHART_COLORS.length] }}>
            {hoveredItem.name}
          </div>
          <div className="pieTooltipDivider" />
          {view === 'events' && (() => {
            const representativeEvent = hoveredItem.events?.[0] ?? hoveredItem.event
            const hitCount = hoveredItem.count ?? 1
            if (!representativeEvent) return null
            const perHit = hitCount > 1 ? hoveredItem.damage / hitCount : null
            return (
              <>
                {hitCount > 1 && (
                  <div className="pieTooltipRow">
                    <span className="pieTooltipLabel">Hits</span>
                    <span className="pieTooltipValue pieTooltipHighlight" style={{ color: PIE_CHART_COLORS[hoveredItem.index % PIE_CHART_COLORS.length] }}>×{hitCount}</span>
                  </div>
                )}
                <div className="pieTooltipRow">
                  <span className="pieTooltipLabel">Dealer</span>
                  <span className="pieTooltipValue">{representativeEvent.dealer}</span>
                </div>
                <div className="pieTooltipRow">
                  <span className="pieTooltipLabel">Target</span>
                  <span className="pieTooltipValue">{representativeEvent.target}</span>
                </div>
                <div className="pieTooltipRow">
                  <span className="pieTooltipLabel">{hitCount > 1 ? 'Total Damage' : 'Avg Damage'}</span>
                  <span className="pieTooltipValue pieTooltipHighlight" style={{ color: PIE_CHART_COLORS[hoveredItem.index % PIE_CHART_COLORS.length] }}>
                    {hoveredItem.damage.toFixed(0)}
                  </span>
                </div>
                {perHit !== null && (
                  <div className="pieTooltipRow">
                    <span className="pieTooltipLabel">Per Hit</span>
                    <span className="pieTooltipValue">{perHit.toFixed(0)}</span>
                  </div>
                )}
                {hitCount === 1 && (
                  <>
                    <div className="pieTooltipRow">
                      <span className="pieTooltipLabel">Normal Hit</span>
                      <span className="pieTooltipValue">{representativeEvent.normalStrike.toFixed(0)}</span>
                    </div>
                    <div className="pieTooltipRow">
                      <span className="pieTooltipLabel">Critical Hit</span>
                      <span className="pieTooltipValue">{representativeEvent.criticalStrike.toFixed(0)}</span>
                    </div>
                  </>
                )}
                {representativeEvent.elements.length > 0 && (
                  <div className="pieTooltipRow">
                    <span className="pieTooltipLabel">Elements</span>
                    <span className="pieTooltipValue">{representativeEvent.elements.join(', ')}</span>
                  </div>
                )}
                <div className="pieTooltipRow">
                  <span className="pieTooltipLabel">Damage Types</span>
                  <span className="pieTooltipValue">{representativeEvent.dmgTypes.join(', ')}</span>
                </div>
              </>
            )
          })()}
          {view === 'types' && (
            <>
              <div className="pieTooltipRow">
                <span className="pieTooltipLabel">Total Damage</span>
                <span className="pieTooltipValue pieTooltipHighlight" style={{ color: PIE_CHART_COLORS[hoveredItem.index % PIE_CHART_COLORS.length] }}>
                  {hoveredItem.damage.toFixed(0)}
                </span>
              </div>
              <div className="pieTooltipRow">
                <span className="pieTooltipLabel">Percentage</span>
                <span className="pieTooltipValue pieTooltipHighlight" style={{ color: PIE_CHART_COLORS[hoveredItem.index % PIE_CHART_COLORS.length] }}>
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
  const [contributionScope, setContributionScope] = useState<'action' | 'all'>('action')
  const [hoveredPillarIndex, setHoveredPillarIndex] = useState<number | null>(null)

  // Filter events based on scope
  const scopedEvents = contributionScope === 'action' ? damageEvents.filter(event => !event.dmgTypes.includes('NEGATIVE_STATUS')) : damageEvents

  // Calculate total damage for the selected scope
  const totalDamageInScope = scopedEvents.reduce((sum, event) => {
    const eventDamage = mode === 'average' ? event.average : mode === 'normal' ? event.normalStrike : event.criticalStrike
    return sum + eventDamage
  }, 0)

  // Aggregate flat damage contributions from scoped events
  const allContributions: Record<string, { source: string; displayName?: string; average: number; normal: number; crit: number }> = {}

  scopedEvents.forEach(event => {
    Object.entries(event.contributions).forEach(([source, contrib]) => {
      if (!allContributions[source]) {
        allContributions[source] = {
          source: contrib.source,
          displayName: contrib.displayName,
          average: contrib.average_damage_contributed,
          normal: contrib.normal_damage_contributed,
          crit: contrib.crit_damage_contributed,
        }
      } else {
        // Sum up flat damage contributions
        allContributions[source].average += contrib.average_damage_contributed
        allContributions[source].normal += contrib.normal_damage_contributed
        allContributions[source].crit += contrib.crit_damage_contributed
      }
    })
  })

  const contributionsList = Object.values(allContributions)

  // Sort by contribution amount (descending) based on current mode
  contributionsList.sort((a, b) => {
    const aValue = mode === 'average' ? a.average : mode === 'normal' ? a.normal : a.crit
    const bValue = mode === 'average' ? b.average : mode === 'normal' ? b.normal : b.crit
    return bValue - aValue
  })

  // Find max value for scaling
  const maxValue = contributionsList.reduce((max, contrib) => {
    const value = mode === 'average' ? contrib.average : mode === 'normal' ? contrib.normal : contrib.crit
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
                const damageValue = mode === 'average' ? contrib.average : mode === 'normal' ? contrib.normal : contrib.crit

                // Calculate percentage as damage increase: (with / without) - 1
                // Total damage WITH modifier = totalDamageInScope
                // Total damage WITHOUT modifier = totalDamageInScope - damageValue
                const damageWithout = totalDamageInScope - damageValue
                const percentValue = damageWithout > 0 ? (totalDamageInScope / damageWithout - 1) * 100 : 0

                // Scale height with a minimum of 15% for visibility
                const rawHeightPercent = maxValue > 0 ? (damageValue / maxValue) * 100 : 0
                const heightPercent = Math.max(15, rawHeightPercent)

                return (
                  <div key={index} className="pillarWrapper" onMouseEnter={() => setHoveredPillarIndex(index)} onMouseLeave={() => setHoveredPillarIndex(null)}>
                    {hoveredPillarIndex === index && (
                      <div className="pillarTooltip">
                        <div className="pillarTooltipTitle">{contrib.displayName || contrib.source}</div>
                        {contrib.displayName && contrib.displayName !== contrib.source && (
                          <div className="pillarTooltipSource">{contrib.source}</div>
                        )}
                        <div className="pillarTooltipDivider" />
                        <div className="pillarTooltipRow">
                          <span className="pillarTooltipLabel">Avg Damage</span>
                          <span className="pillarTooltipValue">{contrib.average.toFixed(0)}</span>
                        </div>
                        <div className="pillarTooltipRow">
                          <span className="pillarTooltipLabel">Normal Hit</span>
                          <span className="pillarTooltipValue">{contrib.normal.toFixed(0)}</span>
                        </div>
                        <div className="pillarTooltipRow">
                          <span className="pillarTooltipLabel">Critical Hit</span>
                          <span className="pillarTooltipValue">{contrib.crit.toFixed(0)}</span>
                        </div>
                        <div className="pillarTooltipRow">
                          <span className="pillarTooltipLabel">+% Damage</span>
                          <span className="pillarTooltipValue pillarTooltipHighlight">{percentValue.toFixed(1)}%</span>
                        </div>
                      </div>
                    )}
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
      <div className="contributionsHeader">
        <div className="contributionScopeToggle">
          <button className={`scopeButton ${contributionScope === 'action' ? 'active' : ''}`} onClick={() => setContributionScope('action')} title="Show contributions for action damage only">
            Action
          </button>
          <button className={`scopeButton ${contributionScope === 'all' ? 'active' : ''}`} onClick={() => setContributionScope('all')} title="Show contributions for all damage (action + status effects + etc)">
            All
          </button>
        </div>
      </div>
    </div>
  )
}

function DataRow({ label, value, barPct, barExcessPct, color = 'cyan', customColor }: { label: React.ReactNode; value: string; barPct?: number; barExcessPct?: number; color?: 'cyan' | 'amber' | 'magenta' | 'purple'; customColor?: string }) {
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
