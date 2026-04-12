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

// ========== Buff Toggle Re-Evaluator =========================================================================================

/**
 * Re-evaluates an action's damage with only the specified modifier groups active.
 * Used by DataOverlay so toggling buffs on/off produces exact (not estimated) damage numbers.
 *
 * The inherent modifier baseline is always included regardless of `activeGroupKeys`,
 * matching the same baseline used inside calculateAllContrubutions's evaluateSubset.
 */
export function evaluateDamageWithGroups(
  params: { action: Action; characterName: string; baseStats: CharacterStats; damageModifiers: DamageModifier[]; enemy: Enemy; ctx?: StepContext },
  snapshotId: number,
  timeStamp: number,
  activeGroupKeys: Set<string>,
): { normal: number; crit: number; avg: number } {
  const { action, characterName, baseStats, damageModifiers, enemy, ctx } = params

  // Pre-compute inherent modifier baseline (same logic as inside calculateAllContrubutions)
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

  // Build the same group → indices mapping as calculateAllContrubutions
  const groupIndices = new Map<string, number[]>()
  for (let i = 0; i < damageModifiers.length; i++) {
    const mod = damageModifiers[i]
    const groupKey = mod.contributionGroup ?? (mod.source !== undefined ? `${mod.source}::${mod.displayName ?? mod.source}` : `modifier_${i}`)
    if (!groupIndices.has(groupKey)) groupIndices.set(groupKey, [])
    groupIndices.get(groupKey)!.push(i)
  }

  // Aggregate only the active modifier groups on top of the inherent baseline
  const charMods: Partial<CharacterStats> = { ...inherentCharBase }
  const enemyMods: Partial<EnemyStats> = { ...inherentEnemyBase }

  for (const [groupKey, indices] of groupIndices) {
    if (!activeGroupKeys.has(groupKey)) continue
    for (const j of indices) {
      const mod = damageModifiers[j]
      const stackedMod = mod.durationStrategy?.type === 'limited' && ctx
        ? applyStackMultiplier(mod, ctx.modifiersInAction)
        : mod
      const conditionMultiplier = stackedMod.condition && ctx ? stackedMod.condition(ctx) : 1

      if (stackedMod.characterStats) {
        for (const [key, value] of Object.entries(stackedMod.characterStats)) {
          const statKey = key as keyof CharacterStats
          charMods[statKey] = aggregateStat(charMods[statKey] as number | undefined, (value as number) * conditionMultiplier, key) as any
        }
      }
      if (stackedMod.enemyStats) {
        for (const [key, value] of Object.entries(stackedMod.enemyStats)) {
          const statKey = key as keyof EnemyStats
          enemyMods[statKey] = aggregateStat(enemyMods[statKey] as number | undefined, (value as number) * conditionMultiplier, key) as any
        }
      }
    }
  }

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

/**
 * Re-evaluates negative status damage with only the specified modifier groups active.
 * Uses the same formula as calculateNegativeStatusContributions's evaluateSubset,
 * avoiding the console.log spam inside calculateDamageNegativeStatus.
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

  // Build group → indices map (same key derivation as calculateNegativeStatusContributions)
  const groupIndices = new Map<string, number[]>()
  for (let i = 0; i < damageModifiers.length; i++) {
    const mod = damageModifiers[i]
    const groupKey = mod.contributionGroup ?? (mod.source !== undefined ? `${mod.source}::${mod.displayName ?? mod.source}` : `modifier_${i}`)
    if (!groupIndices.has(groupKey)) groupIndices.set(groupKey, [])
    groupIndices.get(groupKey)!.push(i)
  }

  // Aggregate only active groups
  const charMods: Partial<CharacterStats> = {}
  const enemyMods: Partial<EnemyStats> = {}
  for (const [groupKey, indices] of groupIndices) {
    if (!activeGroupKeys.has(groupKey)) continue
    for (const j of indices) {
      const mod = damageModifiers[j]
      const stackedMod = mod.durationStrategy?.type === 'limited' && ctx ? applyStackMultiplier(mod, ctx.modifiersInAction) : mod
      const conditionMultiplier = stackedMod.condition && ctx ? stackedMod.condition(ctx) : 1
      if (stackedMod.characterStats) {
        for (const [key, value] of Object.entries(stackedMod.characterStats)) {
          const statKey = key as keyof CharacterStats
          charMods[statKey] = aggregateStat(charMods[statKey] as number | undefined, (value as number) * conditionMultiplier, key) as any
        }
      }
      if (stackedMod.enemyStats) {
        for (const [key, value] of Object.entries(stackedMod.enemyStats)) {
          const statKey = key as keyof EnemyStats
          enemyMods[statKey] = aggregateStat(enemyMods[statKey] as number | undefined, (value as number) * conditionMultiplier, key) as any
        }
      }
    }
  }

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

export function calculateAllContrubutions(action: Action, name: string, stats: CharacterStats, damageModifiers: DamageModifier[], enemy: Enemy, snapshotId: number, timeStamp: number, normalStrike: number, criticalStrike: number, average: number, ctx?: StepContext): Record<string, Contribution> {
  const results: Record<string, Contribution> = {}

  // Pre-compute inherent modifier stats so every subset evaluation baseline includes them.
  // Without this, inherentModifiers would be missing from all subset baselines.
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

  // Group modifiers by contributionGroup (explicit opt-in), or by unique `source::displayName` key.
  // Using source::displayName (not just source) ensures that two modifiers sharing the same source
  // but representing distinct effects (e.g. S1 base vs S2 enhancement) are reported separately.
  // Modifiers that should be reported as one combined entry must explicitly set contributionGroup.
  const groupIndices = new Map<string, number[]>()
  for (let i = 0; i < damageModifiers.length; i++) {
    const mod = damageModifiers[i]
    const groupKey = mod.contributionGroup ?? (mod.source !== undefined ? `${mod.source}::${mod.displayName ?? mod.source}` : `modifier_${i}`)
    if (!groupIndices.has(groupKey)) groupIndices.set(groupKey, [])
    groupIndices.get(groupKey)!.push(i)
  }

  const groups = [...groupIndices.entries()]
  const n = groups.length
  if (n === 0) return results

  // Evaluates damage for an arbitrary subset of modifier groups by aggregating only those groups'
  // stats (plus the inherent baseline) and delegating to calculateDamage.
  const evaluateSubset = (subsetKeys: Set<string>): { normal: number; crit: number; avg: number } => {
    const charMods: Partial<CharacterStats> = { ...inherentCharBase }
    const enemyMods: Partial<EnemyStats> = { ...inherentEnemyBase }

    for (const [groupKey, indices] of groups) {
      if (!subsetKeys.has(groupKey)) continue
      for (const j of indices) {
        const mod = damageModifiers[j]
        const stackedMod = mod.durationStrategy?.type === 'limited' && ctx
          ? applyStackMultiplier(mod, ctx.modifiersInAction)
          : mod
        const conditionMultiplier = stackedMod.condition && ctx ? stackedMod.condition(ctx) : 1

        if (stackedMod.characterStats) {
          for (const [key, value] of Object.entries(stackedMod.characterStats)) {
            const statKey = key as keyof CharacterStats
            charMods[statKey] = aggregateStat(charMods[statKey] as number | undefined, (value as number) * conditionMultiplier, key) as any
          }
        }
        if (stackedMod.enemyStats) {
          for (const [key, value] of Object.entries(stackedMod.enemyStats)) {
            const statKey = key as keyof EnemyStats
            enemyMods[statKey] = aggregateStat(enemyMods[statKey] as number | undefined, (value as number) * conditionMultiplier, key) as any
          }
        }
      }
    }

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

  // Group modifiers by contributionGroup (explicit opt-in), or by unique `source::displayName` key.
  const groupIndices = new Map<string, number[]>()
  for (let i = 0; i < damageModifiers.length; i++) {
    const mod = damageModifiers[i]
    const groupKey = mod.contributionGroup ?? (mod.source !== undefined ? `${mod.source}::${mod.displayName ?? mod.source}` : `modifier_${i}`)
    if (!groupIndices.has(groupKey)) groupIndices.set(groupKey, [])
    groupIndices.get(groupKey)!.push(i)
  }

  const groups = [...groupIndices.entries()]
  const n = groups.length
  if (n === 0) return results

  // Evaluates negative status damage for a given subset of modifier groups by rebuilding
  // only those groups' stats and applying the negative status formula directly.
  const evaluateSubset = (subsetKeys: Set<string>): number => {
    const charMods: Partial<CharacterStats> = {}
    const enemyMods: Partial<EnemyStats> = {}

    for (const [groupKey, indices] of groups) {
      if (!subsetKeys.has(groupKey)) continue
      for (const j of indices) {
        const mod = damageModifiers[j]
        const stackedMod = mod.durationStrategy?.type === 'limited'
          ? applyStackMultiplier(mod, ctx.modifiersInAction)
          : mod
        const conditionMultiplier = stackedMod.condition ? stackedMod.condition(ctx) : 1

        if (stackedMod.characterStats) {
          for (const [key, value] of Object.entries(stackedMod.characterStats)) {
            const statKey = key as keyof CharacterStats
            charMods[statKey] = aggregateStat(charMods[statKey] as number | undefined, (value as number) * conditionMultiplier, key) as any
          }
        }
        if (stackedMod.enemyStats) {
          for (const [key, value] of Object.entries(stackedMod.enemyStats)) {
            const statKey = key as keyof EnemyStats
            enemyMods[statKey] = aggregateStat(enemyMods[statKey] as number | undefined, (value as number) * conditionMultiplier, key) as any
          }
        }
      }
    }

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

  // Monte Carlo Shapley value estimation via random permutation sampling.
  // φ_i ≈ (1/T) Σ_t [ f(S_t^i ∪ {i}) - f(S_t^i) ]
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
