// Summary "Overview" tab: the resonance dial (dealt vs. enabled) on the left, one resonator plate per character on the right
import { useState } from 'react'
import type { RotationSummary } from './computeSummary'
import type { CharColor } from './theme'
import { computeRoleMap } from './characterRoles'
import { buildDialRows } from './dialRows'
import { ResonanceDial } from './ResonanceDial'
import { CharTypeCard } from './CharTypeCard'
import { NegativeStatusesCard } from './NegativeStatusesCard'
import { SectionHeader, SegmentedToggle } from '../../shared/ui'

const DIAL_MODES = [
  { value: 'damage', label: 'Damage' },
  { value: 'dps', label: 'DPS' },
] as const

export function OverviewTab({ summary, charColorMap }: { summary: RotationSummary; charColorMap: Map<string, CharColor> }) {
  const [mode, setMode] = useState<'damage' | 'dps'>('damage')
  const { characterSummaries, contributionEntries, contributionOrigin, actionBreakdowns, globalDamage, grandTotal, passiveDamageEvents, totalDuration } = summary
  const isDps = mode === 'dps' && totalDuration > 0

  const rows = buildDialRows(summary, charColorMap, isDps ? 1 / totalDuration : 1)
  const roles = computeRoleMap(characterSummaries, contributionEntries)
  const originByChar = new Map(contributionOrigin.map(e => [e.charName, e]))
  const dealtByChar = new Map(rows.map(r => [r.key, r.dealt]))
  const resonators = characterSummaries
    .filter(c => c.totalCharacterDamage > 0 || c.passiveDamage > 0)
    .sort((a, b) => (dealtByChar.get(b.name) ?? 0) - (dealtByChar.get(a.name) ?? 0))

  return (
    <>
      <div className="ui-col summaryDialCol">
        <section className="ui-section">
          <SectionHeader label="Damage Distribution" />
          <div className="ui-toolbar">
            <SegmentedToggle options={DIAL_MODES} value={mode} onChange={setMode} />
          </div>
        </section>
        <ResonanceDial rows={rows} roles={roles} centerLabel={isDps ? 'Team DPS' : 'Total Damage'} unit={isDps ? '/s' : undefined} />
      </div>

      <div className="ui-col summaryPlatesCol">
        <section className="ui-section">
          <SectionHeader label="Resonator Breakdown" />
          <div className="summaryPlates">
            {resonators.map(char => (
              <CharTypeCard
                key={char.name}
                summary={char}
                grandTotal={grandTotal}
                originEntry={originByChar.get(char.name)}
                actionBreakdown={actionBreakdowns.get(char.name)}
                role={roles.get(char.name)}
                charColorMap={charColorMap}
              />
            ))}
            {globalDamage.length > 0 && <NegativeStatusesCard globalDamage={globalDamage} grandTotal={grandTotal} passiveDamageEvents={passiveDamageEvents} />}
          </div>
        </section>
      </div>
    </>
  )
}
