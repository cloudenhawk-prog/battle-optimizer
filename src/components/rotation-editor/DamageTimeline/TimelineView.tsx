// Timeline view SVG: owner swimlanes with laned action blocks, a time axis and BUFFS / DEBUFFS sections.
import type { Dispatch, RefObject, SetStateAction } from 'react'
import type { ActionBlock, Owner, StatusBlock, WithSubLane } from './types'
import {
  CHART_WIDTH, CHART_PADDING_TOP, CHART_PADDING_LEFT, CHART_PADDING_RIGHT,
  SWIMLANE_PADDING, BUFF_LANE_HEIGHT, BUFF_SECTION_SPACING,
} from './constants'
import { swimlaneHeight, swimlaneY, timeToX as timeToXScale } from './layout'

// ========== Component ========================================================================================================

type TimelineViewProps = {
  svgRef: RefObject<SVGSVGElement | null>
  owners: Owner[]
  actionBlocks: WithSubLane<ActionBlock>[]
  buffBlocks: WithSubLane<StatusBlock>[]
  debuffBlocks: WithSubLane<StatusBlock>[]
  maxSubLanesByOwner: Map<string, number>
  maxBuffSubLanes: number
  maxDebuffSubLanes: number
  maxTime: number
  xTicks: { time: number; x: number }[]
  hoveredBlock: number | null
  setHoveredBlock: Dispatch<SetStateAction<number | null>>
}

// Hover index space: action blocks first, then buff blocks, then debuff blocks (one shared hoveredBlock).
export function TimelineView({
  svgRef,
  owners,
  actionBlocks,
  buffBlocks,
  debuffBlocks,
  maxSubLanesByOwner,
  maxBuffSubLanes,
  maxDebuffSubLanes,
  maxTime,
  xTicks,
  hoveredBlock,
  setHoveredBlock,
}: TimelineViewProps) {
  const chartWidth = CHART_WIDTH
  const timeToX = (t: number) => timeToXScale(t, maxTime)
  const getSwimlaneHeight = (ownerName: string) => swimlaneHeight(maxSubLanesByOwner, ownerName)
  const getSwimlaneY = (ownerIndex: number) => swimlaneY(owners, maxSubLanesByOwner, ownerIndex)

  // Calculate total height needed for all swimlanes
  const totalSwimlanesHeight = owners.reduce((sum, owner) => sum + getSwimlaneHeight(owner.name), 0)

  // Buff/debuff sections sit below the swimlanes and only take space when they have blocks
  const hasBuffs = maxBuffSubLanes > 0
  const hasDebuffs = maxDebuffSubLanes > 0
  const buffSectionHeight = hasBuffs ? maxBuffSubLanes * (BUFF_LANE_HEIGHT + BUFF_SECTION_SPACING) : 0
  const debuffSectionHeight = hasDebuffs ? maxDebuffSubLanes * (BUFF_LANE_HEIGHT + BUFF_SECTION_SPACING) : 0
  const BUFF_DEBUFF_SECTION_HEIGHT = buffSectionHeight + debuffSectionHeight

  return (
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
  )
}
