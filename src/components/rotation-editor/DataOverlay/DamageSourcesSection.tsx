// Data overlay source list: per-action (or per-type) damage rows with pie cross-highlight, pinning and toggles
import { useState, useRef } from 'react'
import type { DamageEvent } from '../../../types/events'
import { PIE_CHART_COLORS, aggregateDamageByType, aggregateEventsByName } from './damageMath'
import type { DamageMode } from './damageMath'
import { DataRow } from './DataRow'
import { SourceTooltip } from './SourceTooltip'

/** A source row; `index` is its position in the aggregated list (shared with the pie for highlighting). */
export type DisplayItem = { name: string; damage: number; index: number; count?: number; events?: DamageEvent[]; event?: DamageEvent }

export function DamageSourcesSection({
  damageEvents,
  totalDamage,
  mode,
  view,
  externalHighlightedIndex,
  onRowHighlight,
  activeSources,
  onToggleSource,
  activeTypes,
  onToggleType,
}: {
  damageEvents: DamageEvent[]
  totalDamage: number
  mode: DamageMode
  view: 'events' | 'types'
  externalHighlightedIndex: number | null
  onRowHighlight: (index: number | null) => void
  activeSources?: Set<string>
  onToggleSource?: (name: string) => void
  activeTypes?: Set<string>
  onToggleType?: (type: string) => void
}) {
  const [hoveredItem, setHoveredItem] = useState<DisplayItem | null>(null)
  const [showTooltip, setShowTooltip] = useState(false)
  const [pinnedItem, setPinnedItem] = useState<DisplayItem | null>(null)
  const hoverTimeoutRef = useRef<number | null>(null)

  // Hover shows the tooltip after a short delay; a click pins it (hover is ignored while pinned)
  const handleMouseEnter = (item: DisplayItem) => {
    if (pinnedItem) return
    setHoveredItem(item)
    onRowHighlight(item.index)
    if (hoverTimeoutRef.current !== null) clearTimeout(hoverTimeoutRef.current)
    hoverTimeoutRef.current = window.setTimeout(() => setShowTooltip(true), 100)
  }

  const handleMouseLeave = () => {
    if (pinnedItem) return
    if (hoverTimeoutRef.current !== null) clearTimeout(hoverTimeoutRef.current)
    setHoveredItem(null)
    setShowTooltip(false)
    onRowHighlight(null)
  }

  const handleClick = (item: DisplayItem) => {
    if (pinnedItem && pinnedItem.name === item.name && pinnedItem.index === item.index) {
      setPinnedItem(null)
      setHoveredItem(null)
      setShowTooltip(false)
      onRowHighlight(null)
    } else {
      setPinnedItem(item)
      setHoveredItem(item)
      setShowTooltip(true)
      onRowHighlight(item.index)
    }
  }

  const handleClickAway = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.dataSourceRows') === null) {
      setPinnedItem(null)
      setHoveredItem(null)
      setShowTooltip(false)
    }
  }

  const displayData = view === 'types' ? aggregateDamageByType(damageEvents, mode) : aggregateEventsByName(damageEvents, mode)

  const isItemActive = (name: string) => view === 'events' ? (activeSources?.has(name) ?? true) : (activeTypes?.has(name) ?? true)
  const displayedTotal = displayData.filter(item => isItemActive(item.name)).reduce((sum, item) => sum + item.damage, 0)

  return (
    <div className="dataSectionGroup dataSourcesSection" onClick={handleClickAway}>
      <div className="dataPanelHeader silver">
        <div className="dataPanelHeaderDot silver" />
        <span className="dataPanelHeaderLabel">{view === 'events' ? 'Damage Sources' : 'Damage Types'}</span>
        <div className="dataPanelHeaderLine" />
      </div>

      <div className="dataSourceRows">
        {damageEvents.length === 0 ? (
          <p className="dataEmptyMsg">No damage sources detected</p>
        ) : (
          displayData.map((item, index) => {
            const pct = displayedTotal > 0 ? (item.damage / displayedTotal) * 100 : 0
            const pieColor = PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]
            const isPinned = pinnedItem && pinnedItem.name === item.name && pinnedItem.index === index
            const isExternallyHighlighted = externalHighlightedIndex === index && hoveredItem?.index !== index && pinnedItem?.index !== index
            const count = 'count' in item ? item.count : undefined
            const label = (
              <>
                {item.name}
                {count !== undefined && count > 1 && <span className="dataCountBadge">×{count}</span>}
              </>
            )
            return (
              <div
                key={index}
                className={`dataSourceRow${isPinned ? ' pinned' : ''}${isExternallyHighlighted ? ' externalHighlight' : ''}${!isItemActive(item.name) ? ' inactive' : ''}`}
                onMouseEnter={() => handleMouseEnter({ ...item, index })}
                onMouseLeave={handleMouseLeave}
                onClick={e => {
                  e.stopPropagation()
                  handleClick({ ...item, index })
                }}>
                <div className="dataSourceRowInner">
                  <DataRow label={label} value={`${item.damage.toFixed(0)} (${pct.toFixed(1)}%)`} barPct={pct} customColor={pieColor} />
                  {view === 'events' && activeSources && onToggleSource && (
                    <button
                      className={`dataSourceToggle${activeSources.has(item.name) ? ' active' : ''}`}
                      style={{ '--toggle-color': pieColor } as React.CSSProperties}
                      title={activeSources.has(item.name) ? 'Exclude from buff contributions' : 'Include in buff contributions'}
                      onClick={e => { e.stopPropagation(); onToggleSource(item.name) }}
                    />
                  )}
                  {view === 'types' && activeTypes && onToggleType && (
                    <button
                      className={`dataSourceToggle${activeTypes.has(item.name) ? ' active' : ''}`}
                      style={{ '--toggle-color': pieColor } as React.CSSProperties}
                      title={activeTypes.has(item.name) ? 'Hide this type from pie chart' : 'Show this type in pie chart'}
                      onClick={e => { e.stopPropagation(); onToggleType(item.name) }}
                    />
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Hover/pin tooltip */}
      {hoveredItem && showTooltip && (
        <SourceTooltip hoveredItem={hoveredItem} view={view} totalDamage={totalDamage} />
      )}
    </div>
  )
}
