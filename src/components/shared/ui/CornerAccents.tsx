// Four small corner brackets marking a selected / interactive box (parent must be position: relative)

// ========== Component: Corner Accents ========================================================================================

const SIDES = [
  { top: 0, left: 0, borderTop: true, borderLeft: true },
  { top: 0, right: 0, borderTop: true, borderRight: true },
  { bottom: 0, left: 0, borderBottom: true, borderLeft: true },
  { bottom: 0, right: 0, borderBottom: true, borderRight: true },
] as const

export function CornerAccents({ size = 8 }: { size?: number }) {
  const b = '1.5px solid hsl(var(--ui-accent-raw) / 0.4)'
  return (
    <>
      {SIDES.map((s, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: size,
            height: size,
            pointerEvents: 'none',
            top: 'top' in s ? s.top : undefined,
            bottom: 'bottom' in s ? s.bottom : undefined,
            left: 'left' in s ? s.left : undefined,
            right: 'right' in s ? s.right : undefined,
            borderTop: 'borderTop' in s ? b : undefined,
            borderBottom: 'borderBottom' in s ? b : undefined,
            borderLeft: 'borderLeft' in s ? b : undefined,
            borderRight: 'borderRight' in s ? b : undefined,
            borderTopLeftRadius: i === 0 ? 6 : undefined,
            borderTopRightRadius: i === 1 ? 6 : undefined,
            borderBottomLeftRadius: i === 2 ? 6 : undefined,
            borderBottomRightRadius: i === 3 ? 6 : undefined,
          }}
        />
      ))}
    </>
  )
}
