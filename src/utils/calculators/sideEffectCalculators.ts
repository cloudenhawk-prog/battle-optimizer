import type { StepContext } from '../../types/stepContext'
import type { DamageEvent } from '../../types/events'
import { calculateDamageNegativeStatus } from './damageCalculator'

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
