// Summary left column: per-character on-field DPS / field-time cards and energy generation cards
import type { CharacterSummary, EnergyFlowEntry } from './summaryTypes'
import { getElementColor } from './theme'
import type { CharColor } from './theme'
import { formatDamage, formatTime } from './format'
import { PanelHeader } from './PanelHeader'

type LeftPanelProps = {
  characterSummaries: CharacterSummary[]
  charColorMap: Map<string, CharColor>
  energyFlow: EnergyFlowEntry[]
}

export function LeftPanel({ characterSummaries, charColorMap, energyFlow }: LeftPanelProps) {
  const activeChars = characterSummaries.filter(c => c.fieldTime > 0)
  const totalFieldTime = activeChars.reduce((s, c) => s + c.fieldTime, 0)
  const maxOnFieldDps = Math.max(...activeChars.map(c => (c.directDamage + c.caDamage) / c.fieldTime), 1)
  const maxEnergyPerSec = Math.max(...energyFlow.map(e => e.energyGenPerSecond), 1)

  return (
    <div className="summaryLeftPanel">

      {/* ── Field Time & Field DPS ── */}
      <div className="summaryLeftHalf">
        <PanelHeader label="FIELD TIME & DPS" accent="purple" />
        <div className="summaryStatCards">
          {activeChars.map(c => {
            const pct = totalFieldTime > 0 ? (c.fieldTime / totalFieldTime) * 100 : 0
            const onFieldDps = (c.directDamage + c.caDamage) / c.fieldTime
            const dpsPct = (onFieldDps / maxOnFieldDps) * 100
            const theme = charColorMap.get(c.name) ?? getElementColor(c.element)
            return (
              <div
                key={c.name}
                className="summaryStatCard"
                style={{ '--card-color': theme.primary, '--card-glow': theme.glow } as React.CSSProperties}
              >
                <div className="summaryStatCardTop">
                  <span className="summaryStatCardName">{c.name}</span>
                  <span className="summaryStatCardPrimary">{formatDamage(onFieldDps)}/s</span>
                </div>
                <div className="summaryStatCardBars">
                  <div className="summaryStatCardBar">
                    <div className="summaryStatCardBarFill" style={{ width: `${dpsPct}%` }} />
                  </div>
                  <div className="summaryStatCardBar summaryStatCardBarAlt">
                    <div className="summaryStatCardBarFill" style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <span className="summaryStatCardSecondary">{pct.toFixed(0)}% field · {formatTime(c.fieldTime)}</span>
              </div>
            )
          })}
          {totalFieldTime > 0 && (
            <div className="summaryStatCardTotalRow">
              <span className="summaryStatCardTotalLabel">Total rotation</span>
              <span className="summaryStatCardTotalValue">{formatTime(totalFieldTime)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="summaryLeftHalfDivider" />

      {/* ── Energy Generation ── */}
      <div className="summaryLeftHalf">
        <PanelHeader label="ENERGY GENERATION" accent="amber" />
        {energyFlow.length === 0 ? (
          <div className="summaryRightEmpty">No energy data available</div>
        ) : (
          <div className="summaryStatCards">
            {energyFlow.map(entry => {
              const theme = charColorMap.get(entry.name) ?? getElementColor(entry.element)
              const perSecPct = (entry.energyGenPerSecond / maxEnergyPerSec) * 100
              return (
                <div
                  key={entry.name}
                  className="summaryStatCard"
                  style={{ '--card-color': theme.primary, '--card-glow': theme.glow } as React.CSSProperties}
                >
                  <div className="summaryStatCardTop">
                    <span className="summaryStatCardName">{entry.name}</span>
                    <span className="summaryStatCardPrimary">{entry.energyGenPerSecond.toFixed(1)}/s</span>
                  </div>
                  <div className="summaryStatCardBar">
                    <div className="summaryStatCardBarFill" style={{ width: `${perSecPct}%` }} />
                  </div>
                  <span className="summaryStatCardSecondary">{entry.energyGenerated.toFixed(1)} total</span>
                </div>
              )
            })}
          </div>
        )}
      </div>

    </div>
  )
}
