import type { StepContext } from '../../types/stepContext'
import type { DamageEvent } from '../../types/events'
import type { Action } from '../../types/action'
import { calculateDamage, calculateDamageNegativeStatus, evaluateDamageWithGroups, evaluateNegativeStatusWithGroups, mergeStats } from './damageCalculator'
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

  const event = calculateDamageNegativeStatus(aeroErosionStacks, 'AERO', context.enemy, 'Aero Erosion', context.character.stats, context.aggregatedCharacterModifiers, context.aggregatedEnemyModifiers, context.damageModifiers, `${context.character.name}: ${sideEffectName}`, context.snapshotId, timeStamp, sideEffectName, context)
  const _aeroFinalStats = mergeStats(context.character.stats, context.aggregatedCharacterModifiers)
  _aeroFinalStats.critRate = Math.min(_aeroFinalStats.critRate, 1.0)
  event.calcParams = {
    reEvaluate: (activeGroupKeys) => evaluateNegativeStatusWithGroups(
      { currStacks: aeroErosionStacks, element: 'AERO', enemy: context.enemy, negativeStatusName: 'Aero Erosion', baseStats: context.character.stats, damageModifiers: context.damageModifiers, ctx: context },
      activeGroupKeys,
    ),
    finalCharacterStats: _aeroFinalStats,
  }
  return event
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
  const multiplier = context.character.sequence >= 3 ? (1.02 + 4.88) : 1.02
  const event = calculateDamageNegativeStatus(
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
  const _chafeProcFinalStats = mergeStats(context.character.stats, context.aggregatedCharacterModifiers)
  _chafeProcFinalStats.critRate = Math.min(_chafeProcFinalStats.critRate, 1.0)
  event.calcParams = {
    reEvaluate: (activeGroupKeys) => evaluateNegativeStatusWithGroups(
      { currStacks: 0, element: 'GLACIO', enemy: context.enemy, negativeStatusName: 'Glacio Chafe', baseStats: context.character.stats, damageModifiers: context.damageModifiers, ctx: context, baseDMGScaling: { scaling: 'ATK', multiplier } },
      activeGroupKeys,
    ),
    finalCharacterStats: _chafeProcFinalStats,
  }
  return event
}

/**
 * Hiyuki Fine Snow (2 stacks) — Glacio Bite proc (action pipeline variant).
 *
 * Fires through the normal action damage pipeline (crit, bonusDMG, RES, defIgnore, etc.)
 * with a 102% ATK multiplier (590% at S3+, where S3 adds +488% to the DMG Multiplier).
 *
 * elements: ['GLACIO'] + dmgTypes: ['NEGATIVE_STATUS'] so the calculator applies
 * Glacio Chafe-specific stat bonuses (glacioChafeBonusDMG, glacioChafeAmplifyDMG,
 * glacioChafeTotalMultiplierDMG) as well as standard Glacio resistance and RES PEN.
 */
export function calculateGlacioChafeProcActionDamage(context: StepContext, sideEffectName: string, timeStamp: number): DamageEvent {
  const multiplier = context.character.sequence >= 3 ? 1.02 + 4.88 : 1.02
  const syntheticAction = {
    name: sideEffectName,
    displayName: sideEffectName,
    category: 'Other',
    castTime: 0,
    multiplier,

    scaling: 'ATK',
    elements: ['GLACIO'],
    dmgTypes: ['NEGATIVE_STATUS'],
    cooldown: 0,
    energyGenerated: [],
    energyCost: [],
    statusModifications: [],
    damageModifiers: [],
    sideEffects: [],
    castConditions: { startState: 'GROUND', endState: 'GROUND' },
    offtune: 0,
  } as unknown as Action

  const { damageEvent } = calculateDamage({
    action: syntheticAction,
    name: `${context.character.name}: ${sideEffectName}`,
    stats: context.character.stats,
    damageModifiers: context.damageModifiers,
    modifierCharacterStats: context.aggregatedCharacterModifiers,
    modifierEnemyStats: context.aggregatedEnemyModifiers,
    enemy: context.enemy,
    snapshotId: context.snapshotId,
    timeStamp,
    ctx: context,
  })

  const _actionProcFinalStats = mergeStats(context.character.stats, context.aggregatedCharacterModifiers)
  _actionProcFinalStats.critRate = Math.min(_actionProcFinalStats.critRate, 1.0)
  damageEvent.calcParams = {
    reEvaluate: (activeGroupKeys) => evaluateDamageWithGroups(
      { action: syntheticAction, characterName: context.character.name, baseStats: context.character.stats, damageModifiers: context.damageModifiers, enemy: context.enemy, ctx: context },
      context.snapshotId,
      timeStamp,
      activeGroupKeys,
    ),
    finalCharacterStats: _actionProcFinalStats,
  }

  return damageEvent
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
  // TODO: should use current max stacks, not default max stacks:
  // Current max stacks might be something like: context.current.negativeStatusesMaxStacks['Glacio Chafe']
  // OR context.prev.negativeStatusesMaxStacks['Glacio Chafe'] depending on which snapshot is the right to use at this point in time

  const event = calculateDamageNegativeStatus(
    defaultMaxStacks,
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
  const _dominionFinalStats = mergeStats(context.character.stats, context.aggregatedCharacterModifiers)
  _dominionFinalStats.critRate = Math.min(_dominionFinalStats.critRate, 1.0)
  event.calcParams = {
    reEvaluate: (activeGroupKeys) => evaluateNegativeStatusWithGroups(
      { currStacks: defaultMaxStacks, element: 'GLACIO', enemy: context.enemy, negativeStatusName: 'Glacio Chafe', baseStats: context.character.stats, damageModifiers: context.damageModifiers, ctx: context },
      activeGroupKeys,
    ),
    finalCharacterStats: _dominionFinalStats,
  }
  return event
}
