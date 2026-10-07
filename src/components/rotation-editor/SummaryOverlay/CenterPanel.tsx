// Summary centre column: Damage/DPS toggle, the two pies (damage share, contribution) and per-character cards
import { useState } from 'react'
import type { DamageEvent } from '../../../types/events'
import type { ActionBreakdownEntry, CharacterSummary, ContributionEntry, ContributionOriginEntry, GlobalDamageEntry } from './summaryTypes'
import { getElementColor } from './theme'
import type { CharColor } from './theme'
import { computeRoleMap } from './characterRoles'
import { PanelHeader } from './PanelHeader'
import { PieSection } from './PieSection'
import type { PieItem } from './PieSection'
import { CharTypeCard } from './CharTypeCard'
import { NegativeStatusesCard } from './NegativeStatusesCard'

type CenterPanelProps = {
  characterSummaries: CharacterSummary[]
  globalDamage: GlobalDamageEntry[]
  totalPassiveDamage: number
  grandTotal: number
  totalDuration: number
  contributionEntries: ContributionEntry[]
  contributionOrigin: ContributionOriginEntry[]
  actionBreakdowns: Map<string, ActionBreakdownEntry[]>
  passiveDamageEvents: DamageEvent[]
  charColorMap: Map<string, CharColor>
}

export function CenterPanel({ characterSummaries, globalDamage, totalPassiveDamage, grandTotal, totalDuration, contributionEntries, contributionOrigin, actionBreakdowns, passiveDamageEvents, charColorMap }: CenterPanelProps) {
  const [pieMode, setPieMode] = useState<'damage' | 'dps'>('damage')
  const isDps = pieMode === 'dps' && totalDuration > 0
  const dpsScale = isDps ? 1 / totalDuration : 1

  const originByChar = new Map(contributionOrigin.map(e => [e.charName, e]))
  // Pie 1: damage share — per character (direct+CA) + pooled field effects
  const pie1Items: PieItem[] = [
    ...characterSummaries
      .filter(c => c.totalCharacterDamage > 0)
      .map(c => {
        const cc = charColorMap.get(c.name) ?? getElementColor(c.element)
        return { name: c.name, value: c.totalCharacterDamage * dpsScale, color: cc.primary, glow: cc.glow }
      }),
    ...(totalPassiveDamage > 0
      ? [{ name: 'Other Sources', value: totalPassiveDamage * dpsScale, color: 'hsl(220 15% 60%)', glow: 'hsl(220 15% 60% / 0.3)' }]
      : []),
  ].filter(item => item.value > 0)

  // Pie 2: contribution attribution — damage attributed to each enabler
  const characterNames = new Set(characterSummaries.map(c => c.name))
  const pie2CharEntries = contributionEntries.filter(c => c.attributedDamage > 0 && characterNames.has(c.name))
  const pie2OtherEntry = contributionEntries.find(c => c.name === '__OTHER__')
  const pie2Total = contributionEntries.reduce((s, c) => s + c.attributedDamage, 0)

  const roleMap = computeRoleMap(characterSummaries, contributionEntries)

  const pie2Items: PieItem[] = [
    ...pie2CharEntries.map(c => {
      const cc = charColorMap.get(c.name) ?? getElementColor(c.element)
      return { name: c.name, value: c.attributedDamage * dpsScale, color: cc.primary, glow: cc.glow }
    }),
    ...(pie2OtherEntry && pie2OtherEntry.attributedDamage > 0
      ? [{ name: 'Other', value: pie2OtherEntry.attributedDamage * dpsScale, color: 'hsl(220 15% 60%)', glow: 'hsl(220 15% 60% / 0.3)' }]
      : []),
  ]

  const pieCenterLabel = isDps ? 'Team DPS' : 'Total'
  const pie1Total = isDps ? grandTotal / totalDuration : grandTotal
  const pie2TotalScaled = isDps ? pie2Total / totalDuration : pie2Total

  return (
    <div className="summaryCenterPanel">
      {/* Pie mode toggle */}
      <div className="summaryPiesToggleRow">
        <button
          className={`summaryBuffViewBtn${pieMode === 'damage' ? ' active' : ''}`}
          onClick={() => setPieMode('damage')}
        >Damage</button>
        <button
          className={`summaryBuffViewBtn${pieMode === 'dps' ? ' active' : ''}`}
          onClick={() => setPieMode('dps')}
        >DPS</button>
      </div>
      {/* Dual pie row */}
      <div className="summaryPiesRow">
        <PieSection
          title="DAMAGE SHARE"
          accent="cyan"
          items={pie1Items}
          total={pie1Total}
          centerLabel={pieCenterLabel}
          subtitle={isDps ? 'Rotation DPS by character' : 'Damage done by each character'}
        />
        <div className="summaryPiesDivider" />
        <PieSection
          title="CONTRIBUTION"
          accent="purple"
          items={pie2Items}
          total={pie2TotalScaled}
          centerLabel={pieCenterLabel}
          subtitle={isDps ? 'Attributed DPS per resonator (buffs credited to buffer)' : 'Damage contribution per Resonator (Shapley-based attribution)'}
        />
      </div>

      {/* Per-character type breakdown cards */}
      <PanelHeader label="RESONATOR BREAKDOWN" accent="cyan" />
      <div className="summaryCharCards">
        {characterSummaries.filter(char => char.totalCharacterDamage > 0 || char.passiveDamage > 0).map(char => (
          <CharTypeCard
            key={char.name}
            summary={char}
            originEntry={originByChar.get(char.name)}
            actionBreakdown={actionBreakdowns.get(char.name)}
            role={roleMap.get(char.name)}
            charColorMap={charColorMap}
          />
        ))}
        {globalDamage.length > 0 && (
          <NegativeStatusesCard globalDamage={globalDamage} grandTotal={grandTotal} passiveDamageEvents={passiveDamageEvents} />
        )}
      </div>
    </div>
  )
}
