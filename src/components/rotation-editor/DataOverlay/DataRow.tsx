// Label/value row with an optional progress bar (preset accent or custom colour) used across the data overlay

export function DataRow({ label, value, barPct, barExcessPct, color = 'cyan', customColor }: { label: React.ReactNode; value: string; barPct?: number; barExcessPct?: number; color?: 'cyan' | 'amber' | 'purple'; customColor?: string }) {
  return (
    <div className="dataRow">
      <div className="dataRowTop">
        <span className="dataRowLabel">{label}</span>
        <span className="dataRowValue" style={customColor ? { color: customColor, textShadow: `0 0 8px ${customColor}` } : undefined}>
          {value}
        </span>
      </div>
      {barPct !== undefined && (
        <div className="dataRowBar">
          {customColor ? (
            <>
              <div className="dataRowBarFill" style={{ width: `${Math.min(barPct, 100)}%`, background: customColor, boxShadow: `0 0 6px ${customColor}` }} />
              {barExcessPct !== undefined && barExcessPct > 0 && <div className="dataRowBarFillExcess" style={{ width: `${barExcessPct}%`, background: customColor, filter: 'brightness(1.3)' }} />}
            </>
          ) : (
            <>
              <div className={`dataRowBarFill ${color}`} style={{ width: `${Math.min(barPct, 100)}%` }} />
              {barExcessPct !== undefined && barExcessPct > 0 && <div className={`dataRowBarFillExcess ${color}`} style={{ width: `${barExcessPct}%` }} />}
            </>
          )}
        </div>
      )}
    </div>
  )
}
