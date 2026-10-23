// Data overlay hit profile (hits, normal / crit / expected totals) and the per-hit log, cross-highlighted with the dial
import type { DamageEvent } from '../../../types/events'
import { PIE_CHART_COLORS, formatDmgType, getEventDamage } from './damageMath'
import type { DamageMode } from './damageMath'
import { Readout, SectionHeader } from '../../shared/ui'

const formatInt = (n: number) => Math.round(n).toLocaleString('en-US')
// Dealers are `Name` or `Name: Source`; the source is already the hit name, so show only who dealt it
const dealerName = (dealer: string) => dealer.split(': ')[0]

type HitLogProps = {
  damageEvents: DamageEvent[]
  mode: DamageMode
  rowStart: number
  /** actionName → its index in the source ledger (colour + highlight id) */
  sourceIndex: Map<string, number>
  highlightedIndex: number | null
  onHighlight: (index: number | null) => void
}

export function HitLog({ damageEvents, mode, rowStart, sourceIndex, highlightedIndex, onHighlight }: HitLogProps) {
  const hits = [...damageEvents].sort((a, b) => a.timeStamp - b.timeStamp)
  const normal = hits.reduce((s, e) => s + e.normalStrike, 0)
  const crit = hits.reduce((s, e) => s + getEventDamage(e, 'crit'), 0)
  const expected = hits.reduce((s, e) => s + e.average, 0)

  return (
    <section className="ui-section">
      <SectionHeader label="Hit Profile" />
      <div className="ui-card dataHitProfile">
        <div className="ui-readouts">
          <Readout label="Hits" value={hits.length} />
          <Readout label="Normal" value={formatInt(normal)} />
          <Readout label="Critical" value={formatInt(crit)} />
          <Readout label="Expected" value={formatInt(expected)} accent />
          {normal > 0 && <Readout label="Crit Gain" value={`×${(crit / normal).toFixed(2)}`} />}
        </div>
      </div>

      {hits.length > 0 && (
        <div className="dataHitLog" onMouseLeave={() => onHighlight(null)}>
          <div className="dataHitRow dataHitRow--head">
            <span>Time</span>
            <span>Hit</span>
            <span>Dealer</span>
            <span>Types</span>
            <span>{mode === 'average' ? 'Expected' : mode === 'normal' ? 'Normal' : 'Critical'}</span>
          </div>
          {hits.map((e, i) => {
            const idx = sourceIndex.get(e.actionName) ?? 0
            return (
              <div
                key={i}
                className={`dataHitRow${highlightedIndex === idx ? ' is-active' : ''}`}
                style={{ '--source-color': PIE_CHART_COLORS[idx % PIE_CHART_COLORS.length] } as React.CSSProperties}
                onMouseEnter={() => onHighlight(idx)}>
                <span className="dataHitTime">+{(e.timeStamp - rowStart).toFixed(2)}s</span>
                <span className="dataHitName"><i />{e.actionName}</span>
                <span className="dataHitDealer">{dealerName(e.dealer)}</span>
                <span className="dataHitTypes">{e.dmgTypes.map(formatDmgType).join(' · ')}</span>
                <span className="dataHitValue">{formatInt(getEventDamage(e, mode))}</span>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
