// Concentric donut rings with hover-linked segments, a tick bezel and a centre slot (summary dial, row impact dial)
import type { ReactNode } from 'react'

// ========== Geometry ==========================================================================================================

/** 0° = 12 o'clock, clockwise. */
function polar(r: number, deg: number) {
  const a = ((deg - 90) * Math.PI) / 180
  return { x: r * Math.cos(a), y: r * Math.sin(a) }
}

function annulus(r1: number, r2: number, start: number, end: number): string {
  // A single SVG arc cannot close a full circle: draw outer (clockwise) and inner (counter-clockwise) circles,
  // so the hole cuts out under the nonzero fill rule and no radial seam gets stroked
  if (end - start >= 359.9) {
    return `M 0 ${-r2} A ${r2} ${r2} 0 1 1 0 ${r2} A ${r2} ${r2} 0 1 1 0 ${-r2} Z M 0 ${-r1} A ${r1} ${r1} 0 1 0 0 ${r1} A ${r1} ${r1} 0 1 0 0 ${-r1} Z`
  }
  const large = end - start > 180 ? 1 : 0
  const a = polar(r2, start), b = polar(r2, end), c = polar(r1, end), d = polar(r1, start)
  return `M ${a.x} ${a.y} A ${r2} ${r2} 0 ${large} 1 ${b.x} ${b.y} L ${c.x} ${c.y} A ${r1} ${r1} 0 ${large} 0 ${d.x} ${d.y} Z`
}

// ========== Component: Ring Chart =============================================================================================

export type RingSegment = { key: string; value: number; color: string }
export type Ring = { inner: number; outer: number; segments: RingSegment[] }

type RingChartProps = {
  /** Rendered width/height in px; ring radii are in the same px units. */
  size: number
  rings: Ring[]
  activeKey?: string | null
  onHover?: (key: string | null) => void
  /** Radius of the tick bezel; omitted = no bezel. */
  bezel?: number
  children?: ReactNode
}

const GAP_DEG = 1.4
const POP = 6

export function RingChart({ size, rings, activeKey = null, onHover, bezel, children }: RingChartProps) {
  const half = size / 2

  return (
    <div className="ui-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`${-half} ${-half} ${size} ${size}`} className="ui-ring-svg">
        {bezel !== undefined && Array.from({ length: 72 }, (_, i) => {
          const major = i % 6 === 0
          const p1 = polar(bezel, i * 5)
          const p2 = polar(bezel + (major ? 7 : 3), i * 5)
          return <line key={i} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} className={major ? 'ui-ring-tick is-major' : 'ui-ring-tick'} />
        })}

        {rings.map((ring, ri) => {
          const total = ring.segments.reduce((s, x) => s + Math.max(0, x.value), 0)
          const visible = ring.segments.filter(x => x.value > 0)
          const gap = visible.length > 1 ? GAP_DEG : 0
          const usable = 360 - gap * visible.length
          let cursor = gap / 2
          return (
            <g key={ri}>
              <path d={annulus(ring.inner, ring.outer, 0, 360)} className="ui-ring-track" />
              {total > 0 && visible.map((seg, si) => {
                const sweep = (seg.value / total) * usable
                const start = cursor
                cursor += sweep + gap
                const active = activeKey === seg.key
                const dim = activeKey !== null && !active
                return (
                  <path
                    key={seg.key}
                    d={annulus(ring.inner, ring.outer + (active ? POP : 0), start, start + sweep)}
                    className={`ui-ring-seg${active ? ' is-active' : ''}${dim ? ' is-dim' : ''}`}
                    style={{ fill: seg.color, color: seg.color, animationDelay: `${0.08 * ri + 0.05 * si}s` }}
                    onMouseEnter={onHover ? () => onHover(seg.key) : undefined}
                    onMouseLeave={onHover ? () => onHover(null) : undefined}
                  />
                )
              })}
            </g>
          )
        })}
      </svg>
      {children && <div className="ui-ring-center">{children}</div>}
    </div>
  )
}
