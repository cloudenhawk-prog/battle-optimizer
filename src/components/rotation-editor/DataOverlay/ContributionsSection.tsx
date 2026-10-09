// Data overlay "Modifier Contributions": Shapley value per modifier, tinted by owner, with toggles, filters and a detail tooltip
import { useState, useMemo } from 'react'
import type { Snapshot } from '../../../types/snapshot'
import type { DamageEvent } from '../../../types/events'
import type { ResolvedCharacter } from '../../../types/character'
import { StatusDetailPanel } from '../StatusDetailPanel'
import type { DamageMode } from './damageMath'
import { buildModifierMap } from './modifierMap'
import { computeModifierShapley } from './shapley'
import { buildContribStatusInfo } from './contribStatusInfo'
import { buildTeamAccents } from '../../shared/elementColors'
import { PortraitRing, SectionHeader, accentVar } from '../../shared/ui'

const NEUTRAL_RAW = '215 20% 62%'

export function ContributionsSection({ damageEvents, mode, characters, snapshot, activeSources, activeContribs, onToggleContrib, onToggleAllContribs, contribGroupKeys }: { damageEvents: DamageEvent[]; mode: DamageMode; characters: ResolvedCharacter[]; snapshot: Snapshot | null; activeSources: Set<string>; activeContribs: Set<string>; onToggleContrib: (key: string) => void; onToggleAllContribs: () => void; contribGroupKeys: Set<string> }) {
  const [hideInherent, setHideInherent] = useState(false)
  const [hideZero, setHideZero] = useState(false)
  const [tooltipState, setTooltipState] = useState<{ index: number; rect: DOMRect } | null>(null)

  const modifierMap = useMemo(() => buildModifierMap(characters), [characters])
  const accents = buildTeamAccents(characters)

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
    <section className="ui-section">
      <SectionHeader label="Modifier Contributions" />

      <div className="ui-toolbar">
        <button
          type="button"
          className={`ui-toggle${!hideInherent ? ' is-active' : ''}`}
          onClick={() => setHideInherent(p => !p)}
          title={hideInherent ? 'Show inherent modifiers' : 'Hide inherent modifiers'}>
          Inherent
        </button>
        <button
          type="button"
          className={`ui-toggle${!hideZero ? ' is-active' : ''}`}
          onClick={() => setHideZero(p => !p)}
          title={hideZero ? 'Show zero-contribution modifiers' : 'Hide zero-contribution modifiers'}>
          Zeros
        </button>
        <button
          type="button"
          className={`ui-toggle${activeContribs.size >= contribGroupKeys.size ? ' is-active' : ''}`}
          onClick={onToggleAllContribs}
          title={activeContribs.size >= contribGroupKeys.size ? 'Disable all buffs' : 'Enable all buffs'}>
          {activeContribs.size >= contribGroupKeys.size ? 'All On' : 'All Off'}
        </button>
      </div>

      <p className="ui-section-hint dataContribHint">Damage each modifier is responsible for on this row (Shapley). Click to switch one off and recompute.</p>

      {contributionsList.length === 0 ? (
        <div className="ui-empty">No modifier contributions</div>
      ) : (
        <div className="dataContribList">
          {contributionsList.map((contrib, index) => {
            const damageValue = contrib.rawDamage
            const barPct = maxValue > 0 ? (damageValue / maxValue) * 100 : 0
            const isInherent = !!contrib.isInherent
            const isZero = damageValue === 0 && !isInherent
            const isActive = activeContribs.has(contrib.key)
            const owner = contrib.ownerCharacter ? characters.find(c => c.name === contrib.ownerCharacter) : undefined
            const raw = (owner && accents.get(owner.name)) || NEUTRAL_RAW

            return (
              <div
                key={index}
                className={`dataContribRow${!isActive ? ' inactive' : ''}${isZero ? ' zero' : ''}`}
                style={accentVar(raw)}
                onMouseEnter={e => setTooltipState({ index, rect: (e.currentTarget as HTMLDivElement).getBoundingClientRect() })}
                onMouseLeave={() => setTooltipState(null)}
                onClick={() => onToggleContrib(contrib.key)}>
                <button
                  type="button"
                  className={`dataContribToggle${isActive ? ' active' : ''}`}
                  title={isActive ? 'Remove this modifier from the damage calculation' : 'Include this modifier in the damage calculation'}
                />
                <div className="dataContribContent">
                  <div className="dataContribMeta">
                    {owner ? <PortraitRing name={owner.name} src={owner.image} size={20} /> : <i className="ui-diamond dataContribNoOwner" />}
                    <span className="dataContribName">{contrib.displayName || contrib.source}</span>
                    {isInherent && <span className="dataContribTag">Inherent</span>}
                    <span className="dataContribPct">+{contrib.pct.toFixed(1)}%</span>
                  </div>
                  <div className="dataContribBarRow">
                    <div className="ui-bar dataContribBar">
                      <div className="ui-bar-fill" style={{ width: `${barPct}%` }} />
                    </div>
                    <span className="dataContribValue">{Math.round(damageValue).toLocaleString('en-US')}</span>
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
    </section>
  )
}
