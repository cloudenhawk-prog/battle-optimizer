// Hover/pin tooltip for a damage-source row: hit count, dealer/target, per-hit and normal/crit split, or type share
import { PIE_CHART_COLORS } from './damageMath'
import type { DisplayItem } from './DamageSourcesSection'

export function SourceTooltip({ hoveredItem, view, totalDamage }: { hoveredItem: DisplayItem; view: 'events' | 'types'; totalDamage: number }) {
  return (
    <div
      className="dataSourceTooltip"
      style={{ '--tooltip-color': PIE_CHART_COLORS[hoveredItem.index % PIE_CHART_COLORS.length] } as React.CSSProperties}>
      <div className="dataTooltipAccent" style={{ background: `linear-gradient(to right, ${PIE_CHART_COLORS[hoveredItem.index % PIE_CHART_COLORS.length]}, transparent)` }} />
      <div className="dataTooltipTitle" style={{ color: PIE_CHART_COLORS[hoveredItem.index % PIE_CHART_COLORS.length] }}>
        {hoveredItem.name}
      </div>
      <div className="dataTooltipDivider" />
      {view === 'events' &&
        (() => {
          const representativeEvent = hoveredItem.events?.[0] ?? hoveredItem.event
          const hitCount = hoveredItem.count ?? 1
          if (!representativeEvent) return null
          const perHit = hitCount > 1 ? hoveredItem.damage / hitCount : null
          return (
            <>
              {hitCount > 1 && (
                <div className="dataTooltipRow">
                  <span className="dataTooltipLabel">Hits</span>
                  <span className="dataTooltipValue dataTooltipHighlight" style={{ color: PIE_CHART_COLORS[hoveredItem.index % PIE_CHART_COLORS.length] }}>
                    ×{hitCount}
                  </span>
                </div>
              )}
              <div className="dataTooltipRow">
                <span className="dataTooltipLabel">Dealer</span>
                <span className="dataTooltipValue">{representativeEvent.dealer}</span>
              </div>
              <div className="dataTooltipRow">
                <span className="dataTooltipLabel">Target</span>
                <span className="dataTooltipValue">{representativeEvent.target}</span>
              </div>
              <div className="dataTooltipRow">
                <span className="dataTooltipLabel">{hitCount > 1 ? 'Total Damage' : 'Avg Damage'}</span>
                <span className="dataTooltipValue dataTooltipHighlight" style={{ color: PIE_CHART_COLORS[hoveredItem.index % PIE_CHART_COLORS.length] }}>
                  {hoveredItem.damage.toFixed(0)}
                </span>
              </div>
              {perHit !== null && (
                <div className="dataTooltipRow">
                  <span className="dataTooltipLabel">Per Hit</span>
                  <span className="dataTooltipValue">{perHit.toFixed(0)}</span>
                </div>
              )}
              {hitCount === 1 && (
                <>
                  <div className="dataTooltipRow">
                    <span className="dataTooltipLabel">Normal Hit</span>
                    <span className="dataTooltipValue">{representativeEvent.normalStrike.toFixed(0)}</span>
                  </div>
                  <div className="dataTooltipRow">
                    <span className="dataTooltipLabel">Critical Hit</span>
                    <span className="dataTooltipValue">{representativeEvent.criticalStrike.toFixed(0)}</span>
                  </div>
                </>
              )}
              {representativeEvent.elements.length > 0 && (
                <div className="dataTooltipRow">
                  <span className="dataTooltipLabel">Elements</span>
                  <span className="dataTooltipValue">{representativeEvent.elements.join(', ')}</span>
                </div>
              )}
              <div className="dataTooltipRow">
                <span className="dataTooltipLabel">Damage Types</span>
                <span className="dataTooltipValue">{representativeEvent.dmgTypes.join(', ')}</span>
              </div>
            </>
          )
        })()}
      {view === 'types' && (
        <>
          <div className="dataTooltipRow">
            <span className="dataTooltipLabel">Total Damage</span>
            <span className="dataTooltipValue dataTooltipHighlight" style={{ color: PIE_CHART_COLORS[hoveredItem.index % PIE_CHART_COLORS.length] }}>
              {hoveredItem.damage.toFixed(0)}
            </span>
          </div>
          <div className="dataTooltipRow">
            <span className="dataTooltipLabel">Percentage</span>
            <span className="dataTooltipValue dataTooltipHighlight" style={{ color: PIE_CHART_COLORS[hoveredItem.index % PIE_CHART_COLORS.length] }}>
              {((hoveredItem.damage / totalDamage) * 100).toFixed(1)}%
            </span>
          </div>
        </>
      )}
    </div>
  )
}
