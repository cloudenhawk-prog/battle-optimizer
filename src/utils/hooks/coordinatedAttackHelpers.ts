import type { CoordinatedAttack } from '../../types/coordinatedAttack'
import type { DamageEvent } from '../../types/events'
import type { StepContext } from '../../types/stepContext'
import type { ResolvedCharacter } from '../../types/character'
import type { Action } from '../../types/action'
import type { CharacterStats } from '../../types/stats'
import type { ModifierInAction } from '../../types/modifiers'
import { calculateDamage } from '../calculators/damageCalculator'
import { makeCoordinatedAttackKey } from '../coordinatedAttackKey'
import { updateEnergyValue } from './energyHelpers'
import { activateModifiers, applyStackMultiplier } from './modifierHelpers'
import { aggregateStat } from './resolvers'
import { getNegativeStatusStacks, updateNegativeStatusStacks } from './negativeStatusHelpers'
import type { EnemyStats } from '../../types/stats'

// ========== Coordinated Attack Helpers =======================================================================================

/**
 * Inspect the current action and activate (or refresh) any coordinated attacks it defines.
 * New entries are pushed directly onto ctx.coordinatedAttacksInAction (in-place mutation so
 * the ref in useCharacterActions stays in sync without an explicit assignment).
 */
export function activateCoordinatedAttacks(ctx: StepContext): void {
  for (const ca of ctx.action.coordinatedAttacks ?? []) {
    const existing = ctx.coordinatedAttacksInAction.find(
      caia => caia.coordinatedAttack.name === ca.name && caia.ownerCharacter === ctx.character.name,
    )

    if (existing) {
      // Refresh: reset duration and last-damage anchor to the end of this cast
      existing.applicationTime = ctx.toTime
      existing.timeLeft = ca.duration
      existing.lastDamageTime = ctx.toTime
      ensureLinkedModifiersActive(ca, ctx)
    } else {
      ctx.coordinatedAttacksInAction.push({
        coordinatedAttack: ca,
        ownerCharacter: ctx.character.name,
        applicationTime: ctx.toTime,
        timeLeft: ca.duration,
        lastDamageTime: ctx.toTime,
      })
      ensureLinkedModifiersActive(ca, ctx)
    }
  }
}

// ========== Linked Modifier Helpers =========================================================================================

/**
 * Ensures all linkedModifiers for a coordinated attack are present in ctx.modifiersInAction.
 * Called on both initial activation and refresh (re-cast). Does not duplicate if already present.
 */
function ensureLinkedModifiersActive(ca: CoordinatedAttack, ctx: StepContext): void {
  for (const modifier of ca.linkedModifiers ?? []) {
    const alreadyPresent = ctx.modifiersInAction.some(
      mia => mia.modifier.source === modifier.source && mia.modifier.displayName === modifier.displayName,
    )
    if (!alreadyPresent) {
      ctx.modifiersInAction.push({
        modifier,
        applicationTime: ctx.toTime,
        timeLeft: Infinity,
        swapsLeft: Infinity,
        currentStacks: 1,
        targetCharacter: null,
      } satisfies ModifierInAction)
    }
  }
}

/**
 * Removes all linkedModifiers for a coordinated attack from ctx.modifiersInAction.
 * Called when the attack expires (time or swap-cancel).
 */
function removeLinkedModifiers(ca: CoordinatedAttack, ctx: StepContext): void {
  if (!ca.linkedModifiers?.length) return
  const toRemove = new Set(ca.linkedModifiers.map(m => `${m.source}::${m.displayName}`))
  ctx.modifiersInAction = ctx.modifiersInAction.filter(
    mia => !toRemove.has(`${mia.modifier.source}::${mia.modifier.displayName}`),
  )
}

// ========== Per-hit Energy  ==================================================================================================

function applyEnergyPerHit(ctx: StepContext, ownerCharacter: string, ownerCharObj: ResolvedCharacter, energyGenerated: CoordinatedAttack['energyGenerated']): void {
  const current = ctx.current
  const allCharacters = [ctx.character, ...ctx.allies]

  // Owner energy
  const ownerEnergies = current.charactersEnergies[ownerCharacter]
  if (ownerEnergies) {
    for (const gen of energyGenerated) {
      const max = ownerCharObj.maxEnergies?.[gen.energyType] ?? Infinity
      let amount = gen.amount
      if (amount > 0 && gen.scalingStat) {
        const scaling = (ownerCharObj.stats?.[gen.scalingStat as keyof CharacterStats] as number) ?? 1
        amount *= scaling
      }
      ownerEnergies[gen.energyType] = updateEnergyValue(ownerEnergies[gen.energyType], amount, max)
    }
  }

  // Ally energy share
  for (const ally of allCharacters) {
    if (ally.name === ownerCharacter) continue
    const allyEnergies = current.charactersEnergies[ally.name]
    const allyMax = ally.maxEnergies

    for (const gen of energyGenerated) {
      if (gen.share <= 0) continue
      if (!(gen.energyType in allyMax)) continue

      let amount = gen.amount * gen.share
      if (amount > 0 && gen.scalingStat) {
        const scaling = (ally.stats?.[gen.scalingStat as keyof CharacterStats] as number) ?? 1
        amount *= scaling
      }

      const prevValue = allyEnergies?.[gen.energyType] ?? 0
      const maxValue = allyMax[gen.energyType] ?? Infinity
      if (allyEnergies) {
        allyEnergies[gen.energyType] = updateEnergyValue(prevValue, amount, maxValue)
      }
    }
  }
}

// ========== Fake Action Builder ==============================================================================================

/**
 * Wraps a CoordinatedAttack definition in an Action-shaped object so that the existing
 * calculateDamage pipeline (which consumes Action) can be reused without modification.
 * Only the fields actually read by calculateDamage (scaling, multiplier, elements, dmgTypes,
 * name) are meaningful; all other fields carry safe empty/zero defaults.
 */
function makeActionFromCoordinatedAttack(ca: CoordinatedAttack): Action {
  return {
    name: ca.name,
    displayName: ca.displayName ?? ca.name,
    category: 'Other',
    castTime: 0,
    multiplier: ca.multiplier,
    scaling: ca.scaling,
    elements: ca.elements,
    dmgTypes: ca.dmgTypes,
    cooldown: 0,
    energyGenerated: [],
    energyCost: [],
    statusModifications: [],
    damageModifiers: ca.damageModifiers ?? [],
    sideEffects: [],
    coordinatedAttacks: [],
    castConditions: { startState: 'ANY', endState: 'ANY' },
    offtune: 0,
  }
}

// ========== Main Processing ==================================================================================================

/**
 * Tick all active coordinated attacks for the current step window [fromTime, toTime].
 *
 * For each attack:
 *  - Computes damage hits using the OWNER character's base stats + the aggregated modifiers
 *    already collected by resolveDamageModifiers.
 *  - Applies per-hit energy generation to the owner (and allies via share).
 *  - Accumulates per-hit status modifications (negativeStatus, buff, debuff) multiplied by hit
 *    count and applies them once at the end. Buff/debuff stack changes mirror
 *    helpModifierStatusModifications: when stacks are added and resetTimerOnApplication is true,
 *    timeLeft/swapsLeft are reset to the modifier's configured duration.
 *  - For swap-required attacks: if the owner character just became active again
 *    (ctx.lastSwappedToCharacter === ownerCharacter), ticks only up to fromTime then deactivates.
 */
export function processCoordinatedAttacks(ctx: StepContext): void {
  if (ctx.coordinatedAttacksInAction.length === 0) return

  const allCharacters = [ctx.character, ...ctx.allies]
  const allDamageEvents: DamageEvent[] = []
  let totalCoordDamage = 0

  // Accumulated negative-status stack changes from per-hit modifications across all attacks
  const accumulatedNegativeStatusMods: Record<string, { stackChange: number; durationChange: number; refreshDuration: boolean }> = {}

  // Accumulated buff/debuff stack changes from per-hit modifications across all attacks
  const accumulatedBuffDebuffMods: {
    buff: Record<string, { stackChange: number }>
    debuff: Record<string, { stackChange: number }>
  } = { buff: {}, debuff: {} }

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

      const conditionMultiplier = ca.condition ? ca.condition(ctx) : 1
      if (conditionMultiplier === 0) continue

      hitCount++

      // Activate per-tick damageModifiers (e.g. a weapon buff triggered by every heal tick).
      // These are limited-duration modifiers injected into the CA via gear — they need to be
      // activated (or refreshed) on every tick so effects like "4s team crit DMG on heal" work.
      if (ca.damageModifiers?.length) {
        ctx.modifiersInAction = activateModifiers(ca.damageModifiers, ctx.modifiersInAction, ctx)
      }

      // Filter ctx.damageModifiers to only those applicable to the off-field owner character.
      // 'nextSwap' and 'self' buffs targeting the on-field character must not apply to
      // an off-field coordinated attacker.
      const coordDamageModifiers = ctx.damageModifiers.filter(mod => {
        switch (mod.targetStrategy) {
          case 'self': return mod.ownerCharacter === caia.ownerCharacter
          case 'nextSwap': return false
          case 'active': return false  // 'active' means the on-field character; CA owner is off-field
          case 'activeAlly': return mod.ownerCharacter !== caia.ownerCharacter
          case 'allExceptSelf': return mod.ownerCharacter !== caia.ownerCharacter
          default: return true // 'all'
        }
      })

      // Recompute aggregated stats from the filtered modifier list so that on-field-only
      // stat contributions (e.g. Static Mist nextSwap ATK) are excluded.
      const coordCharMods: Partial<CharacterStats> = {}
      const coordEnemyMods: Partial<EnemyStats> = {}
      for (const modifier of coordDamageModifiers) {
        const stackedModifier = modifier.durationStrategy?.type === 'limited' ? applyStackMultiplier(modifier, ctx.modifiersInAction) : modifier
        const condMult = stackedModifier.condition ? stackedModifier.condition(ctx) : 1
        if (stackedModifier.characterStats) {
          for (const [k, v] of Object.entries(stackedModifier.characterStats)) {
            const key = k as keyof CharacterStats
            coordCharMods[key] = aggregateStat(coordCharMods[key] as number | undefined, (v as number) * condMult, key) as any
          }
        }
        if (stackedModifier.enemyStats) {
          for (const [k, v] of Object.entries(stackedModifier.enemyStats)) {
            const key = k as keyof EnemyStats
            coordEnemyMods[key] = aggregateStat(coordEnemyMods[key] as number | undefined, (v as number) * condMult, key) as any
          }
        }
      }

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

    // Accumulate per-hit negative status stack modifications (multiply stackChange by hitCount)
    if (hitCount > 0) {
      for (const mod of ca.statusModifications) {
        if (mod.type === 'negativeStatus') {
          const existing = accumulatedNegativeStatusMods[mod.targetName] ?? { stackChange: 0, durationChange: 0, refreshDuration: false }
          accumulatedNegativeStatusMods[mod.targetName] = {
            stackChange: existing.stackChange + (mod.stackChange ?? 0) * hitCount,
            durationChange: existing.durationChange + (mod.durationChange ?? 0) * hitCount,
            refreshDuration: existing.refreshDuration || (mod.refreshDuration ?? false),
          }
        } else if (mod.type === 'buff' || mod.type === 'debuff') {
          const bucket = accumulatedBuffDebuffMods[mod.type]
          const existing = bucket[mod.targetName] ?? { stackChange: 0 }
          bucket[mod.targetName] = { stackChange: existing.stackChange + (mod.stackChange ?? 0) * hitCount }
        }
      }
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
  for (const type of ['buff', 'debuff'] as const) {
    const bucket = accumulatedBuffDebuffMods[type]
    if (!Object.keys(bucket).length) continue
    ctx.modifiersInAction = ctx.modifiersInAction
      .map(mia => {
        if (mia.modifier.type !== type) return mia
        const changes = bucket[mia.modifier.displayName]
        if (!changes || changes.stackChange === 0) return mia
        const maxStacks = mia.modifier.stackingStrategy?.maxStacks
        const unclampedStacks = mia.currentStacks + changes.stackChange
        const clampedStacks = maxStacks != null
          ? Math.min(Math.max(unclampedStacks, 0), maxStacks)
          : Math.max(unclampedStacks, 0)
        const effectiveDelta = clampedStacks - mia.currentStacks

        // Mirror helpModifierStatusModifications: reset timers when stacks are added and resetTimerOnApplication is set
        const isAddingStacks = effectiveDelta > 0
        const shouldResetTimer = isAddingStacks && mia.modifier.stackingStrategy?.resetTimerOnApplication
        const limited = shouldResetTimer && mia.modifier.durationStrategy?.type === 'limited' ? mia.modifier.durationStrategy : null
        const newTimeLeft = shouldResetTimer ? (limited?.timeDuration ?? Infinity) : mia.timeLeft
        const newSwapsLeft = shouldResetTimer ? (limited?.numberOfSwaps ?? Infinity) : mia.swapsLeft

        return { ...mia, currentStacks: clampedStacks, timeLeft: newTimeLeft, swapsLeft: newSwapsLeft }
      })
      .filter(mia => mia.currentStacks > 0)
  }
}

// ========== Snapshot State ==================================================================================================

// ========== Key Utilities ===================================================================================================

export { makeCoordinatedAttackKey, parseCoordinatedAttackKey } from '../coordinatedAttackKey'

// ========== Snapshot State ==================================================================================================

/**
 * Writes the current active/inactive state and remaining duration of all tracked
 * coordinated attacks into the snapshot so it can be displayed in the rotation table.
 */
export function updateCoordinatedAttackSnapshot(ctx: StepContext): void {
  const coordAttacks: Record<string, number> = {}
  const coordAttacksTimeLeft: Record<string, number> = {}
  const coordAttacksSwapRequired: Record<string, boolean> = {}

  for (const caia of ctx.coordinatedAttacksInAction) {
    const key = makeCoordinatedAttackKey(caia.ownerCharacter, caia.coordinatedAttack.name)
    coordAttacks[key] = caia.applicationTime !== -1 ? 1 : 0
    coordAttacksTimeLeft[key] = caia.timeLeft
    coordAttacksSwapRequired[key] = caia.coordinatedAttack.swapRequired ?? false
  }

  ctx.current.coordinatedAttacks = coordAttacks
  ctx.current.coordinatedAttacksTimeLeft = coordAttacksTimeLeft
  ctx.current.coordinatedAttacksSwapRequired = coordAttacksSwapRequired
}
