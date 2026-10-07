// Data overlay "Modifier Contributions": Shapley value per modifier with toggles, filters and a detail tooltip
import { useState, useMemo } from 'react'
import type { Snapshot } from '../../../types/snapshot'
import type { DamageEvent } from '../../../types/events'
import type { ResolvedCharacter } from '../../../types/character'
import { StatusDetailPanel } from '../StatusDetailPanel'
import type { DamageMode } from './damageMath'
import { buildModifierMap } from './modifierMap'
import { computeModifierShapley } from './shapley'
import { buildContribStatusInfo } from './contribStatusInfo'

export function ContributionsSection({ damageEvents, mode, characters, snapshot, activeSources, activeContribs, onToggleContrib, onToggleAllContribs, contribGroupKeys }: { damageEvents: DamageEvent[]; mode: DamageMode; characters: ResolvedCharacter[]; snapshot: Snapshot | null; activeSources: Set<string>; activeContribs: Set<string>; onToggleContrib: (key: string) => void; onToggleAllContribs: () => void; contribGroupKeys: Set<string> }) {
  const [hideInherent, setHideInherent] = useState(false)
  const [hideZero, setHideZero] = useState(false)
  const [tooltipState, setTooltipState] = useState<{ index: number; rect: DOMRect } | null>(null)

  const modifierMap = useMemo(() => buildModifierMap(characters), [characters])

  // Memoize the entire Shapley computation so tooltip hover re-renders (setTooltipState)
  // don't re-run the calculation — which would produce different Monte Carlo results each time.
  const { metaMap, marginalMap } = useMemo(
    () => computeModifierShapley(damageEvents, activeSources, activeContribs, mode),
    [damageEvents, activeSources, activeContribs, mode],
  )

  let contributionsList = Object.keys(metaMap).map(key => ({
    key,
    ...metaMap[key],
    rawDamage: marginalMap[key]?.rawDamage ?? 0,
    pct:       marginalMap[key]?.pct       ?? 0,
  }))

  if (hideInherent) contributionsList = contributionsList.filter(c => !c.isInherent)
  if (hideZero) contributionsList = contributionsList.filter(c => c.rawDamage > 0)

  contributionsList.sort((a, b) => b.rawDamage - a.rawDamage)

  const maxValue = contributionsList.reduce((max, c) => Math.max(max, c.rawDamage), 0)

  return (
    <div className="dataSectionGroup">
      <div className="dataPanelHeader purple">
        <div className="dataPanelHeaderDot purple" />
        <span className="dataPanelHeaderLabel">Modifier Contributions</span>
        <div className="dataPanelHeaderLine" />
      </div>

      <div className="dataContribFilterBar">
        <span className="dataContribFilterLabel">Show:</span>
        <button
          className={`dataContribFilterBtn${!hideInherent ? ' active amber' : ''}`}
          onClick={() => setHideInherent(p => !p)}
          title={hideInherent ? 'Show inherent modifiers' : 'Hide inherent modifiers'}>
          Inherent
        </button>
        <button
          className={`dataContribFilterBtn${!hideZero ? ' active cyan' : ''}`}
          onClick={() => setHideZero(p => !p)}
          title={hideZero ? 'Show zero-contribution modifiers' : 'Hide zero-contribution modifiers'}>
          Zeros
        </button>
        <button
          className={`dataContribFilterBtn dataContribToggleAllBtn${activeContribs.size >= contribGroupKeys.size ? ' active' : ''}`}
          onClick={onToggleAllContribs}
          title={activeContribs.size >= contribGroupKeys.size ? 'Disable all buffs' : 'Enable all buffs'}>
          {activeContribs.size >= contribGroupKeys.size ? 'All On' : 'All Off'}
        </button>
      </div>

      {contributionsList.length === 0 ? (
        <p className="dataEmptyMsg">No modifier contributions detected</p>
      ) : (
        <div className="dataContribList">
          {contributionsList.map((contrib, index) => {
            const damageValue = contrib.rawDamage
            const percentValue = contrib.pct
            const barPct = maxValue > 0 ? (damageValue / maxValue) * 100 : 0
            const isInherent = !!contrib.isInherent
            const isZero = damageValue === 0 && !isInherent
            const colorClass = isInherent ? ' amber' : isZero ? ' cyan' : ''
            const contribKey = contrib.key
            const isActive = activeContribs.has(contribKey)

            return (
              <div
                key={index}
                className={`dataContribRow${!isActive ? ' inactive' : ''}`}
                onMouseEnter={e => setTooltipState({ index, rect: (e.currentTarget as HTMLDivElement).getBoundingClientRect() })}
                onMouseLeave={() => setTooltipState(null)}
                onClick={() => onToggleContrib(contribKey)}>
                <button
                  className={`dataContribToggle${isActive ? ' active' : ''}${colorClass}`}
                  title={isActive ? 'Remove this buff from damage calculation' : 'Include this buff in damage calculation'}
                />
                <div className="dataContribContent">
                  <div className="dataContribMeta">
                    <span className={`dataContribName${colorClass}`}>
                      {contrib.displayName || contrib.source}
                    </span>
                    <span className={`dataContribPct${colorClass}`}>
                      {percentValue !== 0 ? `+${percentValue.toFixed(1)}%` : '+0.0%'}
                    </span>
                  </div>
                  <div className="dataContribBarRow">
                    <div className="dataContribBarTrack">
                      <div className={`dataContribBarFill${colorClass}`} style={{ width: `${barPct}%` }} />
                    </div>
                    <span className="dataContribValue">{damageValue.toFixed(0)}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
      {tooltipState !== null && (
        <StatusDetailPanel
          variant="tooltip"
          status={buildContribStatusInfo(contributionsList[tooltipState.index], modifierMap, snapshot)}
          style={{
            position: 'fixed',
            right: `${window.innerWidth - tooltipState.rect.left + 12}px`,
            top: `${tooltipState.rect.top + tooltipState.rect.height / 2}px`,
            transform: 'translateY(-50%)',
            left: 'auto',
            bottom: 'auto',
            zIndex: 300,
          }}
        />
      )}
    </div>
  )
}
