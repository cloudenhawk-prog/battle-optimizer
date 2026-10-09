// Summary "Field Presence" tab: per-resonator swimlane timeline of field time, then one plate per resonator with field stats
import type { Snapshot } from '../../../types/snapshot'
import type { RotationSummary } from './computeSummary'
import type { CharColor } from './theme'
import { getElementColor } from './theme'
import { computeFieldSegments } from './rotationStats'
import { formatDamage, formatTime } from './format'
import { PortraitRing, RingChart, SectionHeader, TacetMark, accentVar } from '../../shared/ui'

/** Largest "nice" step that keeps the axis at <= 16 ticks. */
function tickStep(duration: number): number {
  return [0.5, 1, 2, 5, 10, 20, 30, 60].find(s => duration / s <= 16) ?? 60
}

type FieldPresenceTabProps = { summary: RotationSummary; snapshots: Snapshot[]; charColorMap: Map<string, CharColor> }

export function FieldPresenceTab({ summary, snapshots, charColorMap }: FieldPresenceTabProps) {
  const { characterSummaries, energyFlow, totalDuration } = summary
  const segments = computeFieldSegments(snapshots)
  const span = Math.max(totalDuration, ...segments.map(s => s.to), 0.01)
  const energyByName = new Map(energyFlow.map(e => [e.name, e]))
  const roster = characterSummaries.filter(c => c.fieldTime > 0 || energyByName.has(c.name))
  const totalFieldTime = roster.reduce((s, c) => s + c.fieldTime, 0)
  const colorOf = (name: string, element: string) => (charColorMap.get(name) ?? getElementColor(element)).raw
  const step = tickStep(span)
  const ticks = Array.from({ length: Math.floor(span / step) + 1 }, (_, i) => i * step)
  const at = (t: number) => `${(t / span) * 100}%`

  return (
    <div className="ui-col summaryFieldCol">
      <section className="ui-section">
        <SectionHeader label="Field Timeline" />
        <div className="summaryTimeline">
          {/* Gridlines span every lane */}
          <div className="summaryTimelineGrid" aria-hidden="true">
            {ticks.map(t => <i key={t} style={{ left: at(t) }} />)}
          </div>

          {roster.map(c => (
            <div key={c.name} className="summaryLane" style={accentVar(colorOf(c.name, c.element))}>
              <div className="summaryLaneId">
                <PortraitRing name={c.name} src={c.image} size={32} />
                <span className="summaryLaneName">{c.name}</span>
              </div>
              <div className="summaryLaneTrack">
                {segments.filter(s => s.character === c.name).map((s, i) => (
                  <div key={i} className="summaryLaneSeg" style={{ left: at(s.from), width: `max(2px, ${((s.to - s.from) / span) * 100}%)` }} title={`${s.action} · ${formatTime(s.from)} – ${formatTime(s.to)}`}>
                    <span>{s.action}</span>
                  </div>
                ))}
              </div>
              <span className="summaryLaneTotal">{formatTime(c.fieldTime)}</span>
            </div>
          ))}

          {/* Combined strip: who held the field, in order */}
          <div className="summaryLane summaryLane--combined">
            <div className="summaryLaneId"><span className="summaryLaneName">On Field</span></div>
            <div className="summaryLaneTrack">
              {segments.map((s, i) => {
                const c = roster.find(r => r.name === s.character)
                return <div key={i} className="summaryLaneSeg" style={{ ...accentVar(c ? colorOf(c.name, c.element) : '220 15% 60%'), left: at(s.from), width: `max(2px, ${((s.to - s.from) / span) * 100}%)` }} title={`${s.character} · ${s.action}`} />
              })}
            </div>
            <span className="summaryLaneTotal">{formatTime(span)}</span>
          </div>

          <div className="summaryAxis">
            <div className="summaryLaneId" />
            <div className="summaryAxisTrack">
              {ticks.map(t => <span key={t} style={{ left: at(t) }}>{t}s</span>)}
            </div>
            <span className="summaryLaneTotal" />
          </div>
        </div>
      </section>

      <section className="ui-section">
        <SectionHeader label="Resonators" />
        <div className="summaryRoster">
          {roster.map(c => {
            const raw = colorOf(c.name, c.element)
            const energy = energyByName.get(c.name)
            const fieldPct = totalFieldTime > 0 ? (c.fieldTime / totalFieldTime) * 100 : 0
            const onFieldDps = c.fieldTime > 0 ? (c.directDamage + c.caDamage) / c.fieldTime : 0
            const casts = segments.filter(s => s.character === c.name).length
            return (
              <div key={c.name} className="ui-plate summaryRosterPlate" style={accentVar(raw)}>
                <TacetMark seed={c.name} size={200} className="ui-plate-watermark" />
                <div className="summaryRosterTop">
                  <RingChart size={104} rings={[{ inner: 40, outer: 48, segments: [{ key: 'on', value: c.fieldTime, color: `hsl(${raw})` }, { key: 'off', value: Math.max(totalFieldTime - c.fieldTime, 0), color: 'transparent' }] }]}>
                    <PortraitRing name={c.name} src={c.image} size={68} />
                  </RingChart>
                  <div className="summaryRosterId">
                    <span className="summaryPlateName">{c.name}</span>
                    <span className="summaryPlateShareValue">{fieldPct.toFixed(0)}<small>%</small></span>
                    <span className="ui-readout-label">of field time</span>
                  </div>
                </div>
                <div className="summaryRosterStats">
                  <StatRow label="Field Time" value={formatTime(c.fieldTime)} plain />
                  <StatRow label="On-field DPS" value={`${formatDamage(onFieldDps)}/s`} />
                  <StatRow label="Actions" value={String(casts)} plain />
                  {energy && <StatRow label="Energy Regen" value={`${energy.energyGenPerSecond.toFixed(1)}/s`} />}
                  {energy && <StatRow label="Energy Gained" value={energy.energyGenerated.toFixed(1)} plain />}
                  {c.libCount > 0 && <StatRow label="Liberations" value={String(c.libCount)} plain />}
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}

function StatRow({ label, value, plain = false }: { label: string; value: string; plain?: boolean }) {
  return (
    <div className="ui-stat-row">
      <span className="ui-stat-label">{label}</span>
      <span className={`ui-stat-value${plain ? ' ui-stat-value--plain' : ''}`}>{value}</span>
    </div>
  )
}
