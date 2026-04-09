import { useState, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import '../../styles/rotation-editor/DataOverlay.css'
import { StatusDetailPanel } from './StatusDetailPanel'
import type { StatusDetailInfo } from './StatusDetailPanel'
import type { Snapshot } from '../../types/snapshot'
import type { DamageEvent } from '../../types/events'
import type { ResolvedCharacter } from '../../types/character'
import type { CharacterStats, EnemyStats } from '../../types/stats'
import { aggregateStat } from '../../utils/hooks/resolvers'
import { mergeStats, calculateScalingStat } from '../../utils/calculators/damageCalculator'

// Pie chart colors — tuned to match the cyan/amber/purple palette of the SummaryOverlay
const PIE_CHART_COLORS = [
  'rgba(100, 220, 255, 0.75)', // cyan
  'rgba(255, 190,  60, 0.75)', // amber
  'rgba(200, 120, 255, 0.75)', // violet
  'rgba(100, 220, 175, 0.75)', // teal
  'rgba(255, 130, 100, 0.75)', // coral
]

// ========== Modifier Map ======================================================================================================

type ModifierInfo = {
  displayName: string
  description?: string
  type?: 'buff' | 'debuff'
  characterStats?: Partial<CharacterStats>
  enemyStats?: Partial<EnemyStats>
}

function buildModifierMap(characters: ResolvedCharacter[]): Map<string, ModifierInfo> {
  const map = new Map<string, ModifierInfo>()

  const register = (mod: { source: string; displayName: string; description?: string; type?: 'buff' | 'debuff'; characterStats?: Partial<CharacterStats>; enemyStats?: Partial<EnemyStats> }) => {
    if (!map.has(mod.displayName)) {
      map.set(mod.displayName, {
        displayName: mod.displayName,
        description: mod.description,
        type: mod.type,
        characterStats: mod.characterStats,
        enemyStats: mod.enemyStats,
      })
    }
  }

  for (const char of characters) {
    for (const mod of char.damageModifiers ?? []) register(mod)
    for (const mod of char.flattenedPassiveModifiers ?? []) register(mod)
    for (const milestone of char.resourceMilestones ?? []) register(milestone.modifier)
    for (const action of char.actions ?? []) {
      for (const mod of action.damageModifiers ?? []) register(mod)
      for (const ca of action.coordinatedAttacks ?? []) {
        for (const mod of ca.damageModifiers ?? []) register(mod)
      }
    }
  }

  return map
}

// ========== Main Component =====================================================================================================

type DataOverlayProps = {
  snapshot: Snapshot | null
  previousSnapshot?: Snapshot | null
  startWithFullEnergy?: boolean
  damageEvents?: DamageEvent[]
  characters?: ResolvedCharacter[]
  open: boolean
  onClose: () => void
  onPrev?: () => void
  onNext?: () => void
  hasPrev?: boolean
  hasNext?: boolean
  rowInfo?: { current: number; total: number }
}

export default function DataOverlay({ snapshot, previousSnapshot = null, startWithFullEnergy = false, damageEvents = [], characters = [], open, onClose, onPrev, onNext, hasPrev, hasNext, rowInfo }: DataOverlayProps) {
  const [mode, setMode] = useState<'average' | 'normal' | 'crit'>('average')
  const [pieChartView, setPieChartView] = useState<'events' | 'types'>('events')
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null)

  // Unique action names in stable insertion order — used for contribution source toggles
  const sourceNames = useMemo(() => {
    const seen = new Set<string>()
    const result: string[] = []
    for (const e of damageEvents) {
      if (!seen.has(e.actionName)) { seen.add(e.actionName); result.push(e.actionName) }
    }
    return result
  }, [damageEvents])

  const [activeSources, setActiveSources] = useState<Set<string>>(() => new Set(sourceNames))
  const prevSourceNamesRef = useRef<string[]>(sourceNames)
  if (prevSourceNamesRef.current !== sourceNames) {
    prevSourceNamesRef.current = sourceNames
    setActiveSources(new Set(sourceNames))
  }
  const toggleSource = (name: string) => setActiveSources(prev => {
    const next = new Set(prev)
    if (next.has(name)) next.delete(name); else next.add(name)
    return next
  })

  // Unique contribution group keys across all events — used for buff toggles
  const contribGroupKeys = useMemo(() => {
    const keys = new Set<string>()
    for (const e of damageEvents) {
      for (const key of Object.keys(e.contributions)) keys.add(key)
    }
    return keys
  }, [damageEvents])

  const [activeContribs, setActiveContribs] = useState<Set<string>>(() => new Set(contribGroupKeys))
  const prevContribKeysRef = useRef(contribGroupKeys)
  if (prevContribKeysRef.current !== contribGroupKeys) {
    prevContribKeysRef.current = contribGroupKeys
    setActiveContribs(new Set(contribGroupKeys))
  }
  const toggleContrib = (key: string) => setActiveContribs(prev => {
    const next = new Set(prev)
    if (next.has(key)) next.delete(key); else next.add(key)
    return next
  })
  const toggleAllContribs = () => {
    const allKeys = Array.from(contribGroupKeys)
    setActiveContribs(prev => {
      const allActive = allKeys.every(k => prev.has(k))
      return allActive ? new Set<string>() : new Set(allKeys)
    })
  }

  // Unique damage types across all events — used for pie chart type filtering only
  const typeNames = useMemo(() => {
    const seen = new Set<string>()
    for (const e of damageEvents) {
      for (const t of e.dmgTypes) seen.add(t)
    }
    return seen
  }, [damageEvents])

  const [activeTypes, setActiveTypes] = useState<Set<string>>(() => new Set(typeNames))
  const prevTypeNamesRef = useRef(typeNames)
  if (prevTypeNamesRef.current !== typeNames) {
    prevTypeNamesRef.current = typeNames
    setActiveTypes(new Set(typeNames))
  }
  const toggleType = (type: string) => setActiveTypes(prev => {
    const next = new Set(prev)
    if (next.has(type)) next.delete(type); else next.add(type)
    return next
  })

  // Re-evaluate each event with only the active modifier groups.
  // When all contribs are active, pass through the original events unchanged.
  const adjustedDamageEvents = useMemo(() => {
    if (activeContribs.size >= contribGroupKeys.size) return damageEvents
    return damageEvents.map(event => {
      if (!event.calcParams) return event
      const { normal, crit, avg } = event.calcParams.reEvaluate(activeContribs)
      return { ...event, normalStrike: normal, criticalStrike: crit, average: avg }
    })
  }, [damageEvents, activeContribs, contribGroupKeys])

  if (!open || !snapshot) return null

  const totalDamage = calculateTotalDamage(adjustedDamageEvents, mode)
  const duration = calculateDuration(snapshot)
  const showNav = onPrev !== undefined || onNext !== undefined

  return createPortal(
    <div className="dataOverlay" role="dialog" aria-modal="true">
      <div className="dataPanel">

        {/* Header */}
        <div className="dataHeader">
          <div className="dataHeaderLeft">
            <h2 className="dataTitle">RESONANCE FIELD ANALYSIS</h2>
          </div>
          <div className="dataHeaderRight">
            {showNav && (
              <div className="dataNavGroup">
                <button
                  className="dataNavButton"
                  onClick={onPrev}
                  disabled={!hasPrev}
                  title="Previous row (↑)"
                  aria-label="Previous row"
                >
                  ▲
                </button>
                {rowInfo && (
                  <span className="dataNavCounter">{rowInfo.current} / {rowInfo.total}</span>
                )}
                <button
                  className="dataNavButton"
                  onClick={onNext}
                  disabled={!hasNext}
                  title="Next row (↓)"
                  aria-label="Next row"
                >
                  ▼
                </button>
              </div>
            )}
            <button className="dataClose" onClick={onClose}>
              ✕
            </button>
          </div>
        </div>

        {/* 3-column body */}
        <div className="dataColumns">
          {/* Left panel — energy delta + active buff stats */}
          <div className="dataLeftPanel">
            <EnergySection snapshot={snapshot} previousSnapshot={previousSnapshot} startWithFullEnergy={startWithFullEnergy} characters={characters} />
            <ActiveStatsSection damageEvents={adjustedDamageEvents} activeContribs={activeContribs} characters={characters} snapshot={snapshot} />
          </div>

          <div className="dataColDivider" />

          {/* Center — combat metrics + pie chart + damage sources */}
          <div className="dataCenterPanel">
            <div className="dataCenterTopArea">
              <CombatMetricsSection totalDamage={totalDamage} duration={duration} snapshot={snapshot} />
            </div>
            <div className="dataCenterPieArea">
              <div className="dataPieViewBar">
                <div className="dataPieToggle">
                  <button className={`dataPieToggleButton${mode === 'average' ? ' active' : ''}`} onClick={() => setMode('average')}>
                    Average
                  </button>
                  <button className={`dataPieToggleButton${mode === 'normal' ? ' active' : ''}`} onClick={() => setMode('normal')}>
                    Normal
                  </button>
                  <button className={`dataPieToggleButton${mode === 'crit' ? ' active' : ''}`} onClick={() => setMode('crit')}>
                    Critical
                  </button>
                </div>
              </div>
              <PieChartCenter
                damageEvents={adjustedDamageEvents}
                view={pieChartView}
                mode={mode}
                highlightedIndex={highlightedIndex}
                onSliceHover={setHighlightedIndex}
                activeSources={activeSources}
                activeTypes={activeTypes}
              />
              <div className="dataPieViewBar">
                <div className="dataPieToggle">
                  <button className={`dataPieToggleButton${pieChartView === 'events' ? ' active' : ''}`} onClick={() => setPieChartView('events')}>
                    Events
                  </button>
                  <button className={`dataPieToggleButton${pieChartView === 'types' ? ' active' : ''}`} onClick={() => setPieChartView('types')}>
                    Types
                  </button>
                </div>
              </div>
            </div>
            <div className="dataCenterSourcesArea">
              <DamageSourcesSection
                damageEvents={adjustedDamageEvents}
                totalDamage={totalDamage}
                mode={mode}
                view={pieChartView}
                externalHighlightedIndex={highlightedIndex}
                onRowHighlight={setHighlightedIndex}
                activeSources={activeSources}
                onToggleSource={toggleSource}
                activeTypes={activeTypes}
                onToggleType={toggleType}
              />
            </div>
          </div>

          <div className="dataColDivider" />

          {/* Right panel — Modifier Contributions */}
          <div className="dataRightPanel">
            <ContributionsSection damageEvents={adjustedDamageEvents} mode={mode} characters={characters} snapshot={snapshot} activeSources={activeSources} activeContribs={activeContribs} onToggleContrib={toggleContrib} onToggleAllContribs={toggleAllContribs} contribGroupKeys={contribGroupKeys} />
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

function PieChartCenter({ damageEvents, view, mode, highlightedIndex, onSliceHover, activeSources, activeTypes }: { damageEvents: DamageEvent[]; view: 'events' | 'types'; mode: 'average' | 'normal' | 'crit'; highlightedIndex: number | null; onSliceHover: (index: number | null) => void; activeSources: Set<string>; activeTypes: Set<string> }) {
  if (damageEvents.length === 0) return null

  const displayData = view === 'types' ? aggregateDamageByType(damageEvents, mode) : aggregateEventsByName(damageEvents, mode)

  // Filter to active items only — preserve original indices for cross-highlight sync with source list
  const isItemActive = (item: { name: string }) => view === 'events' ? activeSources.has(item.name) : activeTypes.has(item.name)
  const activePieData = displayData.map((item, idx) => ({ ...item, originalIndex: idx })).filter(isItemActive)
  const filteredTotal = activePieData.reduce((sum, item) => sum + item.damage, 0)
  const formattedDamage = filteredTotal >= 1000 ? `${(filteredTotal / 1000).toFixed(1)}k` : filteredTotal.toFixed(0)

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
      {activePieData.length === 0 ? null : activePieData.length === 1 ? (
        <svg viewBox="0 0 200 200" className="pieChartSvg" style={{ overflow: 'visible' }}>
          <circle
            cx="100" cy="100" r="90"
            fill={PIE_CHART_COLORS[activePieData[0].originalIndex % PIE_CHART_COLORS.length]}
            stroke="rgba(30, 30, 40, 0.95)"
            strokeWidth="2"
            className={`pieSlice${highlightedIndex === activePieData[0].originalIndex ? ' highlighted' : ''}`}
            style={{ cursor: 'pointer' }}
            onMouseEnter={() => onSliceHover(activePieData[0].originalIndex)}
            onMouseLeave={() => onSliceHover(null)}
          />
        </svg>
      ) : (
        <svg viewBox="0 0 200 200" className="pieChartSvg" style={{ overflow: 'visible' }}>
          {calculatePieSlices(
            activePieData.map(d => d.damage),
            activePieData.map(d => PIE_CHART_COLORS[d.originalIndex % PIE_CHART_COLORS.length]),
          ).map((slice, sliceIdx) => (
            <path
              key={sliceIdx}
              d={slice.path}
              fill={slice.color}
              stroke="rgba(30, 30, 40, 0.95)"
              strokeWidth="2"
              className={`pieSlice${highlightedIndex === activePieData[sliceIdx].originalIndex ? ' highlighted' : ''}`}
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => onSliceHover(activePieData[sliceIdx].originalIndex)}
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
  mode,
  view,
  externalHighlightedIndex,
  onRowHighlight,
  activeSources,
  onToggleSource,
  activeTypes,
  onToggleType,
}: {
  damageEvents: DamageEvent[]
  totalDamage: number
  mode: 'average' | 'normal' | 'crit'
  view: 'events' | 'types'
  externalHighlightedIndex: number | null
  onRowHighlight: (index: number | null) => void
  activeSources?: Set<string>
  onToggleSource?: (name: string) => void
  activeTypes?: Set<string>
  onToggleType?: (type: string) => void
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

  const displayData = view === 'types' ? aggregateDamageByType(damageEvents, mode) : aggregateEventsByName(damageEvents, mode)

  const isItemActive = (name: string) => view === 'events' ? (activeSources?.has(name) ?? true) : (activeTypes?.has(name) ?? true)
  const displayedTotal = displayData.filter(item => isItemActive(item.name)).reduce((sum, item) => sum + item.damage, 0)

  return (
    <div className="dataSectionGroup dataSourcesSection" onClick={handleClickAway}>
      <div className="dataPanelHeader silver">
        <div className="dataPanelHeaderDot silver" />
        <span className="dataPanelHeaderLabel">{view === 'events' ? 'Damage Sources' : 'Damage Types'}</span>
        <div className="dataPanelHeaderLine" />
      </div>

      <div className="dataSourceRows">
        {damageEvents.length === 0 ? (
          <p className="dataEmptyMsg">No damage sources detected</p>
        ) : (
          displayData.map((item, index) => {
            const pct = displayedTotal > 0 ? (item.damage / displayedTotal) * 100 : 0
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
                className={`dataSourceRow${isPinned ? ' pinned' : ''}${isExternallyHighlighted ? ' externalHighlight' : ''}${!isItemActive(item.name) ? ' inactive' : ''}`}
                onMouseEnter={() => handleMouseEnter({ ...item, index })}
                onMouseLeave={handleMouseLeave}
                onClick={e => {
                  e.stopPropagation()
                  handleClick({ ...item, index })
                }}>
                <div className="dataSourceRowInner">
                  <DataRow label={label} value={`${item.damage.toFixed(0)} (${pct.toFixed(1)}%)`} barPct={pct} customColor={pieColor} />
                  {view === 'events' && activeSources && onToggleSource && (
                    <button
                      className={`dataSourceToggle${activeSources.has(item.name) ? ' active' : ''}`}
                      style={{ '--toggle-color': pieColor } as React.CSSProperties}
                      title={activeSources.has(item.name) ? 'Exclude from buff contributions' : 'Include in buff contributions'}
                      onClick={e => { e.stopPropagation(); onToggleSource(item.name) }}
                    />
                  )}
                  {view === 'types' && activeTypes && onToggleType && (
                    <button
                      className={`dataSourceToggle${activeTypes.has(item.name) ? ' active' : ''}`}
                      style={{ '--toggle-color': pieColor } as React.CSSProperties}
                      title={activeTypes.has(item.name) ? 'Hide this type from pie chart' : 'Show this type in pie chart'}
                      onClick={e => { e.stopPropagation(); onToggleType(item.name) }}
                    />
                  )}
                </div>
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

function ContributionsSection({ damageEvents, mode, characters, snapshot, activeSources, activeContribs, onToggleContrib, onToggleAllContribs, contribGroupKeys }: { damageEvents: DamageEvent[]; mode: 'average' | 'normal' | 'crit'; characters: ResolvedCharacter[]; snapshot: Snapshot | null; activeSources: Set<string>; activeContribs: Set<string>; onToggleContrib: (key: string) => void; onToggleAllContribs: () => void; contribGroupKeys: Set<string> }) {
  const [hideInherent, setHideInherent] = useState(false)
  const [hideZero, setHideZero] = useState(false)
  const [tooltipState, setTooltipState] = useState<{ index: number; rect: DOMRect } | null>(null)

  const modifierMap = useMemo(() => buildModifierMap(characters), [characters])

  // Only count events whose actionName is currently toggled on
  const activeEvents = damageEvents.filter(e => activeSources.has(e.actionName))
  const totalDamage = activeEvents.reduce((sum, event) => sum + getEventDamage(event, mode), 0)

  // Aggregate contributions from active events only.
  // Keep metadata from all events so entries remain stable when sources toggle.
  const metaMap: Record<string, { source: string; displayName?: string; isInherent?: boolean }> = {}
  for (const event of damageEvents) {
    for (const [key, contrib] of Object.entries(event.contributions)) {
      if (!metaMap[key]) metaMap[key] = { source: contrib.source, displayName: contrib.displayName, isInherent: contrib.isInherent }
    }
  }

  // Helper: re-evaluate total damage for active events over an arbitrary contrib subset.
  const evaluateDamage = (contribSet: Set<string>): number => {
    let dmg = 0
    for (const event of activeEvents) {
      if (!event.calcParams) {
        dmg += getEventDamage(event, mode)
      } else {
        const r = event.calcParams.reEvaluate(contribSet)
        dmg += mode === 'average' ? r.avg : mode === 'normal' ? r.normal : r.crit
      }
    }
    return dmg
  }

  // Separate inherent (always-on) from non-inherent (external, toggleable) active buffs.
  const inherentOnlySet = new Set(Array.from(activeContribs).filter(k => metaMap[k]?.isInherent))
  const nonInherentKeys = Object.keys(metaMap).filter(k => activeContribs.has(k) && !metaMap[k]?.isInherent)
  const n = nonInherentKeys.length

  // v(∅): damage with only inherent buffs — stable base for pct = φ_i / v(∅).
  const baseDamage = evaluateDamage(inherentOnlySet)

  // Compute Shapley values for non-inherent buffs.
  // φ_i = Σ_{S ⊆ N\{i}} weight(|S|,n) * [v(S∪{i}) - v(S)]
  // Shapley efficiency: Σφ_i = v(N) - v(∅)  exactly.
  const shapleyValues: Record<string, number> = {}

  const MAX_EXACT = 15
  if (n > 0 && n <= MAX_EXACT) {
    // Exact: enumerate all 2^n subsets of non-inherent keys once, cache damage values.
    const subsetDmg = new Float64Array(1 << n)
    for (let mask = 0; mask < (1 << n); mask++) {
      const contribSet = new Set<string>(inherentOnlySet)
      for (let j = 0; j < n; j++) {
        if (mask & (1 << j)) contribSet.add(nonInherentKeys[j])
      }
      subsetDmg[mask] = evaluateDamage(contribSet)
    }
    // Precompute factorials (floating point is fine for n ≤ 15).
    const fact = new Float64Array(n + 1)
    fact[0] = 1
    for (let k = 1; k <= n; k++) fact[k] = fact[k - 1] * k

    const popcount = (x: number): number => { let c = 0; let v = x; while (v) { c += v & 1; v >>>= 1 } return c }

    for (let i = 0; i < n; i++) {
      let shapley = 0
      const nWithoutI = ((1 << n) - 1) ^ (1 << i)
      let s = nWithoutI
      while (true) {
        const sSize = popcount(s)
        const weight = (fact[sSize] * fact[n - sSize - 1]) / fact[n]
        shapley += weight * (subsetDmg[s | (1 << i)] - subsetDmg[s])
        if (s === 0) break
        s = (s - 1) & nWithoutI
      }
      shapleyValues[nonInherentKeys[i]] = shapley
    }
  } else if (n > MAX_EXACT) {
    // Monte Carlo approximation: average marginal over random permutations.
    const SAMPLES = 300
    for (const key of nonInherentKeys) shapleyValues[key] = 0
    const perm = [...nonInherentKeys]
    for (let s = 0; s < SAMPLES; s++) {
      for (let i = perm.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [perm[i], perm[j]] = [perm[j], perm[i]]
      }
      const contribSet = new Set<string>(inherentOnlySet)
      let prevDmg = baseDamage
      for (const key of perm) {
        contribSet.add(key)
        const newDmg = evaluateDamage(contribSet)
        shapleyValues[key] += newDmg - prevDmg
        prevDmg = newDmg
      }
    }
    for (const key of nonInherentKeys) shapleyValues[key] /= SAMPLES
  }

  // Build marginalMap: Shapley rawDamage for non-inherent, last-in marginal for inherent.
  const marginalMap: Record<string, { rawDamage: number; pct: number }> = {}
  for (const key of Object.keys(metaMap)) {
    if (!activeContribs.has(key)) {
      marginalMap[key] = { rawDamage: 0, pct: 0 }
    } else if (metaMap[key]?.isInherent) {
      // Inherent buffs: marginal vs. the full active set (removing one inherent asks "cost of losing this passive").
      const contribsWithoutKey = new Set(activeContribs)
      contribsWithoutKey.delete(key)
      const dmgWithout = evaluateDamage(contribsWithoutKey)
      const rawDamage = totalDamage - dmgWithout
      const pct = dmgWithout > 0 ? (rawDamage / dmgWithout) * 100 : 0
      marginalMap[key] = { rawDamage, pct }
    } else {
      const rawDamage = shapleyValues[key] ?? 0
      const pct = baseDamage > 0 ? (rawDamage / baseDamage) * 100 : 0
      marginalMap[key] = { rawDamage, pct }
    }
  }

  let contributionsList = Object.keys(metaMap).map(key => ({
    key,
    ...metaMap[key],
    rawDamage: marginalMap[key]?.rawDamage ?? 0,
    pct:       marginalMap[key]?.pct       ?? 0,
  }))

  if (hideInherent) contributionsList = contributionsList.filter(c => !c.isInherent)
  if (hideZero) contributionsList = contributionsList.filter(c => c.rawDamage > 0)

  contributionsList.sort((a, b) => b.rawDamage - a.rawDamage)

  const maxValue = contributionsList.reduce((max, c) => Math.max(max, c.rawDamage), 0)

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
        <button
          className={`dataContribFilterBtn dataContribToggleAllBtn${activeContribs.size >= contribGroupKeys.size ? ' active' : ''}`}
          onClick={onToggleAllContribs}
          title={activeContribs.size >= contribGroupKeys.size ? 'Disable all buffs' : 'Enable all buffs'}>
          {activeContribs.size >= contribGroupKeys.size ? 'All On' : 'All Off'}
        </button>
      </div>

      {contributionsList.length === 0 ? (
        <p className="dataEmptyMsg">No modifier contributions detected</p>
      ) : (
        <div className="dataContribList">
          {contributionsList.map((contrib, index) => {
            const damageValue = contrib.rawDamage
            const percentValue = contrib.pct
            const barPct = maxValue > 0 ? (damageValue / maxValue) * 100 : 0
            const isInherent = !!contrib.isInherent
            const isZero = damageValue === 0 && !isInherent
            const colorClass = isInherent ? ' amber' : isZero ? ' cyan' : ''
            const contribKey = contrib.key
            const isActive = activeContribs.has(contribKey)

            return (
              <div
                key={index}
                className={`dataContribRow${!isActive ? ' inactive' : ''}`}
                onMouseEnter={e => setTooltipState({ index, rect: (e.currentTarget as HTMLDivElement).getBoundingClientRect() })}
                onMouseLeave={() => setTooltipState(null)}
                onClick={() => onToggleContrib(contribKey)}>
                <button
                  className={`dataContribToggle${isActive ? ' active' : ''}${colorClass}`}
                  title={isActive ? 'Remove this buff from damage calculation' : 'Include this buff in damage calculation'}
                />
                <div className="dataContribContent">
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
              </div>
            )
          })}
        </div>
      )}
      {tooltipState !== null && (
        <StatusDetailPanel
          variant="tooltip"
          status={buildContribStatusInfo(contributionsList[tooltipState.index], modifierMap, snapshot)}
          style={{
            position: 'fixed',
            right: `${window.innerWidth - tooltipState.rect.left + 12}px`,
            top: `${tooltipState.rect.top + tooltipState.rect.height / 2}px`,
            transform: 'translateY(-50%)',
            left: 'auto',
            bottom: 'auto',
            zIndex: 300,
          }}
        />
      )}
    </div>
  )
}

// ========== Contrib Status Info Builder ======================================================================================

function buildContribStatusInfo(
  contrib: { source: string; displayName?: string },
  modifierMap: Map<string, ModifierInfo>,
  snapshot: Snapshot | null,
): StatusDetailInfo {
  const lookupKey = contrib.displayName ?? contrib.source
  const info = modifierMap.get(lookupKey)
  const name = contrib.displayName ?? contrib.source
  const icon = `/assets/modifiers/${name.toLowerCase().replace(/:/g, '').replace(/\s+/g, '_')}.png`
  const activationStats = snapshot?.buffsActivationStats?.[name.replace(/\s+/g, '')]
  const charStatsSource =
    activationStats && Object.values(activationStats).some(v => v !== 0)
      ? activationStats
      : info?.characterStats
  const accent =
    info?.type === 'buff' ? 'rgba(255, 190, 60, 0.95)' :
    info?.type === 'debuff' ? 'rgba(255, 130, 100, 0.95)' :
    undefined
  return {
    key: contrib.source,
    label: name,
    icon,
    showStatus: false,
    type: info?.type,
    color: accent,
    description: info?.description,
    showStats: true,
    stats: charStatsSource,
    enemyStats: info?.enemyStats,
  }
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

// ========== Sub-component: Energy Delta Section ===============================================================================

const ENERGY_LABEL: Record<string, string> = {
  energy:            'RESONANCE',
  concerto:          'CONCERTO',
  forte:             'FORTE',
  forte_divinity:    'FORTE (DIV.)',
  forte_discord:     'FORTE (DISC.)',
  forte_virtue:      'FORTE (VIRT.)',
  relative_momentum: 'REL. MOMENTUM',
  conviction:        'CONVICTION',
  mind:              'MIND',
  chill:             'CHILL',
}

const CHAR_ELEMENT_COLORS: Record<string, string> = {
  AERO:    'hsl(160 80% 55%)',
  SPECTRO: 'hsl(45 90% 62%)',
  HAVOC:   'hsl(270 80% 65%)',
  ELECTRO: 'hsl(292 82% 70%)',
  GLACIO:  'hsl(200 80% 67%)',
  FUSION:  'hsl(15 90% 62%)',
  '':      'hsl(220 15% 60%)',
}

function formatEnergyDelta(delta: number): string {
  const rounded = Math.round(delta * 10) / 10
  const sign = rounded >= 0 ? '+' : ''
  return `${sign}${rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1)}`
}

function EnergySection({ snapshot, previousSnapshot, startWithFullEnergy, characters }: {
  snapshot: Snapshot
  previousSnapshot: Snapshot | null
  startWithFullEnergy: boolean
  characters: ResolvedCharacter[]
}) {
  const actingCharacter = snapshot.character

  type CharDelta = { charName: string; element: string; isActing: boolean; deltas: { energyType: string; delta: number }[] }

  const charDeltas: CharDelta[] = characters
    .map(char => {
      const prevEnergies: Record<string, number> = previousSnapshot
        ? (previousSnapshot.charactersEnergies?.[char.name] ?? {}) as Record<string, number>
        : Object.fromEntries(Object.keys(char.maxEnergies).map(et => [
            et,
            et === 'energy' && startWithFullEnergy ? (char.maxEnergies.energy ?? 0) : 0,
          ]))
      const currEnergies = (snapshot.charactersEnergies?.[char.name] ?? {}) as Record<string, number>
      const energyTypes = Object.keys(char.maxEnergies)

      const deltas = energyTypes
        .map(et => ({ energyType: et, delta: (currEnergies[et] ?? 0) - (prevEnergies[et] ?? 0) }))
        .filter(d => Math.abs(d.delta) >= 0.05)

      return { charName: char.name, element: char.element as string, isActing: char.name === actingCharacter, deltas }
    })
    .filter(c => c.deltas.length > 0)
    .sort((a, b) => {
      if (a.isActing && !b.isActing) return -1
      if (!a.isActing && b.isActing) return 1
      return a.charName.localeCompare(b.charName)
    })

  return (
    <div className="dataSectionGroup">
      <div className="dataPanelHeader amber">
        <div className="dataPanelHeaderDot amber" />
        <span className="dataPanelHeaderLabel">Energy Delta</span>
        <div className="dataPanelHeaderLine" />
      </div>
      {charDeltas.length === 0 ? (
        <p className="dataEmptyMsg">No energy changes</p>
      ) : (
        charDeltas.map(({ charName, element, isActing, deltas }) => {
          const color = CHAR_ELEMENT_COLORS[element] ?? CHAR_ELEMENT_COLORS['']
          const triggerEvents = snapshot.offFieldTriggerEvents?.[charName] ?? []
          return (
            <div key={charName} className="dataEnergyCharBlock">
              <div className="dataEnergyCharHeader">
                <span className="dataEnergyCharName" style={{ color, textShadow: `0 0 8px ${color}` }}>
                  {charName}
                </span>
                {isActing && <span className="dataEnergyActingBadge">acting</span>}
              </div>
              {deltas.map(({ energyType, delta }) => (
                <div key={energyType} className="dataEnergyRow">
                  <span className="dataEnergyLabel">{ENERGY_LABEL[energyType] ?? energyType.toUpperCase()}</span>
                  <span className={`dataEnergyDelta ${delta >= 0 ? 'gain' : 'cost'}`}>
                    {formatEnergyDelta(delta)}
                  </span>
                </div>
              ))}
              {triggerEvents.map((desc, i) => (
                <div key={`trigger-${i}`} className="dataEnergyTriggerNote">
                  ⚡ {desc}
                </div>
              ))}
            </div>
          )
        })
      )}
    </div>
  )
}

// ========== Final Stats Section ==============================================================================================

// Groups of stats to display as absolute final values.
// 'ATK', 'HP', 'DEF' are special — they use calculateScalingStat (computed from sub-components).
const FINAL_STAT_GROUPS: Array<{ label: string; keys: string[] }> = [
  {
    label: 'Core',
    keys: ['ATK', 'HP', 'DEF', 'critRate', 'critDamage', 'bonusDMG', 'amplifyDMG', 'totalMultiplierDMG', 'defIgnore', 'resistancePEN', 'elementalResPEN', 'healingBonus', 'energyPercent', 'tuneBreakBoost', 'offtuneBuildupRate'],
  },
  {
    label: 'Elemental',
    keys: ['aeroBonusDMG', 'aeroAmplifyDMG', 'spectroBonusDMG', 'spectroAmplifyDMG', 'fusionBonusDMG', 'fusionAmplifyDMG', 'glacioBonusDMG', 'glacioAmplifyDMG', 'electroBonusDMG', 'electroAmplifyDMG', 'havocBonusDMG', 'havocAmplifyDMG'],
  },
  {
    label: 'Skill Types',
    keys: ['basicBonusDMG', 'basicAmplifyDMG', 'heavyBonusDMG', 'heavyAmplifyDMG', 'skillBonusDMG', 'skillAmplifyDMG', 'liberationBonusDMG', 'liberationAmplifyDMG', 'coordinatedBonusDMG', 'coordinatedAmplifyDMG', 'echoBonusDMG', 'echoAmplifyDMG', 'introBonusDMG', 'introAmplifyDMG', 'outroBonusDMG', 'outroAmplifyDMG'],
  },
  {
    label: 'Negative Status',
    keys: ['aeroErosionBonusDMG', 'aeroErosionAmplifyDMG', 'spectroFrazzleBonusDMG', 'spectroFrazzleAmplifyDMG', 'havocBaneBonusDMG', 'havocBaneAmplifyDMG', 'glacioChafeBonusDMG', 'glacioChafeAmplifyDMG', 'fusionBurstBonusDMG', 'fusionBurstAmplifyDMG', 'electroFlareBonusDMG', 'electroFlareAmplifyDMG'],
  },
]

const ENEMY_DEBUFF_KEYS = ['resistance', 'damageReduction', 'aeroRES', 'spectroRES', 'havocRES', 'glacioRES', 'fusionRES', 'electroRES']

const SCALING_STAT_KEYS = new Set(['ATK', 'HP', 'DEF'])

function formatFinalStatLabel(key: string): string {
  if (key === 'ATK') return 'ATK'
  if (key === 'HP')  return 'HP'
  if (key === 'DEF') return 'DEF'
  return key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/^./, s => s.toUpperCase())
    .trim()
}

function formatFinalStatValue(key: string, value: number): string {
  if (SCALING_STAT_KEYS.has(key)) return Math.round(value).toLocaleString()
  if (key.toLowerCase().includes('totalmultiplier')) return `×${value.toFixed(3)}`
  if (/rate|bonus|amplify|pen|percent|boost|ignore|critdamage|damagereduction|res$/i.test(key) || key === 'healingBonus') {
    return `${(value * 100).toFixed(1)}%`
  }
  return Math.round(value).toLocaleString()
}

function isFinalStatZero(key: string, value: number): boolean {
  if (SCALING_STAT_KEYS.has(key)) return false
  if (key.toLowerCase().includes('totalmultiplier')) return value === 1
  return value === 0
}

function getFinalStatValue(key: string, finalStats: CharacterStats): number {
  if (SCALING_STAT_KEYS.has(key)) return calculateScalingStat(finalStats, key as 'ATK' | 'HP' | 'DEF')
  return (finalStats[key as keyof CharacterStats] as number) ?? 0
}

function ActiveStatsSection({ damageEvents, activeContribs, characters, snapshot }: {
  damageEvents: DamageEvent[]
  activeContribs: Set<string>
  characters: ResolvedCharacter[]
  snapshot: Snapshot | null
}) {
  const [hideZero, setHideZero] = useState(true)

  const modifierMap = useMemo(() => buildModifierMap(characters), [characters])

  const actingChar = useMemo(
    () => characters.find(c => c.name === snapshot?.character) ?? null,
    [characters, snapshot],
  )

  const metaMap = useMemo(() => {
    const map: Record<string, { source: string; displayName?: string; isInherent?: boolean }> = {}
    for (const event of damageEvents) {
      for (const [key, contrib] of Object.entries(event.contributions)) {
        if (!map[key]) map[key] = { source: contrib.source, displayName: contrib.displayName, isInherent: contrib.isInherent }
      }
    }
    return map
  }, [damageEvents])

  // Aggregate active buff character stats into a partial modifier object, then merge with base stats.
  const { finalStats, enemyDebuffStats } = useMemo(() => {
    const activeCharMods: Partial<CharacterStats> = {}
    const enemyDebuffStats: Record<string, number> = {}

    for (const key of activeContribs) {
      const meta = metaMap[key]
      if (!meta || meta.isInherent) continue
      const displayName = meta.displayName ?? meta.source
      const strippedName = displayName.replace(/\s+/g, '')

      // Prefer activation-time stats (captures snapshot-time multiplied values like Halo 5-piece)
      const statsSource = snapshot?.buffsActivationStats?.[strippedName] ?? modifierMap.get(displayName)?.characterStats
      if (statsSource) {
        for (const [k, v] of Object.entries(statsSource)) {
          if (v === undefined) continue
          activeCharMods[k as keyof CharacterStats] = aggregateStat(
            activeCharMods[k as keyof CharacterStats] as number | undefined,
            v as number, k,
          ) as any
        }
      }

      const enemyStatsSource = modifierMap.get(displayName)?.enemyStats
      if (enemyStatsSource) {
        for (const [k, v] of Object.entries(enemyStatsSource)) {
          if (v === undefined) continue
          enemyDebuffStats[k] = aggregateStat(enemyDebuffStats[k], v as number, k)
        }
      }
    }

    const finalStats = actingChar ? mergeStats(actingChar.stats, activeCharMods) : null
    return { finalStats, enemyDebuffStats }
  }, [activeContribs, metaMap, modifierMap, snapshot, actingChar])

  const visibleCharGroups = FINAL_STAT_GROUPS.map(group => ({
    ...group,
    keys: group.keys.filter(key => {
      if (!hideZero) return true
      if (!finalStats) return false
      return !isFinalStatZero(key, getFinalStatValue(key, finalStats))
    }),
  })).filter(g => g.keys.length > 0)

  const visibleEnemyKeys = ENEMY_DEBUFF_KEYS.filter(key => !hideZero || (enemyDebuffStats[key] ?? 0) !== 0)

  return (
    <div className="dataSectionGroup">
      <div className="dataPanelHeader silver">
        <div className="dataPanelHeaderDot silver" />
        <span className="dataPanelHeaderLabel">
          {actingChar ? `${actingChar.name} Stats` : 'Final Stats'}
        </span>
        <div className="dataPanelHeaderLine" />
      </div>

      <div className="dataContribFilterBar">
        <span className="dataContribFilterLabel">Show:</span>
        <button
          className={`dataContribFilterBtn${!hideZero ? ' active cyan' : ''}`}
          onClick={() => setHideZero(p => !p)}
          title={hideZero ? 'Show zero-value stats' : 'Hide zero-value stats'}>
          Zeros
        </button>
      </div>

      {!finalStats ? (
        <p className="dataEmptyMsg">No character stats available</p>
      ) : (
        <>
          {visibleCharGroups.map(group => (
            <div key={group.label} className="dataActiveStatGroup">
              <div className="dataActiveStatGroupLabel">{group.label}</div>
              {group.keys.map(key => {
                const val = getFinalStatValue(key, finalStats)
                return (
                  <div key={key} className="dataActiveStatRow">
                    <span className="dataActiveStatLabel">{formatFinalStatLabel(key)}</span>
                    <span className="dataActiveStatValue">{formatFinalStatValue(key, val)}</span>
                  </div>
                )
              })}
            </div>
          ))}

          {visibleEnemyKeys.length > 0 && (
            <div className="dataActiveStatGroup">
              <div className="dataActiveStatGroupLabel">Enemy Debuffs</div>
              {visibleEnemyKeys.map(key => {
                const val = enemyDebuffStats[key] ?? 0
                return (
                  <div key={key} className="dataActiveStatRow">
                    <span className="dataActiveStatLabel">{formatFinalStatLabel(key)}</span>
                    <span className="dataActiveStatValue coral">{(val * 100).toFixed(1)}%</span>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ========== Helper Functions ===================================================================================================

// Returns the appropriate damage value for a DamageEvent based on the selected mode.
// Negative status damage cannot crit — always uses normalStrike in crit mode.
function getEventDamage(event: DamageEvent, mode: 'average' | 'normal' | 'crit'): number {
  if (mode === 'average') return event.average
  if (mode === 'normal') return event.normalStrike
  if (event.dmgTypes.includes('NEGATIVE_STATUS')) return event.normalStrike
  return event.criticalStrike
}

function calculateTotalDamage(damageEvents: DamageEvent[], mode: 'average' | 'normal' | 'crit'): number {
  return damageEvents.reduce((sum, e) => sum + getEventDamage(e, mode), 0)
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

function aggregateEventsByName(damageEvents: DamageEvent[], mode: 'average' | 'normal' | 'crit'): Array<{ name: string; damage: number; count: number; events: DamageEvent[] }> {
  const map = new Map<string, { damage: number; count: number; events: DamageEvent[] }>()

  for (const e of damageEvents) {
    const dmg = getEventDamage(e, mode)
    const existing = map.get(e.actionName)
    if (existing) {
      existing.damage += dmg
      existing.count++
      existing.events.push(e)
    } else {
      map.set(e.actionName, { damage: dmg, count: 1, events: [e] })
    }
  }

  return Array.from(map.entries()).map(([name, data]) => ({ name, ...data }))
}

function aggregateDamageByType(damageEvents: DamageEvent[], mode: 'average' | 'normal' | 'crit'): Array<{ name: string; damage: number; event?: DamageEvent }> {
  const typeMap = new Map<string, number>()

  damageEvents.forEach(event => {
    const dmg = getEventDamage(event, mode)
    event.dmgTypes.forEach(type => {
      const current = typeMap.get(type) || 0
      typeMap.set(type, current + dmg)
    })
  })

  return Array.from(typeMap.entries())
    .map(([type, damage]) => ({ name: type, damage }))
    .sort((a, b) => b.damage - a.damage)
}
