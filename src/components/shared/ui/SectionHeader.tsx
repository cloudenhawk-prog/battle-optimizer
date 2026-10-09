// Centred section label flanked by accent hairlines — the one section header used by every panel

// ========== Component: Section Header ========================================================================================

export function SectionHeader({ label, className }: { label: string; className?: string }) {
  return (
    <div className={`ui-section-header${className ? ` ${className}` : ''}`}>
      <div className="ui-section-header-line" />
      <span className="ui-section-header-label">{label}</span>
      <div className="ui-section-header-line" />
    </div>
  )
}
