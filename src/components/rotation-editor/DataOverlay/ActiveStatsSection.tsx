// Data overlay final-stats panel: acting character's stats under the active buffs, plus enemy debuffs
import { useState, useMemo } from 'react'
import type { Snapshot } from '../../../types/snapshot'
import type { DamageEvent } from '../../../types/events'
import type { ResolvedCharacter } from '../../../types/character'
import { buildModifierMap, collectContribMeta } from './modifierMap'
import {
  ENEMY_DEBUFF_KEYS, FINAL_STAT_GROUPS, computeDisplayedStats,
  formatFinalStatLabel, formatFinalStatValue, getFinalStatValue, isFinalStatZero,
} from './finalStats'

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
    <div className="dataSectionGroup">
      <div className="dataPanelHeader silver">
        <div className="dataPanelHeaderDot silver" />
        <span className="dataPanelHeaderLabel">
          {actingChar ? `${actingChar.name} Stats` : 'Final Stats'}
        </span>
        <div className="dataPanelHeaderLine" />
      </div>

      <div className="dataContribFilterBar">
        <span className="dataContribFilterLabel">Show:</span>
        <button
          className={`dataContribFilterBtn${!hideZero ? ' active cyan' : ''}`}
          onClick={() => setHideZero(p => !p)}
          title={hideZero ? 'Show zero-value stats' : 'Hide zero-value stats'}>
          Zeros
        </button>
      </div>

      {!finalStats ? (
        <p className="dataEmptyMsg">No character stats available</p>
      ) : (
        <>
          {visibleCharGroups.map(group => (
            <div key={group.label} className="dataActiveStatGroup">
              <div className="dataActiveStatGroupLabel">{group.label}</div>
              {group.keys.map(key => {
                const val = getFinalStatValue(key, finalStats)
                return (
                  <div key={key} className="dataActiveStatRow">
                    <span className="dataActiveStatLabel">{formatFinalStatLabel(key)}</span>
                    <span className="dataActiveStatValue">{formatFinalStatValue(key, val)}</span>
                  </div>
                )
              })}
            </div>
          ))}

          {visibleEnemyKeys.length > 0 && (
            <div className="dataActiveStatGroup">
              <div className="dataActiveStatGroupLabel">Enemy Debuffs</div>
              {visibleEnemyKeys.map(key => {
                const val = enemyDebuffStats[key] ?? 0
                return (
                  <div key={key} className="dataActiveStatRow">
                    <span className="dataActiveStatLabel">{formatFinalStatLabel(key)}</span>
                    <span className="dataActiveStatValue coral">{(val * 100).toFixed(1)}%</span>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
