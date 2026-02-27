import { useState, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Snapshot } from '../../types/snapshot'
import type { DamageEvent } from '../../types/events'
import '../../styles/rotation-editor/DamageTimeline.css'

/**
 * DamageTimeline Component
 *
 * A dual-view visualization for combat damage analysis with flexible data representation.
 *
 * DESIGN CONCEPT:
 * ================
 * 1. **Timeline View** (Action-based Layout)
 *    - Horizontal tracks showing action sequences over time
 *    - Action blocks as rounded rectangles showing when abilities/events are active
 *    - Data points (squares) representing individual damage instances
 *    - Owner-based color coding (character colors or neutral for global effects)
 *
 * 2. **Chart View** (Traditional Line/Area Chart)
 *    - Line graph showing DPS or cumulative damage over time
 *    - Data points as owner-colored squares on the line
 *    - Action blocks in background as context
 *    - Supports multiple attribution sources at same timestamp
 *
 * DATA MODEL CONCEPTS:
 * ====================
 * **OWNER** (who/what caused the damage):
 *   - Character name (e.g., "Yangyang", "Cartethyia")
 *   - Global/System (e.g., negative status procs, environmental effects)
 *   - Used for: Color coding, grouping in swimlanes
 *
 * **ATTRIBUTION** (what action/event generated it):
 *   - Skill/Ability (e.g., "Heavy Attack", "Resonance Liberation")
 *   - Negative Status (e.g., "Outro: Zither's Bolt", "Frostbite Proc")
 *   - DoT tick (e.g., "Coordinated Attack Tick 3")
 *   - Used for: Labels, grouping into action blocks, tooltips
 *
 * **EXAMPLE SCENARIOS**:
 *   - Character skill with multi-hit:
 *     Owner = "Jiyan", Attribution = "Windqueller" (5 separate points)
 *   - Negative status damage:
 *     Owner = "Global/System" or Character who applied it, Attribution = "Outro: Zither's Bolt"
 *   - DoT from coordinated attack:
 *     Owner = "Mortefi", Attribution = "Coordinated Attack (Tick 3)"
 *
 * DATA FLEXIBILITY:
 * =================
 * - Each snapshot/event can generate multiple (x,y) points:
 *   • Subactions (skill phases)
 *   • Multi-hit abilities (each hit = separate point)
 *   • DoT ticks (periodic damage events)
 * - Points are squares for visual distinction
 * - Golden border indicates multiple simultaneous events (different attributions at same time)
 * - Neutral color (grey/white) for global/system damage sources
 *
 * VISUAL ORGANIZATION:
 * ====================
 * Timeline View Options:
 *   A. Owner-based swimlanes (group by who caused damage)
 *   B. Attribution-based tracks (group by action/event type)
 *   C. Hybrid (owner swimlanes with attribution blocks inside)
 *
 * VISUAL FEATURES:
 * ================
 * - Glass-panel aesthetic matching timeline-demo
 * - Interactive hover states with detail tooltips showing both owner & attribution
 * - Owner-based color-coding with neutral colors for global effects
 * - Smooth transitions between views
 * - Clear visual separation between owner and attribution in tooltips/labels
 */

type ChartMode = 'dps' | 'cumulative'
type ViewMode = 'timeline' | 'chart'

const CHART_HEIGHT = 400
const CHART_PADDING_TOP = 60
const CHART_PADDING_BOTTOM = 80
const CHART_PADDING_LEFT = 80
const CHART_PADDING_RIGHT = 40
const USABLE_HEIGHT = CHART_HEIGHT - CHART_PADDING_TOP - CHART_PADDING_BOTTOM

// Swimlane configuration for character-based visualization
const SWIMLANE_HEIGHT = 60
const SWIMLANE_PADDING = 8

// Character color mapping for OWNERS
const CHARACTER_COLORS: Record<string, string> = {
  Yangyang: '#4ade80',
  Cartethyia: '#f87171',
  Verina: '#60a5fa',
  Jiyan: '#a78bfa',
  Calcharo: '#fbbf24',
}

// Neutral color for global/system damage sources
const GLOBAL_COLOR = '#94a3b8'

function getOwnerColor(owner: string): string {
  return CHARACTER_COLORS[owner] || GLOBAL_COLOR
}

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return Math.round(n).toString()
}

interface DamageTimelineProps {
  snapshots: Snapshot[]
  damageEvents?: DamageEvent[]
}

export function DamageTimeline({ snapshots, damageEvents = [] }: DamageTimelineProps) {
  const [mode, setMode] = useState<ChartMode>('cumulative')
  const [viewMode, setViewMode] = useState<ViewMode>('timeline')
  const [tooltipInfo] = useState<{ x: number; y: number; data: any } | null>(null) // TODO: Will be used with hover handlers
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  // TODO: Data processing will be implemented here
  // Each snapshot/event can generate multiple (x,y) points for subactions or multi-hit abilities
  const { maxValue, maxTime, owners, actionBlocks } = useMemo(() => {
    if (!snapshots || snapshots.length === 0) {
      return { maxValue: 1, maxTime: 1, owners: [], actionBlocks: [] }
    }

    // Collect all unique owner names and determine which are characters vs global sources
    const allOwnerNames = new Set<string>()
    snapshots.forEach(s => {
      if (s.character) allOwnerNames.add(s.character)
    })
    damageEvents.forEach(e => {
      if (e.dealer) allOwnerNames.add(e.dealer)
    })

    // Characters are those that have a color defined OR appear in snapshots with character field
    // Everything else goes to "Global"
    const characterOwners = new Set<string>()
    let hasGlobalSources = false

    allOwnerNames.forEach(name => {
      if (CHARACTER_COLORS[name]) {
        characterOwners.add(name)
      } else {
        // Check if this name appears as a character in snapshots (not just in events)
        const isCharacter = snapshots.some(s => s.character === name)
        if (isCharacter) {
          characterOwners.add(name)
        } else {
          hasGlobalSources = true
        }
      }
    })

    // Also check if there are any damage events with non-character dealers
    if (!hasGlobalSources) {
      hasGlobalSources = damageEvents.some(e => !characterOwners.has(e.dealer) && !snapshots.some(s => s.character === e.dealer))
    }

    // Build owner list: individual characters + one "Global" entry if needed
    const ownersList = Array.from(characterOwners).map(name => ({
      name,
      color: getOwnerColor(name),
      isGlobal: false,
    }))

    if (hasGlobalSources) {
      ownersList.push({
        name: 'Global',
        color: GLOBAL_COLOR,
        isGlobal: true,
      })
    }

    // Build action blocks grouped by ATTRIBUTION (what action/event)
    // Map non-character owners to "Global" for swimlane placement
    const blocks: Array<{
      owner: string // Who caused this (for swimlane placement)
      attribution: string // What action/event generated it (skill name, status name, etc)
      startTime: number
      endTime: number
      snapshots: Snapshot[]
    }> = []

    // Process snapshots into action blocks
    let currentBlock: (typeof blocks)[0] | null = null
    snapshots.forEach(snap => {
      const rawOwner = snap.character || 'Global'
      // Map to "Global" if not a recognized character
      const owner = characterOwners.has(rawOwner) ? rawOwner : 'Global'
      const attribution = snap.action || 'Unknown Action'

      // Group consecutive snapshots with same owner AND attribution
      if (!currentBlock || currentBlock.attribution !== attribution || currentBlock.owner !== owner) {
        if (currentBlock) blocks.push(currentBlock)
        currentBlock = {
          owner,
          attribution,
          startTime: snap.fromTime,
          endTime: snap.toTime,
          snapshots: [snap],
        }
      } else {
        currentBlock.endTime = snap.toTime
        currentBlock.snapshots.push(snap)
      }
    })
    if (currentBlock) blocks.push(currentBlock)

    // Process damage events from non-character sources (negative statuses, etc.) into Global blocks
    const globalDamageEvents = damageEvents.filter(e => !characterOwners.has(e.dealer))
    if (globalDamageEvents.length > 0) {
      // Group events by attribution (actionName) and create blocks
      const eventsByAttribution = new Map<string, DamageEvent[]>()
      globalDamageEvents.forEach(e => {
        const key = e.actionName || e.dealer
        if (!eventsByAttribution.has(key)) {
          eventsByAttribution.set(key, [])
        }
        eventsByAttribution.get(key)!.push(e)
      })

      // Create blocks for each attribution group
      eventsByAttribution.forEach((events, attribution) => {
        const times = events.map(e => e.timeStamp).sort((a, b) => a - b)
        const startTime = times[0]
        const endTime = times[times.length - 1]

        blocks.push({
          owner: 'Global',
          attribution,
          startTime,
          endTime,
          snapshots: [], // No snapshots for pure damage events
        })
      })
    }

    // Placeholder values - will be calculated from actual data points
    const maxT = Math.max(...snapshots.map(s => s.toTime), 1)
    const maxVal = mode === 'cumulative' ? 100000 : 10000

    return { maxValue: maxVal, maxTime: maxT, owners: ownersList, actionBlocks: blocks }
  }, [snapshots, damageEvents, mode])

  // Chart dimensions
  const chartWidth = 1000
  const usableWidth = chartWidth - CHART_PADDING_LEFT - CHART_PADDING_RIGHT

  const timeToX = (t: number) => {
    return CHART_PADDING_LEFT + (t / maxTime) * usableWidth
  }

  const valueToY = (v: number) => {
    return CHART_HEIGHT - CHART_PADDING_BOTTOM - (v / maxValue) * USABLE_HEIGHT
  }

  // TODO: Line path calculation will be implemented here

  // Y-axis ticks
  const yTicks = useMemo(() => {
    const count = 5
    return Array.from({ length: count + 1 }, (_, i) => {
      const value = (maxValue / count) * i
      return { value, y: valueToY(value) }
    })
  }, [maxValue])

  // X-axis ticks
  const xTicks = useMemo(() => {
    const step = Math.max(1, Math.ceil(maxTime / 10))
    const ticks: { time: number; x: number }[] = []
    for (let t = 0; t <= maxTime; t += step) {
      ticks.push({ time: t, x: timeToX(t) })
    }
    return ticks
  }, [maxTime])

  // TODO: Hover handlers for interactive data points
  // const handlePointHover = useCallback((data: any, e: React.MouseEvent) => {
  //   const rect = containerRef.current?.getBoundingClientRect()
  //   if (!rect) return
  //   setTooltipInfo({ x: e.clientX - rect.left, y: e.clientY - rect.top, data })
  // }, [])
  //
  // const handlePointLeave = useCallback(() => {
  //   setTooltipInfo(null)
  // }, [])

  if (snapshots.length === 0) {
    return (
      <div className="damage-timeline-container" ref={containerRef}>
        <div className="timeline-header">
          <div className="timeline-title">Damage Timeline</div>
          <div className="timeline-empty-message">No rotation data available</div>
        </div>
      </div>
    )
  }

  return (
    <div className="damage-timeline-container" ref={containerRef}>
      {/* Header with dual-view toggle */}
      <div className="timeline-header">
        <div className="timeline-header-left">
          <div className="timeline-title">Combat Timeline</div>
          <div className="timeline-subtitle">
            {snapshots.length} snapshots · {maxTime.toFixed(1)}s
          </div>
        </div>

        <div className="timeline-controls">
          {/* View mode toggle */}
          <div className="timeline-toggle-group">
            {(['timeline', 'chart'] as ViewMode[]).map(v => (
              <button key={v} onClick={() => setViewMode(v)} className={`timeline-toggle-button ${viewMode === v ? 'active' : ''}`}>
                {viewMode === v && <motion.div layoutId="view-toggle" className="timeline-toggle-active" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />}
                <span className="timeline-toggle-text">{v === 'timeline' ? 'Timeline' : 'Chart'}</span>
              </button>
            ))}
          </div>

          {/* Chart mode toggle (only in chart view) */}
          {viewMode === 'chart' && (
            <div className="timeline-toggle-group">
              {(['dps', 'cumulative'] as ChartMode[]).map(m => (
                <button key={m} onClick={() => setMode(m)} className={`timeline-toggle-button ${mode === m ? 'active' : ''}`}>
                  {mode === m && <motion.div layoutId="chart-toggle" className="timeline-toggle-active" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />}
                  <span className="timeline-toggle-text">{m === 'dps' ? 'DPS' : 'Total'}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="timeline-stat-label">{viewMode === 'chart' ? (mode === 'dps' ? `Peak DPS` : `Total Damage`) : `${owners.length} Owners`}</div>
      </div>

      {/* Main Visualization Area */}
      <div className="timeline-chart-container">
        <AnimatePresence mode="wait">
          {viewMode === 'timeline' ? (
            <motion.div key="timeline-view" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="timeline-swimlanes">
              <svg ref={svgRef} viewBox={`0 0 ${chartWidth} ${Math.max(CHART_HEIGHT, owners.length * SWIMLANE_HEIGHT + 100)}`} className="timeline-chart-svg" preserveAspectRatio="none">
                {/* Owner-based swimlanes */}
                {owners.map((owner, i) => {
                  const y = CHART_PADDING_TOP + i * SWIMLANE_HEIGHT
                  return (
                    <g key={owner.name}>
                      {/* Swimlane background */}
                      <rect x={CHART_PADDING_LEFT} y={y} width={chartWidth - CHART_PADDING_LEFT - CHART_PADDING_RIGHT} height={SWIMLANE_HEIGHT - SWIMLANE_PADDING} fill={`${owner.color}08`} rx="4" opacity="0.3" />

                      {/* Owner label */}
                      <text x={CHART_PADDING_LEFT - 12} y={y + SWIMLANE_HEIGHT / 2 + 3} textAnchor="end" className="timeline-swimlane-label" fill={owner.color}>
                        {owner.name}
                      </text>

                      {/* Time grid lines */}
                      {xTicks.map((tick, ti) => (
                        <line key={`grid-${i}-${ti}`} x1={tick.x} y1={y} x2={tick.x} y2={y + SWIMLANE_HEIGHT - SWIMLANE_PADDING} stroke="rgba(255, 255, 255, 0.03)" strokeDasharray="2 4" />
                      ))}
                    </g>
                  )
                })}

                {/* X-axis */}
                {xTicks.map((tick, i) => (
                  <g key={`x-${i}`}>
                    <line x1={tick.x} y1={CHART_PADDING_TOP} x2={tick.x} y2={CHART_PADDING_TOP + owners.length * SWIMLANE_HEIGHT} stroke="rgba(255, 255, 255, 0.06)" />
                    <text x={tick.x} y={CHART_PADDING_TOP + owners.length * SWIMLANE_HEIGHT + 20} textAnchor="middle" className="timeline-axis-label">
                      {tick.time.toFixed(1)}s
                    </text>
                  </g>
                ))}

                {/* TODO: Action blocks will be rendered here */}
                {/* Each action block shows attribution (what action/event) in the owner's swimlane */}
                {actionBlocks.map((block, i) => {
                  const ownerIndex = owners.findIndex(o => o.name === block.owner)
                  if (ownerIndex === -1) return null

                  const y = CHART_PADDING_TOP + ownerIndex * SWIMLANE_HEIGHT + SWIMLANE_PADDING
                  const x1 = timeToX(block.startTime)
                  const x2 = timeToX(block.endTime)
                  const w = Math.max(x2 - x1, 2)
                  const owner = owners[ownerIndex]

                  return (
                    <g key={`block-${i}`}>
                      <rect x={x1} y={y} width={w} height={SWIMLANE_HEIGHT - SWIMLANE_PADDING * 2} rx="6" fill={`${owner.color}20`} stroke={`${owner.color}40`} strokeWidth="1" className="timeline-action-block" />

                      {/* Attribution label (if wide enough) */}
                      {w > 40 && (
                        <text x={x1 + w / 2} y={y + (SWIMLANE_HEIGHT - SWIMLANE_PADDING * 2) / 2 + 3} textAnchor="middle" className="timeline-action-label" fill={`${owner.color}80`}>
                          {block.attribution.length > 12 && w < 80 ? block.attribution.slice(0, 10) + '…' : block.attribution}
                        </text>
                      )}

                      {/* TODO: Individual data points (squares) will be rendered here */}
                      {/* These represent individual hits/subactions within the block */}
                    </g>
                  )
                })}

                {/* Axis title */}
                <text x={chartWidth - CHART_PADDING_RIGHT} y={CHART_PADDING_TOP + owners.length * SWIMLANE_HEIGHT + 20} textAnchor="end" className="timeline-axis-title">
                  TIME
                </text>
              </svg>
            </motion.div>
          ) : (
            <motion.div key="chart-view" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
              <svg ref={svgRef} viewBox={`0 0 ${chartWidth} ${CHART_HEIGHT}`} className="timeline-chart-svg" preserveAspectRatio="none">
                {/* Grid lines */}
                {yTicks.map((tick, i) => (
                  <g key={`y-${i}`}>
                    <line x1={CHART_PADDING_LEFT} y1={tick.y} x2={chartWidth - CHART_PADDING_RIGHT} y2={tick.y} stroke="rgba(255, 255, 255, 0.04)" strokeDasharray="2 6" />
                    <text x={CHART_PADDING_LEFT - 8} y={tick.y + 3} textAnchor="end" className="timeline-axis-label">
                      {formatNumber(tick.value)}
                    </text>
                  </g>
                ))}

                {/* X-axis ticks */}
                {xTicks.map((tick, i) => (
                  <g key={`x-${i}`}>
                    <line x1={tick.x} y1={CHART_HEIGHT - CHART_PADDING_BOTTOM} x2={tick.x} y2={CHART_HEIGHT - CHART_PADDING_BOTTOM + 6} stroke="rgba(255, 255, 255, 0.08)" />
                    <text x={tick.x} y={CHART_HEIGHT - CHART_PADDING_BOTTOM + 20} textAnchor="middle" className="timeline-axis-label">
                      {tick.time.toFixed(1)}s
                    </text>
                  </g>
                ))}

                {/* Baseline */}
                <line x1={CHART_PADDING_LEFT} y1={CHART_HEIGHT - CHART_PADDING_BOTTOM} x2={chartWidth - CHART_PADDING_RIGHT} y2={CHART_HEIGHT - CHART_PADDING_BOTTOM} stroke="rgba(255, 255, 255, 0.08)" />

                {/* TODO: Chart data visualization (line/area) will be rendered here */}
                {/* Data points as squares colored by character */}

                {/* Axis labels */}
                <text x={CHART_PADDING_LEFT - 8} y={CHART_PADDING_TOP - 12} textAnchor="end" className="timeline-axis-title">
                  {mode === 'dps' ? 'DPS' : 'DMG'}
                </text>
                <text x={chartWidth - CHART_PADDING_RIGHT} y={CHART_HEIGHT - CHART_PADDING_BOTTOM + 20} textAnchor="end" className="timeline-axis-title">
                  TIME
                </text>
              </svg>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Legend - showing damage owners */}
        {owners.length > 0 && (
          <div className="timeline-legend">
            {owners.map(owner => (
              <div key={owner.name} className="legend-item">
                <div className="legend-square" style={{ backgroundColor: owner.color }} />
                <span>{owner.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tooltip */}
      <AnimatePresence>
        {tooltipInfo && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="timeline-tooltip"
            style={{
              left: Math.min(tooltipInfo.x + 12, (containerRef.current?.clientWidth || 800) - 220),
              top: tooltipInfo.y - 10,
            }}>
            <div className="timeline-tooltip-header">
              <div className="timeline-tooltip-dot" style={{ backgroundColor: tooltipInfo.data.color }} />
              <span className="timeline-tooltip-character">{tooltipInfo.data.owner || 'Unknown'}</span>
            </div>
            <div className="timeline-tooltip-action">{tooltipInfo.data.attribution || 'Unknown Action'}</div>
            <div className="timeline-tooltip-time">{tooltipInfo.data.time?.toFixed(2)}s</div>
            {tooltipInfo.data.value && <div className="timeline-tooltip-damage">{formatNumber(tooltipInfo.data.value)}</div>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
