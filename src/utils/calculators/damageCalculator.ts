import type { DamageEvent, Contribution } from '../../types/events'
import type { Action } from '../../types/action'
import type { Enemy } from '../../types/enemy'
import type { CharacterStats, EnemyStats } from '../../types/stats'
import type { DamageModifier } from '../../types/modifiers'
import type { ScalingType, ElementType, DamageType } from '../../types/baseTypes'
import type { StepContext } from '../../types/stepContext'
import { negativeStatuses } from '../../data/negativeStatuses'
import { aggregateStat } from '../hooks/resolvers'

/**
 * Damage Calculator
 *
 * This module handles all damage calculations including:
 * - Regular action damage (basic, heavy, skill, liberation, coordinated, echo, intro, outro)
 * - Negative status damage (erosion, frazzle, bane, chafe, burst, flare)
 *
 * Important: When an action includes NEGATIVE_STATUS in dmgTypes, the calculator automatically
 * applies status-specific stat bonuses/amplifications/multipliers based on the elements present:
 * - AERO → Aero Erosion stats
 * - SPECTRO → Spectro Frazzle stats
 * - HAVOC → Havoc Bane stats
 * - GLACIO → Glacio Chafe stats
 * - FUSION → Fusion Burst stats
 * - ELECTRO → Electro Flare stats
 *
 * This means actions with multiple elements AND NEGATIVE_STATUS will benefit from all
 * applicable status effect bonuses.
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

  const normalStrike = actionMultiplier * baseStat * damageMultiplier
  const criticalStrike = normalStrike * finalStats.critDamage
  const average = normalStrike * critMultiplier

  const contributions = skipContributions || !ctx ? {} : calculateAllContrubutions(action, name, stats, damageModifiers, enemy, snapshotId, timeStamp, normalStrike, criticalStrike, average, ctx)

  if (!skipContributions) {
    console.log('Calculating damage for action:', action.name)
    console.log('Modifiers: ', damageModifiers)
    console.log('Contributions: ', contributions)
  }

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

  return { average: Math.ceil(average), damageEvent }
}

// ========== Helper Functions =================================================================================================

/**
 * Merges base character stats with modifier stats
 */
export function mergeStats(baseStats: CharacterStats, modifierStats: Partial<CharacterStats>): CharacterStats {
  const merged = { ...baseStats }

  for (const key in modifierStats) {
    const statKey = key as keyof CharacterStats
    const modifierValue = modifierStats[statKey]

    if (modifierValue !== undefined) {
      merged[statKey] = aggregateStat(merged[statKey] as number, modifierValue as number, key) as any
    }
  }

  return merged
}

/**
 * Merges enemy stats with modifier stats
 */
export function mergeEnemyStats(baseStats: EnemyStats, modifierStats: Partial<EnemyStats>): EnemyStats {
  const merged = { ...baseStats }

  for (const key in modifierStats) {
    const statKey = key as keyof EnemyStats
    const modifierValue = modifierStats[statKey]

    if (modifierValue !== undefined) {
      merged[statKey] = aggregateStat(merged[statKey] as number, modifierValue as number, key) as any
    }
  }

  return merged
}

/**
 * Calculates the final scaling stat value (ATK, HP, or DEF)
 * Formula: base * (1 + bonus) * (1 + amplify) * totalMultiplier + flat
 */
export function calculateScalingStat(stats: CharacterStats, scaling: ScalingType): number {
  const base = stats[`base${scaling}` as keyof CharacterStats] as number
  const flat = stats[`flat${scaling}` as keyof CharacterStats] as number
  const bonus = stats[`bonus${scaling}` as keyof CharacterStats] as number
  const amplify = stats[`amplify${scaling}` as keyof CharacterStats] as number
  const totalMultiplier = stats[`totalMultiplier${scaling}` as keyof CharacterStats] as number

  return base * (1 + bonus) * (1 + amplify) * totalMultiplier + flat
}

/**
 * Calculates the bonus damage multiplier (additive)
 * Combines: base bonus + element bonuses + damage type bonuses + status bonuses
 * For multiple elements/types, all applicable bonuses are summed
 */
export function calculateBonusMultiplier(stats: CharacterStats, elements: ElementType[], dmgTypes: DamageType[]): number {
  const baseBonusDMG = stats.bonusDMG

  // Sum all element-specific bonuses
  let elementBonuses = 0
  for (const element of elements) {
    if (element === 'NONE') continue
    const elementKey = `${element.toLowerCase()}BonusDMG` as keyof CharacterStats
    elementBonuses += (stats[elementKey] as number) || 0
  }

  // Sum all damage type-specific bonuses
  let dmgTypeBonuses = 0
  for (const dmgType of dmgTypes) {
    if (dmgType === 'NEGATIVE_STATUS') continue
    const dmgTypeKey = `${dmgType.toLowerCase()}BonusDMG` as keyof CharacterStats
    dmgTypeBonuses += (stats[dmgTypeKey] as number) || 0
  }

  // Sum all status effect bonuses for applicable elements
  let statusBonuses = 0
  for (const element of elements) {
    statusBonuses += getStatusBonusDMG(stats, element)
  }

  // All bonuses are additive, then add 1 for the base multiplier
  return 1 + baseBonusDMG + elementBonuses + dmgTypeBonuses + statusBonuses
}

/**
 * Calculates the amplify damage multiplier (additive)
 * Combines: base amplify + element amplifies + damage type amplifies + status amplifies
 * For multiple elements/types, all applicable amplifications are summed
 */
export function calculateAmplifyMultiplier(stats: CharacterStats, elements: ElementType[], dmgTypes: DamageType[]): number {
  const baseAmplifyDMG = stats.amplifyDMG

  // Sum all element-specific amplifications
  let elementAmplifies = 0
  for (const element of elements) {
    if (element === 'NONE') continue
    const elementKey = `${element.toLowerCase()}AmplifyDMG` as keyof CharacterStats
    elementAmplifies += (stats[elementKey] as number) || 0
  }

  // Sum all damage type-specific amplifications
  let dmgTypeAmplifies = 0
  for (const dmgType of dmgTypes) {
    if (dmgType === 'NEGATIVE_STATUS') continue
    const dmgTypeKey = `${dmgType.toLowerCase()}AmplifyDMG` as keyof CharacterStats
    dmgTypeAmplifies += (stats[dmgTypeKey] as number) || 0
  }

  // Sum all status effect amplifications for applicable elements
  let statusAmplifies = 0
  for (const element of elements) {
    statusAmplifies += getStatusAmplifyDMG(stats, element)
  }

  // All amplifications are additive, then add 1 for the base multiplier
  return 1 + baseAmplifyDMG + elementAmplifies + dmgTypeAmplifies + statusAmplifies
}

/**
 * Calculates the total damage multiplier (multiplicative)
 * Combines: base total * element totals * damage type totals * status totals
 * For multiple elements/types, all applicable multipliers are multiplied together
 */
export function calculateTotalMultiplier(stats: CharacterStats, elements: ElementType[], dmgTypes: DamageType[]): number {
  let result = stats.totalMultiplierDMG

  // Multiply all element-specific total multipliers
  for (const element of elements) {
    if (element === 'NONE') continue
    const elementKey = `${element.toLowerCase()}TotalMultiplierDMG` as keyof CharacterStats
    result *= (stats[elementKey] as number) || 1
  }

  // Multiply all damage type-specific total multipliers
  for (const dmgType of dmgTypes) {
    if (dmgType === 'NEGATIVE_STATUS') continue
    const dmgTypeKey = `${dmgType.toLowerCase()}TotalMultiplierDMG` as keyof CharacterStats
    result *= (stats[dmgTypeKey] as number) || 1
  }

  // Multiply all status effect total multipliers for applicable elements
  for (const element of elements) {
    result *= getStatusTotalMultiplierDMG(stats, element)
  }

  return result
}

/**
 * Gets the status-specific bonus DMG for the given element
 * Maps elements to their corresponding status effects
 */
function getStatusBonusDMG(stats: CharacterStats, element: ElementType): number {
  const statusMap: Partial<Record<ElementType, keyof CharacterStats>> = {
    AERO: 'aeroErosionBonusDMG',
    SPECTRO: 'spectroFrazzleBonusDMG',
    HAVOC: 'havocBaneBonusDMG',
    GLACIO: 'glacioChafeBonusDMG',
    FUSION: 'fusionBurstBonusDMG',
    ELECTRO: 'electroFlareBonusDMG',
  }

  const statusKey = statusMap[element]
  return (stats[statusKey] as number) || 0
}

/**
 * Gets the status-specific amplify DMG for the given element
 */
function getStatusAmplifyDMG(stats: CharacterStats, element: ElementType): number {
  const statusMap: Partial<Record<ElementType, keyof CharacterStats>> = {
    AERO: 'aeroErosionAmplifyDMG',
    SPECTRO: 'spectroFrazzleAmplifyDMG',
    HAVOC: 'havocBaneAmplifyDMG',
    GLACIO: 'glacioChafeAmplifyDMG',
    FUSION: 'fusionBurstAmplifyDMG',
    ELECTRO: 'electroFlareAmplifyDMG',
  }

  const statusKey = statusMap[element]
  return (stats[statusKey] as number) || 0
}

/**
 * Gets the status-specific total multiplier DMG for the given element
 */
function getStatusTotalMultiplierDMG(stats: CharacterStats, element: ElementType): number {
  const statusMap: Partial<Record<ElementType, keyof CharacterStats>> = {
    AERO: 'aeroErosionTotalMultiplierDMG',
    SPECTRO: 'spectroFrazzleTotalMultiplierDMG',
    HAVOC: 'havocBaneTotalMultiplierDMG',
    GLACIO: 'glacioChafeTotalMultiplierDMG',
    FUSION: 'fusionBurstTotalMultiplierDMG',
    ELECTRO: 'electroFlareTotalMultiplierDMG',
  }

  const statusKey = statusMap[element]
  return (stats[statusKey] as number) || 1
}

/**
 * Calculates all resistance-based multipliers
 * Includes: defense, resistance, elemental resistance, and damage reduction
 * For multiple elements, uses the WORST (lowest) elemental resistance multiplier
 */
function calculateResistanceMultiplier(stats: CharacterStats, enemyStats: EnemyStats, elements: ElementType[]): number {
  const level = stats.level
  const defIgnore = stats.defIgnore
  const resistancePEN = stats.resistancePEN
  const elementalResPEN = stats.elementalResPEN

  const enemyLevel = enemyStats.level
  const enemyResistance = enemyStats.resistance
  const enemyDamageReduction = enemyStats.damageReduction

  // Calculate individual multipliers (element-independent)
  const defenseMultiplier = calculateDefenseMultiplier(level, enemyLevel, defIgnore)
  const resistanceMultiplier = calculateResistanceMultiplierValue(resistancePEN, enemyResistance)
  const damageReductionMultiplier = 1 - enemyDamageReduction

  // For elemental resistance, use the worst (lowest) multiplier across all elements
  // Select the element used for elemental resistance calculations.
  // Convention: use the first non-'NONE' element in the action's elements list.
  function chooseElementForResistance(list: ElementType[]): ElementType {
    for (const el of list) {
      if (el !== 'NONE') return el
    }
    return 'NONE'
  }

  let elementalResMultiplier = 1
  const chosenElement = chooseElementForResistance(elements)
  if (chosenElement !== 'NONE') {
    const elementResKey = `${chosenElement.toLowerCase()}RES` as keyof EnemyStats
    const enemyElementalRes = (enemyStats[elementResKey] as number) || 0
    elementalResMultiplier = 1 - (enemyElementalRes - elementalResPEN)
  }

  // Combine all resistance effects
  return defenseMultiplier * resistanceMultiplier * elementalResMultiplier * damageReductionMultiplier
}

/**
 * Calculates the defense multiplier based on level difference and defense ignore
 */
function calculateDefenseMultiplier(attackerLevel: number, defenderLevel: number, defIgnore: number): number {
  const defenseValue = convertLevelToDefense(defenderLevel)
  const effectiveDefense = defenseValue * (1 - defIgnore)

  return (800 + 8 * attackerLevel) / (800 + 8 * attackerLevel + effectiveDefense)
}

/**
 * Calculates the resistance multiplier with diminishing returns
 */
function calculateResistanceMultiplierValue(penetration: number, resistance: number): number {
  const effectiveRes = resistance - penetration

  if (effectiveRes < 0) {
    // Negative resistance increases damage by 50% of the excess
    return 1 - effectiveRes / 2
  }

  if (effectiveRes < 0.8) {
    // Linear reduction below 80%
    return 1 - effectiveRes
  }

  // Diminishing returns above 80%
  return 1 / (1 + 5 * effectiveRes)
}

/**
 * Converts enemy level to defense value
 */
function convertLevelToDefense(level: number): number {
  return 8 * level + 792
}

export function calculateAllContrubutions(action: Action, name: string, stats: CharacterStats, damageModifiers: DamageModifier[], enemy: Enemy, snapshotId: number, timeStamp: number, normalStrike: number, criticalStrike: number, average: number, ctx: StepContext): Record<string, Contribution> {
  const results: Record<string, Contribution> = {}

  // For each modifier, recalculate damage without it
  for (let i = 0; i < damageModifiers.length; i++) {
    const mod = damageModifiers[i]
    const keyBase = mod.source || `modifier_${i}`
    const uniqueKey = keyBase in results ? `${keyBase}_${i}` : keyBase

    // Rebuild modifiers without this one
    const charModsWithout: Partial<CharacterStats> = {}
    const enemyModsWithout: Partial<EnemyStats> = {}

    for (let j = 0; j < damageModifiers.length; j++) {
      if (i === j) continue // Skip current modifier

      const otherMod = damageModifiers[j]
      const conditionMultiplier = otherMod.condition ? otherMod.condition(ctx) : 1

      if (otherMod.characterStats) {
        for (const [key, value] of Object.entries(otherMod.characterStats)) {
          const statKey = key as keyof CharacterStats
          const currentVal = charModsWithout[statKey] as number | undefined
          const modValue = (value as number) * conditionMultiplier
          charModsWithout[statKey] = aggregateStat(currentVal, modValue, key) as any
        }
      }
      if (otherMod.enemyStats) {
        for (const [key, value] of Object.entries(otherMod.enemyStats)) {
          const statKey = key as keyof EnemyStats
          const currentVal = enemyModsWithout[statKey] as number | undefined
          const modValue = (value as number) * conditionMultiplier
          enemyModsWithout[statKey] = aggregateStat(currentVal, modValue, key) as any
        }
      }
    }

    // Calculate damage without this modifier
    const resultWithout = calculateDamage({
      action,
      name,
      stats,
      damageModifiers: [],
      modifierCharacterStats: charModsWithout,
      modifierEnemyStats: enemyModsWithout,
      enemy,
      snapshotId,
      timeStamp,
      skipContributions: true,
    })

    const normalWithout = resultWithout.damageEvent.normalStrike
    const critWithout = resultWithout.damageEvent.criticalStrike
    const averageWithout = resultWithout.damageEvent.average

    // Calculate contributions
    const normal_contrib = normalStrike - normalWithout
    const crit_contrib = criticalStrike - critWithout
    const average_contrib = average - averageWithout

    const safePercent = (withVal: number, withoutVal: number) => {
      if (!withoutVal || withoutVal === 0) return 0
      return (withVal / withoutVal - 1) * 100
    }

    const normal_pct = safePercent(normalStrike, normalWithout)
    const crit_pct = safePercent(criticalStrike, critWithout)
    const average_pct = safePercent(average, averageWithout)

    results[uniqueKey] = {
      source: mod.source,
      displayName: mod.displayName,
      crit_damage_contributed: Math.max(0, crit_contrib),
      crit_percent_damage_contributed: crit_pct,
      normal_damage_contributed: Math.max(0, normal_contrib),
      normal_percent_damage_contributed: normal_pct,
      average_damage_contributed: Math.max(0, average_contrib),
      average_percent_damage_contributed: average_pct,
    }
  }

  return results
}

// ========== Negative Status Calculator =======================================================================================

export function calculateDamageNegativeStatus(currStacks: number, element: ElementType, enemy: Enemy, negativeStatusName: string, characterStats: CharacterStats, dealer: string, snapshotId: number, timeStamp: number, actionName?: string): DamageEvent {
  const statusIdentifier = Object.entries(negativeStatuses).find(([, status]) => status.name === negativeStatusName)?.[0]

  // Enemy Stats
  const enemyStats = enemy.stats
  const level = enemyStats.level
  const resistance = enemyStats.resistance
  const elementRES = enemyStats[`${element.toLowerCase()}RES` as keyof typeof enemyStats] as number
  const damageReduction = enemyStats.damageReduction

  // Damage Calculations
  const baseDMG = negativeStatuses[statusIdentifier].damage[currStacks]

  const resistanceMultiplier = calculateResistanceMultiplierValue(0, resistance)
  const defenseMultiplier = calculateDefenseMultiplier(level, level, 0)
  const damageReductionMultiplier = 1 - damageReduction
  const elementalResMultiplier = 1 - elementRES
  const damageRES = resistanceMultiplier * defenseMultiplier * damageReductionMultiplier * elementalResMultiplier

  // Apply negative status damage multipliers from character stats
  const statusBonus = getStatusBonusDMG(characterStats, element)
  const statusAmplify = getStatusAmplifyDMG(characterStats, element)
  const statusTotalMultiplier = getStatusTotalMultiplierDMG(characterStats, element)
  const statusMultiplier = (1 + statusBonus) * (1 + statusAmplify) * statusTotalMultiplier

  const damage = baseDMG * damageRES * statusMultiplier

  const damageEvent: DamageEvent = {
    snapshotId,
    dealer,
    target: enemy.name,
    elements: [element],
    dmgTypes: ['NEGATIVE_STATUS'],
    scaling: 'FLAT',
    actionName: actionName ?? negativeStatusName,
    normalStrike: damage,
    criticalStrike: damage,
    average: damage,
    contributions: {},
    timeStamp,
  }

  return damageEvent
}
