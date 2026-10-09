// Decorative concentric rings (dashed orbit + fading ripples + ticks) drawn behind a centrepiece, as in the gear orbit

// ========== Component: Orbit Rings ===========================================================================================

// Ripple offsets beyond the orbit radius and their stroke opacity — same falloff as the profile's equipment orbit
const RIPPLES = [
  { dr: 22, a: 0.18, w: 0.75 },
  { dr: 52, a: 0.11, w: 0.65 },
  { dr: 94, a: 0.06, w: 0.5 },
  { dr: 152, a: 0.03, w: 0.4 },
]

/** Fills its (position: relative) parent; `radius` is the dashed orbit radius in px from the centre. */
export function OrbitRings({ radius, ticks = 24 }: { radius: number; ticks?: number }) {
  const stroke = (a: number) => `hsl(var(--ui-accent-raw) / ${a})`
  return (
    <svg className="ui-orbit-rings" aria-hidden="true">
      <svg x="50%" y="50%" overflow="visible">
        <circle r={radius} fill="none" style={{ stroke: stroke(0.22) }} strokeWidth="1" strokeDasharray="4 6" />
        {RIPPLES.map(r => (
          <circle key={r.dr} r={radius + r.dr} fill="none" style={{ stroke: stroke(r.a) }} strokeWidth={r.w} />
        ))}
        {Array.from({ length: ticks }).map((_, i) => {
          const rad = ((i * 360) / ticks - 90) * (Math.PI / 180)
          const major = i % 4 === 0
          const len = major ? 10 : 5
          return (
            <line
              key={i}
              x1={Math.cos(rad) * (radius - len / 2)}
              y1={Math.sin(rad) * (radius - len / 2)}
              x2={Math.cos(rad) * (radius + len / 2)}
              y2={Math.sin(rad) * (radius + len / 2)}
              style={{ stroke: stroke(major ? 0.4 : 0.15) }}
              strokeWidth={major ? 1.5 : 1}
            />
          )
        })}
      </svg>
    </svg>
  )
}
