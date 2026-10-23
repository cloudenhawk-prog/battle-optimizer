// Damage calculators for character side effects (Aero Erosion burst, Hiyuki Glacio Bite procs, Lucila Oblivion).
import type { StepContext } from '../../types/stepContext'
import type { DamageEvent } from '../../types/events'
import type { Action } from '../../types/action'
import type { ElementType, ScalingType } from '../../types/baseTypes'
import { calculateDamage, calculateDamageNegativeStatus, evaluateDamageWithGroups, evaluateNegativeStatusWithGroups, mergeStats } from './damageCalculator'
import { negativeStatuses } from '../../data/negativeStatuses'

// ========== Shared Pipelines =================================================================================================

// Every calculator attaches calcParams so DataOverlay can re-evaluate the hit with buffs toggled.
// finalCharacterStats mirrors calculateDamage's merged stats (critRate capped at 100%).

/** Final (merged, crit-capped) character stats for calcParams.finalCharacterStats. */
function finalStatsFor(context: StepContext) {
  const finalStats = mergeStats(context.character.stats, context.aggregatedCharacterModifiers)
  finalStats.critRate = Math.min(finalStats.critRate, 1.0)
  return finalStats
}

/** Fires a hit through the negative-status pipeline (no crit, only status-specific multipliers). */
function negativeStatusSideEffect(
  context: StepContext,
  sideEffectName: string,
  timeStamp: number,
  currStacks: number,
  element: ElementType,
  negativeStatusName: string,
  baseDMGScaling?: { scaling: ScalingType; multiplier: number },
): DamageEvent {
  const event = calculateDamageNegativeStatus(currStacks, element, context.enemy, negativeStatusName, context.character.stats, context.aggregatedCharacterModifiers, context.aggregatedEnemyModifiers, context.damageModifiers, `${context.character.name}: ${sideEffectName}`, context.snapshotId, timeStamp, sideEffectName, context, baseDMGScaling)
  const finalCharacterStats = finalStatsFor(context)
  event.calcParams = {
    reEvaluate: (activeGroupKeys) => evaluateNegativeStatusWithGroups(
      { currStacks, element, enemy: context.enemy, negativeStatusName, baseStats: context.character.stats, damageModifiers: context.damageModifiers, ctx: context, baseDMGScaling },
      activeGroupKeys,
    ),
    finalCharacterStats,
  }
  return event
}

/** Fires a synthetic action through the normal action-damage pipeline (crit, bonuses, RES PEN, ...). */
function syntheticActionSideEffect(context: StepContext, sideEffectName: string, timeStamp: number, syntheticAction: Action): DamageEvent {
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

  const finalCharacterStats = finalStatsFor(context)
  damageEvent.calcParams = {
    reEvaluate: (activeGroupKeys) => evaluateDamageWithGroups(
      { action: syntheticAction, characterName: context.character.name, baseStats: context.character.stats, damageModifiers: context.damageModifiers, enemy: context.enemy, ctx: context },
      context.snapshotId,
      timeStamp,
      activeGroupKeys,
    ),
    finalCharacterStats,
  }
  return damageEvent
}

// ========== Aero Erosion Side Effect =========================================================================================

/**
 * Calculates damage from the Aero Erosion explosion side effect.
 * Uses the unified damage pipeline to ensure proper modifier application.
 * Returns a zero-damage event (no calcParams) when there are no Aero Erosion stacks.
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

  return negativeStatusSideEffect(context, sideEffectName, timeStamp, aeroErosionStacks, 'AERO', 'Aero Erosion')
}

// ========== Hiyuki: Snow Rust 2 — Glacio Bite ATK Proc ======================================================================

/**
 * Hiyuki Snow Rust 2 — Glacio Bite ATK proc (negative-status pipeline).
 *
 * Fires a hit that scales as 102% ATK (590% ATK at S3+) through the negative-status damage
 * pipeline: only Glacio Chafe-specific multipliers apply (glacioChafeBonusDMG/AmplifyDMG/
 * TotalMultiplierDMG), no general bonusDMG or glacioBonusDMG, no defIgnore/resistancePEN.
 * No crit — treated the same as a DoT tick.
 *
 * This is NOT the Everfrost Dominion hit — that one uses the Glacio Chafe damage table
 * at max stacks and does not scale off ATK (see calculateGlacioChafeDominionDamage).
 *
 * The snow_rust >= 2 guard lives in the trigger condition on the character;
 * this function is only called when it is already satisfied.
 */
export function calculateGlacioChafeProcDamage(context: StepContext, sideEffectName: string, timeStamp: number): DamageEvent {
  const multiplier = context.character.sequence >= 3 ? (1.02 + 4.88) : 1.02
  return negativeStatusSideEffect(context, sideEffectName, timeStamp, 0, 'GLACIO', 'Glacio Chafe', { scaling: 'ATK', multiplier })
}

/**
 * Hiyuki Snow Rust 2 — Glacio Bite ATK proc (action pipeline variant).
 *
 * Alternative to calculateGlacioChafeProcDamage that fires through the normal action
 * damage pipeline (crit, bonusDMG, RES, defIgnore, etc.) with a 102% ATK multiplier
 * (590% at S3+, where S3 adds +488% to the DMG Multiplier).
 *
 * elements: ['GLACIO'] + dmgTypes: ['NEGATIVE_STATUS'] so the calculator applies
 * Glacio Chafe-specific stat bonuses (glacioChafeBonusDMG, glacioChafeAmplifyDMG,
 * glacioChafeTotalMultiplierDMG) as well as standard Glacio resistance and RES PEN.
 *
 * This is NOT the Everfrost Dominion hit — that one uses the Glacio Chafe damage table
 * at max stacks and does not scale off ATK (see calculateGlacioChafeDominionDamage).
 *
 * Currently unused (data/sideEffects wires the negative-status variant above).
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

  return syntheticActionSideEffect(context, sideEffectName, timeStamp, syntheticAction)
}

// ========== Hiyuki: Everfrost Dominion — Glacio Bite at Max Stacks ==========================================================

/**
 * Hiyuki S6 (Everfrost Dominion) — fires a Glacio Chafe negative-status damage hit at the
 * current effective MAX stacks whenever any team member applies Glacio Chafe.
 *
 * This is NOT an ATK-scaling hit. Damage is derived from the Glacio Chafe stack damage
 * table at max stacks — the same value used for a DoT tick at maximum stacks. It does
 * not use the 102%/590% ATK multiplier from the Snow Rust 2 proc
 * (see calculateGlacioChafeProcDamage for that).
 *
 * Fires for any Resonator's Glacio Chafe application, not only Hiyuki's own attacks.
 * `context.character` is always Hiyuki (substituted by the TeamActionTrigger resolver),
 * ensuring correct dealer attribution regardless of who cast the triggering action.
 */
export function calculateGlacioChafeDominionDamage(context: StepContext, sideEffectName: string, timeStamp: number): DamageEvent {
  const defaultMaxStacks = negativeStatuses['glacioChafe'].maxStacksDefault
  // TODO: should use current max stacks, not default max stacks:
  // Current max stacks might be something like: context.current.negativeStatusesMaxStacks['Glacio Chafe']
  // OR context.prev.negativeStatusesMaxStacks['Glacio Chafe'] depending on which snapshot is the right to use at this point in time

  return negativeStatusSideEffect(context, sideEffectName, timeStamp, defaultMaxStacks, 'GLACIO', 'Glacio Chafe')
}

// ========== Lucila: Oblivion — Basic Attack DMG proc from photo consumption ==================================================

/**
 * Lucila's Oblivion — fires when BA Tracing Forms Stage 3 consumes a Photo (50 Traces).
 * In Resonance Mode - Glacio Chafe (always active for this build), Oblivion is considered
 * as Basic Attack DMG (285.48% ATK, Glacio element).
 * The sideEffect is pushed once per photo consumed into Action.sideEffects by resolveVariant.
 */
export function calculateLucilaOblivionDamage(context: StepContext, sideEffectName: string, timeStamp: number): DamageEvent {
  const syntheticAction = {
    name: sideEffectName,
    displayName: sideEffectName,
    category: 'Other',
    castTime: 0,
    multiplier: 2.8548, // 285.48%
    scaling: 'ATK',
    elements: ['GLACIO'],
    dmgTypes: ['BASIC'], // Considered as Basic Attack DMG in Glacio Chafe mode
    cooldown: 0,
    energyGenerated: [],
    energyCost: [],
    statusModifications: [],
    damageModifiers: [],
    sideEffects: [],
    castConditions: { startState: 'GROUND', endState: 'GROUND' },
    offtune: 0.96,
  } as unknown as Action

  return syntheticActionSideEffect(context, sideEffectName, timeStamp, syntheticAction)
}
