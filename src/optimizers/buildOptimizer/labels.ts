// Human-readable labels for build candidates: compact leaderboard label and per-slot detail lines.
import type { EchoSlots } from '../../types/gear'
import type { EchoOptConfig } from './types'

// ========== Short Stat Names =================================================================================================

const STAT_SHORT: Record<string, string> = {
  critRate: 'CR', critDamage: 'CD', bonusATK: 'ATK%', bonusHP: 'HP%', bonusDEF: 'DEF%',
  flatATK: 'ATK', flatHP: 'HP', flatDEF: 'DEF', energyPercent: 'ER',
  basicBonusDMG: 'Basic', heavyBonusDMG: 'Heavy', skillBonusDMG: 'Skill', liberationBonusDMG: 'Lib',
}

// Every echo carries a fixed flat ATK/HP base stat next to its main stat; skip those to find the main stat.
const FIXED_FLAT_KEYS = new Set(['flatATK', 'flatHP'])

// ========== Labels ===========================================================================================================

/**
 * Compact label for a candidate gear set: main stat per configured slot, then aggregate substat
 * counts (e.g. "E1→ATK%, CR×2, CD"). Only reads substats from slots that have substat configuration.
 * Returns '' when no slot is configured.
 */
export function compactCandidateLabel(slots: EchoSlots, cfg: EchoOptConfig): string {
  const subCount: Record<string, number> = {}
  const mainParts: string[] = []
  for (const k of [1, 2, 3, 4, 5] as const) {
    const slotCfg = cfg[k]
    if (!slotCfg) continue
    const echo = slots[k]
    if (!echo) continue
    if (slotCfg.enabledMainStats.size > 0) {
      const mainKey = Object.keys(echo.baseStats).find(key => !FIXED_FLAT_KEYS.has(key))
      if (mainKey) mainParts.push(`E${k}→${STAT_SHORT[mainKey] ?? mainKey}`)
    }
    const hasSubConfig = slotCfg.enabledSubstats.size > 0 || (slotCfg.pinnedSubstats?.size ?? 0) > 0
    if (hasSubConfig) {
      for (const key of Object.keys(echo.subStats)) {
        subCount[key] = (subCount[key] ?? 0) + 1
      }
    }
  }
  const subParts = (Object.entries(subCount) as [string, number][])
    .sort(([, a], [, b]) => b - a)
    .map(([k, n]) => n > 1 ? `${STAT_SHORT[k] ?? k}×${n}` : (STAT_SHORT[k] ?? k))
  return [...mainParts, ...subParts].join(', ')
}

/**
 * Per-slot detail breakdown for the "See Details" expand, e.g.
 * ["E1 [ATK%] · CR, CD, ATK%, Lib", "E3 [Glacio] · CR, CD, ATK%, Lib"]
 */
export function detailedCandidateLines(slots: EchoSlots, cfg: EchoOptConfig): string[] {
  const lines: string[] = []
  for (const k of [1, 2, 3, 4, 5] as const) {
    const slotCfg = cfg[k]
    if (!slotCfg) continue
    const echo = slots[k]
    if (!echo) continue
    const hasMainConfig = slotCfg.enabledMainStats.size > 0
    const hasSubConfig = slotCfg.enabledSubstats.size > 0 || (slotCfg.pinnedSubstats?.size ?? 0) > 0
    if (!hasMainConfig && !hasSubConfig) continue
    let line = `E${k}`
    if (hasMainConfig) {
      const mainKey = Object.keys(echo.baseStats).find(key => !FIXED_FLAT_KEYS.has(key))
      if (mainKey) line += ` [${STAT_SHORT[mainKey] ?? mainKey}]`
    }
    if (hasSubConfig) {
      const subParts = Object.keys(echo.subStats).map(sk => STAT_SHORT[sk] ?? sk)
      line += ` · ${subParts.join(', ')}`
    }
    lines.push(line)
  }
  return lines
}
