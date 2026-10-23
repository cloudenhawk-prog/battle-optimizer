// Per-modifier-group damage attribution for action damage (Monte Carlo Shapley values).
import type { Contribution } from '../../../types/events'
import type { Action } from '../../../types/action'
import type { Enemy } from '../../../types/enemy'
import type { CharacterStats, EnemyStats } from '../../../types/stats'
import type { DamageModifier } from '../../../types/modifiers'
import type { StepContext } from '../../../types/stepContext'
import { calculateDamage } from './calculateDamage'
import { buildModifierGroups, addActiveGroupStats, sumInherentStats } from './modifierGroups'

// ========== Action Contributions =============================================================================================

/**
 * Attributes an action's damage to its modifier groups. Inherent modifiers form the unattributed
 * baseline f(∅); each group's contribution is its average marginal damage over random orderings.
 *
 * NOTE: the export name is misspelled ("Contrubutions"); it is kept for compatibility —
 * `calculateAllContributions` is a correctly spelled alias.
 */
export function calculateAllContrubutions(action: Action, name: string, stats: CharacterStats, damageModifiers: DamageModifier[], enemy: Enemy, snapshotId: number, timeStamp: number, normalStrike: number, criticalStrike: number, average: number, ctx?: StepContext): Record<string, Contribution> {
  const results: Record<string, Contribution> = {}

  // Pre-compute inherent modifier stats so every subset evaluation baseline includes them.
  // Without this, inherentModifiers would be missing from all subset baselines.
  const { inherentCharBase, inherentEnemyBase } = sumInherentStats(action, ctx)

  // Tracker-only modifiers are excluded: they carry no stats and exist only to track state.
  const groupIndices = buildModifierGroups(damageModifiers, true)

  const groups = [...groupIndices.entries()]
  const n = groups.length
  if (n === 0) return results

  // Evaluates damage for an arbitrary subset of modifier groups by aggregating only those groups'
  // stats (plus the inherent baseline) and delegating to calculateDamage.
  const evaluateSubset = (subsetKeys: Set<string>): { normal: number; crit: number; avg: number } => {
    const charMods: Partial<CharacterStats> = { ...inherentCharBase }
    const enemyMods: Partial<EnemyStats> = { ...inherentEnemyBase }

    addActiveGroupStats(groups, subsetKeys, damageModifiers, ctx, charMods, enemyMods)

    const result = calculateDamage({
      action,
      name,
      stats,
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

  // Monte Carlo Shapley value estimation via random permutation sampling.
  // φ_i ≈ (1/T) Σ_t [ f(S_t^i ∪ {i}) - f(S_t^i) ]
  // where S_t^i is the set of groups appearing before i in a random permutation of iteration t.
  // Shapley values fairly distribute f(N) - f(∅) among all modifier groups.
  // NOTE: the Math.random call order here is locked by golden tests — don't reorder.
  const SHAPLEY_SAMPLES = 100

  const shapleyNormal = new Map<string, number>()
  const shapleyCrit = new Map<string, number>()
  const shapleyAvg = new Map<string, number>()
  for (const [groupKey] of groups) {
    shapleyNormal.set(groupKey, 0)
    shapleyCrit.set(groupKey, 0)
    shapleyAvg.set(groupKey, 0)
  }

  // f(∅): damage with only inherent modifiers active — the unattributed base
  const base = evaluateSubset(new Set())

  for (let iter = 0; iter < SHAPLEY_SAMPLES; iter++) {
    // Fisher-Yates shuffle to produce a uniform random permutation of group indices
    const perm = groups.map((_, i) => i)
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[perm[i], perm[j]] = [perm[j], perm[i]]
    }

    const currentSet = new Set<string>()
    let prevNormal = base.normal
    let prevCrit = base.crit
    let prevAvg = base.avg

    for (const idx of perm) {
      const [groupKey] = groups[idx]
      currentSet.add(groupKey)

      const dmg = evaluateSubset(currentSet)

      shapleyNormal.set(groupKey, shapleyNormal.get(groupKey)! + (dmg.normal - prevNormal))
      shapleyCrit.set(groupKey, shapleyCrit.get(groupKey)! + (dmg.crit - prevCrit))
      shapleyAvg.set(groupKey, shapleyAvg.get(groupKey)! + (dmg.avg - prevAvg))

      prevNormal = dmg.normal
      prevCrit = dmg.crit
      prevAvg = dmg.avg
    }
  }

  // Average marginals across all iterations to get final Shapley values
  const safePercent = (sv: number, total: number): number => (total !== 0 ? (sv / total) * 100 : 0)

  for (let gi = 0; gi < n; gi++) {
    const [groupKey, indices] = groups[gi]
    const anchor = indices.map(i => damageModifiers[i]).find(m => (m.source ?? '') === groupKey)
    const representativeMod = anchor ?? damageModifiers[indices[0]]
    const uniqueKey = groupKey in results ? `${groupKey}_${indices[0]}` : groupKey

    const svNormal = shapleyNormal.get(groupKey)! / SHAPLEY_SAMPLES
    const svCrit = shapleyCrit.get(groupKey)! / SHAPLEY_SAMPLES
    const svAvg = shapleyAvg.get(groupKey)! / SHAPLEY_SAMPLES

    results[uniqueKey] = {
      source: representativeMod.source,
      ownerCharacter: representativeMod.ownerCharacter ?? null,
      displayName: representativeMod.displayName,
      normal_damage_contributed: Math.max(0, svNormal),
      normal_percent_damage_contributed: safePercent(svNormal, normalStrike),
      crit_damage_contributed: Math.max(0, svCrit),
      crit_percent_damage_contributed: safePercent(svCrit, criticalStrike),
      average_damage_contributed: Math.max(0, svAvg),
      average_percent_damage_contributed: safePercent(svAvg, average),
    }
  }

  return results
}

/** Correctly spelled alias of calculateAllContrubutions. */
export const calculateAllContributions = calculateAllContrubutions
