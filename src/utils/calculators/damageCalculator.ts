import type { DamageEvent } from "../../types/events"
import type { Action } from "../../types/action"
import type { Enemy } from "../../types/enemy"
import type { CharacterStats, EnemyStats } from "../../types/stats"
import type { DamageModifier } from "../../types/modifiers"
import type { ScalingType, ElementType, DamageType } from "../../types/baseTypes"
import { negativeStatuses } from "../../data/negativeStatuses"
import { aggregateStat } from "../hooks/resolvers"

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
}

type CalculateDamageResult = {
  average: number
  damageEvent: DamageEvent
}

export function calculateDamage({ 
  action, 
  name, 
  stats, 
  damageModifiers, 
  modifierCharacterStats, 
  modifierEnemyStats, 
  enemy, 
  snapshotId 
}: CalculateDamageParams): CalculateDamageResult {
  // Step 1: Extract action properties
  const { scaling, dmgType, element, multiplier: actionMultiplier } = action
  
  // Step 2: Merge base stats with modifiers
  const finalStats = mergeStats(stats, modifierCharacterStats)
  const finalEnemyStats = mergeEnemyStats(enemy.stats, modifierEnemyStats)
  
  // Step 3: Calculate base attack/hp/def value
  const baseStat = calculateScalingStat(finalStats, scaling)
  
  // Step 4: Calculate damage bonus multiplier (additive bonuses)
  const bonusMultiplier = calculateBonusMultiplier(finalStats, element, dmgType)
  
  // Step 5: Calculate damage amplification multiplier (additive amplifications)
  const amplifyMultiplier = calculateAmplifyMultiplier(finalStats, element, dmgType)
  
  // Step 6: Calculate total damage multiplier (multiplicative totals)
  const totalDamageMultiplier = calculateTotalMultiplier(finalStats, element, dmgType)
  
  // Step 7: Calculate resistance multipliers from enemy
  const resistanceMultiplier = calculateResistanceMultiplier(
    finalStats,
    finalEnemyStats,
    element
  )
  
  // Step 8: Calculate crit-adjusted damage
  const critMultiplier = 1 + finalStats.critRate * (finalStats.critDamage - 1)
  
  // Step 9: Combine all multipliers for final damage
  const damageMultiplier = 
    bonusMultiplier * 
    amplifyMultiplier * 
    totalDamageMultiplier * 
    resistanceMultiplier
  
  const normalStrike = actionMultiplier * baseStat * damageMultiplier
  const criticalStrike = normalStrike * finalStats.critDamage
  const average = normalStrike * critMultiplier
  
  const damageEvent: DamageEvent = {
    snapshotId,
    dealer: name,
    target: enemy.name,
    element,
    dmgType,
    scaling,
    actionName: action.name,
    normalStrike,
    criticalStrike,
    average
  }

  return { average, damageEvent }
}

// ========== Helper Functions =================================================================================================

/**
 * Merges base character stats with modifier stats
 */
export function mergeStats(
  baseStats: CharacterStats, 
  modifierStats: Partial<CharacterStats>
): CharacterStats {
  const merged = { ...baseStats }
  
  for (const key in modifierStats) {
    const statKey = key as keyof CharacterStats
    const modifierValue = modifierStats[statKey]
    
    if (modifierValue !== undefined) {
      merged[statKey] = aggregateStat(
        merged[statKey] as number,
        modifierValue as number,
        key
      ) as any
    }
  }
  
  return merged
}

/**
 * Merges enemy stats with modifier stats
 */
export function mergeEnemyStats(
  baseStats: EnemyStats,
  modifierStats: Partial<EnemyStats>
): EnemyStats {
  const merged = { ...baseStats }
  
  for (const key in modifierStats) {
    const statKey = key as keyof EnemyStats
    const modifierValue = modifierStats[statKey]
    
    if (modifierValue !== undefined) {
      merged[statKey] = aggregateStat(
        merged[statKey] as number,
        modifierValue as number,
        key
      ) as any
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
 * Combines: base bonus + element bonus + damage type bonus + status bonus
 */
export function calculateBonusMultiplier(
  stats: CharacterStats,
  element: ElementType,
  dmgType: DamageType
): number {
  const baseBonusDMG = stats.bonusDMG
  
  // Element-specific bonus
  const elementKey = `${element.toLowerCase()}BonusDMG` as keyof CharacterStats
  const elementBonus = (stats[elementKey] as number) || 0
  
  // Damage type-specific bonus
  const dmgTypeKey = `${dmgType.toLowerCase()}BonusDMG` as keyof CharacterStats
  const dmgTypeBonus = (stats[dmgTypeKey] as number) || 0
  
  // Status effect bonus (e.g., aeroErosion for AERO element)
  const statusBonus = getStatusBonusDMG(stats, element)
  
  // All bonuses are additive, then add 1 for the base multiplier
  return 1 + baseBonusDMG + elementBonus + dmgTypeBonus + statusBonus
}

/**
 * Calculates the amplify damage multiplier (additive)
 * Combines: base amplify + element amplify + damage type amplify + status amplify
 */
export function calculateAmplifyMultiplier(
  stats: CharacterStats,
  element: ElementType,
  dmgType: DamageType
): number {
  const baseAmplifyDMG = stats.amplifyDMG
  
  // Element-specific amplify
  const elementKey = `${element.toLowerCase()}AmplifyDMG` as keyof CharacterStats
  const elementAmplify = (stats[elementKey] as number) || 0
  
  // Damage type-specific amplify
  const dmgTypeKey = `${dmgType.toLowerCase()}AmplifyDMG` as keyof CharacterStats
  const dmgTypeAmplify = (stats[dmgTypeKey] as number) || 0
  
  // Status effect amplify
  const statusAmplify = getStatusAmplifyDMG(stats, element)
  
  // All amplifications are additive, then add 1 for the base multiplier
  return 1 + baseAmplifyDMG + elementAmplify + dmgTypeAmplify + statusAmplify
}

/**
 * Calculates the total damage multiplier (multiplicative)
 * Combines: base total * element total * damage type total * status total
 */
export function calculateTotalMultiplier(
  stats: CharacterStats,
  element: ElementType,
  dmgType: DamageType
): number {
  const baseTotalMultiplierDMG = stats.totalMultiplierDMG
  
  // Element-specific total multiplier
  const elementKey = `${element.toLowerCase()}TotalMultiplierDMG` as keyof CharacterStats
  const elementTotal = (stats[elementKey] as number) || 1
  
  // Damage type-specific total multiplier
  const dmgTypeKey = `${dmgType.toLowerCase()}TotalMultiplierDMG` as keyof CharacterStats
  const dmgTypeTotal = (stats[dmgTypeKey] as number) || 1
  
  // Status effect total multiplier
  const statusTotal = getStatusTotalMultiplierDMG(stats, element)
  
  // All totals are multiplicative
  return baseTotalMultiplierDMG * elementTotal * dmgTypeTotal * statusTotal
}

/**
 * Gets the status-specific bonus DMG for the given element
 * Maps elements to their corresponding status effects
 */
function getStatusBonusDMG(stats: CharacterStats, element: ElementType): number {
  const statusMap: Record<ElementType, keyof CharacterStats> = {
    AERO: 'aeroErosionBonusDMG',
    SPECTRO: 'spectroFrazzleBonusDMG',
    HAVOC: 'havocBaneBonusDMG',
    GLACIO: 'glacioChafeBonusDMG',
    FUSION: 'fusionBurstBonusDMG',
    ELECTRO: 'electroFlareBonusDMG'
  }
  
  const statusKey = statusMap[element]
  return (stats[statusKey] as number) || 0
}

/**
 * Gets the status-specific amplify DMG for the given element
 */
function getStatusAmplifyDMG(stats: CharacterStats, element: ElementType): number {
  const statusMap: Record<ElementType, keyof CharacterStats> = {
    AERO: 'aeroErosionAmplifyDMG',
    SPECTRO: 'spectroFrazzleAmplifyDMG',
    HAVOC: 'havocBaneAmplifyDMG',
    GLACIO: 'glacioChafeAmplifyDMG',
    FUSION: 'fusionBurstAmplifyDMG',
    ELECTRO: 'electroFlareAmplifyDMG'
  }
  
  const statusKey = statusMap[element]
  return (stats[statusKey] as number) || 0
}

/**
 * Gets the status-specific total multiplier DMG for the given element
 */
function getStatusTotalMultiplierDMG(stats: CharacterStats, element: ElementType): number {
  const statusMap: Record<ElementType, keyof CharacterStats> = {
    AERO: 'aeroErosionTotalMultiplierDMG',
    SPECTRO: 'spectroFrazzleTotalMultiplierDMG',
    HAVOC: 'havocBaneTotalMultiplierDMG',
    GLACIO: 'glacioChafeTotalMultiplierDMG',
    FUSION: 'fusionBurstTotalMultiplierDMG',
    ELECTRO: 'electroFlareTotalMultiplierDMG'
  }
  
  const statusKey = statusMap[element]
  return (stats[statusKey] as number) || 1
}

/**
 * Calculates all resistance-based multipliers
 * Includes: defense, resistance, elemental resistance, and damage reduction
 */
function calculateResistanceMultiplier(
  stats: CharacterStats,
  enemyStats: EnemyStats,
  element: ElementType
): number {
  const level = stats.level
  const defIgnore = stats.defIgnore
  const resistancePEN = stats.resistancePEN
  const elementalResPEN = stats.elementalResPEN
  
  const enemyLevel = enemyStats.level
  const enemyResistance = enemyStats.resistance
  const enemyDamageReduction = enemyStats.damageReduction
  
  // Get element-specific resistance
  const elementResKey = `${element.toLowerCase()}RES` as keyof EnemyStats
  const enemyElementalRes = (enemyStats[elementResKey] as number) || 0
  
  // Calculate individual multipliers
  const defenseMultiplier = calculateDefenseMultiplier(level, enemyLevel, defIgnore)
  const resistanceMultiplier = calculateResistanceMultiplierValue(resistancePEN, enemyResistance)
  const elementalResMultiplier = 1 - (enemyElementalRes - elementalResPEN)
  const damageReductionMultiplier = 1 - enemyDamageReduction
  
  // Combine all resistance effects
  return defenseMultiplier * resistanceMultiplier * elementalResMultiplier * damageReductionMultiplier
}

/**
 * Calculates the defense multiplier based on level difference and defense ignore
 */
function calculateDefenseMultiplier(
  attackerLevel: number,
  defenderLevel: number,
  defIgnore: number
): number {
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

// ========== Negative Status Calculator =======================================================================================

export function calculateDamageNegativeStatus(currStacks: number, element: string, enemy: Enemy, name: string): number {
  const statusIdentifier = Object.entries(negativeStatuses).find(([key, status]) => status.name === name)?.[0]

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

  const damage = baseDMG * damageRES

  return damage
}
