import { createPortal } from 'react-dom'
import { useState, useRef, useEffect, useMemo } from 'react'
import '../../styles/rotation-editor/BuildOptimizerOverlay.css'
import type { ResolvedCharacter } from '../../types/character'
import type { Enemy } from '../../types/enemy'
import type { TableConfig } from '../../types/tableDefinitions'
import type { Snapshot } from '../../types/snapshot'
import type { Settings } from '../../hooks/useSettings'
import { extractSteps } from '../../utils/importExport'
import { replaySteps } from '../../utils/engine/replaySteps'
import { createEmptySnapshot } from '../../hooks/rotation-editor/useSnapshots'
import { negativeStatuses as negativeStatusesData } from '../../data/negativeStatuses'
import { SUBSTAT_OPTIONS, MAIN_STAT_OPTIONS, buildBaseStats } from '../../data/gear/echoStats'
import { baseCharacters } from '../../data/characters'
import { resolveCharacter } from '../../utils/gear/resolveCharacter'
import type { Gear, Echo, EchoSlots } from '../../types/gear'
import type { CharacterStats } from '../../types/stats'
import type { EngineState } from '../../utils/engine/step'

// ========== Types ============================================================================================================

export type BuildResult = {
  /** One-line compact label for the leaderboard, e.g. "CR×4, CD×3, ATK%×2". */
  label: string
  /** Unused legacy field kept for backward compat. Always equals label. */
  buildDesc: string
  dps: number
  delta: number
  deltaPct: number
  isCurrent: boolean
  /** Per-slot breakdown shown on expand, e.g. ["E1 [ATK%] · CR, CD", "E3 [Glacio] · CR, CD"]. */
  details?: string[]
}

// ========== Echo Optimizer Config ============================================================================================

/**
 * Per-slot optimizer configuration.
 *
 * `enabledMainStats` — which main-stat options to test for this slot.
 *   Each selected option is treated as its own candidate (no combinations).
 *
 * `enabledSubstats` — which substats are eligible for this slot.
 *   The optimizer generates all C(N, substatGroupSize) combinations from the
 *   selected pool and tests each at `globalTier`.
 *
 * `substatGroupSize` — how many substats to assign at a time (k in C(N, k)).
 *   Must be ≤ number of enabled substats. Defaults to 5 (use all selected).
 */
export type EchoSlotConfig = {
  enabledMainStats: Set<keyof CharacterStats>
  /** Flexible substats: included in the pool but drawn via C(flexible, k-pinned). */
  enabledSubstats: Set<keyof CharacterStats>
  /** Pinned substats: always present in every combination for this slot. */
  pinnedSubstats: Set<keyof CharacterStats>
  substatGroupSize: number
}

export type EchoOptConfig = Partial<Record<1 | 2 | 3 | 4 | 5, EchoSlotConfig>>

/**
 * All substats eligible for echo optimization — the full SUBSTAT_OPTIONS pool.
 * Every entry here contributes to damage: crit, ATK/HP/DEF (flat and %), energy regen,
 * and action-type bonus DMG multipliers.
 */
const OPTIMIZER_SUBSTATS = SUBSTAT_OPTIONS

function makeDefaultSlotConfig(): EchoSlotConfig {
  return {
    enabledMainStats: new Set<keyof CharacterStats>(),
    enabledSubstats: new Set<keyof CharacterStats>(),
    pinnedSubstats: new Set<keyof CharacterStats>(),
    substatGroupSize: 3,
  }
}

// ========== Echo Config Persistence =========================================================================================

const BO_STORAGE_KEY = 'battle-optimizer-build-optimizer'

type PersistedSlotConfig = {
  enabledMainStats: string[]
  enabledSubstats: string[]
  pinnedSubstats: string[]
  substatGroupSize: number
}

type PersistedCharConfig = {
  globalTier: number
  echoConfig: Partial<Record<string, PersistedSlotConfig>>
}

function loadCharConfig(charName: string): { globalTier: number; echoConfig: EchoOptConfig } {
  try {
    const raw = localStorage.getItem(BO_STORAGE_KEY)
    if (!raw) return { globalTier: 8, echoConfig: {} }
    const all = JSON.parse(raw) as Record<string, PersistedCharConfig>
    const saved = all[charName]
    if (!saved) return { globalTier: 8, echoConfig: {} }
    const echoConfig: EchoOptConfig = {}
    for (const k of ['1', '2', '3', '4', '5'] as const) {
      const slot = Number(k) as 1 | 2 | 3 | 4 | 5
      const s = saved.echoConfig[k]
      if (s) {
        echoConfig[slot] = {
          enabledMainStats: new Set(s.enabledMainStats as Array<keyof CharacterStats>),
          enabledSubstats:  new Set(s.enabledSubstats  as Array<keyof CharacterStats>),
          pinnedSubstats:   new Set((s.pinnedSubstats ?? []) as Array<keyof CharacterStats>),
          substatGroupSize: s.substatGroupSize ?? 3,
        }
      }
    }
    return { globalTier: saved.globalTier ?? 8, echoConfig }
  } catch {
    return { globalTier: 8, echoConfig: {} }
  }
}

function saveCharConfig(charName: string, globalTier: number, echoConfig: EchoOptConfig): void {
  try {
    const raw = localStorage.getItem(BO_STORAGE_KEY)
    const all: Record<string, PersistedCharConfig> = raw ? JSON.parse(raw) : {}
    const persistedEcho: Partial<Record<string, PersistedSlotConfig>> = {}
    for (const k of ['1', '2', '3', '4', '5'] as const) {
      const slot = Number(k) as 1 | 2 | 3 | 4 | 5
      const s = echoConfig[slot]
      if (s) {
        persistedEcho[k] = {
          enabledMainStats: [...s.enabledMainStats] as string[],
          enabledSubstats:  [...s.enabledSubstats]  as string[],
          pinnedSubstats:   [...s.pinnedSubstats]   as string[],
          substatGroupSize: s.substatGroupSize,
        }
      }
    }
    all[charName] = { globalTier, echoConfig: persistedEcho }
    localStorage.setItem(BO_STORAGE_KEY, JSON.stringify(all))
  } catch {
    // ignore write errors
  }
}

// ========== Echo Optimizer Combinatorics =====================================================================================

const MAX_OPTIMIZER_BUILDS = 2000

const STAT_SHORT: Record<string, string> = {
  critRate: 'CR', critDamage: 'CD', bonusATK: 'ATK%', bonusHP: 'HP%', bonusDEF: 'DEF%',
  flatATK: 'ATK', flatHP: 'HP', flatDEF: 'DEF', energyPercent: 'ER',
  basicBonusDMG: 'Basic', heavyBonusDMG: 'Heavy', skillBonusDMG: 'Skill', liberationBonusDMG: 'Lib',
}
const FIXED_FLAT_KEYS = new Set(['flatATK', 'flatHP'])

/**
 * Builds a compact human-readable label for a candidate gear set.
 * Shows aggregate substat counts (e.g. "CR×2, CD, ATK%") and main stat per configured slot.
 * Only reads substats from slots that have substat configuration.
 */
function compactCandidateLabel(slots: EchoSlots, cfg: EchoOptConfig): string {
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
 * Returns a per-slot detail breakdown for the "See Details" expand, e.g.
 * ["E1 [ATK%] · CR, CD, ATK%, Lib", "E3 [Glacio] · CR, CD, ATK%, Lib"]
 */
function detailedCandidateLines(slots: EchoSlots, cfg: EchoOptConfig): string[] {
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

/**
 * Returns all candidate echoes for one slot, varying main stat and substats as configured.
 * Returns a single unchanged candidate when no configuration is set.
 */
function buildEchoCandidates(
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

/**
 * Counts deduplicated candidates without building Echo objects — used for the live preview
 * in the Convergence panel before a run starts.
 */
function countCandidates(
  char: ResolvedCharacter,
  echoConfig: EchoOptConfig,
  globalTier: number,
): number {
  const SLOTS = [1, 2, 3, 4, 5] as const
  const configuredSlots = SLOTS.filter(s => !!echoConfig[s])
  // Build the same per-slot candidate list (we need the actual echo objects for the dedup key)
  const perSlot = SLOTS.map(slot => {
    const echo = char.gear.echoSlots[slot]
    if (!echo) return [{ echo: null as Echo | null }]
    return buildEchoCandidates(echo, echoConfig[slot], globalTier).map(c => ({ echo: c.echo }))
  })

  function candidateKey(slots: EchoSlots): string {
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

  const seen = new Set<string>()
  let count = 0

  function recurse(slotIdx: number, slots: EchoSlots) {
    if (count >= MAX_OPTIMIZER_BUILDS) return
    if (slotIdx === SLOTS.length) {
      const key = candidateKey(slots)
      if (seen.has(key)) return
      seen.add(key)
      count++
      return
    }
    const s = SLOTS[slotIdx]
    for (const c of perSlot[slotIdx]) {
      recurse(slotIdx + 1, { ...slots, [s]: c.echo })
    }
  }
  recurse(0, { ...char.gear.echoSlots })
  return count
}

/**
 * Builds all gear candidates by varying configured echo slots.
 * Unconfigured slots keep their current echo unchanged.
 * Capped at MAX_OPTIMIZER_BUILDS total candidates.
 *
 * Deduplication:
 *  - Substats: aggregated totals across all configured slots (slot-order-independent).
 *  - Main stats: grouped by echo cost tier, then sorted within each cost group.
 *    Echoes of the same cost have the same stat values for the same stat type, so
 *    swapping E2[ATK%]+E3[Glacio] ↔ E2[Glacio]+E3[ATK%] (same cost) is equivalent.
 */
function buildAllCandidates(
  char: ResolvedCharacter,
  echoConfig: EchoOptConfig,
  globalTier: number,
): Array<{ gear: Gear; buildLabel: string }> {
  const SLOTS = [1, 2, 3, 4, 5] as const
  const configuredSlots = SLOTS.filter(s => !!echoConfig[s])
  const perSlot = SLOTS.map(slot => {
    const echo = char.gear.echoSlots[slot]
    if (!echo) return [{ echo: null as Echo | null, label: '' }]
    return buildEchoCandidates(echo, echoConfig[slot], globalTier)
  })

  // Canonical key for a fully-assigned EchoSlots:
  //  - Main stats: grouped by echo cost, sorted within each group (same cost = same value per stat type)
  //  - Substats: aggregated totals across all configured slots (order-independent)
  function candidateKey(slots: EchoSlots): string {
    const subTotals: Record<string, number> = {}
    const mainByCost: Record<number, string[]> = {}
    for (const slot of configuredSlots) {
      const echo = slots[slot]
      if (!echo) continue
      // Group main stat keys by cost so same-cost swaps collapse to the same key
      const cost = echo.cost
      if (!mainByCost[cost]) mainByCost[cost] = []
      for (const k of Object.keys(echo.baseStats)) {
        mainByCost[cost].push(k)
      }
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

  const seen = new Set<string>()
  const candidates: Array<{ gear: Gear; buildLabel: string }> = []

  function recurse(slotIdx: number, slots: EchoSlots) {
    if (candidates.length >= MAX_OPTIMIZER_BUILDS) return
    if (slotIdx === SLOTS.length) {
      const key = candidateKey(slots)
      if (seen.has(key)) return
      seen.add(key)
      const buildLabel = compactCandidateLabel(slots, echoConfig)
      candidates.push({ gear: { ...char.gear, echoSlots: slots }, buildLabel })
      return
    }
    const s = SLOTS[slotIdx]
    for (const c of perSlot[slotIdx]) {
      recurse(slotIdx + 1, { ...slots, [s]: c.echo })
    }
  }
  recurse(0, { ...char.gear.echoSlots })
  return candidates
}

// ========== Helpers ==========================================================================================================

function buildGlobalColumns(tableConfig: TableConfig) {
  const statusEffectsColumns = tableConfig.statusEffects?.columns ?? []
  const buffsCol = statusEffectsColumns.find(col => col.key === 'buffs')
  const debuffsCol = statusEffectsColumns.find(col => col.key === 'debuffs')
  const negativeStatusesCol = statusEffectsColumns.find(col => col.key === 'negativeStatuses')
  return {
    basic: tableConfig.basic.columns.map(col => col.key),
    buffs: buffsCol?.statusMetadata?.map(meta => meta.key) ?? [],
    debuffs: debuffsCol?.statusMetadata?.map(meta => meta.key) ?? [],
    negativeStatuses: negativeStatusesCol?.statusMetadata?.map(meta => meta.key) ?? [],
  }
}

function freshEngineState(): EngineState {
  return {
    negativeStatusesInAction: Object.values(negativeStatusesData).map(status => ({
      negativeStatus: status,
      applicationTime: -1,
      timeLeft: 0,
      currentStacks: 0,
      lastDamageTime: 0,
    })),
    modifiersInAction: [],
    coordinatedAttacksInAction: [],
  }
}

function scoreRotation(params: {
  steps: ReturnType<typeof extractSteps>
  charactersMap: Record<string, ResolvedCharacter>
  characterColumnsMap: Record<string, string[]>
  globalColumns: ReturnType<typeof buildGlobalColumns>
  enemy: Enemy
  tableConfig: TableConfig
  settings: Settings
  autocastFollowUps: boolean
}): number {
  const { steps, charactersMap, characterColumnsMap, globalColumns, enemy, tableConfig, settings, autocastFollowUps } = params
  if (steps.length === 0) return 0

  const startingSnapshot = createEmptySnapshot(
    charactersMap,
    characterColumnsMap,
    globalColumns,
    tableConfig,
    settings.startWithFullEnergy,
  )

  const result = replaySteps({
    steps,
    startingSnapshots: [startingSnapshot],
    startingEngineState: freshEngineState(),
    charactersMap,
    characterColumnsMap,
    globalColumns,
    enemy,
    autocastFollowUps,
  })

  if (!result.valid) return 0
  const lastResolved = result.snapshots[result.snapshots.length - 2]
  return lastResolved?.dps ?? 0
}

// ========== Local SVG Components =============================================================================================

function BoCog({
  size = 100,
  teeth = 14,
  className,
}: {
  size?: number
  teeth?: number
  className?: string
}) {
  const cx = 50, cy = 50, rOuter = 47, rInner = 39, hub = 11, bore = 4.5
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className} aria-hidden="true">
      {Array.from({ length: teeth }, (_, i) => {
        const angle = (360 / teeth) * i
        const yTop = cy - rOuter, yBot = cy - rInner + 0.5
        return (
          <polygon
            key={i}
            fill="currentColor"
            transform={`rotate(${angle} ${cx} ${cy})`}
            points={`${cx - 1.6},${yTop} ${cx + 1.6},${yTop} ${cx + 2.6},${yBot} ${cx - 2.6},${yBot}`}
          />
        )
      })}
      <circle cx={cx} cy={cy} r={rInner} fill="none" stroke="currentColor" strokeWidth={1.1} />
      {Array.from({ length: 5 }, (_, i) => (
        <rect
          key={i}
          x={cx - 0.6}
          y={cy - rInner + 3}
          width={1.2}
          height={rInner - hub - 2}
          fill="currentColor"
          opacity={0.45}
          transform={`rotate(${(360 / 5) * i} ${cx} ${cy})`}
        />
      ))}
      <circle cx={cx} cy={cy} r={hub} fill="currentColor" opacity={0.9} />
      <circle cx={cx} cy={cy} r={bore} fill="var(--bo-bg)" />
    </svg>
  )
}

// Build a rounded-rect SVG path string (clockwise, suitable for animateMotion)
function roundedRectPath(x: number, y: number, w: number, h: number, r: number): string {
  const cr = Math.min(r, w / 2, h / 2)
  return [
    `M ${x + cr} ${y}`,
    `H ${x + w - cr}`,
    `A ${cr} ${cr} 0 0 1 ${x + w} ${y + cr}`,
    `V ${y + h - cr}`,
    `A ${cr} ${cr} 0 0 1 ${x + w - cr} ${y + h}`,
    `H ${x + cr}`,
    `A ${cr} ${cr} 0 0 1 ${x} ${y + h - cr}`,
    `V ${y + cr}`,
    `A ${cr} ${cr} 0 0 1 ${x + cr} ${y}`,
    `Z`,
  ].join(' ')
}

function BoEdgeOrbiter() {
  // ViewBox = "0 0 112 92".
  // Panel border: x=6..106, y=6..86 (100×80 units).
  // Cog center rides R=3 units OUTSIDE the panel border.
  // Cog center rect: x=3, y=3, w=106, h=86.
  // Corner radius of that rect = (panel CSS border-radius in viewBox units) + R.
  //   panel CSS border-radius = 28px (fixed pixels).
  //   1 viewBox unit = svgRenderedWidth / 112 pixels  (since SVG width = 1.12 × panelWidth,
  //   and 112 viewBox units span that full SVG width).
  //   → panelBrInUnits = 28 / (svgPx / 112) = 28 × 112 / svgPx
  //   → cogCenterCr = panelBrInUnits + R

  const R      = 3
  const rInner = 2.49
  const hub    = 0.70
  const bore   = 0.29
  const teeth  = 14
  const tw     = 0.10
  const bw     = 0.17
  const gold   = 'oklch(0.86 0.13 88)'

  const svgRef = useRef<SVGSVGElement>(null)
  const [svgWidthPx, setSvgWidthPx] = useState(1321.6) // default = 1180 × 1.12

  useEffect(() => {
    const el = svgRef.current
    if (!el) return
    const ro = new ResizeObserver(entries => {
      setSvgWidthPx(entries[0].contentRect.width)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Corner radius for the cog-center path in viewBox units
  const panelBrUnits = (28 * 112) / svgWidthPx
  const cogCr        = panelBrUnits + R

  // Rounded rect for the cog center: x=3, y=3, w=106, h=86
  const cogPath = roundedRectPath(3, 3, 106, 86, cogCr)

  // Perimeter of the rounded rect (straight segments + 4 quarter-circle arcs)
  const straightW  = 106 - 2 * cogCr
  const straightH  = 86  - 2 * cogCr
  const perimeter  = 2 * (straightW + straightH) + 2 * Math.PI * cogCr
  // Rolling: full_perimeter / (2π × R) rotations per lap = perimeter / (2π × R) × 360°
  const spinDeg = Math.round((perimeter / (2 * Math.PI * R)) * 360)
  const dur     = '30s'

  return (
    <svg
      ref={svgRef}
      className="buildOptEdgeOrbiter"
      viewBox="0 0 112 92"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        {/* Cog center rides R=3 units outside the panel border, on rounded corners */}
        <path id="bo-cog-path" d={cogPath} fill="none" />

        {/* Bloom glow: blurred copy rendered behind the sharp cog */}
        <filter id="bo-cog-glow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="0.9" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Outer group: animateMotion translates to path position and rotates to path tangent */}
      <g filter="url(#bo-cog-glow)">
        <animateMotion dur={dur} repeatCount="indefinite" rotate="auto">
          <mpath href="#bo-cog-path" />
        </animateMotion>

        {/* Inner group: rolling spin around the cog's own centre (local origin = cog centre) */}
        <g>
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 0 0"
            to={`${spinDeg} 0 0`}
            dur={dur}
            repeatCount="indefinite"
          />

          {/* ── Teeth ── */}
          {Array.from({ length: teeth }, (_, i) => (
            <polygon
              key={i}
              fill={gold}
              transform={`rotate(${(360 / teeth) * i})`}
              points={`${-tw},${-R} ${tw},${-R} ${bw},${-rInner} ${-bw},${-rInner}`}
            />
          ))}

          {/* ── Inner ring (face of body) ── */}
          <circle r={rInner} fill="none" stroke={gold} strokeWidth={0.08} />

          {/* ── Web / spokes (5×) ── */}
          {Array.from({ length: 5 }, (_, i) => (
            <rect
              key={i}
              x={-0.038}
              y={-2.30}
              width={0.077}
              height={1.66}
              fill={gold}
              opacity={0.55}
              transform={`rotate(${(360 / 5) * i})`}
            />
          ))}

          {/* ── Hub disc ── */}
          <circle r={hub} fill={gold} opacity={0.92} />

          {/* ── Bore hole ── */}
          <circle r={bore} fill="var(--bo-bg)" />

          {/* ── Bore detail ring ── */}
          <circle r={bore - 0.05} fill="none" stroke={gold} strokeWidth={0.03} opacity={0.65} />
        </g>
      </g>
    </svg>
  )
}

function BoTriquetra({ size = 36, className }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} className={className} aria-hidden="true">
      <g stroke="currentColor" fill="none" strokeWidth="1">
        <circle cx="20" cy="14" r="7" />
        <circle cx="13" cy="25" r="7" />
        <circle cx="27" cy="25" r="7" />
        <circle cx="20" cy="21" r="2" fill="currentColor" />
      </g>
    </svg>
  )
}

function BoDiamond({ size = 14, className }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} className={className} aria-hidden="true">
      <g transform="rotate(45 20 20)">
        <rect x="6" y="6" width="28" height="28" rx="3" fill="none" stroke="currentColor" strokeWidth="1" />
        <rect x="17" y="17" width="6" height="6" rx="0.8" fill="currentColor" />
      </g>
    </svg>
  )
}

function BoCross({ size = 14, className }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} className={className} aria-hidden="true">
      <g stroke="currentColor" fill="none" strokeWidth="1">
        <path d="M20 4 L20 36 M4 20 L36 20" />
        <circle cx="20" cy="20" r="6" />
      </g>
      <circle cx="20" cy="20" r="1.6" fill="currentColor" />
    </svg>
  )
}

// ========== Sub-components ===================================================================================================


function BoSectionHeading({
  title,
  hint,
  icon,
}: {
  title: string
  hint?: string
  icon?: React.ReactNode
}) {
  return (
    <div className="boSectionHeading">
      <div className="boSectionHeadingLeft">
        {icon && <span className="boSectionHeadingIcon">{icon}</span>}
        <span className="boSectionHeadingTitle">{title}</span>
      </div>
      {hint && <span className="boSectionHeadingHint">{hint}</span>}
    </div>
  )
}

function BoKV({ k, v }: { k: string; v: string }) {
  return (
    <div className="boKV">
      <span className="boKVKey">{k}</span>
      <span className="boKVVal">{v}</span>
    </div>
  )
}

// ========== Component ========================================================================================================

type BuildOptimizerOverlayProps = {
  open: boolean
  onClose: () => void
  snapshots: Snapshot[]
  charactersInBattle: ResolvedCharacter[]
  enemy: Enemy
  tableConfig: TableConfig
  settings: Settings
}

export default function BuildOptimizerOverlay({
  open,
  onClose,
  snapshots,
  charactersInBattle,
  enemy,
  tableConfig,
  settings,
}: BuildOptimizerOverlayProps) {
  const [selectedCharName, setSelectedCharName] = useState<string>(() => charactersInBattle[0]?.name ?? '')
  const [results, setResults] = useState<BuildResult[]>([])
  const [running, setRunning] = useState(false)
  const [ran, setRan] = useState(false)
  const [configOpen, setConfigOpen] = useState(false)
  // Global quality tier for all selected substats (1 = lowest roll, 8 = highest)
  const [globalTier, setGlobalTier] = useState<number>(() => {
    const name = charactersInBattle[0]?.name ?? ''
    return name ? loadCharConfig(name).globalTier : 8
  })
  // Per-echo-slot substat selection — which substats the optimizer will vary for that slot
  const [echoConfig, setEchoConfig] = useState<EchoOptConfig>(() => {
    const name = charactersInBattle[0]?.name ?? ''
    return name ? loadCharConfig(name).echoConfig : {}
  })
  const [echoesOpen, setEchoesOpen] = useState(false)
  const [progress, setProgress] = useState(0)
  const [heroExpanded, setHeroExpanded] = useState(false)
  const [expandedLeaderRow, setExpandedLeaderRow] = useState<string | null>(null)
  const runIdRef = useRef(0)

  const steps = extractSteps(snapshots)
  const hasRotation = steps.length > 0
  const selectedChar = charactersInBattle.find(c => c.name === selectedCharName)

  // Live candidate count — computed from config so it shows before Run Optimizer is clicked
  const totalBuilds = useMemo(
    () => selectedChar ? countCandidates(selectedChar, echoConfig, globalTier) : 0,
    [selectedChar, echoConfig, globalTier],
  )

  function handleSelectChar(name: string) {
    setSelectedCharName(name)
    setResults([])
    setRan(false)
    setProgress(0)
    const saved = loadCharConfig(name)
    setGlobalTier(saved.globalTier)
    setEchoConfig(saved.echoConfig)
    setConfigOpen(false)
    setEchoesOpen(false)
  }

  function toggleSubstat(slot: 1 | 2 | 3 | 4 | 5, statKey: keyof CharacterStats) {
    setEchoConfig(prev => {
      const raw = prev[slot] ?? makeDefaultSlotConfig()
      const slotCfg = { ...raw, pinnedSubstats: raw.pinnedSubstats ?? new Set<keyof CharacterStats>() }
      const isFlexible = slotCfg.enabledSubstats.has(statKey)
      const isPinned   = slotCfg.pinnedSubstats.has(statKey)
      const nextEnabled = new Set(slotCfg.enabledSubstats)
      const nextPinned  = new Set(slotCfg.pinnedSubstats)
      if (!isFlexible && !isPinned) {
        // off → flexible
        nextEnabled.add(statKey)
      } else if (isFlexible) {
        // flexible → pinned
        nextEnabled.delete(statKey)
        nextPinned.add(statKey)
      } else {
        // pinned → off
        nextPinned.delete(statKey)
      }
      const updated = { ...prev, [slot]: { ...slotCfg, enabledSubstats: nextEnabled, pinnedSubstats: nextPinned } }
      saveCharConfig(selectedCharName, globalTier, updated)
      return updated
    })
  }

  function toggleMainStat(slot: 1 | 2 | 3 | 4 | 5, statKey: keyof CharacterStats) {
    setEchoConfig(prev => {
      const slotCfg = prev[slot] ?? makeDefaultSlotConfig()
      const next = new Set(slotCfg.enabledMainStats)
      if (next.has(statKey)) next.delete(statKey)
      else next.add(statKey)
      const updated = { ...prev, [slot]: { ...slotCfg, enabledMainStats: next } }
      saveCharConfig(selectedCharName, globalTier, updated)
      return updated
    })
  }

  function setSlotGroupSize(slot: 1 | 2 | 3 | 4 | 5, n: number) {
    setEchoConfig(prev => {
      const slotCfg = prev[slot] ?? makeDefaultSlotConfig()
      const updated = { ...prev, [slot]: { ...slotCfg, substatGroupSize: n } }
      saveCharConfig(selectedCharName, globalTier, updated)
      return updated
    })
  }

  function handleSetGlobalTier(t: number) {
    setGlobalTier(t)
    saveCharConfig(selectedCharName, t, echoConfig)
  }

  function exportConfig() {
    const persistedSlots: Partial<Record<string, PersistedSlotConfig>> = {}
    for (const k of ['1', '2', '3', '4', '5'] as const) {
      const slot = Number(k) as 1 | 2 | 3 | 4 | 5
      const s = echoConfig[slot]
      if (s) {
        persistedSlots[k] = {
          enabledMainStats: [...s.enabledMainStats] as string[],
          enabledSubstats:  [...s.enabledSubstats]  as string[],
          pinnedSubstats:   [...s.pinnedSubstats]   as string[],
          substatGroupSize: s.substatGroupSize,
        }
      }
    }
    const data: PersistedCharConfig = { globalTier, echoConfig: persistedSlots }
    const json = JSON.stringify({ character: selectedCharName, config: data }, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bo-config-${selectedCharName.replace(/\s+/g, '-').toLowerCase()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function runOptimizer() {
    if (!selectedChar || steps.length === 0) return

    const baseChar = baseCharacters.find(c => c.name === selectedCharName)
    if (!baseChar) return

    const runId = ++runIdRef.current
    setRunning(true)
    setRan(false)
    setResults([])
    setProgress(0)

    const globalColumns = buildGlobalColumns(tableConfig)
    const characterColumnsMap = Object.fromEntries(
      charactersInBattle.map(c => [c.name, Object.keys(c.maxEnergies)]),
    )
    const currentCharactersMap = Object.fromEntries(charactersInBattle.map(c => [c.name, c]))

    // Score the current build as the baseline entry
    const baselineDPS = scoreRotation({
      steps, charactersMap: currentCharactersMap, characterColumnsMap, globalColumns,
      enemy, tableConfig, settings, autocastFollowUps: true,
    })

    // Generate all build candidates from the echo configuration
    const candidates = buildAllCandidates(selectedChar, echoConfig, globalTier)

    const scored: BuildResult[] = [{
      label: 'Current build', buildDesc: '', dps: baselineDPS, delta: 0, deltaPct: 0, isCurrent: true,
    }]

    let idx = 0
    // Time-budgeted chunks: process builds for at most BUDGET_MS per slice, then yield.
    // This bounds the main-thread block time regardless of how expensive scoreRotation is.
    const BUDGET_MS = 5

    function processChunk() {
      if (runIdRef.current !== runId) return

      const deadline = performance.now() + BUDGET_MS
      while (idx < candidates.length && performance.now() < deadline) {
        const { gear, buildLabel } = candidates[idx]
        // Skip the unmodified candidate — its DPS is already captured in the baseline entry
        if (buildLabel !== '') {
          const candidateChar = resolveCharacter(baseChar, gear)
          const dps = scoreRotation({
            steps,
            charactersMap: { ...currentCharactersMap, [selectedCharName]: candidateChar },
            characterColumnsMap,
            globalColumns,
            enemy,
            tableConfig,
            settings,
            autocastFollowUps: true,
          })
          scored.push({
            label: buildLabel,
            buildDesc: buildLabel,
            dps,
            delta: 0,
            deltaPct: 0,
            isCurrent: false,
            details: detailedCandidateLines(gear.echoSlots, echoConfig),
          })
        }
        idx++
      }

      // Always update progress before scheduling next chunk so React can render it
      setProgress(idx / candidates.length)

      const done = idx >= candidates.length
      if (!done) {
        setTimeout(processChunk, 0)
        return
      }

      if (runIdRef.current !== runId) return
      scored.sort((a, b) => b.dps - a.dps)
      const finalBaseline = scored.find(r => r.isCurrent)?.dps ?? baselineDPS
      setResults(scored.map(r => ({
        ...r,
        delta: r.dps - finalBaseline,
        deltaPct: finalBaseline > 0 ? ((r.dps - finalBaseline) / finalBaseline) * 100 : 0,
      })))
      setRunning(false)
      setRan(true)
    }

    setTimeout(processChunk, 0)
  }

  const bestResult = ran && results.length > 0 ? results[0] : null
  const currentResult = ran ? results.find(r => r.isCurrent) : null
  const headroomDPS = bestResult && currentResult ? bestResult.dps - currentResult.dps : null
  const headroomPct =
    headroomDPS !== null && currentResult && currentResult.dps > 0
      ? (headroomDPS / currentResult.dps) * 100
      : null

  if (!open) return null

  return createPortal(
    <div className="buildOptOverlay" onClick={onClose}>
      <div className="buildOptPanelWrap">
        {/* Edge orbiter lives OUTSIDE the panel so overflow:hidden doesn't clip its teeth */}
        <BoEdgeOrbiter />

        {/* ===================== CONFIG DRAWER ===================== */}
        {/* Slides in over the main panel from the right, inside the wrapper so it clips to
            the panel's border-radius. z-index sits above body content but below header. */}
        <div className={`buildOptDrawer${configOpen ? ' open' : ''}`} onClick={e => e.stopPropagation()}>
          <div className="buildOptDrawerInner">
            <div className="buildOptDrawerHead">
              <div className="buildOptDrawerTitle">
                <BoCog size={14} teeth={8} />
                Echo Configuration
              </div>
              <button
                className="buildOptCloseBtn"
                onClick={() => setConfigOpen(false)}
                aria-label="Close configuration"
              >
                ✕
              </button>
            </div>

            {/* Tier selector */}
            <div className="buildOptConfigSection">
              <div className="buildOptConfigSectionLabel">Substat Roll Quality</div>
              <div className="buildOptTierRow">
                {([1, 2, 3, 4, 5, 6, 7, 8] as const).map(t => (
                  <button
                    key={t}
                    className={`buildOptTierBtn${globalTier === t ? ' active' : ''}`}
                    onClick={() => handleSetGlobalTier(t)}
                    title={t === 1 ? 'Lowest roll' : t === 8 ? 'Highest roll' : `Tier ${t}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Per-slot substat toggles */}
            <div className="buildOptConfigSection buildOptEchoConfig">
              <div className="buildOptConfigSectionLabel">Substats to Vary per Echo</div>
              {!selectedChar ? (
                <div className="buildOptEmptyNote">Select a character first.</div>
              ) : (
                ([1, 2, 3, 4, 5] as const)
                  .slice()
                  .sort((a, b) => {
                    const ca = selectedChar.gear.echoSlots[a]?.cost ?? -1
                    const cb = selectedChar.gear.echoSlots[b]?.cost ?? -1
                    return cb - ca
                  })
                  .map(slot => {
                  const echo = selectedChar.gear.echoSlots[slot]
                  const slotCfg = (() => {
                    const raw = echoConfig[slot] ?? makeDefaultSlotConfig()
                    return { ...raw, pinnedSubstats: raw.pinnedSubstats ?? new Set<keyof CharacterStats>() }
                  })()
                  const mainStatOptions = echo
                    ? (MAIN_STAT_OPTIONS[echo.cost as 1 | 3 | 4] ?? [])
                    : []
                  const pinnedCount   = slotCfg.pinnedSubstats.size
                  const flexibleCount = slotCfg.enabledSubstats.size
                  const maxGroup = Math.max(1, flexibleCount)
                  return (
                    <div key={slot} className={`buildOptEchoSlot${echo ? '' : ' empty'}`}>
                      <div className="buildOptEchoSlotHead">
                        <span className="buildOptEchoSlotLabel">
                          {echo
                            ? <span className="buildOptEchoSlotName">{echo.name}</span>
                            : <span>(empty)</span>
                          }
                        </span>
                        {echo && <span className="buildOptEchoSlotCost">Cost {echo.cost}</span>}
                      </div>
                      {echo ? (
                        <>
                          {/* ── Main Stat ── */}
                          <div className="buildOptEchoSubRow">
                            <span className="buildOptEchoSubLabel">Main Stat</span>
                          </div>
                          <div className="buildOptEchoSubstatGrid">
                            {mainStatOptions.map(s => {
                              const active = slotCfg.enabledMainStats.has(s.key)
                              return (
                                <button
                                  key={s.key}
                                  className={`buildOptSubstatChip${active ? ' active' : ''}`}
                                  onClick={() => toggleMainStat(slot, s.key)}
                                  title={s.label}
                                >
                                  {s.label}
                                </button>
                              )
                            })}
                          </div>

                          {/* ── Substats ── */}
                          <div className="buildOptEchoSubRow">
                            <span className="buildOptEchoSubLabel">Substats</span>
                            <div className="buildOptGroupRow">
                              <span>pick</span>
                              {[1, 2, 3, 4, 5].map(n => (
                                <button
                                  key={n}
                                  className={`buildOptGroupBtn${slotCfg.substatGroupSize === n ? ' active' : ''}${n > maxGroup ? ' dim' : ''}`}
                                  onClick={() => setSlotGroupSize(slot, n)}
                                  title={
                                    pinnedCount > 0
                                      ? `Pick ${n} from yellow pool + ${pinnedCount} pinned = ${n + pinnedCount} total`
                                      : `Test combinations of ${n} substats at a time`
                                  }
                                >
                                  {n}
                                </button>
                              ))}
                              <span>from flexible</span>
                              {pinnedCount > 0 && (
                                <span className="buildOptGroupPinHint">+{pinnedCount} always</span>
                              )}
                            </div>
                          </div>
                          <div className="buildOptEchoSubstatGrid">
                            {OPTIMIZER_SUBSTATS.map(s => {
                              const isFlexible = slotCfg.enabledSubstats.has(s.key)
                              const isPinned   = slotCfg.pinnedSubstats.has(s.key)
                              const cls = isPinned ? ' pinned' : isFlexible ? ' active' : ''
                              return (
                                <button
                                  key={s.key}
                                  className={`buildOptSubstatChip${cls}`}
                                  onClick={() => toggleSubstat(slot, s.key)}
                                  title={isPinned ? `${s.label} — always included` : s.isPercent ? `${s.label} (%)` : s.label}
                                >
                                  {s.label}
                                </button>
                              )
                            })}
                          </div>
                        </>
                      ) : (
                        <div className="buildOptEchoEmpty">No echo equipped in this slot</div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>

        {/* ===================== ECHOES DRAWER ===================== */}
        <div className={`buildOptDrawer${echoesOpen ? ' open' : ''}`} onClick={e => e.stopPropagation()}>
          <div className="buildOptDrawerInner">
            <div className="buildOptDrawerHead">
              <div className="buildOptDrawerTitle">
                <BoDiamond size={14} />
                Echo Substats
              </div>
              <button
                className="buildOptCloseBtn"
                onClick={() => setEchoesOpen(false)}
                aria-label="Close echoes"
              >
                ✕
              </button>
            </div>
            <div className="buildOptConfigSection buildOptEchoConfig">
              {!selectedChar ? (
                <div className="buildOptEmptyNote">No character selected.</div>
              ) : (
                ([1, 2, 3, 4, 5] as const).map(slot => {
                  const echo = selectedChar.gear.echoSlots[slot]
                  return (
                    <div key={slot} className={`buildOptEchoDetailSlot${echo ? '' : ' empty'}`}>
                      <div className="buildOptEchoDetailHead">
                        <span className="buildOptEchoDetailSlotNum">E{slot}</span>
                        {echo
                          ? <span className="buildOptEchoDetailName">{echo.name}</span>
                          : <span className="buildOptEchoDetailEmpty">empty</span>
                        }
                        {echo && <span className="buildOptEchoDetailCost">C{echo.cost}</span>}
                      </div>
                      {echo && (
                        <div className="buildOptEchoDetailSubs">
                          {Object.entries(echo.subStats).map(([key, val]) => {
                            const opt = SUBSTAT_OPTIONS.find(s => s.key === (key as keyof CharacterStats))
                            const label = opt?.label ?? key
                            const formatted = opt?.isPercent
                              ? `${((val as number) * 100).toFixed(1)}%`
                              : String(val)
                            return (
                              <span key={key} className="buildOptEchoDetailSub">
                                {label} {formatted}
                              </span>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>

        <div className="buildOptPanel" onClick={e => e.stopPropagation()}>

          {/* Decorative background */}
          <div className="buildOptGridOverlay" />
          <BoCog size={520} teeth={22} className="buildOptDecoCogBL" />
          <BoCog size={420} teeth={36} className="buildOptDecoCogBR" />

        {/* ===================== HEADER ===================== */}
        <header className="buildOptHeader">
          <div className="buildOptHeaderLeft">
            <BoTriquetra size={26} className="buildOptHeaderTriquetra" />
            <div className="buildOptHeaderTitles">
              <h2 className="buildOptHeaderTitle">
                Build <span className="buildOptGold">Optimizer</span>
              </h2>
            </div>
            <span className={`boStatusChip${running ? ' solving' : ran ? ' done' : ''}`}>
              <span className="boStatusDot" />
              {running ? 'Solving' : ran ? 'Done' : 'Ready'}
            </span>
          </div>

          <div className="buildOptHeaderRight">
            <button className="buildOptCloseBtn" onClick={onClose} aria-label="Close">
              <img src="/assets/ui/close.png" alt="" style={{ width: 22, height: 22, display: 'block' }} />
            </button>
          </div>
        </header>

        {/* ===================== BODY ===================== */}
        <div className="buildOptBody">

          {/* LEFT: Rotation + Character selector */}
          <section className="buildOptSectionLeft">
            <BoSectionHeading
              title="Skill Rotation"
              hint={hasRotation ? `${steps.length} steps` : 'empty'}
              icon={<BoDiamond size={12} />}
            />
            <div className="buildOptRotList boInsetPanel">
              {steps.length === 0 ? (
                <div className="buildOptEmptyNote">No steps \u2014 add actions to the rotation first.</div>
              ) : (
                steps.map((s, i) => (
                  <div key={i} className={`buildOptRotRow${i === 0 ? ' first' : ''}`}>
                    <span className="buildOptRotIdx">{i + 1}</span>
                    <div className="buildOptRotInfo">
                      <div className="buildOptRotChar">{s.character}</div>
                      <div className="buildOptRotAction">{s.action}</div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <BoSectionHeading title="Optimize For" icon={<BoCross size={14} />} />
            <div className="buildOptCharList">
              {charactersInBattle.map(c => (
                <button
                  key={c.name}
                  className={`buildOptCharBtn${c.name === selectedCharName ? ' active' : ''}`}
                  onClick={() => handleSelectChar(c.name)}
                >
                  <span className="buildOptCharBtnName">{c.name}</span>
                </button>
              ))}
            </div>
          </section>

          {/* CENTER: Hero card + Leaderboard */}
          <section className="buildOptSectionCenter">

            {ran && bestResult && (
              <div className="buildOptHeroCard boInsetPanel">
                <BoCog size={220} teeth={48} className="buildOptHeroCog" />
                <div className="buildOptHeroGlow" />
                <div className="buildOptHeroRow">
                  <div className="buildOptHeroLeft">
                    <div className="buildOptHeroIconWrap">
                      <BoTriquetra size={36} className="buildOptHeroTriquetra" />
                      <span className="buildOptHeroRank">#1</span>
                    </div>
                    <div>
                      <div className="buildOptHeroSubLabel">Leading Configuration</div>
                      {(() => {
                        const mainLines = bestResult.details?.filter(l => l.includes('[')) ?? []
                        return mainLines.length > 0
                          ? <div className="buildOptHeroMainStats">{mainLines.map(l => l.split(' · ')[0]).join('  ·  ')}</div>
                          : <div className="buildOptHeroMainStats buildOptHeroMainStatsEmpty">Substat-only run</div>
                      })()}
                      <button
                        className="buildOptHeroDetailsBtn"
                        onClick={() => setHeroExpanded(v => !v)}
                      >
                        {heroExpanded ? '▴ Less' : '▾ Details'}
                      </button>
                      {heroExpanded && bestResult.details && bestResult.details.length > 0 && (
                        <div className="buildOptHeroDetailBox">
                          {bestResult.details.map(line => (
                            <div key={line} className="buildOptHeroDetailLine">{line}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="buildOptHeroRight">
                    <div className="buildOptHeroDpsSub">Average DPS</div>
                    <div className="buildOptHeroDps">
                      {bestResult.dps.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="buildOptLeaderboard boInsetPanel">
              <div className="buildOptLeaderHead">
                <div className="buildOptLeaderHeadLeft">
                  <BoDiamond size={12} className="buildOptLeaderHeadIcon" />
                  <span className="buildOptLeaderHeadLabel">Leaderboard</span>
                </div>
                <div className="buildOptLeaderHeadRight">
                  <span>Sort DPS</span>
                  <span className="buildOptLeaderHeadDivider" />
                  <span>{ran ? `Top ${Math.min(results.length, 20)} / ${results.length}` : '\u2014'}</span>
                </div>
              </div>
              <div className="buildOptLeaderBody">
                {!ran && !running && (
                  <div className="buildOptLeaderEmpty">
                    {hasRotation
                      ? 'Select a character and click Run Optimizer.'
                      : 'Add actions to the rotation first.'}
                  </div>
                )}
                {running && (
                  <div className="buildOptLeaderEmpty">Calculating builds\u2026</div>
                )}
                {ran && results.slice(0, 20).map((r, i) => (
                  <div key={r.label}>
                    <div
                      className={`buildOptLeaderRow${r.isCurrent ? ' current' : ''}${i === 0 ? ' best' : ''}`}
                    >
                      <span className="buildOptLeaderRank">{String(i + 1).padStart(2, '0')}</span>
                      <span className="buildOptLeaderName" title={r.label}>
                        {r.label}
                        {r.isCurrent && <span className="buildOptLeaderCurrent"> current</span>}
                      </span>
                      <div className="buildOptLeaderBarWrap">
                        <div
                          className="buildOptLeaderBarFill"
                          style={{ width: `${(r.dps / (bestResult?.dps || 1)) * 100}%` }}
                        />
                      </div>
                      <span className="buildOptLeaderDps">
                        {r.dps.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
                      <span
                        className={`buildOptLeaderDelta${r.deltaPct > 0 ? ' pos' : r.deltaPct < 0 ? ' neg' : ' neu'}`}
                      >
                        {r.deltaPct === 0 ? '\u2014' : `${r.deltaPct > 0 ? '+' : ''}${r.deltaPct.toFixed(1)}%`}
                      </span>
                      {!r.isCurrent && r.details && r.details.length > 0 && (
                        <button
                          className={`buildOptLeaderExpandBtn${expandedLeaderRow === r.label ? ' open' : ''}`}
                          onClick={() => setExpandedLeaderRow(prev => prev === r.label ? null : r.label)}
                          title="Per-echo breakdown"
                        >›</button>
                      )}
                    </div>
                    {expandedLeaderRow === r.label && r.details && (
                      <div className="buildOptLeaderDetail">
                        {r.details.map(line => (
                          <span key={line} className="buildOptLeaderDetailLine">{line}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* RIGHT: Tier selector + Convergence + Build info */}
          <section className="buildOptSectionRight">

            <BoSectionHeading title="Convergence" icon={<BoCross size={12} />} />
            <div className="buildOptConvergenceBox boInsetPanel">
              {/* Dial */}
              <div className="buildOptDial">
                <div className="buildOptDialRingOuter" />
                <div className="buildOptDialRingInner" />
                {Array.from({ length: 24 }).map((_, i) => (
                  <span
                    key={i}
                    className="buildOptDialTick"
                    style={{
                      height: i % 6 === 0 ? '12%' : '5%',
                      transform: `translate(-50%, -50%) rotate(${i * 15}deg) translateY(-90%)`,
                    }}
                  />
                ))}
                {/* Needle — sweeps -80° → +80° as progress goes 0 → 1 */}
                <span
                  className="buildOptDialNeedle"
                  style={{ transform: `translate(-50%, -100%) rotate(${progress * 160 - 80}deg)` }}
                />
                <span className="buildOptDialDot" />
                <div className="buildOptDialCenter">
                  <div className="buildOptDialValue">
                    {running ? `${Math.round(progress * 100)}%` : ran ? '100%' : '—'}
                  </div>
                  <div className="buildOptDialSub">CONF.</div>
                </div>
              </div>
              {/* Stats beside dial */}
              <div className="buildOptDialStats">
                <BoKV k="Builds" v={
                  running
                    ? `${Math.round(progress * totalBuilds)} / ${totalBuilds}`
                    : totalBuilds > 0 ? String(totalBuilds) : '—'
                } />
                <BoKV k="Rotation" v={ran || running ? `${steps.length} steps` : '—'} />
                <BoKV k="Tier" v={String(globalTier)} />
                <BoKV k="Substats" v={
                  (() => {
                    const total = ([1,2,3,4,5] as const)
                      .reduce((n, s) => n + (echoConfig[s]?.substatGroupSize ?? 0), 0)
                    return total > 0 ? String(total) : '—'
                  })()
                } />
              </div>
            </div>

            <BoSectionHeading title="Current Build" icon={<BoDiamond size={12} />} />
            <div className="buildOptCurrentBox boInsetPanel">
              {selectedChar ? (
                <>
                  {(() => {
                    const slots = selectedChar.gear.echoSlots
                    const setNames = ([1, 2, 3, 4, 5] as const)
                      .map(s => slots[s]?.setName)
                      .filter((n): n is string => n !== undefined)
                    const uniqueSets = [...new Set(setNames)]
                    return (
                      <>
                        <BoKV k="Sequence" v={`S${selectedChar.sequence}`} />
                        <BoKV k="Weapon" v={
                          selectedChar.gear.weapon
                            ? `${selectedChar.gear.weapon.name} R${selectedChar.gear.weapon.rank}`
                            : '—'
                        } />
                        <BoKV k="Set" v={
                          uniqueSets.length === 0 ? '—' :
                          uniqueSets.length === 1 ? uniqueSets[0] :
                          `${uniqueSets.length} sets`
                        } />
                        <button
                          className={`buildOptEchoesToggle${echoesOpen ? ' active' : ''}`}
                          onClick={() => { setEchoesOpen(true); setConfigOpen(false) }}
                        >
                          <span className="buildOptEchoesToggleLeft">
                            <BoCog
                              size={14}
                              teeth={8}
                              className={`buildOptHeaderCog ${echoesOpen ? 'boCogSpinFast' : 'boCogSpin'}`}
                            />
                            <span>Echoes</span>
                          </span>
                          <span>&#x25b6;</span>
                        </button>
                      </>
                    )
                  })()}
                </>
              ) : (
                <div className="buildOptEmptyNote">No character selected</div>
              )}
            </div>

            {ran && headroomDPS !== null && (
              <>
                <BoSectionHeading title="Headroom" icon={<BoDiamond size={12} />} />
                <div className="buildOptGapBox boInsetPanel">
                  <div className="buildOptGapValue">
                    {headroomDPS.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </div>
                  <div className="buildOptGapLabel">DPS gap</div>
                  {headroomPct !== null && (
                    <div className="buildOptGapPct">
                      {headroomPct > 0 ? `+${headroomPct.toFixed(1)}%` : '—'}
                    </div>
                  )}
                  <div className="buildOptGapSub">best vs. current</div>
                </div>
              </>
            )}
          </section>
        </div>

        {/* ===================== FOOTER ===================== */}
        <footer className="buildOptFooter">
          <div className="buildOptFooterLeft">
            <button
              className={`buildOptSmallBtn${configOpen ? ' active' : ''}`}
              onClick={() => { setConfigOpen(v => !v); setEchoesOpen(false) }}
              aria-label="Echo configuration"
            >
              <BoCog
                size={14}
                teeth={8}
                className={`buildOptHeaderCog ${configOpen || running ? 'boCogSpinFast' : 'boCogSpin'}`}
              />
              Configure
            </button>
            {ran && (
              <button
                className="buildOptSmallBtn"
                onClick={exportConfig}
                aria-label="Export configuration"
              >
                ↓ Export
              </button>
            )}
            {ran && (
              <div className="buildOptFooterInfo">
                {results.length} builds tested · {selectedCharName}
              </div>
            )}
          </div>
          <div className="buildOptFooterRight">
            {!hasRotation && (
              <span className="buildOptFooterWarn">No rotation \u2014 add steps first</span>
            )}
            <button
              className="buildOptRunBtn"
              onClick={runOptimizer}
              disabled={!hasRotation || running}
              aria-label="Run build optimizer"
            >
              <BoCog
                size={18}
                teeth={10}
                className={`buildOptRunCog${running ? ' boCogSpinFast' : ''}`}
              />
              {running ? 'Calculating\u2026' : ran ? 'Re-run' : 'Run Optimizer'}
              {!running && <BoDiamond size={12} className="buildOptRunIcon" />}
            </button>
          </div>
        </footer>

        </div>{/* /buildOptPanel */}
      </div>{/* /buildOptPanelWrap */}
    </div>,
    document.body,
  )
}
