import type { StepContext } from '../../types/stepContext'
import type { DamageEvent } from '../../types/events'
import { calculateDamageNegativeStatus } from './damageCalculator'
import { negativeStatuses } from '../../data/negativeStatuses'


// ========== Aero Erosion Side Effect =========================================================================================

/**
 * Calculates damage from the Aero Erosion explosion side effect.
 * Uses the unified damage pipeline to ensure proper modifier application.
 */
export function calculateAeroErosionSideEffectDamage(context: StepContext, sideEffectName: string, timeStamp: number): DamageEvent {
  const aeroErosionStacks = context.prev.negativeStatuses['Aero Erosion'] || 0

  if (aeroErosionStacks === 0) {
    return {
      snapshotId: context.snapshotId,
      dealer: `${context.character.name}: ${sideEffectName}`,
      target: context.enemy.name,
      elements: ['AERO'],
      dmgTypes: ['NEGATIVE_STATUS'],
      scaling: 'FLAT',
      actionName: sideEffectName,
      normalStrike: 0,
      criticalStrike: 0,
      average: 0,
      contributions: {},
      timeStamp,
    }
  }

  return calculateDamageNegativeStatus(aeroErosionStacks, 'AERO', context.enemy, 'Aero Erosion', context.character.stats, context.aggregatedCharacterModifiers, context.aggregatedEnemyModifiers, context.damageModifiers, `${context.character.name}: ${sideEffectName}`, context.snapshotId, timeStamp, sideEffectName, context)
}

// ========== Hiyuki: Fine Snow — Glacio Chafe Proc ===========================================================================

/**
 * Hiyuki Fine Snow (2 stacks) — Glacio Bite proc.
 *
 * Scales as 102% ATK (or 590% ATK at S3) but follows the negative-status damage pipeline:
 * only Glacio Chafe-specific multipliers apply (glacioChafeBonusDMG/AmplifyDMG/TotalMultiplierDMG),
 * no general bonusDMG or glacioBonusDMG, and no defIgnore/resistancePEN/elementalResPEN.
 * No crit — treat the same as a DoT tick.
 *
 * The snow_rust >= 2 guard lives in the ActionTrigger condition on the character;
 * this function is only called when it is already satisfied.
 */
export function calculateGlacioChafeProcDamage(context: StepContext, sideEffectName: string, timeStamp: number): DamageEvent {
  // S3: DMG Multiplier of Snow Rust: Glacio Bite is increased by 488% (102% + 488% = 590% ATK). TODO: Might be multiplicative
  const multiplier = context.character.sequence >= 3 ? (1.02 + 4.88) : 1.02
  return calculateDamageNegativeStatus(
    0,
    'GLACIO',
    context.enemy,
    'Glacio Chafe',
    context.character.stats,
    context.aggregatedCharacterModifiers,
    context.aggregatedEnemyModifiers,
    context.damageModifiers,
    `${context.character.name}: ${sideEffectName}`,
    context.snapshotId,
    timeStamp,
    sideEffectName,
    context,
    { scaling: 'ATK', multiplier },
  )
}

// ========== Hiyuki: Everfrost Dominion — Glacio Bite at Max Stacks ==========================================================

/**
 * Hiyuki S6 (Everfrost Dominion) — fires a Glacio Chafe negative-status damage hit at the
 * current effective MAX stacks whenever any team member applies Glacio Chafe.
 *
 * Key differences from `calculateGlacioChafeProcDamage` (Fine Snow ATK proc):
 *  - Damage is a NegativeStatus tick at max stacks, not an ATK-multiplier hit.
 *  - Uses the Glacio Chafe damage table, so it scales with the same modifiers that
 *    affect Glacio Chafe DoT ticks (glacioChafeAmplifyDMG, enemy GLACIO RES, etc.).
 *  - Fires for any Resonator's Glacio Chafe application, not only Hiyuki's own attacks.
 *  - `context.character` is always Hiyuki (substituted by the TeamActionTrigger resolver),
 *    ensuring correct dealer attribution regardless of who cast the triggering action.
 */
export function calculateGlacioChafeDominionDamage(context: StepContext, sideEffectName: string, timeStamp: number): DamageEvent {
  const defaultMaxStacks = negativeStatuses['glacioChafe'].maxStacksDefault
  const activeGlacioChafe = context.negativeStatusesInAction.find(s => s.negativeStatus.name === 'Glacio Chafe')
  const rawStacks = activeGlacioChafe?.currentStacks ?? 0
  const currentStacks = rawStacks > 0 ? rawStacks : defaultMaxStacks

  return calculateDamageNegativeStatus(
    currentStacks,
    'GLACIO',
    context.enemy,
    'Glacio Chafe',
    context.character.stats,
    context.aggregatedCharacterModifiers,
    context.aggregatedEnemyModifiers,
    context.damageModifiers,
    `${context.character.name}: ${sideEffectName}`,
    context.snapshotId,
    timeStamp,
    sideEffectName,
    context,
  )
}
