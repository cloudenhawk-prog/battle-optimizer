// Data overlay "Energy Delta": per-character energy changes on this row (acting character first) + off-field triggers
import type { Snapshot } from '../../../types/snapshot'
import type { ResolvedCharacter } from '../../../types/character'

const ENERGY_LABEL: Record<string, string> = {
  energy:            'RESONANCE',
  concerto:          'CONCERTO',
  forte:             'FORTE',
  forte_divinity:    'FORTE (DIV.)',
  forte_discord:     'FORTE (DISC.)',
  forte_virtue:      'FORTE (VIRT.)',
  relative_momentum: 'REL. MOMENTUM',
  conviction:        'CONVICTION',
  mind:              'MIND',
  chill:             'CHILL',
}

const CHAR_ELEMENT_COLORS: Record<string, string> = {
  AERO:    'hsl(160 80% 55%)',
  SPECTRO: 'hsl(45 90% 62%)',
  HAVOC:   'hsl(270 80% 65%)',
  ELECTRO: 'hsl(292 82% 70%)',
  GLACIO:  'hsl(200 80% 67%)',
  FUSION:  'hsl(15 90% 62%)',
  '':      'hsl(220 15% 60%)',
}

function formatEnergyDelta(delta: number): string {
  const rounded = Math.round(delta * 10) / 10
  const sign = rounded >= 0 ? '+' : ''
  return `${sign}${rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1)}`
}

export function EnergySection({ snapshot, previousSnapshot, startWithFullEnergy, characters }: {
  snapshot: Snapshot
  previousSnapshot: Snapshot | null
  startWithFullEnergy: boolean
  characters: ResolvedCharacter[]
}) {
  const actingCharacter = snapshot.character

  type CharDelta = { charName: string; element: string; isActing: boolean; deltas: { energyType: string; delta: number }[] }

  const charDeltas: CharDelta[] = characters
    .map(char => {
      // First row has no previous snapshot: diff against the starting energies (0, or full resonance energy)
      const prevEnergies: Record<string, number> = previousSnapshot
        ? (previousSnapshot.charactersEnergies?.[char.name] ?? {}) as Record<string, number>
        : Object.fromEntries(Object.keys(char.maxEnergies).map(et => [
            et,
            et === 'energy' && startWithFullEnergy ? (char.maxEnergies.energy ?? 0) : 0,
          ]))
      const currEnergies = (snapshot.charactersEnergies?.[char.name] ?? {}) as Record<string, number>
      const energyTypes = Object.keys(char.maxEnergies)

      const deltas = energyTypes
        .map(et => ({ energyType: et, delta: (currEnergies[et] ?? 0) - (prevEnergies[et] ?? 0) }))
        .filter(d => Math.abs(d.delta) >= 0.05)  // hide negligible changes

      return { charName: char.name, element: char.element as string, isActing: char.name === actingCharacter, deltas }
    })
    .filter(c => c.deltas.length > 0)
    .sort((a, b) => {
      if (a.isActing && !b.isActing) return -1
      if (!a.isActing && b.isActing) return 1
      return a.charName.localeCompare(b.charName)
    })

  return (
    <div className="dataSectionGroup">
      <div className="dataPanelHeader amber">
        <div className="dataPanelHeaderDot amber" />
        <span className="dataPanelHeaderLabel">Energy Delta</span>
        <div className="dataPanelHeaderLine" />
      </div>
      {charDeltas.length === 0 ? (
        <p className="dataEmptyMsg">No energy changes</p>
      ) : (
        charDeltas.map(({ charName, element, isActing, deltas }) => {
          const color = CHAR_ELEMENT_COLORS[element] ?? CHAR_ELEMENT_COLORS['']
          const triggerEvents = snapshot.offFieldTriggerEvents?.[charName] ?? []
          return (
            <div key={charName} className="dataEnergyCharBlock">
              <div className="dataEnergyCharHeader">
                <span className="dataEnergyCharName" style={{ color, textShadow: `0 0 8px ${color}` }}>
                  {charName}
                </span>
                {isActing && <span className="dataEnergyActingBadge">acting</span>}
              </div>
              {deltas.map(({ energyType, delta }) => (
                <div key={energyType} className="dataEnergyRow">
                  <span className="dataEnergyLabel">{ENERGY_LABEL[energyType] ?? energyType.toUpperCase()}</span>
                  <span className={`dataEnergyDelta ${delta >= 0 ? 'gain' : 'cost'}`}>
                    {formatEnergyDelta(delta)}
                  </span>
                </div>
              ))}
              {triggerEvents.map((desc, i) => (
                <div key={`trigger-${i}`} className="dataEnergyTriggerNote">
                  ⚡ {desc}
                </div>
              ))}
            </div>
          )
        })
      )}
    </div>
  )
}
