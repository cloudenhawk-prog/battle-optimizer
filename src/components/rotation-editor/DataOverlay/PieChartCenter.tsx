// Data overlay centre pie: decorative rings/ticks around a pie of the active sources or damage types
import type { DamageEvent } from '../../../types/events'
import { PIE_CHART_COLORS, aggregateDamageByType, aggregateEventsByName, calculatePieSlices } from './damageMath'
import type { DamageMode } from './damageMath'

export function PieChartCenter({ damageEvents, view, mode, highlightedIndex, onSliceHover, activeSources, activeTypes }: { damageEvents: DamageEvent[]; view: 'events' | 'types'; mode: DamageMode; highlightedIndex: number | null; onSliceHover: (index: number | null) => void; activeSources: Set<string>; activeTypes: Set<string> }) {
  if (damageEvents.length === 0) return null

  const displayData = view === 'types' ? aggregateDamageByType(damageEvents, mode) : aggregateEventsByName(damageEvents, mode)

  // Filter to active items only — preserve original indices for cross-highlight sync with source list
  const isItemActive = (item: { name: string }) => view === 'events' ? activeSources.has(item.name) : activeTypes.has(item.name)
  const activePieData = displayData.map((item, idx) => ({ ...item, originalIndex: idx })).filter(isItemActive)
  const filteredTotal = activePieData.reduce((sum, item) => sum + item.damage, 0)
  const formattedDamage = filteredTotal >= 1000 ? `${(filteredTotal / 1000).toFixed(1)}k` : filteredTotal.toFixed(0)

  return (
    <div className="pieChartCenter">
      {/* Outer rotating rings */}
      <div className="pieOuterRing" />
      <div className="pieOuterRingDashed" />

      {/* Outer notches rotating counter-clockwise */}
      <div className="pieOuterNotchContainer">
        {Array.from({ length: 24 }).map((_, i) => (
          <div
            key={i}
            className="pieOuterNotch"
            style={{
              transform: `rotate(${i * 15}deg) translateY(-${185}px)`,
              height: i % 2 === 0 ? '10px' : '6px',
              marginLeft: '-1px',
              marginTop: i % 2 === 0 ? '-5px' : '-3px',
              backgroundColor: i % 2 === 0 ? `rgba(100, 200, 255, ${0.25})` : `rgba(100, 150, 255, ${0.12})`,
              boxShadow: i % 2 === 0 ? '0 0 4px rgba(100, 200, 255, 0.3)' : 'none',
            }}
          />
        ))}
      </div>

      {/* Pie chart SVG — a single slice is drawn as a full circle (an SVG arc cannot span 360°) */}
      {activePieData.length === 0 ? null : activePieData.length === 1 ? (
        <svg viewBox="0 0 200 200" className="pieChartSvg" style={{ overflow: 'visible' }}>
          <circle
            cx="100" cy="100" r="90"
            fill={PIE_CHART_COLORS[activePieData[0].originalIndex % PIE_CHART_COLORS.length]}
            stroke="rgba(30, 30, 40, 0.95)"
            strokeWidth="2"
            className={`pieSlice${highlightedIndex === activePieData[0].originalIndex ? ' highlighted' : ''}`}
            style={{ cursor: 'pointer' }}
            onMouseEnter={() => onSliceHover(activePieData[0].originalIndex)}
            onMouseLeave={() => onSliceHover(null)}
          />
        </svg>
      ) : (
        <svg viewBox="0 0 200 200" className="pieChartSvg" style={{ overflow: 'visible' }}>
          {calculatePieSlices(
            activePieData.map(d => d.damage),
            activePieData.map(d => PIE_CHART_COLORS[d.originalIndex % PIE_CHART_COLORS.length]),
          ).map((slice, sliceIdx) => (
            <path
              key={sliceIdx}
              d={slice.path}
              fill={slice.color}
              stroke="rgba(30, 30, 40, 0.95)"
              strokeWidth="2"
              className={`pieSlice${highlightedIndex === activePieData[sliceIdx].originalIndex ? ' highlighted' : ''}`}
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => onSliceHover(activePieData[sliceIdx].originalIndex)}
              onMouseLeave={() => onSliceHover(null)}
            />
          ))}
        </svg>
      )}

      {/* Inner circle with total damage */}
      <div className="pieInnerCircle">
        <div className="pieLabel">Total Damage</div>
        <div className="piePercentage">{formattedDamage}</div>
      </div>

      {/* Tick marks */}
      <div className="pieTickContainer">
        {Array.from({ length: 36 }).map((_, i) => (
          <div
            key={i}
            className="pieTick"
            style={{
              transform: `rotate(${i * 10}deg) translateY(-${155}px)`,
              height: i % 3 === 0 ? '6px' : '3px',
              marginLeft: '-0.5px',
              marginTop: i % 3 === 0 ? '-3px' : '-1.5px',
              backgroundColor: `rgba(255, 255, 255, ${i % 3 === 0 ? 0.15 : 0.06})`,
            }}
          />
        ))}
      </div>
    </div>
  )
}
