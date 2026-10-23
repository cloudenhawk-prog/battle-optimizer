// Main action damage calculation: merges stats, applies every multiplier, and attaches Shapley contributions.
import type { DamageEvent } from '../../../types/events'
import type { Action } from '../../../types/action'
import type { Enemy } from '../../../types/enemy'
import type { CharacterStats, EnemyStats } from '../../../types/stats'
import type { DamageModifier } from '../../../types/modifiers'
import type { StepContext } from '../../../types/stepContext'
import { mergeStats, mergeEnemyStats, calculateScalingStat } from './mergeStats'
import { calculateBonusMultiplier, calculateAmplifyMultiplier, calculateTotalMultiplier, calculateResistanceMultiplier } from './formulas'
import { calculateAllContrubutions } from './contributions'

/*
 * Handles regular action damage (basic, heavy, skill, liberation, coordinated, echo, intro, outro).
 * The formula is documented at the top of formulas.ts.
 *
 * When an action includes NEGATIVE_STATUS in dmgTypes, the status-specific stats of every element
 * present are applied too (AERO → Aero Erosion, SPECTRO → Spectro Frazzle, HAVOC → Havoc Bane,
 * GLACIO → Glacio Chafe, FUSION → Fusion Burst, ELECTRO → Electro Flare).
 */

// ========== Base Calculator ==================================================================================================

type CalculateDamageParams = {
  action: Action
  name: string
  stats: CharacterStats
  damageModifiers: DamageModifier[]
  modifierCharacterStats: Partial<CharacterStats>
  modifierEnemyStats: Partial<EnemyStats>
  enemy: Enemy
  snapshotId: number
  timeStamp: number
  /** True for subset re-evaluations (Shapley / buff toggles) — avoids recursive attribution. */
  skipContributions?: boolean
  ctx?: StepContext
}

type CalculateDamageResult = {
  average: number
  damageEvent: DamageEvent
}

export function calculateDamage({ action, name, stats, damageModifiers, modifierCharacterStats, modifierEnemyStats, enemy, snapshotId, timeStamp, skipContributions = false, ctx }: CalculateDamageParams): CalculateDamageResult {
  // Step 1: Extract action properties
  const { scaling, dmgTypes, elements, multiplier: actionMultiplier } = action

  // Step 2: Merge base stats with modifiers
  const finalStats = mergeStats(stats, modifierCharacterStats)
  // Crit rate is capped at 100% — values above cause impossible average > crit results.
  finalStats.critRate = Math.min(finalStats.critRate, 1.0)
  const finalEnemyStats = mergeEnemyStats(enemy.stats, modifierEnemyStats)

  // Step 3: Calculate base attack/hp/def value
  const baseStat = calculateScalingStat(finalStats, scaling)

  // Step 4: Calculate damage bonus multiplier (additive bonuses)
  const bonusMultiplier = calculateBonusMultiplier(finalStats, elements, dmgTypes)

  // Step 5: Calculate damage amplification multiplier (additive amplifications)
  const amplifyMultiplier = calculateAmplifyMultiplier(finalStats, elements, dmgTypes)

  // Step 6: Calculate total damage multiplier (multiplicative totals)
  const totalDamageMultiplier = calculateTotalMultiplier(finalStats, elements, dmgTypes)

  // Step 7: Calculate resistance multipliers from enemy
  const resistanceMultiplier = calculateResistanceMultiplier(finalStats, finalEnemyStats, elements)

  // Step 8: Calculate crit-adjusted damage
  const critMultiplier = 1 + finalStats.critRate * (finalStats.critDamage - 1)

  // Step 9: Combine all multipliers for final damage
  const damageMultiplier = bonusMultiplier * amplifyMultiplier * totalDamageMultiplier * resistanceMultiplier

  const normalStrike   = actionMultiplier * baseStat * damageMultiplier
  const criticalStrike = normalStrike * finalStats.critDamage
  const average        = normalStrike * critMultiplier

  const contributions = skipContributions || !damageModifiers.length ? {} : calculateAllContrubutions(action, name, stats, damageModifiers, enemy, snapshotId, timeStamp, normalStrike, criticalStrike, average, ctx)

  const damageEvent: DamageEvent = {
    snapshotId,
    dealer: name,
    target: enemy.name,
    elements: elements,
    dmgTypes: dmgTypes,
    scaling,
    actionName: action.name,
    normalStrike,
    criticalStrike,
    average,
    contributions: contributions,
    timeStamp,
  }

  // The returned `average` is rounded up; the event keeps the unrounded values.
  return { average: Math.ceil(average), damageEvent }
}
