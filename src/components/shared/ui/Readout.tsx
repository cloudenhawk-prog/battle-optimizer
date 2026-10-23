// Label-over-value metric block; place several inside `.ui-readouts` for a divided strip

// ========== Component: Readout ===============================================================================================

export function Readout({ label, value, unit, accent = false }: { label: string; value: React.ReactNode; unit?: string; accent?: boolean }) {
  return (
    <div className={`ui-readout${accent ? ' ui-readout--accent' : ''}`}>
      <span className="ui-readout-label">{label}</span>
      <span className="ui-readout-value">
        {value}
        {unit && <span className="ui-readout-unit">{unit}</span>}
      </span>
    </div>
  )
}
