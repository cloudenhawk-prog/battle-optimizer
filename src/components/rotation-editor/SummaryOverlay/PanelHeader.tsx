// Section header used by every summary panel: accent dot, label and trailing rule

export function PanelHeader({ label, accent = 'cyan' }: { label: string; accent?: 'cyan' | 'purple' | 'amber' }) {
  return (
    <div className={`summaryPanelHeader ${accent}`}>
      <div className={`summaryPanelHeaderDot ${accent}`} />
      <span className="summaryPanelHeaderLabel">{label}</span>
      <div className="summaryPanelHeaderLine" />
    </div>
  )
}
