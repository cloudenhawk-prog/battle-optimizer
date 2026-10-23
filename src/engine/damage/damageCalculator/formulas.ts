// Damage multiplier formulas: DMG bonus / amplify / total multipliers, status-specific stats, RES and DEF.
import type { CharacterStats, EnemyStats } from '../../../types/stats'
import type { ElementType, DamageType } from '../../../types/baseTypes'

/*
 * Damage formula (see calculateDamage.ts):
 *
 *   scalingStat = base * (1 + bonus) * (1 + amplify) * totalMultiplier + flat      (ATK / HP / DEF)
 *   bonus       = 1 + bonusDMG + Σ element bonus + Σ dmgType bonus [+ Σ status bonus]     (additive)
 *   amplify     = 1 + amplifyDMG + Σ element amp + Σ dmgType amp [+ Σ status amp]         (additive)
 *   total       = totalMultiplierDMG * Π element total * Π dmgType total [* Π status total]  (multiplicative)
 *   resist      = DEF mult * general RES mult * elemental RES mult (first element) * (1 - damageReduction)
 *   normal      = actionMultiplier * scalingStat * bonus * amplify * total * resist
 *   crit        = normal * critDamage
 *   average     = normal * (1 + critRate * (critDamage - 1))       (critRate capped at 1)
 *
 * The [status] terms only apply when dmgTypes includes NEGATIVE_STATUS (e.g. AERO → Aero Erosion stats).
 */

// ========== Bonus / Amplify / Total Multipliers ==============================================================================

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
    if (element === '') continue
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
  // Status-specific bonuses only apply when NEGATIVE_STATUS is present in dmgTypes
  let statusBonuses = 0
  if (dmgTypes.includes('NEGATIVE_STATUS')) {
    for (const element of elements) {
      statusBonuses += getStatusBonusDMG(stats, element)
    }
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
    if (element === '') continue
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
  if (dmgTypes.includes('NEGATIVE_STATUS')) {
    for (const element of elements) {
      statusAmplifies += getStatusAmplifyDMG(stats, element)
    }
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
    if (element === '') continue
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
  // Status-specific multipliers only apply when NEGATIVE_STATUS is present in dmgTypes
  if (dmgTypes.includes('NEGATIVE_STATUS')) {
    for (const element of elements) {
      result *= getStatusTotalMultiplierDMG(stats, element)
    }
  }

  return result
}

// ========== Status-Specific Stats (NEGATIVE_STATUS) ==========================================================================

/**
 * Gets the status-specific bonus DMG for the given element
 * Maps elements to their corresponding status effects
 */
export function getStatusBonusDMG(stats: CharacterStats, element: ElementType): number {
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
export function getStatusAmplifyDMG(stats: CharacterStats, element: ElementType): number {
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
export function getStatusTotalMultiplierDMG(stats: CharacterStats, element: ElementType): number {
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

// ========== Resistance / Defense =============================================================================================

/**
 * Calculates all resistance-based multipliers
 * Includes: defense, resistance, elemental resistance, and damage reduction
 * For multiple elements, only the FIRST non-empty element's RES is used (not the worst one).
 * Note: elemental RES is applied linearly (1 - (RES - PEN)), without the <0 / >=80% curve
 * that calculateResistanceMultiplierValue applies to the general resistance stat.
 */
export function calculateResistanceMultiplier(stats: CharacterStats, enemyStats: EnemyStats, elements: ElementType[]): number {
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

  // Select the element used for elemental resistance calculations.
  // Convention: use the first non-empty element in the action's elements list.
  function chooseElementForResistance(list: ElementType[]): ElementType {
    for (const el of list) {
      if (el !== '') return el
    }
    return ''
  }

  let elementalResMultiplier = 1
  const chosenElement = chooseElementForResistance(elements)
  if (chosenElement !== '') {
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
export function calculateDefenseMultiplier(attackerLevel: number, defenderLevel: number, defIgnore: number): number {
  const defenseValue = convertLevelToDefense(defenderLevel)
  const effectiveDefense = defenseValue * (1 - defIgnore)

  return (800 + 8 * attackerLevel) / (800 + 8 * attackerLevel + effectiveDefense)
}

/**
 * Calculates the resistance multiplier with diminishing returns
 */
export function calculateResistanceMultiplierValue(penetration: number, resistance: number): number {
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
export function convertLevelToDefense(level: number): number {
  return 8 * level + 792
}
