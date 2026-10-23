// Alive Tacet Mark: animated crest sigil variant with layered rings, pulse core and scan sweep.
import { useId } from 'react'
import { tacetMarkShape } from './tacetMarkShape'

// ========== Component: Alive Tacet Mark =====================================================================================

type AliveTacetMarkProps = {
  seed: string
  size?: number
  className?: string
}

export function AliveTacetMark({ seed, size = 360, className }: AliveTacetMarkProps) {
  const s = tacetMarkShape(seed)
  const idBase = useId().replace(/:/g, '')
  const glowFilterId = `${idBase}-alive-glow`
  const coreGradientId = `${idBase}-alive-core`
  const beamGradientId = `${idBase}-alive-beam`

  return (
    <svg
      className={`ui-tacet-alive${className ? ` ${className}` : ''}`}
      width={size}
      height={size}
      viewBox="-120 -120 240 240"
      aria-hidden="true"
      shapeRendering="geometricPrecision"
    >
      <defs>
        <filter id={glowFilterId} x="-60%" y="-60%" width="220%" height="220%" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <radialGradient id={coreGradientId} cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="hsl(var(--ui-accent-raw) / 0.92)" />
          <stop offset="70%" stopColor="hsl(var(--ui-accent-raw) / 0.24)" />
          <stop offset="100%" stopColor="hsl(var(--ui-accent-raw) / 0)" />
        </radialGradient>

        <linearGradient id={beamGradientId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="hsl(var(--ui-accent-raw) / 0)" />
          <stop offset="45%" stopColor="hsl(var(--ui-accent-raw) / 0.62)" />
          <stop offset="55%" stopColor="hsl(var(--ui-accent-raw) / 0.95)" />
          <stop offset="100%" stopColor="hsl(var(--ui-accent-raw) / 0)" />
        </linearGradient>
      </defs>

      <g filter={`url(#${glowFilterId})`}>
        <circle className="ui-tacet-alive__halo" r="94" />

        <g className="ui-tacet-alive__outer">
          {s.outerArcs.map((d, i) => (
            <path key={`oa-${i}`} d={d} className="ui-tacet-alive__outer-arc" />
          ))}
          {s.ringDots.map((p, i) => (
            <circle key={`dot-${i}`} cx={p.x} cy={p.y} r="2.1" className="ui-tacet-alive__dot" />
          ))}
        </g>

        <g className="ui-tacet-alive__counter">
          <circle r={s.innerR + 10} className="ui-tacet-alive__counter-ring" />
          <path d={arcPath(s.innerR + 10, -28, 24)} className="ui-tacet-alive__counter-slice" />
          <path d={arcPath(s.innerR + 10, 152, 204)} className="ui-tacet-alive__counter-slice" />
        </g>

        {s.innerTicks.map((t, i) => (
          <line key={`tick-${i}`} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} className="ui-tacet-alive__tick" />
        ))}

        <line x1="0" y1={-s.spine} x2="0" y2={s.spine} className="ui-tacet-alive__spine" />

        {[1, -1].map(side => (
          <g key={side} transform={`scale(${side} 1)`} className="ui-tacet-alive__wings">
            {s.wings.map((d, i) => (
              <path key={`w-${i}`} d={d} className="ui-tacet-alive__wing" style={{ opacity: 0.98 - i * 0.18 }} />
            ))}
            {s.crown.map((d, i) => (
              <path key={`c-${i}`} d={d} className="ui-tacet-alive__crown" />
            ))}
          </g>
        ))}

        <g className="ui-tacet-alive__scan">
          <path d={scanBeamPath(s.innerR + 14)} fill={`url(#${beamGradientId})`} />
        </g>

        <g className="ui-tacet-alive__pulse">
          <circle r={s.core + 14} fill={`url(#${coreGradientId})`} />
          <path d={diamond(0, 0, s.core + 3)} className="ui-tacet-alive__core-outline" />
          <path d={diamond(0, 0, s.core * 0.52)} className="ui-tacet-alive__core-fill" />
        </g>
      </g>
    </svg>
  )
}

function arcPath(r: number, from: number, to: number): string {
  const a = polar(r, from)
  const b = polar(r, to)
  const large = to - from > 180 ? 1 : 0
  return `M ${a.x} ${a.y} A ${r} ${r} 0 ${large} 1 ${b.x} ${b.y}`
}

function scanBeamPath(r: number): string {
  const outerA = polar(r + 5, -18)
  const outerB = polar(r + 5, 18)
  const innerB = polar(r - 18, 11)
  const innerA = polar(r - 18, -11)
  return `M ${outerA.x} ${outerA.y} A ${r + 5} ${r + 5} 0 0 1 ${outerB.x} ${outerB.y} L ${innerB.x} ${innerB.y} A ${r - 18} ${r - 18} 0 0 0 ${innerA.x} ${innerA.y} Z`
}

function polar(r: number, deg: number): { x: number; y: number } {
  const rad = (deg * Math.PI) / 180
  return { x: +(r * Math.cos(rad)).toFixed(2), y: +(r * Math.sin(rad)).toFixed(2) }
}

function diamond(cx: number, cy: number, r: number): string {
  return `M ${cx} ${cy - r} L ${cx + r} ${cy} L ${cx} ${cy + r} L ${cx - r} ${cy} Z`
}