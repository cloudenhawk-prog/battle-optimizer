import { useState, useMemo, useRef, useLayoutEffect } from 'react'
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
  const [tooltipInfo, setTooltipInfo] = useState<{ x: number; y: number; data: any } | null>(null)
  const [hoveredBlock, setHoveredBlock] = useState<number | null>(null)
  const [containerWidth, setContainerWidth] = useState(800)
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  useLayoutEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.clientWidth)
    }
  }, [viewMode])

  // Data processing: extract owners, action blocks, buff/debuff blocks, and calculate sub-lanes for overlaps
  // Each snapshot/event can generate multiple (x,y) points for subactions or multi-hit abilities
  const { maxValue, maxTime, owners, actionBlocks, buffBlocks, debuffBlocks, maxBuffSubLanes, maxDebuffSubLanes, maxSubLanesByOwner } = useMemo(() => {
    if (!snapshots || snapshots.length === 0) {
      return {
        maxValue: 1,
        maxTime: 1,
        owners: [],
        actionBlocks: [],
        buffBlocks: [],
        debuffBlocks: [],
        maxBuffSubLanes: 0,
        maxDebuffSubLanes: 0,
        maxSubLanesByOwner: new Map<string, number>(),
      }
    }

    // Helper function to extract character name from dealer strings
    // Dealers can be formatted as "CharacterName" or "CharacterName: ActionName"
    const extractCharacterName = (dealer: string): string => {
      const colonIndex = dealer.indexOf(':')
      return colonIndex !== -1 ? dealer.substring(0, colonIndex).trim() : dealer
    }

    // Collect all unique owner names and determine which are characters vs global sources
    const allOwnerNames = new Set<string>()
    snapshots.forEach(s => {
      if (s.character) allOwnerNames.add(s.character)
    })
    damageEvents.forEach(e => {
      if (e.dealer) {
        const characterName = extractCharacterName(e.dealer)
        allOwnerNames.add(characterName)
      }
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
      hasGlobalSources = damageEvents.some(e => {
        const characterName = extractCharacterName(e.dealer)
        return !characterOwners.has(characterName) && !snapshots.some(s => s.character === characterName)
      })
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
    // Each snapshot creates its own block to show individual action uses
    snapshots.forEach(snap => {
      const rawOwner = snap.character || 'Global'
      // Map to "Global" if not a recognized character
      const owner = characterOwners.has(rawOwner) ? rawOwner : 'Global'
      const attribution = snap.action || 'Unknown Action'

      blocks.push({
        owner,
        attribution,
        startTime: snap.fromTime,
        endTime: snap.toTime,
        snapshots: [snap],
      })
    })

    // Process damage events - extract character name from dealer and group appropriately
    damageEvents.forEach(e => {
      const characterName = extractCharacterName(e.dealer)
      const owner = characterOwners.has(characterName) ? characterName : 'Global'
      const attribution = e.actionName || e.dealer

      // Check if we can merge with an existing block
      const existingBlock = blocks.find(b => b.owner === owner && b.attribution === attribution && Math.abs(b.endTime - e.timeStamp) < 0.1)

      if (existingBlock) {
        // Extend the block to include this event
        existingBlock.endTime = Math.max(existingBlock.endTime, e.timeStamp)
      } else {
        // Create a new block for this event
        blocks.push({
          owner,
          attribution,
          startTime: e.timeStamp,
          endTime: e.timeStamp,
          snapshots: [],
        })
      }
    })

    // Track negative status duration blocks
    // Create blocks showing when each negative status is active (application to expiry)
    const negativeStatusTracking = new Map<string, { startTime: number; lastSeenTime: number; wasActive: boolean }>()

    snapshots.forEach(snap => {
      const currentTime = snap.toTime

      // Check all negative statuses in this snapshot
      for (const [statusName, stacks] of Object.entries(snap.negativeStatuses || {})) {
        if (stacks > 0) {
          //const timeLeft = snap.negativeStatusesTimeLeft?.[statusName] || 0
          const trackingKey = statusName

          if (!negativeStatusTracking.has(trackingKey)) {
            // New negative status application - start a new duration block
            negativeStatusTracking.set(trackingKey, {
              startTime: currentTime,
              lastSeenTime: currentTime,
              wasActive: true,
            })
          } else {
            // Status still active - update last seen time
            const tracking = negativeStatusTracking.get(trackingKey)!

            // If status was previously inactive, this is a new application - reset start time
            if (!tracking.wasActive) {
              tracking.startTime = currentTime
            }

            tracking.lastSeenTime = currentTime
            tracking.wasActive = true
          }
        } else {
          // Status has 0 stacks - check if it was previously active
          const trackingKey = statusName
          const tracking = negativeStatusTracking.get(trackingKey)

          if (tracking && tracking.wasActive) {
            // Status just ended - create a duration block
            blocks.push({
              owner: 'Global',
              attribution: `${statusName} (Active)`,
              startTime: tracking.startTime,
              endTime: tracking.lastSeenTime,
              snapshots: [],
            })

            // Mark as inactive so we can detect new applications
            tracking.wasActive = false
          }
        }
      }
    })

    // Handle any negative statuses that are still active at the end
    for (const [statusName, tracking] of negativeStatusTracking.entries()) {
      if (tracking.wasActive) {
        blocks.push({
          owner: 'Global',
          attribution: `${statusName} (Active)`,
          startTime: tracking.startTime,
          endTime: tracking.lastSeenTime,
          snapshots: [],
        })
      }
    }

    // Track buff/debuff duration blocks similar to negative statuses
    const buffDebuffTracking = new Map<string, { startTime: number; lastSeenTime: number; wasActive: boolean; type: 'buff' | 'debuff' }>()
    const buffDebuffBlocksList: Array<{
      name: string
      type: 'buff' | 'debuff'
      startTime: number
      endTime: number
    }> = []

    snapshots.forEach(snap => {
      const currentTime = snap.toTime

      // Process buffs
      for (const [buffName, stacks] of Object.entries(snap.buffs || {})) {
        if (stacks > 0) {
          const trackingKey = `buff:${buffName}`

          if (!buffDebuffTracking.has(trackingKey)) {
            buffDebuffTracking.set(trackingKey, {
              startTime: currentTime,
              lastSeenTime: currentTime,
              wasActive: true,
              type: 'buff',
            })
          } else {
            const tracking = buffDebuffTracking.get(trackingKey)!
            if (!tracking.wasActive) {
              tracking.startTime = currentTime
            }
            tracking.lastSeenTime = currentTime
            tracking.wasActive = true
          }
        } else {
          const trackingKey = `buff:${buffName}`
          const tracking = buffDebuffTracking.get(trackingKey)
          if (tracking && tracking.wasActive) {
            // Buff just became inactive - create a block for its duration
            buffDebuffBlocksList.push({
              name: buffName,
              type: 'buff',
              startTime: tracking.startTime,
              endTime: tracking.lastSeenTime,
            })
            tracking.wasActive = false
          }
        }
      }

      // Process debuffs
      for (const [debuffName, stacks] of Object.entries(snap.debuffs || {})) {
        if (stacks > 0) {
          const trackingKey = `debuff:${debuffName}`

          if (!buffDebuffTracking.has(trackingKey)) {
            buffDebuffTracking.set(trackingKey, {
              startTime: currentTime,
              lastSeenTime: currentTime,
              wasActive: true,
              type: 'debuff',
            })
          } else {
            const tracking = buffDebuffTracking.get(trackingKey)!
            if (!tracking.wasActive) {
              tracking.startTime = currentTime
            }
            tracking.lastSeenTime = currentTime
            tracking.wasActive = true
          }
        } else {
          const trackingKey = `debuff:${debuffName}`
          const tracking = buffDebuffTracking.get(trackingKey)
          if (tracking && tracking.wasActive) {
            // Debuff just became inactive - create a block for its duration
            buffDebuffBlocksList.push({
              name: debuffName,
              type: 'debuff',
              startTime: tracking.startTime,
              endTime: tracking.lastSeenTime,
            })
            tracking.wasActive = false
          }
        }
      }
    })

    // Handle any buffs/debuffs that are still active at the end
    for (const [key, tracking] of buffDebuffTracking.entries()) {
      if (tracking.wasActive) {
        const name = key.replace(/^(buff|debuff):/, '')
        buffDebuffBlocksList.push({
          name,
          type: tracking.type,
          startTime: tracking.startTime,
          endTime: tracking.lastSeenTime,
        })
      }
    }

    // Calculate sub-lanes for overlapping action blocks
    // Sort blocks by start time, then by end time
    const sortedBlocks = [...blocks].sort((a, b) => {
      if (a.startTime !== b.startTime) return a.startTime - b.startTime
      return a.endTime - b.endTime
    })

    // Assign sub-lanes to prevent overlap within each owner's swimlane
    const blocksWithLanes = sortedBlocks.map(block => ({
      ...block,
      subLane: 0,
    }))

    // Group by owner for sub-lane calculation
    const blocksByOwner = new Map<string, typeof blocksWithLanes>()
    blocksWithLanes.forEach(block => {
      if (!blocksByOwner.has(block.owner)) {
        blocksByOwner.set(block.owner, [])
      }
      blocksByOwner.get(block.owner)!.push(block)
    })

    // Calculate sub-lanes for each owner separately
    blocksByOwner.forEach(ownerBlocks => {
      // Track which sub-lanes are occupied at each time point
      const laneEndTimes: number[] = []

      ownerBlocks.forEach(block => {
        // Find the first available sub-lane (one that ends before this block starts)
        let assignedLane = 0
        for (let i = 0; i < laneEndTimes.length; i++) {
          if (laneEndTimes[i] <= block.startTime) {
            assignedLane = i
            break
          }
        }

        // If no available lane found, create a new one
        if (assignedLane === 0 && laneEndTimes.length > 0 && laneEndTimes[0] > block.startTime) {
          assignedLane = laneEndTimes.length
        }

        block.subLane = assignedLane

        // Update the end time for this lane
        if (assignedLane >= laneEndTimes.length) {
          laneEndTimes.push(block.endTime)
        } else {
          laneEndTimes[assignedLane] = block.endTime
        }
      })
    })

    // Calculate max sub-lanes per owner for dynamic height
    const maxSubLanesByOwner = new Map<string, number>()
    blocksWithLanes.forEach(block => {
      const current = maxSubLanesByOwner.get(block.owner) || 0
      maxSubLanesByOwner.set(block.owner, Math.max(current, block.subLane + 1))
    })

    // Calculate sub-lanes for buff/debuff blocks
    const buffBlocksWithLanes = buffDebuffBlocksList
      .filter(b => b.type === 'buff')
      .sort((a, b) => {
        if (a.startTime !== b.startTime) return a.startTime - b.startTime
        return a.endTime - b.endTime
      })
      .map(block => ({ ...block, subLane: 0 }))

    const debuffBlocksWithLanes = buffDebuffBlocksList
      .filter(b => b.type === 'debuff')
      .sort((a, b) => {
        if (a.startTime !== b.startTime) return a.startTime - b.startTime
        return a.endTime - b.endTime
      })
      .map(block => ({ ...block, subLane: 0 }))

    // Assign sub-lanes for buffs
    const buffLaneEndTimes: number[] = []
    buffBlocksWithLanes.forEach(block => {
      let assignedLane = 0
      for (let i = 0; i < buffLaneEndTimes.length; i++) {
        if (buffLaneEndTimes[i] <= block.startTime) {
          assignedLane = i
          break
        }
      }
      if (assignedLane === 0 && buffLaneEndTimes.length > 0 && buffLaneEndTimes[0] > block.startTime) {
        assignedLane = buffLaneEndTimes.length
      }
      block.subLane = assignedLane
      if (assignedLane >= buffLaneEndTimes.length) {
        buffLaneEndTimes.push(block.endTime)
      } else {
        buffLaneEndTimes[assignedLane] = block.endTime
      }
    })

    // Assign sub-lanes for debuffs
    const debuffLaneEndTimes: number[] = []
    debuffBlocksWithLanes.forEach(block => {
      let assignedLane = 0
      for (let i = 0; i < debuffLaneEndTimes.length; i++) {
        if (debuffLaneEndTimes[i] <= block.startTime) {
          assignedLane = i
          break
        }
      }
      if (assignedLane === 0 && debuffLaneEndTimes.length > 0 && debuffLaneEndTimes[0] > block.startTime) {
        assignedLane = debuffLaneEndTimes.length
      }
      block.subLane = assignedLane
      if (assignedLane >= debuffLaneEndTimes.length) {
        debuffLaneEndTimes.push(block.endTime)
      } else {
        debuffLaneEndTimes[assignedLane] = block.endTime
      }
    })

    const maxBuffSubLanes = buffLaneEndTimes.length
    const maxDebuffSubLanes = debuffLaneEndTimes.length

    // Placeholder values - will be calculated from actual data points
    const maxT = Math.max(...snapshots.map(s => s.toTime), 1)
    const maxVal = mode === 'cumulative' ? 100000 : 10000

    return {
      maxValue: maxVal,
      maxTime: maxT,
      owners: ownersList,
      actionBlocks: blocksWithLanes,
      buffBlocks: buffBlocksWithLanes,
      debuffBlocks: debuffBlocksWithLanes,
      maxBuffSubLanes,
      maxDebuffSubLanes,
      maxSubLanesByOwner,
    }
  }, [snapshots, damageEvents, mode])

  // Calculate dynamic swimlane heights based on sub-lane count
  const getSwimlaneHeight = (ownerName: string) => {
    const subLanes = maxSubLanesByOwner?.get(ownerName) || 1
    // Base height + additional height for sub-lanes (but not 1:1 - use smaller increments)
    return SWIMLANE_HEIGHT + (subLanes - 1) * 20
  }

  // Calculate cumulative Y positions for swimlanes
  const getSwimlaneY = (ownerIndex: number) => {
    let y = CHART_PADDING_TOP
    for (let i = 0; i < ownerIndex; i++) {
      y += getSwimlaneHeight(owners[i].name)
    }
    return y
  }

  // Calculate total height needed for all swimlanes
  const totalSwimlanesHeight = owners.reduce((sum, owner) => sum + getSwimlaneHeight(owner.name), 0)

  // Add buff/debuff section height - only if there are active buffs or debuffs
  const BUFF_LANE_HEIGHT = 24
  const BUFF_SECTION_SPACING = 8
  const hasBuffs = maxBuffSubLanes > 0
  const hasDebuffs = maxDebuffSubLanes > 0
  const buffSectionHeight = hasBuffs ? maxBuffSubLanes * (BUFF_LANE_HEIGHT + BUFF_SECTION_SPACING) : 0
  const debuffSectionHeight = hasDebuffs ? maxDebuffSubLanes * (BUFF_LANE_HEIGHT + BUFF_SECTION_SPACING) : 0
  const BUFF_DEBUFF_SECTION_HEIGHT = buffSectionHeight + debuffSectionHeight

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
  }, [maxValue, valueToY])

  // X-axis ticks
  const xTicks = useMemo(() => {
    const step = Math.max(1, Math.ceil(maxTime / 10))
    const ticks: { time: number; x: number }[] = []
    for (let t = 0; t <= maxTime; t += step) {
      ticks.push({ time: t, x: timeToX(t) })
    }
    return ticks
  }, [maxTime, timeToX])

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
            {snapshots.length} {snapshots.length === 1 ? 'SEQUENCE' : 'SEQUENCES'} · {maxTime.toFixed(1)}s DURATION
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

        <div className="timeline-stat-label">{viewMode === 'chart' ? (mode === 'dps' ? 'PEAK DPS' : 'TOTAL OUTPUT') : `DETECTED ${owners.length} ${owners.length === 1 ? 'SOURCE' : 'SOURCES'}`}</div>
      </div>

      {/* Main Visualization Area */}
      <div className="timeline-chart-container">
        <AnimatePresence mode="wait">
          {viewMode === 'timeline' ? (
            <motion.div key="timeline-view" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="timeline-swimlanes">
              <svg ref={svgRef} viewBox={`0 0 ${chartWidth} ${CHART_PADDING_TOP + totalSwimlanesHeight + BUFF_DEBUFF_SECTION_HEIGHT + 100}`} className="timeline-chart-svg" preserveAspectRatio="none">
                {/* Owner-based swimlanes */}
                {owners.map((owner, i) => {
                  const y = getSwimlaneY(i)
                  const height = getSwimlaneHeight(owner.name)
                  return (
                    <g key={owner.name}>
                      {/* Swimlane background */}
                      <rect x={CHART_PADDING_LEFT} y={y} width={chartWidth - CHART_PADDING_LEFT - CHART_PADDING_RIGHT} height={height - SWIMLANE_PADDING} fill={`${owner.color}08`} rx="4" opacity="0.3" />

                      {/* Owner label */}
                      <text x={CHART_PADDING_LEFT - 12} y={y + height / 2 + 3} textAnchor="end" className="timeline-swimlane-label" fill={owner.color}>
                        {owner.name}
                      </text>

                      {/* Time grid lines */}
                      {xTicks.map((tick, ti) => (
                        <line key={`grid-${i}-${ti}`} x1={tick.x} y1={y} x2={tick.x} y2={y + height} stroke="rgba(255, 255, 255, 0.03)" strokeDasharray="2 4" />
                      ))}
                    </g>
                  )
                })}

                {/* X-axis */}
                {xTicks.map((tick, i) => (
                  <g key={`x-${i}`}>
                    <line x1={tick.x} y1={CHART_PADDING_TOP} x2={tick.x} y2={CHART_PADDING_TOP + totalSwimlanesHeight + BUFF_DEBUFF_SECTION_HEIGHT} stroke="rgba(255, 255, 255, 0.06)" />
                    <text x={tick.x} y={CHART_PADDING_TOP + totalSwimlanesHeight + BUFF_DEBUFF_SECTION_HEIGHT + 20} textAnchor="middle" className="timeline-axis-label">
                      {tick.time.toFixed(1)}s
                    </text>
                  </g>
                ))}

                {/* Action blocks with sub-lanes and hover functionality */}
                {/* Each action block shows attribution (what action/event) in the owner's swimlane */}
                {/* Sort blocks so hovered block renders last (on top) */}
                {[...actionBlocks]
                  .sort((a, b) => {
                    const aIndex = actionBlocks.indexOf(a)
                    const bIndex = actionBlocks.indexOf(b)
                    if (aIndex === hoveredBlock) return 1
                    if (bIndex === hoveredBlock) return -1
                    return 0
                  })
                  .map(block => {
                    const blockIndex = actionBlocks.indexOf(block)
                    const ownerIndex = owners.findIndex(o => o.name === block.owner)
                    if (ownerIndex === -1) return null

                    const swimlaneY = getSwimlaneY(ownerIndex)
                    const swimlaneHeight = getSwimlaneHeight(block.owner)
                    const maxSubLanes = maxSubLanesByOwner?.get(block.owner) || 1
                    const subLaneHeight = (swimlaneHeight - SWIMLANE_PADDING * 2) / maxSubLanes

                    const y = swimlaneY + SWIMLANE_PADDING + block.subLane * subLaneHeight
                    const x1 = timeToX(block.startTime)
                    const x2 = timeToX(block.endTime)
                    const w = Math.max(x2 - x1, 2)
                    const owner = owners[ownerIndex]
                    const isHovered = hoveredBlock === blockIndex

                    return (
                      <g key={`block-${blockIndex}`} onMouseEnter={() => setHoveredBlock(blockIndex)} onMouseLeave={() => setHoveredBlock(null)} style={{ cursor: 'pointer' }}>
                        <rect
                          x={x1}
                          y={y}
                          width={w}
                          height={subLaneHeight - 4}
                          rx="6"
                          fill={isHovered ? `${owner.color}40` : `${owner.color}20`}
                          stroke={isHovered ? `${owner.color}80` : `${owner.color}40`}
                          strokeWidth={isHovered ? '2' : '1'}
                          className="timeline-action-block"
                          style={{
                            opacity: isHovered ? 1 : hoveredBlock !== null ? 0.4 : 0.8,
                            transition: 'all 0.2s ease',
                          }}
                        />

                        {/* Attribution label (if wide enough) */}
                        {w > 40 && (
                          <text
                            x={x1 + w / 2}
                            y={y + subLaneHeight / 2 - 2}
                            textAnchor="middle"
                            className="timeline-action-label"
                            fill={isHovered ? `${owner.color}` : `${owner.color}80`}
                            style={{
                              opacity: isHovered ? 1 : hoveredBlock !== null ? 0.5 : 0.9,
                              transition: 'all 0.2s ease',
                            }}>
                            {block.attribution.length > 12 && w < 80 ? block.attribution.slice(0, 10) + '…' : block.attribution}
                          </text>
                        )}

                        {/* TODO: Individual data points (squares) will be rendered here */}
                        {/* These represent individual hits/subactions within the block */}
                      </g>
                    )
                  })}

                {/* Buff/Debuff Section - only shown if there are active buffs or debuffs */}
                {(hasBuffs || hasDebuffs) && (
                  <g>
                    {/* Buff swimlane - only if there are buffs */}
                    {hasBuffs && (
                      <g>
                        {/* Buff section label */}
                        <text x={CHART_PADDING_LEFT - 12} y={CHART_PADDING_TOP + totalSwimlanesHeight + buffSectionHeight / 2} textAnchor="end" className="timeline-swimlane-label" fill="rgba(74, 222, 128, 0.7)">
                          BUFFS
                        </text>

                        {/* Buff background */}
                        <rect x={CHART_PADDING_LEFT} y={CHART_PADDING_TOP + totalSwimlanesHeight} width={chartWidth - CHART_PADDING_LEFT - CHART_PADDING_RIGHT} height={buffSectionHeight} fill="rgba(74, 222, 128, 0.03)" rx="4" opacity="0.5" />

                        {/* Buff blocks with sub-lanes */}
                        {buffBlocks.map((block, i) => {
                          const blockIndex = actionBlocks.length + i // Offset by action blocks count
                          const isHovered = hoveredBlock === blockIndex
                          const y = CHART_PADDING_TOP + totalSwimlanesHeight + block.subLane * (BUFF_LANE_HEIGHT + BUFF_SECTION_SPACING)
                          const x1 = timeToX(block.startTime)
                          const x2 = timeToX(block.endTime)
                          const w = Math.max(x2 - x1, 2)

                          return (
                            <g key={`buff-${i}`} onMouseEnter={() => setHoveredBlock(blockIndex)} onMouseLeave={() => setHoveredBlock(null)} style={{ cursor: 'pointer' }}>
                              <rect
                                x={x1}
                                y={y}
                                width={w}
                                height={BUFF_LANE_HEIGHT}
                                rx="4"
                                fill={isHovered ? 'rgba(74, 222, 128, 0.35)' : 'rgba(74, 222, 128, 0.2)'}
                                stroke={isHovered ? 'rgba(74, 222, 128, 0.6)' : 'rgba(74, 222, 128, 0.4)'}
                                strokeWidth={isHovered ? '2' : '1'}
                                className="timeline-buff-block"
                                style={{
                                  opacity: isHovered ? 1 : hoveredBlock !== null ? 0.4 : 0.8,
                                  transition: 'all 0.2s ease',
                                }}
                              />
                              {w > 50 && (
                                <text
                                  x={x1 + w / 2}
                                  y={y + BUFF_LANE_HEIGHT / 2 + 4}
                                  textAnchor="middle"
                                  className="timeline-action-label"
                                  fill="rgba(74, 222, 128, 0.9)"
                                  style={{
                                    opacity: isHovered ? 1 : hoveredBlock !== null ? 0.5 : 0.9,
                                    transition: 'all 0.2s ease',
                                  }}>
                                  {block.name.length > 15 && w < 100 ? block.name.slice(0, 12) + '…' : block.name}
                                </text>
                              )}
                            </g>
                          )
                        })}
                      </g>
                    )}

                    {/* Debuff swimlane - only if there are debuffs */}
                    {hasDebuffs && (
                      <g>
                        {/* Debuff section label */}
                        <text x={CHART_PADDING_LEFT - 12} y={CHART_PADDING_TOP + totalSwimlanesHeight + buffSectionHeight + debuffSectionHeight / 2} textAnchor="end" className="timeline-swimlane-label" fill="rgba(248, 113, 113, 0.7)">
                          DEBUFFS
                        </text>

                        {/* Debuff background */}
                        <rect x={CHART_PADDING_LEFT} y={CHART_PADDING_TOP + totalSwimlanesHeight + buffSectionHeight} width={chartWidth - CHART_PADDING_LEFT - CHART_PADDING_RIGHT} height={debuffSectionHeight} fill="rgba(248, 113, 113, 0.03)" rx="4" opacity="0.5" />

                        {/* Debuff blocks with sub-lanes */}
                        {debuffBlocks.map((block, i) => {
                          const blockIndex = actionBlocks.length + buffBlocks.length + i // Offset by action + buff blocks count
                          const isHovered = hoveredBlock === blockIndex
                          const y = CHART_PADDING_TOP + totalSwimlanesHeight + buffSectionHeight + block.subLane * (BUFF_LANE_HEIGHT + BUFF_SECTION_SPACING)
                          const x1 = timeToX(block.startTime)
                          const x2 = timeToX(block.endTime)
                          const w = Math.max(x2 - x1, 2)

                          return (
                            <g key={`debuff-${i}`} onMouseEnter={() => setHoveredBlock(blockIndex)} onMouseLeave={() => setHoveredBlock(null)} style={{ cursor: 'pointer' }}>
                              <rect
                                x={x1}
                                y={y}
                                width={w}
                                height={BUFF_LANE_HEIGHT}
                                rx="4"
                                fill={isHovered ? 'rgba(248, 113, 113, 0.35)' : 'rgba(248, 113, 113, 0.2)'}
                                stroke={isHovered ? 'rgba(248, 113, 113, 0.6)' : 'rgba(248, 113, 113, 0.4)'}
                                strokeWidth={isHovered ? '2' : '1'}
                                className="timeline-debuff-block"
                                style={{
                                  opacity: isHovered ? 1 : hoveredBlock !== null ? 0.4 : 0.8,
                                  transition: 'all 0.2s ease',
                                }}
                              />
                              {w > 50 && (
                                <text
                                  x={x1 + w / 2}
                                  y={y + BUFF_LANE_HEIGHT / 2 + 4}
                                  textAnchor="middle"
                                  className="timeline-action-label"
                                  fill="rgba(248, 113, 113, 0.9)"
                                  style={{
                                    opacity: isHovered ? 1 : hoveredBlock !== null ? 0.5 : 0.9,
                                    transition: 'all 0.2s ease',
                                  }}>
                                  {block.name.length > 15 && w < 100 ? block.name.slice(0, 12) + '…' : block.name}
                                </text>
                              )}
                            </g>
                          )
                        })}
                      </g>
                    )}
                  </g>
                )}

                {/* Axis title */}
                <text x={chartWidth - CHART_PADDING_RIGHT} y={CHART_PADDING_TOP + totalSwimlanesHeight + BUFF_DEBUFF_SECTION_HEIGHT + 20} textAnchor="end" className="timeline-axis-title">
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
              left: Math.min(tooltipInfo.x + 12, containerWidth - 220),
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
