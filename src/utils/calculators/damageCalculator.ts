import type { DamageEvent, Contribution } from '../../types/events'
import type { Action } from '../../types/action'
import type { Enemy } from '../../types/enemy'
import type { CharacterStats, EnemyStats } from '../../types/stats'
import type { DamageModifier } from '../../types/modifiers'
import type { ScalingType, ElementType, DamageType } from '../../types/baseTypes'
import type { StepContext } from '../../types/stepContext'
import { negativeStatuses } from '../../data/negativeStatuses'
import { aggregateStat } from '../hooks/resolvers'
import { applyStackMultiplier } from '../hooks/modifierHelpers'

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

export function calculateAllContrubutions(action: Action, name: string, stats: CharacterStats, damageModifiers: DamageModifier[], enemy: Enemy, snapshotId: number, timeStamp: number, normalStrike: number, criticalStrike: number, average: number, ctx?: StepContext): Record<string, Contribution> {
  const results: Record<string, Contribution> = {}

  // Pre-compute inherent modifier stats so every "without modifier X" baseline includes them.
  // Without this, inherentModifiers would be missing from normalWithout, inflating all contributions.
  const inherentCharBase: Partial<CharacterStats> = {}
  const inherentEnemyBase: Partial<EnemyStats> = {}
  if (ctx && action.inherentModifiers?.length) {
    for (const im of action.inherentModifiers) {
      const scale = im.condition(ctx)
      if (scale !== 0) {
        if (im.characterStats) {
          for (const key in im.characterStats) {
            const statKey = key as keyof CharacterStats
            const value = (im.characterStats[statKey] as number) * scale
            inherentCharBase[statKey] = aggregateStat(inherentCharBase[statKey] as number | undefined, value, statKey) as any
          }
        }
        if (im.enemyStats) {
          for (const key in im.enemyStats) {
            const statKey = key as keyof EnemyStats
            const value = (im.enemyStats[statKey] as number) * scale
            inherentEnemyBase[statKey] = aggregateStat(inherentEnemyBase[statKey] as number | undefined, value, statKey) as any
          }
        }
      }
    }
  }

  // Group modifiers by contributionGroup (or own source for ungrouped)
  const groupIndices = new Map<string, number[]>()
  for (let i = 0; i < damageModifiers.length; i++) {
    const mod = damageModifiers[i]
    const groupKey = mod.contributionGroup ?? mod.source ?? `modifier_${i}`
    if (!groupIndices.has(groupKey)) groupIndices.set(groupKey, [])
    groupIndices.get(groupKey)!.push(i)
  }

  for (const [groupKey, indices] of groupIndices.entries()) {
    // Anchor modifier: the one whose source matches the group key (for named groups)
    const anchor = indices.map(i => damageModifiers[i]).find(m => (m.source ?? '') === groupKey)
    const representativeMod = anchor ?? damageModifiers[indices[0]]
    const uniqueKey = groupKey in results ? `${groupKey}_${indices[0]}` : groupKey

    const excludedIndices = new Set(indices)

    // Rebuild modifiers excluding the entire group, seeded with inherent modifier stats
    const charModsWithout: Partial<CharacterStats> = { ...inherentCharBase }
    const enemyModsWithout: Partial<EnemyStats> = { ...inherentEnemyBase }

    for (let j = 0; j < damageModifiers.length; j++) {
      if (excludedIndices.has(j)) continue

      const otherMod = damageModifiers[j]
      // Apply stack multiplier for limited modifiers, matching resolveDamageModifiers logic
      const stackedOtherMod = otherMod.durationStrategy?.type === 'limited' && ctx
        ? applyStackMultiplier(otherMod, ctx.modifiersInAction)
        : otherMod
      const conditionMultiplier = stackedOtherMod.condition && ctx ? stackedOtherMod.condition(ctx) : 1

      if (stackedOtherMod.characterStats) {
        for (const [key, value] of Object.entries(stackedOtherMod.characterStats)) {
          const statKey = key as keyof CharacterStats
          const currentVal = charModsWithout[statKey] as number | undefined
          const modValue = (value as number) * conditionMultiplier
          charModsWithout[statKey] = aggregateStat(currentVal, modValue, key) as any
        }
      }
      if (stackedOtherMod.enemyStats) {
        for (const [key, value] of Object.entries(stackedOtherMod.enemyStats)) {
          const statKey = key as keyof EnemyStats
          const currentVal = enemyModsWithout[statKey] as number | undefined
          const modValue = (value as number) * conditionMultiplier
          enemyModsWithout[statKey] = aggregateStat(currentVal, modValue, key) as any
        }
      }
    }

    // Calculate damage without this group
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
      source: representativeMod.source,
      ownerCharacter: representativeMod.ownerCharacter ?? null,
      displayName: representativeMod.displayName,
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

/**
 * Calculates negative status damage with proper modifier application.
 *
 * Unlike normal action damage which scales off character stats (ATK/HP/DEF),
 * negative status damage uses FLAT values from a stack table. However, it still
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
 */
export function calculateDamageNegativeStatus(currStacks: number, element: ElementType, enemy: Enemy, negativeStatusName: string, baseStats: CharacterStats, modifierCharacterStats: Partial<CharacterStats>, modifierEnemyStats: Partial<EnemyStats>, damageModifiers: DamageModifier[], dealer: string, snapshotId: number, timeStamp: number, actionName?: string, ctx?: StepContext): DamageEvent {
  const statusIdentifier = Object.entries(negativeStatuses).find(([, status]) => status.name === negativeStatusName)?.[0]

  // Get base damage from stack table (this is a flat value, not a multiplier)
  const baseDMG = negativeStatuses[statusIdentifier].damage[currStacks]

  // Merge base stats with modifiers to get final stats
  const finalCharacterStats = mergeStats(baseStats, modifierCharacterStats)
  const finalEnemyStats = mergeEnemyStats(enemy.stats, modifierEnemyStats)

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
  const contributions = !damageModifiers.length || !ctx ? {} : calculateNegativeStatusContributions(baseDMG, element, enemy, baseStats, damageModifiers, damage, ctx)

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
    contributions,
    timeStamp,
  }

  return damageEvent
}

/**
 * Calculates contributions for negative status damage.
 * Similar to normal damage contributions but uses the flat damage formula.
 */
function calculateNegativeStatusContributions(baseDMG: number, element: ElementType, enemy: Enemy, baseStats: CharacterStats, damageModifiers: DamageModifier[], fullDamage: number, ctx: StepContext): Record<string, Contribution> {
  const results: Record<string, Contribution> = {}

  // Group modifiers by contributionGroup (or own source for ungrouped)
  const groupIndices = new Map<string, number[]>()
  for (let i = 0; i < damageModifiers.length; i++) {
    const mod = damageModifiers[i]
    const groupKey = mod.contributionGroup ?? mod.source ?? `modifier_${i}`
    if (!groupIndices.has(groupKey)) groupIndices.set(groupKey, [])
    groupIndices.get(groupKey)!.push(i)
  }

  for (const [groupKey, indices] of groupIndices.entries()) {
    const anchor = indices.map(i => damageModifiers[i]).find(m => (m.source ?? '') === groupKey)
    const representativeMod = anchor ?? damageModifiers[indices[0]]
    const uniqueKey = groupKey in results ? `${groupKey}_${indices[0]}` : groupKey

    const excludedIndices = new Set(indices)

    // Rebuild modifiers excluding the entire group
    const charModsWithout: Partial<CharacterStats> = {}
    const enemyModsWithout: Partial<EnemyStats> = {}

    for (let j = 0; j < damageModifiers.length; j++) {
      if (excludedIndices.has(j)) continue

      const otherMod = damageModifiers[j]
      // Apply stack multiplier for limited modifiers, matching resolveDamageModifiers logic
      const stackedOtherMod = otherMod.durationStrategy?.type === 'limited' && ctx
        ? applyStackMultiplier(otherMod, ctx.modifiersInAction)
        : otherMod
      const conditionMultiplier = stackedOtherMod.condition ? stackedOtherMod.condition(ctx) : 1

      if (stackedOtherMod.characterStats) {
        for (const [key, value] of Object.entries(stackedOtherMod.characterStats)) {
          const statKey = key as keyof CharacterStats
          const currentVal = charModsWithout[statKey] as number | undefined
          const modValue = (value as number) * conditionMultiplier
          charModsWithout[statKey] = aggregateStat(currentVal, modValue, key) as any
        }
      }
      if (stackedOtherMod.enemyStats) {
        for (const [key, value] of Object.entries(stackedOtherMod.enemyStats)) {
          const statKey = key as keyof EnemyStats
          const currentVal = enemyModsWithout[statKey] as number | undefined
          const modValue = (value as number) * conditionMultiplier
          enemyModsWithout[statKey] = aggregateStat(currentVal, modValue, key) as any
        }
      }
    }

    // Recalculate damage without this group
    const statsWithout = mergeStats(baseStats, charModsWithout)
    const enemyStatsWithout = mergeEnemyStats(enemy.stats, enemyModsWithout)

    // Resistance multipliers
    const level = statsWithout.level
    const enemyLevel = enemyStatsWithout.level
    const enemyResistance = enemyStatsWithout.resistance
    const enemyDamageReduction = enemyStatsWithout.damageReduction
    const elementRES = enemyStatsWithout[`${element.toLowerCase()}RES` as keyof typeof enemyStatsWithout] as number

    const resistanceMultiplier = calculateResistanceMultiplierValue(0, enemyResistance)
    const defenseMultiplier = calculateDefenseMultiplier(level, enemyLevel, 0)
    const damageReductionMultiplier = 1 - enemyDamageReduction
    const elementalResMultiplier = 1 - elementRES
    const damageRES = resistanceMultiplier * defenseMultiplier * damageReductionMultiplier * elementalResMultiplier

    // Status multipliers
    const statusBonus = getStatusBonusDMG(statsWithout, element)
    const statusAmplify = getStatusAmplifyDMG(statsWithout, element)
    const statusTotalMultiplier = getStatusTotalMultiplierDMG(statsWithout, element)
    const statusMultiplier = (1 + statusBonus) * (1 + statusAmplify) * statusTotalMultiplier

    const damageWithout = baseDMG * damageRES * statusMultiplier

    // Calculate contribution
    const contrib = fullDamage - damageWithout

    const safePercent = (withVal: number, withoutVal: number) => {
      if (!withoutVal || withoutVal === 0) return 0
      return (withVal / withoutVal - 1) * 100
    }

    const pct = safePercent(fullDamage, damageWithout)

    results[uniqueKey] = {
      source: representativeMod.source,
      ownerCharacter: representativeMod.ownerCharacter ?? null,
      displayName: representativeMod.displayName,
      isSelf: representativeMod.targetStrategy === 'self',
      crit_damage_contributed: Math.max(0, contrib),
      crit_percent_damage_contributed: pct,
      normal_damage_contributed: Math.max(0, contrib),
      normal_percent_damage_contributed: pct,
      average_damage_contributed: Math.max(0, contrib),
      average_percent_damage_contributed: pct,
    }
  }

  return results
}
