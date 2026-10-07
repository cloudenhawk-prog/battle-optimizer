// Animated SVG donut chart with hover-highlighted slices, centre readout and legend (used for both summary pies)
import { useState, useId } from 'react'
import { motion } from 'framer-motion'
import { formatDamage } from './format'
import { PanelHeader } from './PanelHeader'

// ========== Arc Geometry ====================================================================================================

/** Angle 0° points up (12 o'clock) and grows clockwise. */
function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

/** SVG path of a ring segment between inner radius r1 and outer radius r2. */
function annularArcPath(cx: number, cy: number, r1: number, r2: number, startDeg: number, endDeg: number) {
  const large = endDeg - startDeg > 180 ? 1 : 0
  const s1 = polarToCartesian(cx, cy, r2, startDeg)
  const e1 = polarToCartesian(cx, cy, r2, endDeg)
  const s2 = polarToCartesian(cx, cy, r1, endDeg)
  const e2 = polarToCartesian(cx, cy, r1, startDeg)
  return `M ${s1.x} ${s1.y} A ${r2} ${r2} 0 ${large} 1 ${e1.x} ${e1.y} L ${s2.x} ${s2.y} A ${r1} ${r1} 0 ${large} 0 ${e2.x} ${e2.y} Z`
}

// ========== Pie Section =====================================================================================================

export type PieItem = { name: string; value: number; color: string; glow: string }

type PieSectionProps = {
  title: string
  accent: 'cyan' | 'purple' | 'amber'
  items: PieItem[]
  total: number
  centerLabel?: string
  subtitle?: string
}

export function PieSection({ title, accent, items, total, centerLabel = 'Total', subtitle }: PieSectionProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)
  const uid = useId()

  const CX = 200, CY = 200
  const INNER_R = 80, OUTER_R = 128
  const TICK_R = 136, RING2_INNER = 145, RING2_OUTER = 153
  const GAP = items.length > 1 ? 2.0 : 0
  // Single-item arcs would produce a degenerate 360° path; use 359.99 to keep it drawable
  const usableDeg = items.length > 1 ? (360 - GAP * items.length) : 359.99
  let cursor = 0
  const arcs = total > 0 ? items.map((item, i) => {
    const sweep = (item.value / total) * usableDeg
    const start = cursor
    const end = cursor + sweep
    cursor = end + GAP
    return { ...item, start, end, mid: (start + end) / 2, index: i }
  }) : []

  const ticks = Array.from({ length: 60 }, (_, i) => {
    const angle = i * 6
    const isMajor = i % 5 === 0
    const p1 = polarToCartesian(CX, CY, TICK_R, angle)
    const p2 = polarToCartesian(CX, CY, TICK_R + (isMajor ? 6 : 3), angle)
    return { p1, p2, isMajor }
  })

  const hoveredItem = hoveredIdx !== null ? items[hoveredIdx] : null
  const glowId = `spie-glow-${uid}`
  const gradId = (i: number) => `spie-grad-${uid}-${i}`

  return (
    <div className="summaryPieSection">
      <PanelHeader label={title} accent={accent} />
      {subtitle && <div className="summaryPieSubtitle">{subtitle}</div>}

      <div className="summaryPieWrap">
        <svg viewBox="34 34 332 332" className="summaryPieSvg" style={{ overflow: 'visible' }}>
          <defs>
            {arcs.map((a, i) => (
              <radialGradient key={gradId(i)} id={gradId(i)} cx="50%" cy="50%" r="50%">
                <stop offset="30%" stopColor={a.color} stopOpacity="0.9" />
                <stop offset="100%" stopColor={a.color} stopOpacity="0.55" />
              </radialGradient>
            ))}
            <filter id={glowId}>
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background rings — idle: slow desynchronised opacity breathing */}
          <motion.circle
            cx={CX} cy={CY} r={OUTER_R + 20}
            fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="0.5"
            animate={{ opacity: [0.2, 0.55, 0.2] }}
            transition={{ duration: 5.5, ease: 'easeInOut', repeat: Infinity }}
          />
          <motion.circle
            cx={CX} cy={CY} r={INNER_R - 8}
            fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="0.5"
            animate={{ opacity: [0.12, 0.38, 0.12] }}
            transition={{ duration: 4, ease: 'easeInOut', repeat: Infinity, delay: 1.8 }}
          />

          {/* Tick marks */}
          {ticks.map((t, i) => (
            <motion.line
              key={`${uid}-tick-${i}`}
              x1={t.p1.x} y1={t.p1.y} x2={t.p2.x} y2={t.p2.y}
              stroke="rgba(255,255,255,0.25)"
              strokeWidth={t.isMajor ? 1 : 0.5}
              initial={{ opacity: 0 }}
              animate={{ opacity: t.isMajor ? 0.5 : 0.2 }}
              transition={{ delay: 0.6 + i * 0.008, duration: 0.3 }}
            />
          ))}

          {/* Outer thin ring (secondary data layer) */}
          {arcs.map((a) => {
            const sweep2 = (a.end - a.start) * 0.7
            return (
              <motion.path
                key={`${uid}-ring2-${a.index}`}
                d={annularArcPath(CX, CY, RING2_INNER, RING2_OUTER, a.start, a.start + sweep2)}
                fill={a.color}
                fillOpacity="0.22"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 + a.index * 0.06, duration: 0.4 }}
              />
            )
          })}

          {/* Main donut segments */}
          {arcs.map((a) => {
            const isHovered = hoveredIdx === a.index
            return (
              <motion.path
                key={`${uid}-seg-${a.index}`}
                d={annularArcPath(CX, CY, INNER_R, OUTER_R + (isHovered ? 6 : 0), a.start, a.end)}
                fill={`url(#${gradId(a.index)})`}
                stroke="rgba(8,10,18,0.9)"
                strokeWidth={1.5}
                filter={isHovered ? `url(#${glowId})` : undefined}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{
                  opacity: isHovered ? 1 : (hoveredIdx !== null ? 0.55 : 0.88),
                  scale: 1,
                }}
                transition={{
                  // opacity uses a fast tween — works for both entrance fade-in and hover dimming
                  opacity: { duration: 0.15 },
                  // scale uses a staggered spring — only meaningful on mount (entrance)
                  scale: { delay: 0.15 + a.index * 0.07, type: 'spring', stiffness: 120, damping: 14 },
                }}
                style={{ transformOrigin: `${CX}px ${CY}px`, cursor: 'pointer' }}
                onMouseEnter={() => setHoveredIdx(a.index)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            )
          })}

          {/* Idle: center glow pulse — soft halo at the inner edge of the donut */}
          <motion.circle
            cx={CX} cy={CY} r={INNER_R + 5}
            fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth={4}
            animate={{ opacity: [0.2, 0.7, 0.2] }}
            transition={{ duration: 6, ease: 'easeInOut', repeat: Infinity, delay: 0.8 }}
          />

          {/* Center circle */}
          <motion.circle
            cx={CX} cy={CY} r={INNER_R - 2}
            fill="rgba(8,10,18,0.97)"
            stroke="rgba(255,255,255,0.06)" strokeWidth={1}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{ transformOrigin: `${CX}px ${CY}px` }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 150, damping: 16 }}
          />

        </svg>

        <div className="summaryPieCenter">
          {hoveredItem ? (
            <>
              <div className="summaryPieCenterName">{hoveredItem.name}</div>
              <div
                className="summaryPieCenterBig"
                style={{ color: hoveredItem.color, textShadow: `0 0 16px ${hoveredItem.glow}` }}
              >
                {formatDamage(hoveredItem.value)}
              </div>
              <div className="summaryPieCenterPct">
                {((hoveredItem.value / total) * 100).toFixed(1)}%
              </div>
            </>
          ) : (
            <>
              <div className="summaryPieCenterLabel">{centerLabel}</div>
              <div className="summaryPieCenterBig">{formatDamage(total)}</div>
            </>
          )}
        </div>
      </div>

      <div className="summaryPieLegend">
        {items.map((item, i) => {
          const pct = total > 0 ? (item.value / total) * 100 : 0
          return (
            <div
              key={i}
              className={`summaryPieLegendRow${hoveredIdx === i ? ' active' : ''}`}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <div
                className="summaryPieLegendDot"
                style={{ background: item.color, boxShadow: `0 0 6px ${item.glow}` }}
              />
              <span className="summaryPieLegendName">{item.name}</span>
              <span className="summaryPieLegendValue">{formatDamage(item.value)}</span>
              <span className="summaryPieLegendPct" style={{ color: item.color }}>
                {pct.toFixed(1)}%
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
