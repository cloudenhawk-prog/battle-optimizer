// Decorative SVG glyphs for the build optimizer (cog, triquetra, diamond, cross).

// ========== SVG Icons ========================================================================================================

export function BoCog({
  size = 100,
  teeth = 14,
  className,
}: {
  size?: number
  teeth?: number
  className?: string
}) {
  const cx = 50, cy = 50, rOuter = 47, rInner = 39, hub = 11, bore = 4.5
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className} aria-hidden="true">
      {Array.from({ length: teeth }, (_, i) => {
        const angle = (360 / teeth) * i
        const yTop = cy - rOuter, yBot = cy - rInner + 0.5
        return (
          <polygon
            key={i}
            fill="currentColor"
            transform={`rotate(${angle} ${cx} ${cy})`}
            points={`${cx - 1.6},${yTop} ${cx + 1.6},${yTop} ${cx + 2.6},${yBot} ${cx - 2.6},${yBot}`}
          />
        )
      })}
      <circle cx={cx} cy={cy} r={rInner} fill="none" stroke="currentColor" strokeWidth={1.1} />
      {Array.from({ length: 5 }, (_, i) => (
        <rect
          key={i}
          x={cx - 0.6}
          y={cy - rInner + 3}
          width={1.2}
          height={rInner - hub - 2}
          fill="currentColor"
          opacity={0.45}
          transform={`rotate(${(360 / 5) * i} ${cx} ${cy})`}
        />
      ))}
      <circle cx={cx} cy={cy} r={hub} fill="currentColor" opacity={0.9} />
      <circle cx={cx} cy={cy} r={bore} fill="var(--bo-bg)" />
    </svg>
  )
}

export function BoTriquetra({ size = 36, className }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} className={className} aria-hidden="true">
      <g stroke="currentColor" fill="none" strokeWidth="1">
        <circle cx="20" cy="14" r="7" />
        <circle cx="13" cy="25" r="7" />
        <circle cx="27" cy="25" r="7" />
        <circle cx="20" cy="21" r="2" fill="currentColor" />
      </g>
    </svg>
  )
}

export function BoDiamond({ size = 14, className }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} className={className} aria-hidden="true">
      <g transform="rotate(45 20 20)">
        <rect x="6" y="6" width="28" height="28" rx="3" fill="none" stroke="currentColor" strokeWidth="1" />
        <rect x="17" y="17" width="6" height="6" rx="0.8" fill="currentColor" />
      </g>
    </svg>
  )
}

export function BoCross({ size = 14, className }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} className={className} aria-hidden="true">
      <g stroke="currentColor" fill="none" strokeWidth="1">
        <path d="M20 4 L20 36 M4 20 L36 20" />
        <circle cx="20" cy="20" r="6" />
      </g>
      <circle cx="20" cy="20" r="1.6" fill="currentColor" />
    </svg>
  )
}
