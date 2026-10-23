// Data overlay source ledger: per-action (or per-type) damage rows with dial cross-highlight, pinning and swatch toggles
import { useState, useRef } from 'react'
import type { DamageEvent } from '../../../types/events'
import { PIE_CHART_COLORS, aggregateDamageByType, aggregateEventsByName, formatDmgType } from './damageMath'
import type { DamageMode } from './damageMath'
import { SourceTooltip } from './SourceTooltip'
import { SectionHeader } from '../../shared/ui'

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
    <section className="ui-section dataSourcesSection" onClick={handleClickAway}>
      <SectionHeader label={view === 'events' ? 'Damage Sources' : 'Damage Types'} />

      <div className="dataSourceRows">
        {damageEvents.length === 0 ? (
          <div className="ui-empty">No damage sources</div>
        ) : (
          displayData.map((item, index) => {
            const pct = displayedTotal > 0 ? (item.damage / displayedTotal) * 100 : 0
            const pieColor = PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]
            const isPinned = pinnedItem && pinnedItem.name === item.name && pinnedItem.index === index
            const isExternallyHighlighted = externalHighlightedIndex === index && hoveredItem?.index !== index && pinnedItem?.index !== index
            const count = 'count' in item ? item.count : undefined
            const active = isItemActive(item.name)
            // The swatch is the on/off switch: events → excluded from modifier contributions, types → hidden from the dial
            const onToggle = view === 'events' ? onToggleSource : onToggleType
            const toggleTitle = view === 'events'
              ? (active ? 'Exclude from modifier contributions' : 'Include in modifier contributions')
              : (active ? 'Hide this type from the dial' : 'Show this type in the dial')
            return (
              <div
                key={index}
                className={`dataSourceRow${isPinned ? ' pinned' : ''}${isExternallyHighlighted ? ' externalHighlight' : ''}${!active ? ' inactive' : ''}`}
                style={{ '--source-color': pieColor } as React.CSSProperties}
                onMouseEnter={() => handleMouseEnter({ ...item, index })}
                onMouseLeave={handleMouseLeave}
                onClick={e => {
                  e.stopPropagation()
                  handleClick({ ...item, index })
                }}>
                <button
                  type="button"
                  className={`dataSourceSwatch${active ? ' active' : ''}`}
                  title={toggleTitle}
                  disabled={!onToggle}
                  onClick={e => { e.stopPropagation(); onToggle?.(item.name) }}
                />
                <span className="dataSourceName">
                  {view === 'types' ? formatDmgType(item.name) : item.name}
                  {count !== undefined && count > 1 && <span className="dataCountBadge">×{count}</span>}
                </span>
                <span className="dataSourceValue">{Math.round(item.damage).toLocaleString('en-US')}</span>
                <span className="dataSourcePct">{pct.toFixed(1)}%</span>
                <div className="ui-bar dataSourceBar">
                  <div className="ui-bar-fill" style={{ width: `${Math.min(pct, 100)}%`, background: pieColor, boxShadow: `0 0 6px ${pieColor}` }} />
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
    </section>
  )
}
