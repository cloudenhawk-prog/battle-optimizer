// Data overlay "Energy Flow": per-character energy gauges for this row (before → after, change highlighted) + off-field triggers
import type { Snapshot } from '../../../types/snapshot'
import type { ResolvedCharacter } from '../../../types/character'
import { buildTeamAccents } from '../../shared/elementColors'
import { PortraitRing, SectionHeader, accentVar } from '../../shared/ui'

const ENERGY_LABEL: Record<string, string> = {
  energy:            'Resonance',
  concerto:          'Concerto',
  forte:             'Forte',
  forte_divinity:    'Forte (Div.)',
  forte_discord:     'Forte (Disc.)',
  forte_virtue:      'Forte (Virt.)',
  relative_momentum: 'Rel. Momentum',
  conviction:        'Conviction',
  mind:              'Mind',
  chill:             'Chill',
}

const fmt = (v: number) => (Math.abs(v % 1) < 0.05 ? v.toFixed(0) : v.toFixed(1))

function formatEnergyDelta(delta: number): string {
  const rounded = Math.round(delta * 10) / 10
  return `${rounded >= 0 ? '+' : ''}${fmt(rounded)}`
}

type Gauge = { energyType: string; before: number; after: number; max: number }
type CharFlow = { charName: string; image?: string; accent: string; isActing: boolean; gauges: Gauge[] }

export function EnergySection({ snapshot, previousSnapshot, startWithFullEnergy, characters }: {
  snapshot: Snapshot
  previousSnapshot: Snapshot | null
  startWithFullEnergy: boolean
  characters: ResolvedCharacter[]
}) {
  const actingCharacter = snapshot.character
  const accents = buildTeamAccents(characters)

  const flows: CharFlow[] = characters
    .map(char => {
      // First row has no previous snapshot: diff against the starting energies (0, or full resonance energy)
      const prevEnergies: Record<string, number> = previousSnapshot
        ? (previousSnapshot.charactersEnergies?.[char.name] ?? {}) as Record<string, number>
        : Object.fromEntries(Object.keys(char.maxEnergies).map(et => [
            et,
            et === 'energy' && startWithFullEnergy ? (char.maxEnergies.energy ?? 0) : 0,
          ]))
      const currEnergies = (snapshot.charactersEnergies?.[char.name] ?? {}) as Record<string, number>
      const maxes = char.maxEnergies as Record<string, number | undefined>

      const gauges = Object.keys(char.maxEnergies)
        .map(et => ({ energyType: et, before: prevEnergies[et] ?? 0, after: currEnergies[et] ?? 0, max: maxes[et] ?? 0 }))
        .filter(g => Math.abs(g.after - g.before) >= 0.05)  // hide negligible changes

      return { charName: char.name, image: char.image, accent: accents.get(char.name) ?? '', isActing: char.name === actingCharacter, gauges }
    })
    .filter(c => c.gauges.length > 0)
    .sort((a, b) => {
      if (a.isActing && !b.isActing) return -1
      if (!a.isActing && b.isActing) return 1
      return a.charName.localeCompare(b.charName)
    })

  return (
    <section className="ui-section">
      <SectionHeader label="Energy Flow" />
      {flows.length === 0 ? (
        <div className="ui-empty">No energy changes</div>
      ) : (
        flows.map(({ charName, image, accent, isActing, gauges }) => {
          const triggerEvents = snapshot.offFieldTriggerEvents?.[charName] ?? []
          return (
            <div key={charName} className="dataEnergyBlock" style={accentVar(accent)}>
              <div className="dataEnergyHead">
                <PortraitRing name={charName} src={image} size={28} />
                <span className="dataEnergyName">{charName}</span>
                {isActing && <span className="ui-chip">Acting</span>}
              </div>
              {gauges.map(g => <EnergyGauge key={g.energyType} gauge={g} />)}
              {triggerEvents.map((desc, i) => (
                <div key={`trigger-${i}`} className="dataEnergyTrigger">
                  <i className="ui-diamond" /> {desc}
                </div>
              ))}
            </div>
          )
        })
      )}
    </section>
  )
}

/** Track scaled to the energy's max (or the larger value when uncapped); the changed span glows green or red. */
function EnergyGauge({ gauge }: { gauge: Gauge }) {
  const { energyType, before, after, max } = gauge
  const scale = Math.max(max, before, after, 1)
  const lo = (Math.min(before, after) / scale) * 100
  const hi = (Math.max(before, after) / scale) * 100
  const gain = after >= before
  return (
    <div className="dataGauge">
      <div className="dataGaugeTop">
        <span className="ui-stat-label">{ENERGY_LABEL[energyType] ?? energyType.replace(/_/g, ' ')}</span>
        <span className="dataGaugeFlow">
          {fmt(before)} → <b>{fmt(after)}</b>{max > 0 && <span className="dataGaugeMax"> / {fmt(max)}</span>}
        </span>
        <span className={`ui-stat-value ${gain ? 'ui-stat-value--gain' : 'ui-stat-value--cost'}`}>{formatEnergyDelta(after - before)}</span>
      </div>
      <div className="dataGaugeTrack">
        <div className="dataGaugeBase" style={{ width: `${lo}%` }} />
        <div className={`dataGaugeDelta ${gain ? 'is-gain' : 'is-cost'}`} style={{ left: `${lo}%`, width: `max(2px, ${hi - lo}%)` }} />
      </div>
    </div>
  )
}
