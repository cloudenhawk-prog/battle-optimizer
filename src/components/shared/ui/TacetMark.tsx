// Tacet Mark: a mirrored crest sigil (rings, spine, wings, core) whose shape is derived from a seed string
import { tacetMarkShape } from './tacetMarkShape'

// ========== Component: Tacet Mark ============================================================================================

type TacetMarkProps = {
  /** Same seed → same crest; use the character name so every resonator keeps one mark everywhere. */
  seed: string
  size: number
  /** Overall stroke opacity; the mark is drawn in --ui-accent-raw. */
  opacity?: number
  /** Slowly turns the outer broken ring. */
  spin?: boolean
  className?: string
}

export function TacetMark({ seed, size, opacity = 1, spin = false, className }: TacetMarkProps) {
  const s = tacetMarkShape(seed)
  const stroke = (a: number) => `hsl(var(--ui-accent-raw) / ${(a * opacity).toFixed(3)})`

  return (
    <svg className={`ui-tacet${className ? ` ${className}` : ''}`} width={size} height={size} viewBox="-100 -100 200 200" aria-hidden="true">
      {/* Outer broken ring — the gaps sit on the spine so the crest reads as one vertical axis */}
      <g className={spin ? 'ui-tacet-spin' : undefined}>
        {s.outerArcs.map((d, i) => (
          <path key={i} d={d} fill="none" style={{ stroke: stroke(0.55) }} strokeWidth="1.4" strokeLinecap="round" />
        ))}
        {s.ringDots.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="1.8" style={{ fill: stroke(0.7) }} />
        ))}
      </g>

      {/* Inner hairline ring with short ticks */}
      <circle r={s.innerR} fill="none" style={{ stroke: stroke(0.22) }} strokeWidth="0.8" />
      {s.innerTicks.map((t, i) => (
        <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} style={{ stroke: stroke(0.4) }} strokeWidth="0.9" />
      ))}

      {/* Spine with diamond terminals */}
      <line x1="0" y1={-s.spine} x2="0" y2={s.spine} style={{ stroke: stroke(0.5) }} strokeWidth="1" />
      <path d={diamond(0, -s.spine, 4)} style={{ fill: stroke(0.8) }} />
      <path d={diamond(0, s.spine, 3)} style={{ fill: stroke(0.6) }} />

      {/* Wings and crown, drawn once and mirrored */}
      {[1, -1].map(side => (
        <g key={side} transform={`scale(${side} 1)`}>
          {s.wings.map((d, i) => (
            <path key={i} d={d} fill="none" style={{ stroke: stroke(0.9 - i * 0.18) }} strokeWidth={1.8 - i * 0.35} strokeLinecap="round" />
          ))}
          {s.crown.map((d, i) => (
            <path key={`c${i}`} d={d} fill="none" style={{ stroke: stroke(0.6) }} strokeWidth="1.1" strokeLinecap="round" />
          ))}
        </g>
      ))}

      {/* Core */}
      <path d={diamond(0, 0, s.core)} fill="none" style={{ stroke: stroke(0.95) }} strokeWidth="1.5" />
      <path d={diamond(0, 0, s.core * 0.45)} style={{ fill: stroke(0.9) }} />
    </svg>
  )
}

function diamond(cx: number, cy: number, r: number): string {
  return `M ${cx} ${cy - r} L ${cx + r} ${cy} L ${cx} ${cy + r} L ${cx - r} ${cy} Z`
}
