// Small decorative pieces: gradient section header and corner accent brackets

// ========== Sub-component: Section Header ====================================================================================

export function SectionHeader({ label, elColor }: { label: string; elColor: string }) {
  return (
    <div className="cpo-section-header">
      <div className="cpo-section-header-line" style={{ background: `linear-gradient(90deg, hsl(${elColor} / 0.3), transparent)` }} />
      <span className="cpo-section-header-label">{label}</span>
      <div className="cpo-section-header-line" style={{ background: `linear-gradient(90deg, transparent, hsl(${elColor} / 0.3))` }} />
    </div>
  )
}

// ========== Sub-component: Corner Accents ====================================================================================

export function CornerAccents({ elColor }: { elColor: string }) {
  const b = `1.5px solid hsl(${elColor} / 0.4)`
  return (
    <>
      <div style={{ position: 'absolute', top: 0, left: 0, width: 8, height: 8, borderTop: b, borderLeft: b, borderTopLeftRadius: 6, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: 0, right: 0, width: 8, height: 8, borderTop: b, borderRight: b, borderTopRightRadius: 6, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, width: 8, height: 8, borderBottom: b, borderLeft: b, borderBottomLeftRadius: 6, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: 0, right: 0, width: 8, height: 8, borderBottom: b, borderRight: b, borderBottomRightRadius: 6, pointerEvents: 'none' }} />
    </>
  )
}
