import type { StepContext } from '../../types/stepContext'
import type { DamageEvent } from '../../types/events'
import type { Action } from '../../types/action'
import { calculateDamageNegativeStatus, calculateDamage } from './damageCalculator'

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

const GLACIO_CHAFE_PROC_ACTION: Action = {
  name: 'Glacio Chafe',
  displayName: 'Glacio Chafe',
  category: 'Other',
  castTime: 0,
  multiplier: 1.02,
  scaling: 'ATK',
  elements: ['GLACIO'],
  dmgTypes: ['LIBERATION'],
  cooldown: 0,
  energyGenerated: [],
  energyCost: [],
  statusModifications: [],
  damageModifiers: [],
  sideEffects: [],
  castConditions: { startState: 'ANY', endState: 'PRESERVE' },
  offtune: 0,
}

/**
 * Hiyuki Fine Snow (2 stacks) — Glacio Bite proc.
 *
 * Scaling assumptions:
 *  - Multiplier: 102% ATK (stated explicitly in the skill).
 *  - Element: GLACIO (matching Hiyuki's kit).
 *  - Damage type: LIBERATION — the game reuses the Liberation dmg type bucket for most of
 *    Hiyuki's special hits; this ensures liberation bonusDMG/amplifyDMG buffs apply.
 *  - Runs through the full calculateDamage pipeline, so crit rate/damage, all active
 *    modifier stats (bonusDMG, amplifyDMG, totalMultiplierDMG, glacioChafeAmplifyDMG, etc.),
 *    and enemy resistances all apply normally.
 *  - The snow_rust >= 2 guard lives in the ActionTrigger condition on the character;
 *    this function is only called when it is already satisfied.
 */
export function calculateGlacioChafeProcDamage(context: StepContext, sideEffectName: string, timeStamp: number): DamageEvent {
  return calculateDamage({
    action: { ...GLACIO_CHAFE_PROC_ACTION, name: sideEffectName, displayName: sideEffectName },
    name: `${context.character.name}: ${sideEffectName}`,
    stats: context.character.stats,
    damageModifiers: context.damageModifiers,
    modifierCharacterStats: context.aggregatedCharacterModifiers,
    modifierEnemyStats: context.aggregatedEnemyModifiers,
    enemy: context.enemy,
    snapshotId: context.snapshotId,
    timeStamp,
    ctx: context,
  }).damageEvent
}
