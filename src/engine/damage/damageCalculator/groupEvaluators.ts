// Buff-toggle re-evaluators: exact damage with only a chosen set of modifier groups active (DataOverlay).
import type { Action } from '../../../types/action'
import type { Enemy } from '../../../types/enemy'
import type { CharacterStats, EnemyStats } from '../../../types/stats'
import type { DamageModifier } from '../../../types/modifiers'
import type { ScalingType, ElementType } from '../../../types/baseTypes'
import type { StepContext } from '../../../types/stepContext'
import { negativeStatuses } from '../../../data/negativeStatuses'
import { mergeStats, mergeEnemyStats, calculateScalingStat } from './mergeStats'
import { calculateDefenseMultiplier, calculateResistanceMultiplierValue, getStatusBonusDMG, getStatusAmplifyDMG, getStatusTotalMultiplierDMG } from './formulas'
import { calculateDamage } from './calculateDamage'
import { buildModifierGroups, addActiveGroupStats, sumInherentStats } from './modifierGroups'

// DEBUG: character:action combos that already logged a critRate overflow, so each warns only once per
// session (module-level on purpose; never cleared).
const _dbgLoggedOverflows = new Set<string>()

// ========== Action Damage Re-Evaluator =======================================================================================

/**
 * Re-evaluates an action's damage with only the specified modifier groups active.
 * Used by DataOverlay so toggling buffs on/off produces exact (not estimated) damage numbers.
 *
 * Inherent modifiers are controlled via their `inherent_${im.displayName}` key, just like
 * regular modifier groups, so they participate correctly in Shapley value calculations.
 */
export function evaluateDamageWithGroups(
  params: { action: Action; characterName: string; baseStats: CharacterStats; damageModifiers: DamageModifier[]; enemy: Enemy; ctx?: StepContext },
  snapshotId: number,
  timeStamp: number,
  activeGroupKeys: Set<string>,
): { normal: number; crit: number; avg: number } {
  const { action, characterName, baseStats, damageModifiers, enemy, ctx } = params

  // Accumulate inherent modifier stats for only those whose key is active.
  const { inherentCharBase, inherentEnemyBase } = sumInherentStats(action, ctx, activeGroupKeys)

  // Build the same group → indices mapping as calculateAllContrubutions
  const groupIndices = buildModifierGroups(damageModifiers, true)

  // Aggregate only the active modifier groups on top of the inherent baseline
  const charMods: Partial<CharacterStats> = { ...inherentCharBase }
  const enemyMods: Partial<EnemyStats> = { ...inherentEnemyBase }

  addActiveGroupStats(groupIndices, activeGroupKeys, damageModifiers, ctx, charMods, enemyMods)

  // ── DEBUG: log when critRate overflows 100% (causes impossible average > crit) ─────────────────
  // calculateDamage caps critRate at 1, so this is only diagnostic: it names the modifiers stacking it.
  const _dbgFinalCritRate = (baseStats.critRate ?? 0) + (charMods.critRate ?? 0)
  if (_dbgFinalCritRate > 1.0 && !_dbgLoggedOverflows.has(`${characterName}:${action.name}`)) {
    _dbgLoggedOverflows.add(`${characterName}:${action.name}`)
    // Build a readable snapshot of every modifier that contributed critRate
    const _dbgCritContrib = damageModifiers
      .filter(m => (m.characterStats as Record<string, unknown> | undefined)?.critRate)
      .map((m, _i) => ({
        globalIdx: _i,
        source: m.source,
        displayName: m.displayName,
        critRate: (m.characterStats as Record<string, unknown>).critRate,
      }))
    const _dbgGroupMap: Record<string, number[]> = {}
    for (const [k, v] of groupIndices) _dbgGroupMap[k] = v
    console.warn(
      `[DEBUG evaluateDamageWithGroups] critRate overflow on "${action.name}" (${characterName})`,
      '\n  baseStats.critRate:', baseStats.critRate,
      '\n  charMods.critRate:', charMods.critRate,
      '\n  finalCritRate:', _dbgFinalCritRate,
      '\n  All modifiers with critRate:', _dbgCritContrib,
      '\n  damageModifiers.length:', damageModifiers.length,
      '\n  groupIndices (key → indices):', _dbgGroupMap,
      '\n  All modifier sources:', damageModifiers.map((m, i) => `[${i}] ${m.source} / ${m.displayName}`),
    )
  }
  // ────────────────────────────────────────────────────────────────────────────────────────────────

  const result = calculateDamage({
    action,
    name: characterName,
    stats: baseStats,
    damageModifiers: [],
    modifierCharacterStats: charMods,
    modifierEnemyStats: enemyMods,
    enemy,
    snapshotId,
    timeStamp,
    skipContributions: true,
  })

  return {
    normal: result.damageEvent.normalStrike,
    crit: result.damageEvent.criticalStrike,
    avg: result.damageEvent.average,
  }
}

// ========== Negative Status Re-Evaluator =====================================================================================

/**
 * Re-evaluates negative status damage with only the specified modifier groups active.
 * Uses the same formula as calculateNegativeStatusContributions's evaluateSubset.
 */
export function evaluateNegativeStatusWithGroups(
  params: { currStacks: number; element: ElementType; enemy: Enemy; negativeStatusName: string; baseStats: CharacterStats; damageModifiers: DamageModifier[]; ctx?: StepContext; baseDMGScaling?: { scaling: ScalingType; multiplier: number } },
  activeGroupKeys: Set<string>,
): { normal: number; crit: number; avg: number } {
  const { currStacks, element, enemy, negativeStatusName, baseStats, damageModifiers, ctx, baseDMGScaling } = params

  // Resolve base DMG from stack table (if not ATK-scaled)
  let baseDMG = 0
  if (!baseDMGScaling) {
    const statusIdentifier = Object.entries(negativeStatuses).find(([, s]) => s.name === negativeStatusName)?.[0]
    if (statusIdentifier) baseDMG = negativeStatuses[statusIdentifier].damage[currStacks] ?? 0
  }

  // Build group → indices map. Unlike the contribution path, tracker-only modifiers are NOT skipped
  // here (harmless: they carry no stats).
  const groupIndices = buildModifierGroups(damageModifiers, false)

  // Aggregate only active groups
  const charMods: Partial<CharacterStats> = {}
  const enemyMods: Partial<EnemyStats> = {}
  addActiveGroupStats(groupIndices, activeGroupKeys, damageModifiers, ctx, charMods, enemyMods)

  const statsS = mergeStats(baseStats, charMods)
  const enemyStatsS = mergeEnemyStats(enemy.stats, enemyMods)

  // Same formula as the negative status evaluateSubset (no defIgnore, no resistancePEN, no elementalResPEN)
  const damageRES =
    calculateResistanceMultiplierValue(0, enemyStatsS.resistance) *
    calculateDefenseMultiplier(statsS.level, enemyStatsS.level, 0) *
    (1 - enemyStatsS.damageReduction) *
    (1 - ((enemyStatsS[`${element.toLowerCase()}RES` as keyof EnemyStats] as number) || 0))

  const statusMultiplier =
    (1 + getStatusBonusDMG(statsS, element)) *
    (1 + getStatusAmplifyDMG(statsS, element)) *
    getStatusTotalMultiplierDMG(statsS, element)

  const effectiveBaseDMG = baseDMGScaling
    ? calculateScalingStat(statsS, baseDMGScaling.scaling) * baseDMGScaling.multiplier
    : baseDMG

  const dmg = effectiveBaseDMG * damageRES * statusMultiplier
  return { normal: dmg, crit: dmg, avg: dmg }
}
