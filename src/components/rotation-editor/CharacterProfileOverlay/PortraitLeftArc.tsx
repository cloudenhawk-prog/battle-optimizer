// Level + element badges on the portrait's left arc
import { seqArcPath, PORTRAIT_ARC_RADIUS } from './portraitGeometry'
import { MUTED, FONT_DISPLAY, FONT_MONO } from './theme'

// ========== Sub-component: Portrait Left Arc (level + element) =============================================================

export function PortraitLeftArc({ level, element, elColor }: { level: number | undefined; element: string; elColor: string }) {
  const R = PORTRAIT_ARC_RADIUS
  const trackPath = seqArcPath(R, 100, 265)

  // Tightly grouped near 180° (pure left): Element at upper-left (138°), Level at lower-left (115°)
  const items = [
    { angle: 138, label: element, isElement: true },
    { angle: 115, label: level !== undefined ? `Lv.${level}` : '—', isElement: false },
  ]

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none' }}>
      {/* SVG arc track — mirrors the right-side track, anchored to portrait center */}
      <svg
        width="190"
        height="360"
        viewBox="-190 -180 190 360"
        style={{
          position: 'absolute',
          right: '50%',
          top: '50%',
          transform: 'translateY(-50%)',
          overflow: 'visible',
          pointerEvents: 'none',
        }}>
        <path d={trackPath} fill="none" stroke="rgba(120, 128, 145, 0.22)" strokeWidth="1" strokeLinecap="round" />
      </svg>

      {/* Badges */}
      {items.map(({ angle, label, isElement }) => {
        const rad = (angle * Math.PI) / 180
        const offsetX = R * Math.cos(rad)
        const offsetY = R * Math.sin(rad)
        return (
          <div
            key={angle}
            style={{
              position: 'absolute',
              left: `calc(50% + ${offsetX}px)`,
              top: `calc(50% + ${offsetY}px)`,
              transform: 'translate(-50%, -50%)',
            }}>
            <span
              style={{
                display: 'block',
                fontFamily: isElement ? FONT_DISPLAY : FONT_MONO,
                fontSize: '0.65rem',
                fontWeight: isElement ? 700 : undefined,
                color: isElement ? `hsl(${elColor})` : MUTED,
                background: isElement ? `hsl(${elColor} / 0.12)` : 'rgba(30, 40, 60, 0.7)',
                border: `1px solid ${isElement ? `hsl(${elColor} / 0.35)` : 'rgba(80, 90, 110, 0.3)'}`,
                borderRadius: 99,
                padding: '1px 8px',
                textTransform: isElement ? ('uppercase' as const) : undefined,
                letterSpacing: isElement ? '0.1em' : '0.04em',
                whiteSpace: 'nowrap',
              }}>
              {label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
