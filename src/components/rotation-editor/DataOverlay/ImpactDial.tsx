// Data overlay impact dial: ring of the active sources (or damage types) around the acting character's crest and the total
import type { DamageEvent } from '../../../types/events'
import { PIE_CHART_COLORS, aggregateDamageByType, aggregateEventsByName, formatDmgType } from './damageMath'
import type { DamageMode } from './damageMath'
import { RingChart, TacetMark } from '../../shared/ui'

const SIZE = 320

type ImpactDialProps = {
  damageEvents: DamageEvent[]
  view: 'events' | 'types'
  mode: DamageMode
  crestSeed: string
  highlightedIndex: number | null
  onSliceHover: (index: number | null) => void
  activeSources: Set<string>
  activeTypes: Set<string>
}

export function ImpactDial({ damageEvents, view, mode, crestSeed, highlightedIndex, onSliceHover, activeSources, activeTypes }: ImpactDialProps) {
  const displayData = view === 'types' ? aggregateDamageByType(damageEvents, mode) : aggregateEventsByName(damageEvents, mode)

  // Segment key = the item's index in the full list, so it cross-highlights with the source ledger
  const isActive = (name: string) => (view === 'events' ? activeSources.has(name) : activeTypes.has(name))
  const segments = displayData
    .map((item, i) => ({ key: String(i), name: item.name, label: view === 'types' ? formatDmgType(item.name) : item.name, value: item.damage, color: PIE_CHART_COLORS[i % PIE_CHART_COLORS.length] }))
    .filter(s => isActive(s.name))
  const total = segments.reduce((s, x) => s + x.value, 0)
  const hovered = highlightedIndex !== null ? segments.find(s => s.key === String(highlightedIndex)) : undefined
  const compact = (v: number) => (v >= 1e6 ? `${(v / 1e6).toFixed(2)}M` : v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toFixed(0))

  return (
    <div className="dataImpactDial">
      <RingChart
        size={SIZE}
        rings={[{ inner: 104, outer: 140, segments }]}
        bezel={148}
        activeKey={hovered?.key ?? null}
        onHover={key => onSliceHover(key === null ? null : Number(key))}>
        <div className="dataImpactCore">
          <TacetMark seed={crestSeed} size={170} opacity={0.4} spin className="dataImpactCrest" />
          <div className="dataImpactReadout">
            {hovered ? (
              <>
                <span className="dataImpactName" style={{ color: hovered.color }}>{hovered.label}</span>
                <span className="dataImpactBig">{total > 0 ? ((hovered.value / total) * 100).toFixed(1) : '0.0'}<small>%</small></span>
                <span className="dataImpactSub">{compact(hovered.value)}</span>
              </>
            ) : (
              <>
                <span className="ui-readout-label">{view === 'events' ? 'Total Damage' : 'Typed Damage'}</span>
                <span className="dataImpactBig">{compact(total)}</span>
                <span className="dataImpactSub">{segments.length} {view === 'events' ? 'sources' : 'types'}</span>
              </>
            )}
          </div>
        </div>
      </RingChart>
    </div>
  )
}
