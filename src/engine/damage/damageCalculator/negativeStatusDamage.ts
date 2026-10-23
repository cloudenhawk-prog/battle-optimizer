// Negative status damage (Erosion, Frazzle, Bane, Chafe, Burst, Flare ticks/procs) and its Shapley contributions.
import type { DamageEvent, Contribution } from '../../../types/events'
import type { Enemy } from '../../../types/enemy'
import type { CharacterStats, EnemyStats } from '../../../types/stats'
import type { DamageModifier } from '../../../types/modifiers'
import type { ScalingType, ElementType } from '../../../types/baseTypes'
import type { StepContext } from '../../../types/stepContext'
import { negativeStatuses } from '../../../data/negativeStatuses'
import { mergeStats, mergeEnemyStats, calculateScalingStat } from './mergeStats'
import { calculateDefenseMultiplier, calculateResistanceMultiplierValue, getStatusBonusDMG, getStatusAmplifyDMG, getStatusTotalMultiplierDMG } from './formulas'
import { buildModifierGroups, addActiveGroupStats } from './modifierGroups'

// ========== Negative Status Calculator =======================================================================================

/**
 * Calculates negative status damage with proper modifier application.
 *
 * Unlike normal action damage which scales off character stats (ATK/HP/DEF),
 * negative status damage uses FLAT values from a stack table (or, with baseDMGScaling,
 * a scaled stat — e.g. Hiyuki's ATK-scaled Glacio Chafe proc). However, it still
 * benefits from status-specific modifiers (bonus/amplify/totalMultiplier for the
 * specific status type).
 *
 * Formula:
 *   damage = baseDMG * resistanceMultipliers * statusModifierMultipliers
 *
 * Where:
 *   - baseDMG = flat damage from stack table (e.g., 1654 for Aero Erosion stack 1)
 *   - resistanceMultipliers = defense, resistance, elemental RES, damage reduction
 *   - statusModifierMultipliers = (1 + statusBonus) * (1 + statusAmplify) * statusTotalMultiplier
 *
 * @param currStacks - Current stack count of the negative status
 * @param element - Element type of the negative status
 * @param enemy - Target enemy
 * @param negativeStatusName - Name of the negative status
 * @param baseStats - Base character stats (before modifiers) - used for level in defense calc
 * @param modifierCharacterStats - Aggregated modifier stats from context
 * @param modifierEnemyStats - Aggregated enemy modifier stats from context
 * @param damageModifiers - Active damage modifiers from context (for contributions)
 * @param dealer - Name of the damage dealer
 * @param snapshotId - Current snapshot ID
 * @param timeStamp - Time when damage occurs
 * @param actionName - Optional action name override
 * @param ctx - Optional step context (for contributions)
 * @param baseDMGScaling - Optional: base DMG = scalingStat * multiplier instead of the stack table
 *
 * No crit, no general/element/dmgType bonuses, and no defIgnore / RES PEN apply.
 */
export function calculateDamageNegativeStatus(currStacks: number, element: ElementType, enemy: Enemy, negativeStatusName: string, baseStats: CharacterStats, modifierCharacterStats: Partial<CharacterStats>, modifierEnemyStats: Partial<EnemyStats>, damageModifiers: DamageModifier[], dealer: string, snapshotId: number, timeStamp: number, actionName?: string, ctx?: StepContext, baseDMGScaling?: { scaling: ScalingType; multiplier: number }): DamageEvent {
  // Merge base stats with modifiers to get final stats (must happen before baseDMG when scaling off merged stats)
  const finalCharacterStats = mergeStats(baseStats, modifierCharacterStats)
  const finalEnemyStats = mergeEnemyStats(enemy.stats, modifierEnemyStats)

  // Get base damage: either scaled from a stat (ATK/HP/DEF) or from the negative status stack table
  let baseDMG: number
  let scalingType: ScalingType
  if (baseDMGScaling) {
    baseDMG = calculateScalingStat(finalCharacterStats, baseDMGScaling.scaling) * baseDMGScaling.multiplier
    scalingType = baseDMGScaling.scaling
  } else {
    const statusIdentifier = Object.entries(negativeStatuses).find(([, status]) => status.name === negativeStatusName)?.[0]
    baseDMG = negativeStatuses[statusIdentifier].damage[currStacks]
    scalingType = 'FLAT'
  }

  // Calculate resistance multipliers
  const level = finalCharacterStats.level
  const enemyLevel = finalEnemyStats.level
  const enemyResistance = finalEnemyStats.resistance
  const enemyDamageReduction = finalEnemyStats.damageReduction
  const elementRES = finalEnemyStats[`${element.toLowerCase()}RES` as keyof typeof finalEnemyStats] as number

  const resistanceMultiplier = calculateResistanceMultiplierValue(0, enemyResistance)
  const defenseMultiplier = calculateDefenseMultiplier(level, enemyLevel, 0)
  const damageReductionMultiplier = 1 - enemyDamageReduction
  const elementalResMultiplier = 1 - elementRES
  const damageRES = resistanceMultiplier * defenseMultiplier * damageReductionMultiplier * elementalResMultiplier

  // Apply negative status damage multipliers from merged character stats
  // These are only the status-specific modifiers (e.g., aeroErosionAmplifyDMG)
  const statusBonus = getStatusBonusDMG(finalCharacterStats, element)
  const statusAmplify = getStatusAmplifyDMG(finalCharacterStats, element)
  const statusTotalMultiplier = getStatusTotalMultiplierDMG(finalCharacterStats, element)
  const statusMultiplier = (1 + statusBonus) * (1 + statusAmplify) * statusTotalMultiplier

  // Final damage calculation
  const damage = baseDMG * damageRES * statusMultiplier

  // Calculate contributions if requested
  const baseDMGFn = baseDMGScaling
    ? (stats: CharacterStats) => calculateScalingStat(stats, baseDMGScaling.scaling) * baseDMGScaling.multiplier
    : undefined
  const contributions = !damageModifiers.length || !ctx ? {} : calculateNegativeStatusContributions(baseDMG, element, enemy, baseStats, damageModifiers, damage, ctx, baseDMGFn)

  const damageEvent: DamageEvent = {
    snapshotId,
    dealer,
    target: enemy.name,
    elements: [element],
    dmgTypes: ['NEGATIVE_STATUS'],
    scaling: scalingType,
    actionName: actionName ?? negativeStatusName,
    normalStrike: damage,
    criticalStrike: damage,
    average: damage,
    contributions,
    timeStamp,
  }

  return damageEvent
}

/**
 * Calculates contributions for negative status damage.
 * Similar to normal damage contributions but uses the flat damage formula.
 */
function calculateNegativeStatusContributions(baseDMG: number, element: ElementType, enemy: Enemy, baseStats: CharacterStats, damageModifiers: DamageModifier[], fullDamage: number, ctx: StepContext, baseDMGFn?: (stats: CharacterStats) => number): Record<string, Contribution> {
  const results: Record<string, Contribution> = {}

  // Tracker-only modifiers are excluded: they carry no stats and exist only to track state.
  const groupIndices = buildModifierGroups(damageModifiers, true)

  const groups = [...groupIndices.entries()]
  const n = groups.length
  if (n === 0) return results

  // Evaluates negative status damage for a given subset of modifier groups by rebuilding
  // only those groups' stats and applying the negative status formula directly.
  const evaluateSubset = (subsetKeys: Set<string>): number => {
    const charMods: Partial<CharacterStats> = {}
    const enemyMods: Partial<EnemyStats> = {}

    addActiveGroupStats(groups, subsetKeys, damageModifiers, ctx, charMods, enemyMods)

    const statsS = mergeStats(baseStats, charMods)
    const enemyStatsS = mergeEnemyStats(enemy.stats, enemyMods)

    const level = statsS.level
    const enemyLevel = enemyStatsS.level
    const enemyResistance = enemyStatsS.resistance
    const enemyDamageReduction = enemyStatsS.damageReduction
    const elementRES = enemyStatsS[`${element.toLowerCase()}RES` as keyof typeof enemyStatsS] as number

    const damageRES =
      calculateResistanceMultiplierValue(0, enemyResistance) *
      calculateDefenseMultiplier(level, enemyLevel, 0) *
      (1 - enemyDamageReduction) *
      (1 - elementRES)

    const statusBonus = getStatusBonusDMG(statsS, element)
    const statusAmplify = getStatusAmplifyDMG(statsS, element)
    const statusTotalMultiplier = getStatusTotalMultiplierDMG(statsS, element)
    const statusMultiplier = (1 + statusBonus) * (1 + statusAmplify) * statusTotalMultiplier

    const effectiveBaseDMG = baseDMGFn ? baseDMGFn(statsS) : baseDMG
    return effectiveBaseDMG * damageRES * statusMultiplier
  }

  // Monte Carlo Shapley value estimation via random permutation sampling (same as action contributions).
  // φ_i ≈ (1/T) Σ_t [ f(S_t^i ∪ {i}) - f(S_t^i) ]
  // NOTE: the Math.random call order here is locked by golden tests — don't reorder.
  const SHAPLEY_SAMPLES = 100

  const shapleyValues = new Map<string, number>()
  for (const [groupKey] of groups) {
    shapleyValues.set(groupKey, 0)
  }

  // f(∅): damage with no external modifiers active — the unattributed base
  const baseDamage = evaluateSubset(new Set())

  for (let iter = 0; iter < SHAPLEY_SAMPLES; iter++) {
    // Fisher-Yates shuffle to produce a uniform random permutation of group indices
    const perm = groups.map((_, i) => i)
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[perm[i], perm[j]] = [perm[j], perm[i]]
    }

    const currentSet = new Set<string>()
    let prevDmg = baseDamage

    for (const idx of perm) {
      const [groupKey] = groups[idx]
      currentSet.add(groupKey)

      const dmg = evaluateSubset(currentSet)
      shapleyValues.set(groupKey, shapleyValues.get(groupKey)! + (dmg - prevDmg))
      prevDmg = dmg
    }
  }

  // Average marginals across all iterations to get final Shapley values
  const safePercent = (sv: number, total: number): number => (total !== 0 ? (sv / total) * 100 : 0)

  for (let gi = 0; gi < n; gi++) {
    const [groupKey, indices] = groups[gi]
    const anchor = indices.map(i => damageModifiers[i]).find(m => (m.source ?? '') === groupKey)
    const representativeMod = anchor ?? damageModifiers[indices[0]]
    const uniqueKey = groupKey in results ? `${groupKey}_${indices[0]}` : groupKey

    const sv = shapleyValues.get(groupKey)! / SHAPLEY_SAMPLES

    results[uniqueKey] = {
      source: representativeMod.source,
      ownerCharacter: representativeMod.ownerCharacter ?? null,
      displayName: representativeMod.displayName,
      isSelf: representativeMod.targetStrategy === 'self',
      normal_damage_contributed: Math.max(0, sv),
      normal_percent_damage_contributed: safePercent(sv, fullDamage),
      crit_damage_contributed: Math.max(0, sv),
      crit_percent_damage_contributed: safePercent(sv, fullDamage),
      average_damage_contributed: Math.max(0, sv),
      average_percent_damage_contributed: safePercent(sv, fullDamage),
    }
  }

  return results
}
