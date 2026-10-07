// Build candidate generation: per-slot echo variants, cross-product over slots, dedup and the global cap.
import type { ResolvedCharacter } from '../../types/character'
import type { Gear, Echo, EchoSlots } from '../../types/gear'
import type { CharacterStats } from '../../types/stats'
import { SUBSTAT_OPTIONS, MAIN_STAT_OPTIONS, buildBaseStats } from '../../data/gear/echoStats'
import type { EchoOptConfig, EchoSlotConfig } from './types'
import { compactCandidateLabel } from './labels'

// ========== Constants ========================================================================================================

/** Hard cap on unique candidates per run (enumeration stops once reached). */
export const MAX_OPTIMIZER_BUILDS = 2000

const SLOTS = [1, 2, 3, 4, 5] as const

// ========== Combinatorics ====================================================================================================

/** Returns all k-element subsets of arr. */
function combinations<T>(arr: T[], k: number): T[][] {
  if (k === 0) return [[]]
  if (arr.length < k) return []
  const [first, ...rest] = arr
  return [
    ...combinations(rest, k - 1).map(c => [first, ...c]),
    ...combinations(rest, k),
  ]
}

// ========== Per-Slot Candidates ==============================================================================================

/**
 * Returns all candidate echoes for one slot, varying main stat and substats as configured.
 * Returns a single unchanged candidate when no configuration is set.
 */
export function buildEchoCandidates(
  echo: Echo,
  slotCfg: EchoSlotConfig | undefined,
  globalTier: number,
): Array<{ echo: Echo; label: string }> {
  const hasSubConfig = !!slotCfg && (slotCfg.enabledSubstats.size > 0 || slotCfg.pinnedSubstats.size > 0)
  if (!slotCfg || (slotCfg.enabledMainStats.size === 0 && !hasSubConfig)) {
    return [{ echo, label: '' }]
  }

  // Main stat candidates — keep current baseStats if none selected
  const mainOptions: Array<{ baseStats: Partial<CharacterStats>; label: string }> = []
  if (slotCfg.enabledMainStats.size > 0) {
    const pool = MAIN_STAT_OPTIONS[echo.cost as 1 | 3 | 4] ?? []
    for (const key of slotCfg.enabledMainStats) {
      const opt = pool.find(o => o.key === key)
      if (opt) mainOptions.push({ baseStats: buildBaseStats(echo.cost as 1 | 3 | 4, opt.key, opt.value), label: opt.label })
    }
  }
  if (mainOptions.length === 0) mainOptions.push({ baseStats: echo.baseStats, label: '' })

  // Substat combo candidates — keep current subStats when nothing is configured
  const subOptions: Array<{ subStats: Partial<CharacterStats>; label: string }> = []
  if (hasSubConfig) {
    const pinned = [...slotCfg.pinnedSubstats] as Array<keyof CharacterStats>
    const flexible = [...slotCfg.enabledSubstats].filter(k => !slotCfg.pinnedSubstats.has(k)) as Array<keyof CharacterStats>
    // substatGroupSize = number of flexible picks (not total); total = pinned + flexible picks
    const flexNeeded = slotCfg.substatGroupSize
    const flexCombos = flexNeeded === 0
      ? [[]]
      : combinations(flexible, Math.min(flexNeeded, flexible.length))
    for (const flexCombo of flexCombos) {
      const keys = [...pinned, ...flexCombo]
      const subStats: Partial<CharacterStats> = {}
      const parts: string[] = []
      for (const key of keys) {
        const opt = SUBSTAT_OPTIONS.find(s => s.key === key)
        if (!opt) continue
        // Tier 1..8 indexes the roll table; 4-value stats map two tiers onto each value
        subStats[key] = opt.values.length === 4
          ? opt.values[Math.floor((globalTier - 1) / 2)]
          : opt.values[globalTier - 1]
        parts.push(opt.label)
      }
      subOptions.push({ subStats, label: parts.join('+') })
    }
  }
  if (subOptions.length === 0) subOptions.push({ subStats: echo.subStats, label: '' })

  // Cross-product: main stat × substat combos
  const result: Array<{ echo: Echo; label: string }> = []
  for (const ms of mainOptions) {
    for (const ss of subOptions) {
      result.push({
        echo: { ...echo, baseStats: ms.baseStats, subStats: ss.subStats },
        label: [ms.label, ss.label].filter(Boolean).join('/'),
      })
    }
  }
  return result
}

// ========== Dedup Key ========================================================================================================

/**
 * Canonical key for a fully-assigned EchoSlots, so equivalent builds collapse to one candidate:
 *  - Main stats: grouped by echo cost, sorted within each group (same cost = same value per stat type,
 *    so swapping E2[ATK%]+E3[Glacio] ↔ E2[Glacio]+E3[ATK%] is equivalent)
 *  - Substats: aggregated totals across all configured slots (slot-order-independent)
 */
function candidateKey(slots: EchoSlots, configuredSlots: ReadonlyArray<1 | 2 | 3 | 4 | 5>): string {
  const subTotals: Record<string, number> = {}
  const mainByCost: Record<number, string[]> = {}
  for (const slot of configuredSlots) {
    const echo = slots[slot]
    if (!echo) continue
    const cost = echo.cost
    if (!mainByCost[cost]) mainByCost[cost] = []
    for (const k of Object.keys(echo.baseStats)) mainByCost[cost].push(k)
    for (const [k, v] of Object.entries(echo.subStats) as [string, number][]) {
      subTotals[k] = (subTotals[k] ?? 0) + v
    }
  }
  const mainPart = Object.entries(mainByCost)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([cost, keys]) => `${cost}:[${[...keys].sort().join(',')}]`)
    .join(',')
  const subPart = Object.entries(subTotals)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${v.toFixed(6)}`)
    .join(',')
  return `${mainPart}|${subPart}`
}

// ========== Enumeration ======================================================================================================

/**
 * Walks the cross-product of per-slot candidates (slot 1 → 5, depth-first) and calls `visit` once per
 * unique build (see candidateKey), stopping after MAX_OPTIMIZER_BUILDS unique builds.
 * Unconfigured slots keep their current echo unchanged.
 */
function forEachUniqueCandidate(
  char: ResolvedCharacter,
  echoConfig: EchoOptConfig,
  globalTier: number,
  visit: (slots: EchoSlots) => void,
): void {
  const configuredSlots = SLOTS.filter(s => !!echoConfig[s])
  const perSlot = SLOTS.map(slot => {
    const echo = char.gear.echoSlots[slot]
    if (!echo) return [{ echo: null as Echo | null }]
    return buildEchoCandidates(echo, echoConfig[slot], globalTier)
  })

  const seen = new Set<string>()
  let count = 0

  function recurse(slotIdx: number, slots: EchoSlots) {
    if (count >= MAX_OPTIMIZER_BUILDS) return
    if (slotIdx === SLOTS.length) {
      const key = candidateKey(slots, configuredSlots)
      if (seen.has(key)) return
      seen.add(key)
      count++
      visit(slots)
      return
    }
    const s = SLOTS[slotIdx]
    for (const c of perSlot[slotIdx]) {
      recurse(slotIdx + 1, { ...slots, [s]: c.echo })
    }
  }
  recurse(0, { ...char.gear.echoSlots })
}

/** Number of unique candidates a run would test — the live preview in the Convergence panel. */
export function countCandidates(
  char: ResolvedCharacter,
  echoConfig: EchoOptConfig,
  globalTier: number,
): number {
  let count = 0
  forEachUniqueCandidate(char, echoConfig, globalTier, () => { count++ })
  return count
}

/**
 * Builds all unique gear candidates (capped at MAX_OPTIMIZER_BUILDS) with their compact labels.
 * buildLabel is '' only when no equipped slot has a main/sub stat configured (i.e. the unmodified current gear).
 */
export function buildAllCandidates(
  char: ResolvedCharacter,
  echoConfig: EchoOptConfig,
  globalTier: number,
): Array<{ gear: Gear; buildLabel: string }> {
  const candidates: Array<{ gear: Gear; buildLabel: string }> = []
  forEachUniqueCandidate(char, echoConfig, globalTier, slots => {
    const buildLabel = compactCandidateLabel(slots, echoConfig)
    candidates.push({ gear: { ...char.gear, echoSlots: slots }, buildLabel })
  })
  return candidates
}
