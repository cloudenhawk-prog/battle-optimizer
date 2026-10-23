// Stat aggregation helpers shared by the resolvers: empty stat bags, aggregateStat, and modifier → stat folding.
import type { CharacterStats, EnemyStats } from '../../types/stats'
import type { DamageModifier, ModifierInAction } from '../../types/modifiers'
import type { StepContext } from '../../types/stepContext'
import { applyStackMultiplier } from '../modifiers/modifierHelpers'

// ========== Empty Stat Bags =================================================================================================

/** Neutral starting values for aggregated character modifiers (0 for additive stats, 1 for multipliers). */
export function initializeEmptyCharacterStats(): Partial<CharacterStats> {
  const stats: Partial<CharacterStats> = {
    level: 0,
    baseATK: 0,
    flatATK: 0,
    bonusATK: 0,
    amplifyATK: 0,
    totalMultiplierATK: 1.0,
    baseHP: 0,
    flatHP: 0,
    bonusHP: 0,
    amplifyHP: 0,
    totalMultiplierHP: 1.0,
    baseDEF: 0,
    flatDEF: 0,
    bonusDEF: 0,
    amplifyDEF: 0,
    totalMultiplierDEF: 1.0,
    critRate: 0,
    critDamage: 0,
    bonusDMG: 0,
    amplifyDMG: 0,
    totalMultiplierDMG: 1.0,
    defIgnore: 0.0,
    elementalResPEN: 0.0,
    resistancePEN: 0.0,
    basicBonusDMG: 0,
    basicAmplifyDMG: 0,
    basicTotalMultiplierDMG: 1.0,
    heavyBonusDMG: 0,
    heavyAmplifyDMG: 0,
    heavyTotalMultiplierDMG: 1.0,
    skillBonusDMG: 0,
    skillAmplifyDMG: 0,
    skillTotalMultiplierDMG: 1.0,
    liberationBonusDMG: 0,
    liberationAmplifyDMG: 0,
    liberationTotalMultiplierDMG: 1.0,
    coordinatedBonusDMG: 0,
    coordinatedAmplifyDMG: 0,
    coordinatedTotalMultiplierDMG: 1.0,
    echoBonusDMG: 0,
    echoAmplifyDMG: 0,
    echoTotalMultiplierDMG: 1.0,
    introBonusDMG: 0,
    introAmplifyDMG: 0,
    introTotalMultiplierDMG: 1.0,
    outroBonusDMG: 0,
    outroAmplifyDMG: 0,
    outroTotalMultiplierDMG: 1.0,
    aeroErosionBonusDMG: 0,
    aeroErosionAmplifyDMG: 0,
    aeroErosionTotalMultiplierDMG: 1.0,
    spectroFrazzleBonusDMG: 0,
    spectroFrazzleAmplifyDMG: 0,
    spectroFrazzleTotalMultiplierDMG: 1.0,
    havocBaneBonusDMG: 0,
    havocBaneAmplifyDMG: 0,
    havocBaneTotalMultiplierDMG: 1.0,
    glacioChafeBonusDMG: 0,
    glacioChafeAmplifyDMG: 0,
    glacioChafeTotalMultiplierDMG: 1.0,
    fusionBurstBonusDMG: 0,
    fusionBurstAmplifyDMG: 0,
    fusionBurstTotalMultiplierDMG: 1.0,
    electroFlareBonusDMG: 0,
    electroFlareAmplifyDMG: 0,
    electroFlareTotalMultiplierDMG: 1.0,
    spectroBonusDMG: 0,
    spectroAmplifyDMG: 0,
    spectroTotalMultiplierDMG: 1.0,
    fusionBonusDMG: 0,
    fusionAmplifyDMG: 0,
    fusionTotalMultiplierDMG: 1.0,
    aeroBonusDMG: 0,
    aeroAmplifyDMG: 0,
    aeroTotalMultiplierDMG: 1.0,
    glacioBonusDMG: 0,
    glacioAmplifyDMG: 0,
    glacioTotalMultiplierDMG: 1.0,
    electroBonusDMG: 0,
    electroAmplifyDMG: 0,
    electroTotalMultiplierDMG: 1.0,
    havocBonusDMG: 0,
    havocAmplifyDMG: 0,
    havocTotalMultiplierDMG: 1.0,
    energyPercent: 0,
  }
  return stats
}

/** Neutral starting values for aggregated enemy modifiers. */
export function initializeEmptyEnemyStats(): Partial<EnemyStats> {
  const stats: Partial<EnemyStats> = {
    level: 0,
    aeroRES: 0,
    spectroRES: 0,
    havocRES: 0,
    glacioRES: 0,
    fusionRES: 0,
    electroRES: 0,
    resistance: 0,
    damageReduction: 0,
  }
  return stats
}

// ========== Aggregation =====================================================================================================

/**
 * Folds one incoming modifier value into an aggregated stat.
 * - `*TotalMultiplier*` stats multiply (neutral 1)
 * - `damageReduction` stacks multiplicatively: 1 - (1 - a)(1 - b)
 * - everything else adds (neutral 0)
 */
export function aggregateStat(currentValue: number | undefined, incomingValue: number, statKey: string): number {
  const lowerKey = statKey.toLowerCase()
  const isMultiplier = lowerKey.includes('totalmultiplier')
  const isDamageReduction = lowerKey === 'damagereduction'

  if (isDamageReduction) {
    const current = currentValue ?? 0
    return 1 - (1 - current) * (1 - incomingValue)
  }

  const current = currentValue ?? (isMultiplier ? 1 : 0)

  return isMultiplier ? current * incomingValue : current + incomingValue
}

/**
 * Folds every modifier's characterStats / enemyStats into the given stat bags (mutated in place).
 * Limited modifiers are first scaled by their current stack count; each modifier's `condition`
 * (evaluated against `conditionCtx`) scales its values. Iteration order = modifier order.
 */
export function aggregateModifierStats(
  modifiers: DamageModifier[],
  modifiersInAction: ModifierInAction[],
  conditionCtx: StepContext,
  characterModifiers: Partial<CharacterStats>,
  enemyModifiers: Partial<EnemyStats>,
): void {
  for (const modifier of modifiers) {
    const stackedModifier = modifier.durationStrategy?.type === 'limited' ? applyStackMultiplier(modifier, modifiersInAction) : modifier
    const conditionMultiplier = stackedModifier.condition ? stackedModifier.condition(conditionCtx) : 1

    if (stackedModifier.characterStats) {
      for (const [key, value] of Object.entries(stackedModifier.characterStats)) {
        const statKey = key as keyof CharacterStats
        characterModifiers[statKey] = aggregateStat(characterModifiers[statKey] as number | undefined, (value as number) * conditionMultiplier, statKey) as any
      }
    }

    if (stackedModifier.enemyStats) {
      for (const [key, value] of Object.entries(stackedModifier.enemyStats)) {
        const statKey = key as keyof EnemyStats
        enemyModifiers[statKey] = aggregateStat(enemyModifiers[statKey] as number | undefined, (value as number) * conditionMultiplier, statKey) as any
      }
    }
  }
}
