// Gold cog that rolls around the optimizer panel's rounded border (SVG animateMotion along a rounded rect).
import { useState, useRef, useEffect } from 'react'

// ========== Geometry =========================================================================================================

// Build a rounded-rect SVG path string (clockwise, suitable for animateMotion)
function roundedRectPath(x: number, y: number, w: number, h: number, r: number): string {
  const cr = Math.min(r, w / 2, h / 2)
  return [
    `M ${x + cr} ${y}`,
    `H ${x + w - cr}`,
    `A ${cr} ${cr} 0 0 1 ${x + w} ${y + cr}`,
    `V ${y + h - cr}`,
    `A ${cr} ${cr} 0 0 1 ${x + w - cr} ${y + h}`,
    `H ${x + cr}`,
    `A ${cr} ${cr} 0 0 1 ${x} ${y + h - cr}`,
    `V ${y + cr}`,
    `A ${cr} ${cr} 0 0 1 ${x + cr} ${y}`,
    `Z`,
  ].join(' ')
}

// ========== Component ========================================================================================================

export function BoEdgeOrbiter() {
  // ViewBox = "0 0 112 92".
  // Panel border: x=6..106, y=6..86 (100×80 units).
  // Cog center rides R=3 units OUTSIDE the panel border.
  // Cog center rect: x=3, y=3, w=106, h=86.
  // Corner radius of that rect = (panel CSS border-radius in viewBox units) + R.
  //   panel CSS border-radius = 28px (fixed pixels).
  //   1 viewBox unit = svgRenderedWidth / 112 pixels  (since SVG width = 1.12 × panelWidth,
  //   and 112 viewBox units span that full SVG width).
  //   → panelBrInUnits = 28 / (svgPx / 112) = 28 × 112 / svgPx
  //   → cogCenterCr = panelBrInUnits + R

  const R      = 3
  const rInner = 2.49
  const hub    = 0.70
  const bore   = 0.29
  const teeth  = 14
  const tw     = 0.10
  const bw     = 0.17
  const gold   = 'oklch(0.86 0.13 88)'

  const svgRef = useRef<SVGSVGElement>(null)
  const [svgWidthPx, setSvgWidthPx] = useState(1321.6) // default = 1180 × 1.12

  useEffect(() => {
    const el = svgRef.current
    if (!el) return
    const ro = new ResizeObserver(entries => {
      setSvgWidthPx(entries[0].contentRect.width)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Corner radius for the cog-center path in viewBox units
  const panelBrUnits = (28 * 112) / svgWidthPx
  const cogCr        = panelBrUnits + R

  // Rounded rect for the cog center: x=3, y=3, w=106, h=86
  const cogPath = roundedRectPath(3, 3, 106, 86, cogCr)

  // Perimeter of the rounded rect (straight segments + 4 quarter-circle arcs)
  const straightW  = 106 - 2 * cogCr
  const straightH  = 86  - 2 * cogCr
  const perimeter  = 2 * (straightW + straightH) + 2 * Math.PI * cogCr
  // Rolling: full_perimeter / (2π × R) rotations per lap = perimeter / (2π × R) × 360°
  const spinDeg = Math.round((perimeter / (2 * Math.PI * R)) * 360)
  const dur     = '30s'

  return (
    <svg
      ref={svgRef}
      className="buildOptEdgeOrbiter"
      viewBox="0 0 112 92"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        {/* Cog center rides R=3 units outside the panel border, on rounded corners */}
        <path id="bo-cog-path" d={cogPath} fill="none" />

        {/* Bloom glow: blurred copy rendered behind the sharp cog */}
        <filter id="bo-cog-glow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="0.9" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Outer group: animateMotion translates to path position and rotates to path tangent */}
      <g filter="url(#bo-cog-glow)">
        <animateMotion dur={dur} repeatCount="indefinite" rotate="auto">
          <mpath href="#bo-cog-path" />
        </animateMotion>

        {/* Inner group: rolling spin around the cog's own centre (local origin = cog centre) */}
        <g>
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 0 0"
            to={`${spinDeg} 0 0`}
            dur={dur}
            repeatCount="indefinite"
          />

          {/* ── Teeth ── */}
          {Array.from({ length: teeth }, (_, i) => (
            <polygon
              key={i}
              fill={gold}
              transform={`rotate(${(360 / teeth) * i})`}
              points={`${-tw},${-R} ${tw},${-R} ${bw},${-rInner} ${-bw},${-rInner}`}
            />
          ))}

          {/* ── Inner ring (face of body) ── */}
          <circle r={rInner} fill="none" stroke={gold} strokeWidth={0.08} />

          {/* ── Web / spokes (5×) ── */}
          {Array.from({ length: 5 }, (_, i) => (
            <rect
              key={i}
              x={-0.038}
              y={-2.30}
              width={0.077}
              height={1.66}
              fill={gold}
              opacity={0.55}
              transform={`rotate(${(360 / 5) * i})`}
            />
          ))}

          {/* ── Hub disc ── */}
          <circle r={hub} fill={gold} opacity={0.92} />

          {/* ── Bore hole ── */}
          <circle r={bore} fill="var(--bo-bg)" />

          {/* ── Bore detail ring ── */}
          <circle r={bore - 0.05} fill="none" stroke={gold} strokeWidth={0.03} opacity={0.65} />
        </g>
      </g>
    </svg>
  )
}
