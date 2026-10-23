// Summary "Buff Coverage" tab: limited-duration buffs grouped by owner, each with damage coverage and time uptime
import { useState } from 'react'
import type { RotationSummary } from './computeSummary'
import type { BuffUptimeEntry } from './summaryTypes'
import type { CharColor } from './theme'
import { getElementColor } from './theme'
import { buffIconPath } from './format'
import { renderBuffRowTooltip } from './BuffRowTooltip'
import { PortraitRing, SectionHeader, TacetMark, accentVar } from '../../shared/ui'

const SHARED = 'Shared'

type BuffCoverageTabProps = { summary: RotationSummary; charColorMap: Map<string, CharColor> }

export function BuffCoverageTab({ summary, charColorMap }: BuffCoverageTabProps) {
  const { buffUptime, modifierInfoMap, characterSummaries } = summary
  const [tooltip, setTooltip] = useState<{ entry: BuffUptimeEntry; rect: DOMRect } | null>(null)

  // Owners in team order, ownerless buffs last
  const groups = new Map<string, BuffUptimeEntry[]>()
  for (const c of characterSummaries) groups.set(c.name, [])
  for (const e of buffUptime) {
    const owner = e.ownerCharacter ?? SHARED
    if (!groups.has(owner)) groups.set(owner, [])
    groups.get(owner)!.push(e)
  }
  const ownerGroups = [...groups.entries()].filter(([, entries]) => entries.length > 0)

  return (
    <div className="ui-col summaryBuffCol">
      <section className="ui-section">
        <SectionHeader label="Buff Coverage" />
        <div className="summaryBuffKey">
          <span><i className="summaryBuffKeyBar" /><b>Coverage</b> share of team damage dealt while the buff was active</span>
          <span><i className="summaryBuffKeyBar summaryBuffKeyBar--uptime" /><b>Uptime</b> share of rotation time it was active</span>
        </div>

        {ownerGroups.length === 0 ? (
          <div className="ui-empty">No limited-duration buffs</div>
        ) : (
          <div className="summaryBuffGroups">
            {ownerGroups.map(([owner, entries]) => {
              const who = characterSummaries.find(c => c.name === owner)
              const raw = (charColorMap.get(owner) ?? getElementColor(entries[0].ownerElement)).raw
              return (
                <div key={owner} className="ui-plate summaryBuffGroup" style={accentVar(raw)}>
                  <TacetMark seed={owner} size={180} className="ui-plate-watermark summaryBuffWatermark" />
                  <div className="summaryBuffGroupHead">
                    {who ? <PortraitRing name={owner} src={who.image} size={40} /> : <i className="ui-diamond" />}
                    <span className="summaryPlateName">{owner}</span>
                    <span className="ui-chip ui-chip--muted">{entries.length} buff{entries.length > 1 ? 's' : ''}</span>
                  </div>
                  <div className="summaryBuffRows">
                    {entries.map(entry => (
                      <div
                        key={entry.key}
                        className="summaryBuffRow"
                        onMouseEnter={e => setTooltip({ entry, rect: e.currentTarget.getBoundingClientRect() })}
                        onMouseLeave={() => setTooltip(null)}>
                        <div className="summaryBuffIconBox">
                          <img
                            src={buffIconPath(entry.displayName)}
                            alt=""
                            className="summaryBuffIconImg"
                            onError={e => {
                              e.currentTarget.style.display = 'none'
                              const dot = e.currentTarget.nextElementSibling as HTMLElement
                              if (dot) dot.style.display = 'block'
                            }}
                          />
                          <i className="ui-diamond" style={{ display: 'none' }} />
                        </div>
                        <span className="summaryBuffName">{entry.displayName}</span>
                        <div className="summaryBuffMeters">
                          <Meter pct={entry.coveragePct} />
                          <Meter pct={entry.timeUptimePct} uptime />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {tooltip && renderBuffRowTooltip(tooltip.entry, tooltip.rect, modifierInfoMap, charColorMap)}
    </div>
  )
}

function Meter({ pct, uptime = false }: { pct: number; uptime?: boolean }) {
  return (
    <div className={`summaryBuffMeter${uptime ? ' summaryBuffMeter--uptime' : ''}`}>
      <div className="ui-bar"><div className="ui-bar-fill" style={{ width: `${Math.min(pct, 100)}%` }} /></div>
      <span>{pct.toFixed(0)}%</span>
    </div>
  )
}
