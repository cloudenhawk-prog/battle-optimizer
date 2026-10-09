// Data overlay final-stats panel: acting character's stats under the active buffs as a tile grid, plus enemy debuffs
import { useState, useMemo } from 'react'
import type { Snapshot } from '../../../types/snapshot'
import type { DamageEvent } from '../../../types/events'
import type { ResolvedCharacter } from '../../../types/character'
import { buildModifierMap, collectContribMeta } from './modifierMap'
import {
  ENEMY_DEBUFF_KEYS, FINAL_STAT_GROUPS, computeDisplayedStats,
  formatFinalStatLabel, formatFinalStatValue, getFinalStatValue, isFinalStatZero,
} from './finalStats'
import { SectionHeader } from '../../shared/ui'

export function ActiveStatsSection({ damageEvents, activeContribs, contribGroupKeys, characters, snapshot }: {
  damageEvents: DamageEvent[]
  activeContribs: Set<string>
  contribGroupKeys: Set<string>
  characters: ResolvedCharacter[]
  snapshot: Snapshot | null
}) {
  const [hideZero, setHideZero] = useState(true)

  const modifierMap = useMemo(() => buildModifierMap(characters), [characters])

  const actingChar = useMemo(
    () => characters.find(c => c.name === snapshot?.character) ?? null,
    [characters, snapshot],
  )

  const metaMap = useMemo(() => collectContribMeta(damageEvents), [damageEvents])

  // Aggregate active buff character stats into a partial modifier object, then merge with base stats.
  const { finalStats, enemyDebuffStats } = useMemo(
    () => computeDisplayedStats({ activeContribs, contribGroupKeys, metaMap, modifierMap, snapshot, actingChar, damageEvents }),
    [activeContribs, contribGroupKeys, metaMap, modifierMap, snapshot, actingChar, damageEvents],
  )

  const visibleCharGroups = FINAL_STAT_GROUPS.map(group => ({
    ...group,
    keys: group.keys.filter(key => {
      if (!hideZero) return true
      if (!finalStats) return false
      return !isFinalStatZero(key, getFinalStatValue(key, finalStats))
    }),
  })).filter(g => g.keys.length > 0)

  const visibleEnemyKeys = ENEMY_DEBUFF_KEYS.filter(key => !hideZero || (enemyDebuffStats[key] ?? 0) !== 0)

  return (
    <section className="ui-section">
      <SectionHeader label={actingChar ? `${actingChar.name} Stats` : 'Final Stats'} />

      <div className="ui-toolbar">
        <button
          type="button"
          className={`ui-toggle${!hideZero ? ' is-active' : ''}`}
          onClick={() => setHideZero(p => !p)}
          title={hideZero ? 'Show zero-value stats' : 'Hide zero-value stats'}>
          Zeros
        </button>
      </div>

      {!finalStats ? (
        <div className="ui-empty">No character stats</div>
      ) : (
        <>
          {visibleCharGroups.map(group => (
            <div key={group.label}>
              <div className="ui-group-label">{group.label}</div>
              <div className="dataStatGrid">
                {group.keys.map(key => (
                  <div key={key} className="dataStatTile">
                    <span className="dataStatLabel">{formatFinalStatLabel(key)}</span>
                    <span className="dataStatValue">{formatFinalStatValue(key, getFinalStatValue(key, finalStats))}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {visibleEnemyKeys.length > 0 && (
            <div>
              <div className="ui-group-label">Enemy Debuffs</div>
              <div className="dataStatGrid">
                {visibleEnemyKeys.map(key => (
                  <div key={key} className="dataStatTile dataStatTile--debuff">
                    <span className="dataStatLabel">{formatFinalStatLabel(key)}</span>
                    <span className="dataStatValue">{((enemyDebuffStats[key] ?? 0) * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  )
}
