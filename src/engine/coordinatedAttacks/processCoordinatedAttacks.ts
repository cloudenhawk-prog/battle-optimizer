// Ticks every active coordinated attack over the step window: hit damage, per-hit energy and status edits, expiry.
import type { CoordinatedAttack } from '../../types/coordinatedAttack'
import type { DamageEvent } from '../../types/events'
import type { StepContext } from '../../types/stepContext'
import type { DamageModifier } from '../../types/modifiers'
import type { CharacterStats, EnemyStats } from '../../types/stats'
import { calculateDamage } from '../damage/damageCalculator'
import { activateModifiers } from '../modifiers/modifierHelpers'
import { applyModifierStackChange } from '../modifiers/modifierStackChange'
import { aggregateModifierStats } from '../resolvers/statHelpers'
import { getNegativeStatusStacks, updateNegativeStatusStacks } from '../negativeStatuses/negativeStatusHelpers'
import { applyEnergyPerHit } from './energyPerHit'
import { makeActionFromCoordinatedAttack } from './fakeAction'
import { removeLinkedModifiers } from './linkedModifiers'

// ========== Types ===========================================================================================================

type NegativeStatusModTotals = Record<string, { stackChange: number; durationChange: number; refreshDuration: boolean }>

type BuffDebuffModTotals = {
  buff: Record<string, { stackChange: number }>
  debuff: Record<string, { stackChange: number }>
}

// ========== Main Processing =================================================================================================

/**
 * Tick all active coordinated attacks for the current step window [fromTime, toTime].
 *
 * For each attack:
 *  - Computes damage hits using the OWNER character's base stats + the step's applicable modifiers
 *    (ctx.damageModifiers) re-filtered and re-aggregated for an off-field attacker.
 *  - Applies per-hit energy generation to the owner (and allies via share).
 *  - Accumulates per-hit status modifications (negativeStatus, buff, debuff) multiplied by hit
 *    count and applies them once at the end. Buff/debuff stack changes mirror
 *    helpModifierStatusModifications: when stacks are added and resetTimerOnApplication is true,
 *    timeLeft/swapsLeft are reset to the modifier's configured duration.
 *  - For swap-required attacks: if the owner character just became active again
 *    (ctx.lastSwappedToCharacter === ownerCharacter), ticks only up to fromTime then deactivates.
 *
 * Attack entries (caia) are mutated in place.
 */
export function processCoordinatedAttacks(ctx: StepContext): void {
  if (ctx.coordinatedAttacksInAction.length === 0) return

  const allCharacters = [ctx.character, ...ctx.allies]
  const allDamageEvents: DamageEvent[] = []
  let totalCoordDamage = 0

  // Accumulated negative-status stack changes from per-hit modifications across all attacks
  const accumulatedNegativeStatusMods: NegativeStatusModTotals = {}

  // Accumulated buff/debuff stack changes from per-hit modifications across all attacks
  const accumulatedBuffDebuffMods: BuffDebuffModTotals = { buff: {}, debuff: {} }

  for (const caia of ctx.coordinatedAttacksInAction) {
    if (caia.applicationTime === -1) continue

    const ca = caia.coordinatedAttack
    const ownerChar = allCharacters.find(c => c.name === caia.ownerCharacter)
    if (!ownerChar) continue

    // Determines the tick boundary for this step
    // Swap-required: if the owner just swapped back in, only tick up to fromTime then expire
    const isReturnToOwner = ca.swapRequired && ctx.lastSwappedToCharacter === caia.ownerCharacter
    const tickEndTime = isReturnToOwner ? ctx.fromTime : ctx.toTime

    const fakeAction = makeActionFromCoordinatedAttack(ca)

    let lastDamageTime = caia.lastDamageTime
    let timeLeft = caia.timeLeft
    let hitCount = 0

    while (lastDamageTime + ca.frequency <= tickEndTime && timeLeft >= ca.frequency) {
      lastDamageTime += ca.frequency
      timeLeft -= ca.frequency

      // A zero condition skips the hit but still consumes its time slot
      const conditionMultiplier = ca.condition ? ca.condition(ctx) : 1
      if (conditionMultiplier === 0) continue

      hitCount++

      // Activate per-tick damageModifiers (e.g. a weapon buff triggered by every heal tick).
      // These are limited-duration modifiers injected into the CA via gear — they need to be
      // activated (or refreshed) on every tick so effects like "4s team crit DMG on heal" work.
      if (ca.damageModifiers?.length) {
        ctx.modifiersInAction = activateModifiers(ca.damageModifiers, ctx.modifiersInAction, ctx)
      }

      const { coordDamageModifiers, coordCharMods, coordEnemyMods } = buildOffFieldModifierStats(ctx, caia.ownerCharacter)

      const { average, damageEvent } = calculateDamage({
        action: fakeAction,
        name: `${caia.ownerCharacter}: ${ca.displayName ?? ca.name}`,
        stats: ownerChar.stats,
        damageModifiers: coordDamageModifiers,
        modifierCharacterStats: coordCharMods,
        modifierEnemyStats: coordEnemyMods,
        enemy: ctx.enemy,
        snapshotId: ctx.snapshotId,
        timeStamp: lastDamageTime,
        ctx,
      })

      const scaledAverage = Math.ceil(average * conditionMultiplier)
      const scaledEvent = conditionMultiplier === 1 ? damageEvent : {
        ...damageEvent,
        normalStrike: damageEvent.normalStrike * conditionMultiplier,
        criticalStrike: damageEvent.criticalStrike * conditionMultiplier,
        average: scaledAverage,
      }

      allDamageEvents.push(scaledEvent)
      totalCoordDamage += scaledAverage
    }

    // Per-hit energy generation (applied once per tick, repeated hitCount times)
    if (hitCount > 0 && ca.energyGenerated.length > 0) {
      for (let i = 0; i < hitCount; i++) {
        applyEnergyPerHit(ctx, caia.ownerCharacter, ownerChar, ca.energyGenerated)
      }
    }

    // Accumulate per-hit status modifications (multiply stackChange by hitCount)
    if (hitCount > 0) {
      accumulateHitStatusModifications(ca, hitCount, accumulatedNegativeStatusMods, accumulatedBuffDebuffMods)
    }

    // Update or expire the attack state
    if (timeLeft <= 0 || isReturnToOwner) {
      removeLinkedModifiers(ca, ctx)
      caia.applicationTime = -1
      caia.timeLeft = 0
      caia.lastDamageTime = 0
    } else {
      caia.lastDamageTime = lastDamageTime
      caia.timeLeft = timeLeft
    }
  }

  // Flush damage events and accumulate into snapshot
  if (allDamageEvents.length > 0) {
    ctx.damageEvents.push(...allDamageEvents)
    ctx.current.damage += totalCoordDamage
  }

  // Apply aggregated negative-status modifications from per-hit effects
  if (Object.keys(accumulatedNegativeStatusMods).length > 0) {
    const stacksCurr = getNegativeStatusStacks(ctx.current)
    updateNegativeStatusStacks(ctx.current, stacksCurr, ctx.action, ctx.negativeStatusesInAction, accumulatedNegativeStatusMods, ctx)
  }

  // Apply aggregated buff/debuff stack modifications from per-hit effects
  applyBuffDebuffMods(ctx, accumulatedBuffDebuffMods)
}

// ========== Off-Field Modifier Stats ========================================================================================

/**
 * Filter ctx.damageModifiers to only those applicable to the off-field owner character, then
 * recompute aggregated stats from that list so on-field-only contributions (e.g. Static Mist
 * nextSwap ATK) are excluded. 'nextSwap' and 'self' buffs targeting the on-field character
 * must not apply to an off-field coordinated attacker.
 */
function buildOffFieldModifierStats(ctx: StepContext, ownerCharacter: string): {
  coordDamageModifiers: DamageModifier[]
  coordCharMods: Partial<CharacterStats>
  coordEnemyMods: Partial<EnemyStats>
} {
  const coordDamageModifiers = ctx.damageModifiers.filter(mod => {
    switch (mod.targetStrategy) {
      case 'self': return mod.ownerCharacter === ownerCharacter
      case 'nextSwap': return false
      case 'active': return false  // 'active' means the on-field character; CA owner is off-field
      case 'activeAlly': return mod.ownerCharacter !== ownerCharacter
      case 'allExceptSelf': return mod.ownerCharacter !== ownerCharacter
      default: return true // 'all'
    }
  })

  // Starts from empty bags (not initializeEmpty*Stats): aggregateStat supplies neutral defaults
  const coordCharMods: Partial<CharacterStats> = {}
  const coordEnemyMods: Partial<EnemyStats> = {}
  aggregateModifierStats(coordDamageModifiers, ctx.modifiersInAction, ctx, coordCharMods, coordEnemyMods)

  return { coordDamageModifiers, coordCharMods, coordEnemyMods }
}

// ========== Status Modification Accumulation ================================================================================

/** Adds `hitCount` × each of the attack's statusModifications into the running totals. */
function accumulateHitStatusModifications(ca: CoordinatedAttack, hitCount: number, negativeStatusMods: NegativeStatusModTotals, buffDebuffMods: BuffDebuffModTotals): void {
  for (const mod of ca.statusModifications) {
    if (mod.type === 'negativeStatus') {
      const existing = negativeStatusMods[mod.targetName] ?? { stackChange: 0, durationChange: 0, refreshDuration: false }
      negativeStatusMods[mod.targetName] = {
        stackChange: existing.stackChange + (mod.stackChange ?? 0) * hitCount,
        durationChange: existing.durationChange + (mod.durationChange ?? 0) * hitCount,
        refreshDuration: existing.refreshDuration || (mod.refreshDuration ?? false),
      }
    } else if (mod.type === 'buff' || mod.type === 'debuff') {
      const bucket = buffDebuffMods[mod.type]
      const existing = bucket[mod.targetName] ?? { stackChange: 0 }
      bucket[mod.targetName] = { stackChange: existing.stackChange + (mod.stackChange ?? 0) * hitCount }
    }
  }
}

/** Applies accumulated buff/debuff stack deltas (by displayName) and drops entries left at 0 stacks. */
function applyBuffDebuffMods(ctx: StepContext, buffDebuffMods: BuffDebuffModTotals): void {
  for (const type of ['buff', 'debuff'] as const) {
    const bucket = buffDebuffMods[type]
    if (!Object.keys(bucket).length) continue
    ctx.modifiersInAction = ctx.modifiersInAction
      .map(mia => {
        if (mia.modifier.type !== type) return mia
        const changes = bucket[mia.modifier.displayName]
        if (!changes || changes.stackChange === 0) return mia
        return applyModifierStackChange(mia, changes.stackChange)
      })
      .filter(mia => mia.currentStacks > 0)
  }
}
