// Final-stats panel logic: stat groups, label/value formatting and the displayed stat computation (pure)
import type { Snapshot } from '../../../types/snapshot'
import type { DamageEvent } from '../../../types/events'
import type { ResolvedCharacter } from '../../../types/character'
import type { CharacterStats } from '../../../types/stats'
import { aggregateStat } from '../../../engine/resolvers'
import { mergeStats, calculateScalingStat } from '../../../engine/damage/damageCalculator'
import type { ContribMeta, ModifierInfo } from './modifierMap'

// ========== Stat Groups & Formatting ========================================================================================

// Groups of stats to display as absolute final values (keys not present on CharacterStats show 0).
// 'ATK', 'HP', 'DEF' are special — they use calculateScalingStat (computed from sub-components).
export const FINAL_STAT_GROUPS: Array<{ label: string; keys: string[] }> = [
  {
    label: 'Core',
    keys: ['ATK', 'HP', 'DEF', 'critRate', 'critDamage', 'bonusDMG', 'amplifyDMG', 'totalMultiplierDMG', 'defIgnore', 'resistancePEN', 'elementalResPEN', 'healingBonus', 'energyPercent', 'tuneBreakBoost', 'offtuneBuildupRate'],
  },
  {
    label: 'Elemental',
    keys: ['aeroBonusDMG', 'aeroAmplifyDMG', 'spectroBonusDMG', 'spectroAmplifyDMG', 'fusionBonusDMG', 'fusionAmplifyDMG', 'glacioBonusDMG', 'glacioAmplifyDMG', 'electroBonusDMG', 'electroAmplifyDMG', 'havocBonusDMG', 'havocAmplifyDMG'],
  },
  {
    label: 'Skill Types',
    keys: ['basicBonusDMG', 'basicAmplifyDMG', 'heavyBonusDMG', 'heavyAmplifyDMG', 'skillBonusDMG', 'skillAmplifyDMG', 'liberationBonusDMG', 'liberationAmplifyDMG', 'coordinatedBonusDMG', 'coordinatedAmplifyDMG', 'echoBonusDMG', 'echoAmplifyDMG', 'introBonusDMG', 'introAmplifyDMG', 'outroBonusDMG', 'outroAmplifyDMG'],
  },
  {
    label: 'Negative Status',
    keys: ['aeroErosionBonusDMG', 'aeroErosionAmplifyDMG', 'spectroFrazzleBonusDMG', 'spectroFrazzleAmplifyDMG', 'havocBaneBonusDMG', 'havocBaneAmplifyDMG', 'glacioChafeBonusDMG', 'glacioChafeAmplifyDMG', 'fusionBurstBonusDMG', 'fusionBurstAmplifyDMG', 'electroFlareBonusDMG', 'electroFlareAmplifyDMG'],
  },
]

export const ENEMY_DEBUFF_KEYS = ['resistance', 'damageReduction', 'aeroRES', 'spectroRES', 'havocRES', 'glacioRES', 'fusionRES', 'electroRES']

const SCALING_STAT_KEYS = new Set(['ATK', 'HP', 'DEF'])

export function formatFinalStatLabel(key: string): string {
  if (key === 'ATK') return 'ATK'
  if (key === 'HP')  return 'HP'
  if (key === 'DEF') return 'DEF'
  return key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/^./, s => s.toUpperCase())
    .trim()
}

export function formatFinalStatValue(key: string, value: number): string {
  if (SCALING_STAT_KEYS.has(key)) return Math.round(value).toLocaleString()
  if (key.toLowerCase().includes('totalmultiplier')) return `×${value.toFixed(3)}`
  if (/rate|bonus|amplify|pen|percent|boost|ignore|critdamage|damagereduction|res$/i.test(key) || key === 'healingBonus') {
    return `${(value * 100).toFixed(1)}%`
  }
  return Math.round(value).toLocaleString()
}

export function isFinalStatZero(key: string, value: number): boolean {
  if (SCALING_STAT_KEYS.has(key)) return false
  if (key.toLowerCase().includes('totalmultiplier')) return value === 1
  return value === 0
}

export function getFinalStatValue(key: string, finalStats: CharacterStats): number {
  if (SCALING_STAT_KEYS.has(key)) return calculateScalingStat(finalStats, key as 'ATK' | 'HP' | 'DEF')
  return (finalStats[key as keyof CharacterStats] as number) ?? 0
}

// ========== Displayed Stats =================================================================================================

/**
 * Final stats of the acting character with only the active (non-inherent) buffs applied, plus summed enemy debuffs.
 * With every buff active the damage pipeline's captured stats are used instead (source of truth).
 */
export function computeDisplayedStats({ activeContribs, contribGroupKeys, metaMap, modifierMap, snapshot, actingChar, damageEvents }: {
  activeContribs: Set<string>
  contribGroupKeys: Set<string>
  metaMap: Record<string, ContribMeta>
  modifierMap: Map<string, ModifierInfo>
  snapshot: Snapshot | null
  actingChar: ResolvedCharacter | null
  damageEvents: DamageEvent[]
}) {
  const activeCharMods: Partial<CharacterStats> = {}
  const enemyDebuffStats: Record<string, number> = {}

  for (const key of activeContribs) {
    const meta = metaMap[key]
    if (!meta || meta.isInherent) continue
    const displayName = meta.displayName ?? meta.source
    const strippedName = displayName.replace(/\s+/g, '')

    // Only use activation-time stats from the snapshot. buffsActivationStats is only populated
    // for modifiers whose condition > 0 at step time, so missing entries mean condition = 0
    // and the modifier contributes nothing. Falling back to modifierMap would use raw unscaled
    // stats and incorrectly add the modifier's full value even when its condition is inactive.
    const statsSource = snapshot?.buffsActivationStats?.[strippedName]
    if (statsSource) {
      for (const [k, v] of Object.entries(statsSource)) {
        if (v === undefined) continue
        activeCharMods[k as keyof CharacterStats] = aggregateStat(
          activeCharMods[k as keyof CharacterStats] as number | undefined,
          v as number, k,
        ) as any
      }
    }

    const enemyStatsSource = modifierMap.get(displayName)?.enemyStats
    if (enemyStatsSource) {
      for (const [k, v] of Object.entries(enemyStatsSource)) {
        if (v === undefined) continue
        enemyDebuffStats[k] = aggregateStat(enemyDebuffStats[k], v as number, k)
      }
    }
  }

  const allActive = activeContribs.size >= contribGroupKeys.size
  const calcFinalStats = allActive
    ? (damageEvents.find(e => e.calcParams?.finalCharacterStats)?.calcParams?.finalCharacterStats ?? null)
    : null

  const independentFinalStats = actingChar ? mergeStats(actingChar.stats, activeCharMods) : null

  // When all contributions are active, use the stats captured at calculation time as the source
  // of truth. These come directly from the damage pipeline, not reconstructed from snapshots.
  const finalStats = calcFinalStats ?? independentFinalStats

  // Sanity check: if both sources are available and they diverge significantly, something is wrong.
  if (allActive && calcFinalStats && independentFinalStats) {
    const EPSILON = 0.001
    // NOTE: 'ATK'/'HP'/'DEF' are not CharacterStats keys (known tsc error): both sides read undefined → 0,
    // so only crit stats are really compared. Scaling stats would need calculateScalingStat.
    const statsToCheck: (keyof CharacterStats)[] = ['critRate', 'critDamage', 'ATK', 'HP', 'DEF']
    for (const stat of statsToCheck) {
      const calcVal = (calcFinalStats[stat] as number) ?? 0
      const indepVal = (independentFinalStats[stat] as number) ?? 0
      if (Math.abs(calcVal - indepVal) > EPSILON) {
        console.error(
          `[ActiveStatsSection] Stats display diverges from calculation for "${stat}":`,
          `displayed=${indepVal.toFixed(4)}, actual=${calcVal.toFixed(4)}`,
          '— buffsActivationStats may be incomplete or stale.',
        )
      }
    }
  }

  return { finalStats, enemyDebuffStats }
}
