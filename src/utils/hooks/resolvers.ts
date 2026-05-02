import type { StepContext } from '../../types/stepContext'
import type { CharacterStats, EnemyStats } from '../../types/stats'
import type { ModifierInAction } from '../../types/modifiers'
import type { DamageEvent } from '../../types/events'
import type { Snapshot } from '../../types/snapshot'
import type { Action } from '../../types/action'
import type { ResolvedCharacter } from '../../types/character'
import type { Enemy } from '../../types/enemy'
import type { NegativeStatusInAction } from '../../types/negativeStatus'
import type { CoordinatedAttackInAction } from '../../types/coordinatedAttack'
import { calculateDamage, evaluateDamageWithGroups, mergeStats } from '../../utils/calculators/damageCalculator'
import { activateCoordinatedAttacks, processCoordinatedAttacks, updateCoordinatedAttackSnapshot } from './coordinatedAttackHelpers'
import { getNegativeStatusStacks, processNegativeStatusStacks, updateNegativeStatusStacks } from './negativeStatusHelpers'
import { getCharacterEnergyState, updateEnergyValue } from './energyHelpers'
import { getDefaultFormName } from './formHelpers'
import { updateModifiersForSwap, collectAllModifiers, activateModifiers, filterApplicableModifiers, applyStackMultiplier, updateModifiersForTime } from './modifierHelpers'
import { updateModifierStacks } from './modifierStateHelpers'
import { updateAllCharactersCooldowns, setActionOnCooldown, reduceCooldown, getActionCooldownKey } from './cooldownHelpers'
import type { SideEffect } from '../../types/sideEffect'

// ========== Resolver 0: Build Step Context ==================================================================================

export function buildStepContext(snapshotId: number, current: Snapshot, prev: Snapshot, character: ResolvedCharacter, action: Action, enemy: Enemy, negativeStatusesInAction: NegativeStatusInAction[], modifiersInAction: ModifierInAction[], characterMap: Record<string, ResolvedCharacter>, coordinatedAttacksInAction: CoordinatedAttackInAction[] = []): StepContext {
  const fromTime = prev.toTime
  const toTime = fromTime + action.castTime
  current.action = action.name
  current.resolvedDisplayName = action.displayName

  const allies = []
  for (const [name, char] of Object.entries(characterMap)) {
    if (name !== character.name) {
      allies.push(char)
    }
  }

  // Determine if this is a swap: character changed from prev to current
  // Intro actions are swap-triggered, so we include them
  const isSwap = prev.character && prev.character !== character.name
  const lastSwappedToCharacter = isSwap ? character.name : undefined

  // Handle swap-based modifier expiration
  let updatedModifiersInAction = modifiersInAction
  if (isSwap && lastSwappedToCharacter) {
    updatedModifiersInAction = updateModifiersForSwap(modifiersInAction, lastSwappedToCharacter)
  }

  const ctx: StepContext = {
    snapshotId,

    current,
    prev,

    character,
    allies,
    enemy,

    action,

    fromTime,
    toTime,

    modifiersInAction: updatedModifiersInAction,
    negativeStatusesInAction,
    coordinatedAttacksInAction,

    permanentModifiers: [],
    damageModifiers: [],
    aggregatedCharacterModifiers: {},
    aggregatedEnemyModifiers: {},

    damageEvents: [],

    lastSwappedToCharacter,

    pendingEnergyCooldowns: [],

    logs: [],
  }

  ctx.logs.push({
    resolver: 'buildStepContext',
    message: `Context built for snapshot ${snapshotId}`,
    details: { character: character.name, action: action.name, isSwap },
  })

  return ctx
}

// ========== Resolver 1: Time ================================================================================================

export function resolveTime(ctx: StepContext): void {
  if (ctx.fromTime == null || ctx.toTime == null || ctx.fromTime > ctx.toTime || ctx.snapshotId !== Number(ctx.current.id)) {
    throw Error(`Resolver: resolveTime failed for snapshot ${ctx.current.id} with snapshotId=${ctx.snapshotId}, fromTime=${ctx.fromTime}, toTime=${ctx.toTime}`)
  }

  ctx.current.fromTime = ctx.prev.toTime
  ctx.current.toTime = ctx.prev.toTime + ctx.action.castTime

  ctx.logs.push({
    resolver: 'resolveTime',
    message: `Snapshot with id: ${ctx.snapshotId}: from ${ctx.current.fromTime}s to ${ctx.current.toTime}s`,
    details: { action: ctx.action.name },
  })
}

// ========== Resolver 2: Damage Modifiers ====================================================================================

export function resolveDamageModifiers(ctx: StepContext) {
  const characterModifiers = initializeEmptyCharacterStats()
  const enemyModifiers = initializeEmptyEnemyStats()

  // Step 1: Collect all modifier blueprints from various sources
  const allModifiers = collectAllModifiers(ctx.character, ctx.action, ctx.negativeStatusesInAction, ctx.allies)

  // Step 2: Activate new modifiers (convert limited ones to ModifierInAction, handle stacking)
  // Pass the cast duration as an offset so that limited modifier timers start from end-of-cast (ctx.toTime)
  // rather than start-of-cast (ctx.fromTime). resolveModifierState will subtract this same duration,
  // so the net effect is that timeLeft equals timeDuration at the moment the action finishes casting.
  const castTimeOffset = ctx.toTime - ctx.fromTime
  ctx.modifiersInAction = activateModifiers(allModifiers, ctx.modifiersInAction, ctx, castTimeOffset)

  // Step 3: Filter modifiers that apply to current context
  // This includes both permanent modifiers and active limited modifiers
  const permanentModifiers = allModifiers.filter(mod => !mod.durationStrategy || mod.durationStrategy.type === 'permanent')
  ctx.permanentModifiers = permanentModifiers // Store for later use in resolveModifierState
  const applicableModifiers = filterApplicableModifiers(ctx.modifiersInAction, permanentModifiers, ctx)

  // Store all applicable modifiers in context for damage calculator to use
  ctx.damageModifiers = applicableModifiers

  // Step 4: Aggregate stats from applicable modifiers
  for (const modifier of applicableModifiers) {
    // Apply stack multiplier for limited modifiers
    const stackedModifier = modifier.durationStrategy && modifier.durationStrategy.type === 'limited' ? applyStackMultiplier(modifier, ctx.modifiersInAction) : modifier

    const conditionMultiplier = stackedModifier.condition ? stackedModifier.condition(ctx) : 1

    if (stackedModifier.characterStats) {
      for (const [key, value] of Object.entries(stackedModifier.characterStats)) {
        const statKey = key as keyof CharacterStats
        const modValue = (value as number) * conditionMultiplier

        characterModifiers[statKey] = aggregateStat(characterModifiers[statKey] as number | undefined, modValue, statKey) as any
      }
    }

    if (stackedModifier.enemyStats) {
      for (const [key, value] of Object.entries(stackedModifier.enemyStats)) {
        const statKey = key as keyof EnemyStats
        const modValue = (value as number) * conditionMultiplier

        enemyModifiers[statKey] = aggregateStat(enemyModifiers[statKey] as number | undefined, modValue, statKey) as any
      }
    }
  }

  ctx.aggregatedCharacterModifiers = characterModifiers
  ctx.aggregatedEnemyModifiers = enemyModifiers

  ctx.logs.push({
    resolver: 'resolveDamageModifiers',
    message: 'Final aggregated modifiers collected',
    details: {
      totalModifiers: allModifiers.length,
      applicableModifiers: applicableModifiers.length,
      activeModifiersInAction: ctx.modifiersInAction.length,
      characterModifiers: ctx.aggregatedCharacterModifiers,
      enemyModifiers: ctx.aggregatedEnemyModifiers,
    },
  })
}

// ========== Resolver 3: Damage ==============================================================================================

export function resolveDamage(ctx: StepContext): void {
  const action = ctx.action
  const name = ctx.character.name
  const baseStats = ctx.character.stats
  const damageModifiers = ctx.damageModifiers
  const modifierEnemyStats = ctx.aggregatedEnemyModifiers
  const enemy = ctx.enemy
  const snapshotId = ctx.snapshotId
  const prev = ctx.prev
  const current = ctx.current
  const toTime = ctx.toTime

  // Apply inherent modifiers — ephemeral conditional amplifiers on this action only.
  // Never dispatched into modifiersInAction; evaluated once here and discarded.
  let modifierCharacterStats = ctx.aggregatedCharacterModifiers
  if (action.inherentModifiers?.length) {
    const merged = { ...modifierCharacterStats }
    for (const im of action.inherentModifiers) {
      const scale = im.condition(ctx)
      if (scale !== 0 && im.characterStats) {
        for (const key in im.characterStats) {
          const statKey = key as keyof CharacterStats
          const value = (im.characterStats[statKey] as number) * scale
          merged[statKey] = aggregateStat(merged[statKey] as number | undefined, value, statKey) as any
        }
      }
    }
    modifierCharacterStats = merged
  }

  const { average, damageEvent } = calculateDamage({ action, name, stats: baseStats, damageModifiers, modifierCharacterStats, modifierEnemyStats, enemy, snapshotId, timeStamp: ctx.fromTime, ctx })

  // Compute inherent modifier contributions: "damage without modifier i" using pre-inherent baseline
  if (action.inherentModifiers?.length) {
    for (const im of action.inherentModifiers) {
      const scale = im.condition(ctx)
      if (scale === 0) continue

      // Rebuild charStats = aggregatedCharacterModifiers + all OTHER inherent mods
      const charWithout: Partial<CharacterStats> = { ...ctx.aggregatedCharacterModifiers }
      for (const other of action.inherentModifiers) {
        if (other === im) continue
        const otherScale = other.condition(ctx)
        if (otherScale !== 0 && other.characterStats) {
          for (const key in other.characterStats) {
            const statKey = key as keyof CharacterStats
            const value = (other.characterStats[statKey] as number) * otherScale
            charWithout[statKey] = aggregateStat(charWithout[statKey] as number | undefined, value, statKey) as any
          }
        }
      }

      // Rebuild enemyStats = aggregatedEnemyModifiers + all OTHER inherent mods
      const enemyWithout: Partial<EnemyStats> = { ...ctx.aggregatedEnemyModifiers }
      for (const other of action.inherentModifiers) {
        if (other === im) continue
        const otherScale = other.condition(ctx)
        if (otherScale !== 0 && other.enemyStats) {
          for (const key in other.enemyStats) {
            const statKey = key as keyof EnemyStats
            const value = (other.enemyStats[statKey] as number) * otherScale
            enemyWithout[statKey] = aggregateStat(enemyWithout[statKey] as number | undefined, value, statKey) as any
          }
        }
      }

      const { damageEvent: withoutEvent } = calculateDamage({ action, name, stats: baseStats, damageModifiers, modifierCharacterStats: charWithout, modifierEnemyStats: enemyWithout, enemy, snapshotId, timeStamp: ctx.fromTime, skipContributions: true })

      const safePercent = (withVal: number, withoutVal: number) => (!withoutVal ? 0 : (withVal / withoutVal - 1) * 100)

      const contribKey = `inherent_${im.displayName}`
      damageEvent.contributions[contribKey] = {
        source: contribKey,
        displayName: im.displayName,
        isInherent: true,
        normal_damage_contributed: Math.max(0, damageEvent.normalStrike - withoutEvent.normalStrike),
        normal_percent_damage_contributed: safePercent(damageEvent.normalStrike, withoutEvent.normalStrike),
        crit_damage_contributed: Math.max(0, damageEvent.criticalStrike - withoutEvent.criticalStrike),
        crit_percent_damage_contributed: safePercent(damageEvent.criticalStrike, withoutEvent.criticalStrike),
        average_damage_contributed: Math.max(0, damageEvent.average - withoutEvent.average),
        average_percent_damage_contributed: safePercent(damageEvent.average, withoutEvent.average),
      }
    }
  }

  // Attach a re-evaluation closure so DataOverlay can recompute damage with a subset of active buffs
  const _calcFinalStats = mergeStats(baseStats, modifierCharacterStats)
  _calcFinalStats.critRate = Math.min(_calcFinalStats.critRate, 1.0)
  damageEvent.calcParams = {
    reEvaluate: (activeGroupKeys) => evaluateDamageWithGroups(
      { action, characterName: name, baseStats, damageModifiers, enemy, ctx },
      snapshotId, ctx.fromTime, activeGroupKeys,
    ),
    finalCharacterStats: _calcFinalStats,
  }
  ctx.damageEvents.push(damageEvent)

  const cumulativeDamage = prev.damage + average
  const dps = toTime > 0 ? cumulativeDamage / toTime : 0

  current.damage = cumulativeDamage
  current.dps = dps

  ctx.logs.push({
    resolver: 'resolveDamage',
    message: `Damage resolved for snapshot ${snapshotId}: +${average} dmg, cumulative ${cumulativeDamage}`,
    details: { damageEvent },
  })
}

// ========== Resolver 4: Side Effects And Statuses ===========================================================================

export function resolveSideEffectsAndStatuses(ctx: StepContext): void {
  // Aggregate all status modifications from both action and side effects
  const statusModifications = aggregateStatusModifications(ctx)

  // Side Effects Damage
  helpSideEffectsDamage(ctx)

  // Negative Statuses
  helpNegativeStatuses(ctx, statusModifications)

  // Buff/Debuff modifier stack modifications (e.g. an action forcefully ending a buff)
  helpModifierStatusModifications(ctx, statusModifications)

  // Tick periodic heal procs from active heal-proc modifiers (e.g. Syntony Field)
  helpHealProcModifiers(ctx)
}

function aggregateStatusModifications(ctx: StepContext) {
  const aggregated = {
    buff: {} as Record<string, { stackChange: number; durationChange: number; refreshDuration: boolean }>,
    debuff: {} as Record<string, { stackChange: number; durationChange: number; refreshDuration: boolean }>,
    negativeStatus: {} as Record<string, { stackChange: number; durationChange: number; refreshDuration: boolean }>,
  }

  // Collect from action's statusModifications
  if (ctx.action.statusModifications) {
    for (const modification of ctx.action.statusModifications) {
      aggregateModification(aggregated, modification)
    }
  }

  // Collect from all side effects' statusModifications
  const sideEffects = ctx.action.sideEffects
  if (sideEffects && sideEffects.length > 0) {
    for (const sideEffect of sideEffects) {
      if (sideEffect.statusModifications) {
        for (const modification of sideEffect.statusModifications) {
          aggregateModification(aggregated, modification)
        }
      }
    }
  }

  ctx.logs.push({
    resolver: 'aggregateStatusModifications',
    message: 'Status modifications aggregated from action and side effects',
    details: { statusModifications: aggregated },
  })

  return aggregated
}

function aggregateModification(
  aggregated: {
    buff: Record<string, { stackChange: number; durationChange: number; refreshDuration: boolean }>
    debuff: Record<string, { stackChange: number; durationChange: number; refreshDuration: boolean }>
    negativeStatus: Record<string, { stackChange: number; durationChange: number; refreshDuration: boolean }>
  },
  modification: {
    type: 'buff' | 'debuff' | 'negativeStatus'
    targetName: string
    stackChange?: number
    durationChange?: number
    refreshDuration?: boolean
  },
) {
  const { type, targetName, stackChange = 0, durationChange = 0, refreshDuration = false } = modification
  const container = aggregated[type]

  const entry = (container[targetName] ??= {
    stackChange: 0,
    durationChange: 0,
    refreshDuration: false,
  })

  entry.stackChange += stackChange
  entry.durationChange += durationChange
  entry.refreshDuration ||= refreshDuration
}

function helpModifierStatusModifications(ctx: StepContext, statusModifications: ReturnType<typeof aggregateStatusModifications>): void {
  const types = ['buff', 'debuff'] as const
  const anyChanges = types.some(t => Object.keys(statusModifications[t]).length > 0)
  if (!anyChanges) return

  const applied: { type: string; targetName: string; requestedStackChange: number; effectiveDelta: number; stacksBefore: number; stacksAfter: number }[] = []

  const modifiersBefore = ctx.modifiersInAction

  ctx.modifiersInAction = ctx.modifiersInAction
    .map(mia => {
      const bucket = statusModifications[mia.modifier.type as 'buff' | 'debuff']
      if (!bucket) return mia
      const changes = bucket[mia.modifier.displayName]
      if (!changes) return mia
      // Duration-related modifications are not currently supported for buffs/debuffs.
      // Log and ignore them explicitly to avoid silent no-ops.
      if (changes.durationChange !== 0 || changes.refreshDuration) {
        ctx.logs.push({
          resolver: 'helpModifierStatusModifications',
          message: 'Duration modifications for buffs/debuffs are not supported and will be ignored.',
          details: {
            type: mia.modifier.type,
            targetName: mia.modifier.displayName,
            durationChange: changes.durationChange,
            refreshDuration: changes.refreshDuration,
          },
        })
      }
      if (changes.stackChange === 0) return mia
      const maxStacks = mia.modifier.stackingStrategy?.maxStacks
      const unclampedStacks = mia.currentStacks + changes.stackChange
      const clampedStacks = maxStacks != null ? Math.min(Math.max(unclampedStacks, 0), maxStacks) : Math.max(unclampedStacks, 0)
      const effectiveDelta = clampedStacks - mia.currentStacks

      // When stacks are added, mirror activateModifiers: reset timers if resetTimerOnApplication is set
      const isAddingStacks = effectiveDelta > 0
      const shouldResetTimer = isAddingStacks && mia.modifier.stackingStrategy?.resetTimerOnApplication
      const limited = shouldResetTimer && mia.modifier.durationStrategy?.type === 'limited' ? mia.modifier.durationStrategy : null
      const newTimeLeft = shouldResetTimer ? (limited?.timeDuration ?? Infinity) : mia.timeLeft
      const newSwapsLeft = shouldResetTimer ? (limited?.numberOfSwaps ?? Infinity) : mia.swapsLeft

      applied.push({ type: mia.modifier.type, targetName: mia.modifier.displayName, requestedStackChange: changes.stackChange, effectiveDelta, stacksBefore: mia.currentStacks, stacksAfter: clampedStacks })
      return { ...mia, currentStacks: clampedStacks, timeLeft: newTimeLeft, swapsLeft: newSwapsLeft }
    })
    .filter(mia => mia.currentStacks > 0)

  // Clear forteGrants for any modifier with clearsForteGrantsOnExpiry that was explicitly removed
  for (const mia of modifiersBefore) {
    if (!mia.modifier.clearsForteGrantsOnExpiry || !mia.modifier.ownerCharacter) continue
    const stillExists = ctx.modifiersInAction.some(m => m.modifier.source === mia.modifier.source)
    if (!stillExists) {
      if (!ctx.current.charactersForteGrants) ctx.current.charactersForteGrants = {}
      ctx.current.charactersForteGrants[mia.modifier.ownerCharacter] = []
    }
  }

  if (applied.length > 0) {
    ctx.logs.push({
      resolver: 'helpModifierStatusModifications',
      message: 'Buff/debuff stack modifications applied',
      details: { applied },
    })
  }
}

function helpSideEffectsDamage(ctx: StepContext): void {
  const sideEffects = ctx.action.sideEffects ?? []

  // Collect character-level action triggers whose required tags all match and condition passes.
  // Each trigger may fire more than once if fireCount is specified (e.g. once per application event).
  const triggeredSideEffects: SideEffect[] = (ctx.character.actionTriggers ?? [])
    .filter(trigger =>
      trigger.requiredTags.every(tag => ctx.action.tags?.includes(tag)) &&
      (!trigger.condition || trigger.condition(ctx))
    )
    .flatMap(trigger => {
      const count = trigger.fireCount ? trigger.fireCount(ctx) : 1
      return Array.from({ length: count }, () => trigger.sideEffect)
    })

  // Collect team-wide triggers from all characters (active + allies).
  // Each fires with an owner-substituted context so ctx.character = trigger owner,
  // ensuring correct dealer attribution and owner stats regardless of who is active.
  type TeamFiring = { sideEffect: SideEffect; ownerCtx: StepContext }
  const teamFirings: TeamFiring[] = []
  for (const teamChar of [ctx.character, ...ctx.allies]) {
    if (!teamChar.teamActionTriggers?.length) continue
    const ownerCtx: StepContext = teamChar.name === ctx.character.name ? ctx : { ...ctx, character: teamChar }
    for (const trigger of teamChar.teamActionTriggers) {
      if (!trigger.requiredTags.every(tag => ctx.action.tags?.includes(tag))) continue
      if (trigger.condition && !trigger.condition(ownerCtx)) continue
      const count = trigger.fireCount ? trigger.fireCount(ownerCtx) : 1
      for (let i = 0; i < count; i++) {
        teamFirings.push({ sideEffect: trigger.sideEffect, ownerCtx })
      }
    }
  }

  if (sideEffects.length === 0 && triggeredSideEffects.length === 0 && teamFirings.length === 0) return

  let totalSideEffectDamage = 0
  const damageEvents: DamageEvent[] = []

  for (const sideEffect of [...sideEffects, ...triggeredSideEffects]) {
    const damageEvent = sideEffect.damageDealt(ctx, sideEffect.name, ctx.fromTime)
    if (damageEvent.average > 0) {
      damageEvents.push(damageEvent)
      totalSideEffectDamage += damageEvent.average
    }
  }

  for (const { sideEffect, ownerCtx } of teamFirings) {
    const damageEvent = sideEffect.damageDealt(ownerCtx, sideEffect.name, ctx.fromTime)
    if (damageEvent.average > 0) {
      damageEvents.push(damageEvent)
      totalSideEffectDamage += damageEvent.average
    }
  }

  ctx.damageEvents.push(...damageEvents)
  ctx.current.damage += totalSideEffectDamage

  ctx.logs.push({
    resolver: 'resolveSideEffectsDamage',
    message: `Side effects damage resolved: +${totalSideEffectDamage} dmg`,
    details: { sideEffectsCount: sideEffects.length + triggeredSideEffects.length + teamFirings.length, totalDamage: totalSideEffectDamage, damageEvents },
  })
}

export function helpNegativeStatuses(ctx: StepContext, statusModifications: any): void {
  const prev = ctx.prev
  const current = ctx.current
  const negativeStatusesInAction = ctx.negativeStatusesInAction
  const fromTime = ctx.fromTime
  const toTime = ctx.toTime
  const enemy = ctx.enemy
  const action = ctx.action

  const stacksPrev = getNegativeStatusStacks(prev)
  const { damageEvents, stacksCurr } = processNegativeStatusStacks(negativeStatusesInAction, fromTime, toTime, stacksPrev, enemy, ctx.character.stats, ctx.aggregatedCharacterModifiers, ctx.aggregatedEnemyModifiers, ctx.damageModifiers, ctx.snapshotId, ctx)
  updateNegativeStatusStacks(current, stacksCurr, action, negativeStatusesInAction, statusModifications.negativeStatus, ctx)

  // Collect all damage events and filter out zero-damage events
  const allDamageEvents = Object.values(damageEvents)
    .flat()
    .filter(event => event.average > 0)
  ctx.damageEvents.push(...allDamageEvents)

  // Calculate total damage from all events
  const totalDmgNegativeStatuses = allDamageEvents.reduce((sum, event) => sum + event.average, 0)
  current.damage += totalDmgNegativeStatuses

  ctx.logs.push({
    resolver: 'resolveNegativeStatuses',
    message: `Negative statuses resolved: +${totalDmgNegativeStatuses} dmg`,
    details: { damageEventsCount: allDamageEvents.length, totalDamage: totalDmgNegativeStatuses, damageEvents: allDamageEvents },
  })
}

// ========== Resolver 4.5: Coordinated Attacks ===============================================================================

/**
 * Ticks periodic heal procs from active heal-proc modifiers (e.g. Syntony Field).
 *
 * For each ModifierInAction that carries `healProc`:
 *  - Computes how many ticks fall in [lastHealProcTime + frequency, toTime].
 *  - For each tick: calls activateModifiers on healProc.procModifiers so gear-injected
 *    buffs (e.g. Starfield Calibrator crit DMG) are activated or refreshed.
 *  - Updates lastHealProcTime on the live MIA entry.
 *
 * Runs after helpModifierStatusModifications so that any modifier removed this step
 * (e.g. Liberation destroying Syntony Field) does not fire a final proc.
 */
function helpHealProcModifiers(ctx: StepContext): void {
  // Snapshot to avoid processing procs activated within this same step
  const snapshot = [...ctx.modifiersInAction]
  for (const mia of snapshot) {
    const { healProc } = mia.modifier
    if (!healProc || healProc.procModifiers.length === 0) continue

    const lastProcTimeBase = mia.lastHealProcTime ?? (mia.applicationTime - healProc.frequency)
    if (lastProcTimeBase + healProc.frequency > ctx.toTime) continue

    let lastProcTime = lastProcTimeBase
    while (lastProcTime + healProc.frequency <= ctx.toTime) {
      lastProcTime += healProc.frequency
      ctx.modifiersInAction = activateModifiers(healProc.procModifiers, ctx.modifiersInAction, ctx)
    }

    // activateModifiers sets each proc-modifier's timeLeft = timeDuration measured from ctx.fromTime,
    // but the tick actually fires at lastProcTime (which may be > ctx.fromTime for long steps).
    // resolveModifierState will later subtract (toTime - fromTime) from timeLeft, so we pre-compensate
    // by adding (lastProcTime - fromTime) here, making the effective duration start from lastProcTime.
    const tickOffset = lastProcTime - ctx.fromTime
    if (tickOffset > 0) {
      for (const procMod of healProc.procModifiers) {
        if (!procMod.durationStrategy || procMod.durationStrategy.type === 'permanent') continue
        const procIdx = ctx.modifiersInAction.findIndex(
          m => m.modifier.source === procMod.source && m.modifier.displayName === procMod.displayName,
        )
        if (procIdx !== -1 && ctx.modifiersInAction[procIdx].timeLeft !== Infinity) {
          ctx.modifiersInAction[procIdx] = {
            ...ctx.modifiersInAction[procIdx],
            timeLeft: ctx.modifiersInAction[procIdx].timeLeft + tickOffset,
          }
        }
      }
    }

    // Update lastHealProcTime on the live entry (activateModifiers may have replaced the object)
    const liveIndex = ctx.modifiersInAction.findIndex(
      m => m.modifier.source === mia.modifier.source && m.modifier.displayName === mia.modifier.displayName,
    )
    if (liveIndex !== -1) {
      ctx.modifiersInAction[liveIndex] = { ...ctx.modifiersInAction[liveIndex], lastHealProcTime: lastProcTime }
    }
  }
}

/**
 * Ticks all active coordinated attacks for the current step window [fromTime, toTime].
 *
 * Runs after resolveSideEffectsAndStatuses so that ctx.damageModifiers and
 * ctx.aggregatedCharacterModifiers are already populated. Runs before resolveResources so
 * that per-hit energy is stacked on top of the main action energy.
 */
export function resolveCoordinatedAttacks(ctx: StepContext): void {
  activateCoordinatedAttacks(ctx)
  processCoordinatedAttacks(ctx)
  updateCoordinatedAttackSnapshot(ctx)

  ctx.logs.push({
    resolver: 'resolveCoordinatedAttacks',
    message: `Coordinated attacks processed: ${ctx.coordinatedAttacksInAction.filter(a => a.applicationTime !== -1).length} active`,
    details: {
      active: ctx.coordinatedAttacksInAction.filter(a => a.applicationTime !== -1).map(a => ({ name: a.coordinatedAttack.name, owner: a.ownerCharacter, timeLeft: a.timeLeft })),
    },
  })
}

// ========== Resolver 5: Update Modifier State ===============================================================================

export function resolveModifierState(ctx: StepContext): void {
  // Capture active modifiers before time update to detect expiries
  const modifiersBefore = ctx.modifiersInAction

  // Update time-based modifiers
  ctx.modifiersInAction = updateModifiersForTime(ctx.modifiersInAction, ctx.fromTime, ctx.toTime)

  // Clear forteGrants for any modifier with clearsForteGrantsOnExpiry that just expired
  for (const mia of modifiersBefore) {
    if (!mia.modifier.clearsForteGrantsOnExpiry || !mia.modifier.ownerCharacter) continue
    const stillExists = ctx.modifiersInAction.some(m => m.modifier.source === mia.modifier.source)
    if (!stillExists) {
      if (!ctx.current.charactersForteGrants) ctx.current.charactersForteGrants = {}
      ctx.current.charactersForteGrants[mia.modifier.ownerCharacter] = []
    }
  }

  // Store modifier state in snapshot (includes both limited and permanent modifiers)
  updateModifierStacks(ctx.current, ctx.modifiersInAction, ctx.permanentModifiers, ctx)

  ctx.logs.push({
    resolver: 'resolveModifierState',
    message: 'Modifier state updated for time passage',
    details: {
      activeModifiers: ctx.modifiersInAction.length,
      permanentModifiers: ctx.permanentModifiers.length,
      modifiers: ctx.modifiersInAction.map(mia => ({
        name: mia.modifier.displayName,
        stacks: mia.currentStacks,
        timeLeft: mia.timeLeft === Infinity ? 'permanent' : `${mia.timeLeft}s`,
        swapsLeft: mia.swapsLeft === Infinity ? 'permanent' : mia.swapsLeft,
      })),
    },
  })
}

// ========== Resolver: Resource Milestones ===================================================================================

/**
 * After resources are resolved, checks each ResourceMilestoneDef on the active character.
 * For each definition, counts how many thresholds the resource crossed this step (prev < threshold ≤ curr)
 * and adds that many stacks to the corresponding modifier in modifiersInAction.
 *
 * Rules encoded per-definition on the character:
 *   - Timer starts on the first stack; resetTimerOnApplication on the modifier controls reset behaviour.
 *   - All stacks expire together via stacksRemovedEachTime on the modifier.
 *   - Explicit removal (e.g. on Liberation) is handled by statusModifications on the relevant action.
 */
export function resolveResourceMilestones(ctx: StepContext): void {
  const milestonesDefs = ctx.character.resourceMilestones
  if (!milestonesDefs || milestonesDefs.length === 0) return

  for (const { resourceType, milestones, modifier } of milestonesDefs) {
    const charName = ctx.character.name
    const prevValue = ctx.prev.charactersEnergies?.[charName]?.[resourceType] ?? 0
    const currValue = ctx.current.charactersEnergies?.[charName]?.[resourceType] ?? 0

    const count = milestones.filter(m => prevValue < m && currValue >= m).length
    if (count === 0) continue

    const existingIndex = ctx.modifiersInAction.findIndex(mia => mia.modifier.source === modifier.source)
    if (existingIndex !== -1) {
      const existing = ctx.modifiersInAction[existingIndex]
      const updated = [...ctx.modifiersInAction]
      updated[existingIndex] = {
        ...existing,
        currentStacks: Math.min(existing.currentStacks + count, modifier.stackingStrategy.maxStacks),
      }
      ctx.modifiersInAction = updated
    } else {
      const limited = modifier.durationStrategy.type === 'limited' ? modifier.durationStrategy : null
      ctx.modifiersInAction = [
        ...ctx.modifiersInAction,
        {
          modifier,
          applicationTime: ctx.fromTime,
          timeLeft: limited?.timeDuration ?? Infinity,
          swapsLeft: limited?.numberOfSwaps ?? Infinity,
          currentStacks: Math.min(count, modifier.stackingStrategy.maxStacks),
          targetCharacter: null,
        },
      ]
    }

    const finalStacks = ctx.modifiersInAction.find(mia => mia.modifier.source === modifier.source)?.currentStacks ?? 0
    ctx.logs.push({
      resolver: 'resolveResourceMilestones',
      message: `[${charName}] ${resourceType} milestone(s) crossed: +${count} stack(s) of '${modifier.displayName}', total: ${finalStacks}`,
      details: { resourceType, prevValue, currValue, count, finalStacks },
    })
  }
}

// ========== Resolver 7: Resources ===========================================================================================

export function resolveResources(ctx: StepContext): void {
  const current = ctx.current
  const character = ctx.character
  const action = ctx.action
  const allies = ctx.allies

  const energiesCurr = getCharacterEnergyState(current, current.character!)
  const maxEnergies = character.maxEnergies

  // Subtract Energy Cost
  for (const cost of action.energyCost) {
    const key = cost.energyType
    const maxValue = maxEnergies?.[key] ?? Infinity
    const prevValue = energiesCurr![key] ?? 0

    energiesCurr![key] = updateEnergyValue(prevValue, -cost.amount, maxValue)

    // If this cost specifies grants and the energy was non-zero, add them to forteGrants
    if (cost.grantsOnConsume && cost.grantsOnConsume.length > 0 && prevValue > 0) {
      const charName = character.name
      if (!current.charactersForteGrants) current.charactersForteGrants = {}
      const existing = current.charactersForteGrants[charName] ?? []
      const newGrants = cost.grantsOnConsume.filter(g => !existing.includes(g))
      if (newGrants.length > 0) {
        current.charactersForteGrants[charName] = [...existing, ...newGrants]
      }
    }
  }

  // Update Character Energy
  for (const generated of action.energyGenerated) {
    // Skip entries that are gated behind a cooldown that hasn't expired yet
    if (generated.cooldownKey) {
      const charName = character.name
      const cooldownRemaining = ctx.prev.charactersCooldowns?.[charName]?.[generated.cooldownKey] ?? 0
      if (cooldownRemaining > 0) continue
      ctx.pendingEnergyCooldowns.push({ charName, cooldownKey: generated.cooldownKey, cooldownDuration: generated.cooldownDuration! })
    }

    const key = generated.energyType
    const maxValue = maxEnergies?.[key] ?? Infinity
    let amount = generated.amount

    if (amount > 0 && generated.scalingStat) {
      const scaling = character.stats?.[generated.scalingStat] ?? 1
      amount *= scaling
    }

    const prevValue = energiesCurr![key] ?? 0
    energiesCurr![key] = updateEnergyValue(prevValue, amount, maxValue)
  }

  // Update Allies Energy
  for (const ally of allies) {
    const allyEnergies = getCharacterEnergyState(current, ally.name)
    const allyMax = ally.maxEnergies

    for (const generated of action.energyGenerated) {
      if (generated.share <= 0) continue
      if (!(generated.energyType in allyMax)) continue

      let allyAmount = generated.amount * generated.share
      if (allyAmount > 0 && generated.scalingStat) {
        const scaling = ally.stats?.[generated.scalingStat] ?? 1
        allyAmount *= scaling
      }

      const prevValue = allyEnergies![generated.energyType] ?? 0
      const maxValue = allyMax[generated.energyType] ?? Infinity
      allyEnergies![generated.energyType] = updateEnergyValue(prevValue, allyAmount, maxValue)
    }
  }

  // Drain concerto to 0 when any OUTRO action is cast (concerto is the universal trigger cost)
  if ((action.dmgTypes as string[]).includes('OUTRO') && energiesCurr?.concerto !== undefined) {
    energiesCurr.concerto = 0
  }
}

// ========== Resolver 6: Cooldowns ===========================================================================================

export function resolveCooldowns(ctx: StepContext): void {
  const current = ctx.current
  const character = ctx.character
  const action = ctx.action
  const allies = ctx.allies
  const elapsedTime = ctx.toTime - ctx.fromTime

  // Update all characters' cooldowns for the elapsed time
  const allCharacters = [character, ...allies]
  current.charactersCooldowns = updateAllCharactersCooldowns(ctx.prev, allCharacters, elapsedTime)

  // Carry forward stacks data from previous snapshot
  current.charactersActionStacksConfig = {}
  current.charactersActionStacks = {}
  for (const char of allCharacters) {
    const prevConfig = ctx.prev.charactersActionStacksConfig?.[char.name]
    if (prevConfig) {
      current.charactersActionStacksConfig[char.name] = { ...prevConfig }
    }
    const prevStacks = ctx.prev.charactersActionStacks?.[char.name]
    if (prevStacks) {
      current.charactersActionStacks[char.name] = { ...prevStacks }
    }
  }

  // Regenerate stacks for any stacked actions whose timers expired this step
  for (const char of allCharacters) {
    const config = current.charactersActionStacksConfig?.[char.name]
    if (!config) continue
    for (const [key, stackConfig] of Object.entries(config)) {
      const wasOnCooldown = (ctx.prev.charactersCooldowns?.[char.name]?.[key] ?? 0) > 0
      const isNowOnCooldown = (current.charactersCooldowns[char.name]?.[key] ?? 0) > 0
      if (!wasOnCooldown || isNowOnCooldown) continue // Didn't expire this step

      const prevStackCount = ctx.prev.charactersActionStacks?.[char.name]?.[key] ?? stackConfig.max
      const newStackCount = Math.min(stackConfig.max, prevStackCount + 1)

      if (newStackCount >= stackConfig.max) {
        // Reached max stacks: stop the timer, remove tracking entry (absent = max)
        if (current.charactersActionStacks[char.name]) {
          delete current.charactersActionStacks[char.name][key]
        }
      } else {
        // Still below max: restart the timer and store the incremented count
        current.charactersCooldowns[char.name] ??= {}
        current.charactersCooldowns[char.name][key] = stackConfig.cooldown
        current.charactersActionStacks[char.name] ??= {}
        current.charactersActionStacks[char.name][key] = newStackCount
      }
    }
  }

  // If the cast action uses stacks: store its config and consume one stack
  if (action.maxStacks && action.maxStacks > 1) {
    const cooldownKey = getActionCooldownKey(action)
    const charName = character.name

    current.charactersActionStacksConfig[charName] ??= {}
    current.charactersActionStacksConfig[charName][cooldownKey] = {
      max: action.maxStacks,
      cooldown: action.cooldown,
    }

    // Read stacks from post-regeneration state (current may have been updated above)
    const stacksAfterRegen = current.charactersActionStacks?.[charName]?.[cooldownKey]
      ?? ctx.prev.charactersActionStacks?.[charName]?.[cooldownKey]
      ?? action.maxStacks // absent entry = at max stacks
    const newStackCount = Math.max(0, stacksAfterRegen - 1)

    current.charactersActionStacks[charName] ??= {}
    current.charactersActionStacks[charName][cooldownKey] = newStackCount
  }

  // Set the used action on cooldown
  current.charactersCooldowns[character.name] = setActionOnCooldown(current, character.name, action)

  // Apply cooldown reductions granted by this action
  if (action.cooldownReductions) {
    for (const reduction of action.cooldownReductions) {
      const amount = typeof reduction.amount === 'function' ? reduction.amount(ctx) : reduction.amount
      if (amount > 0) {
        current.charactersCooldowns[character.name] = reduceCooldown(current, character.name, reduction.targetActionKey, amount)
      }
    }
  }

  // Apply energy cooldowns queued by resolveResources (must run after updateAllCharactersCooldowns
  // so these entries are not overwritten by the rebuild from prev)
  for (const pending of ctx.pendingEnergyCooldowns) {
    current.charactersCooldowns[pending.charName] ??= {}
    current.charactersCooldowns[pending.charName][pending.cooldownKey] = pending.cooldownDuration
  }

  ctx.logs.push({
    resolver: 'resolveCooldowns',
    message: `Cooldowns updated: ${action.name} set on ${action.cooldown}s cooldown`,
    details: {
      elapsedTime,
      actionCooldown: action.cooldown,
      characterCooldowns: current.charactersCooldowns[character.name],
    },
  })
}

// ========== Resolver 7: Events ==============================================================================================

// ========== Resolver 8: Cast State ==========================================================================================

/**
 * Updates each character's resolved position, persistence window, and last-action tracking
 * after the current action completes.
 *
 * - charactersPositions: resolved to GROUND or AIR (PRESERVE/ANY keep the previous value)
 * - charactersPersistentUntil: absolute time until which the character persists on-field state
 *   after being swapped out (counted from fromTime, per the spec)
 * - charactersLastAction: the name of the last action this character cast; cleared for the
 *   active character if no persistenceTime is set AND the next step swaps away (handled by
 *   ActionSelect reading the persistence window rather than explicit clearing)
 */
export function resolveCastState(ctx: StepContext): void {
  const charName = ctx.character.name

  // Determine the new resolved position for the active character.
  // For swap-cancel variants, swapOutState overrides endState (it's the position the character
  // lands in after being swapped out mid-action). Falls back to endState for all other actions.
  // Position source priority:
  //   1. Swapping in while own persistence window is still active → use own stored position
  //      (character lingered on-field after a swap-cancel, their position was preserved)
  //   2. Swapping in normally → inherit the outgoing character's position
  //      (incoming character lands wherever the field currently is)
  //   3. Same character continuing → use own stored position
  const storedPosition = ctx.prev.charactersPositions?.[charName]
  const prevCharName = ctx.prev.character
  const isSwappingIn = !!prevCharName && prevCharName !== charName
  const persistentUntil = ctx.prev.charactersPersistentUntil?.[charName] ?? 0
  const isLingeringActive = isSwappingIn && persistentUntil > ctx.fromTime

  // Use this character's own stored position only while their persistence window is still
  // active (i.e. they lingered on-field after a swap-cancel). In all other cases inherit
  // from the outgoing character — the incoming character lands wherever the field currently is.
  const prevPosition: 'GROUND' | 'AIR' = isLingeringActive
    ? (storedPosition ?? 'GROUND')
    : isSwappingIn
      ? (ctx.prev.charactersPositions?.[prevCharName] ?? 'GROUND')
      : (storedPosition ?? 'GROUND')
  const rawEndState = ctx.action.castConditions.swapOutState ?? ctx.action.castConditions.endState
  const newPosition: 'GROUND' | 'AIR' = rawEndState === 'PRESERVE' || rawEndState === 'ANY' ? prevPosition : (rawEndState as 'GROUND' | 'AIR')

  ctx.current.charactersPositions = {
    ...(ctx.prev.charactersPositions ?? {}),
    [charName]: newPosition,
  }

  // Track how long this character persists with their current state after swapping out
  const persistenceTime = ctx.action.castConditions.persistenceTime ?? 0
  ctx.current.charactersPersistentUntil = {
    ...(ctx.prev.charactersPersistentUntil ?? {}),
    [charName]: persistenceTime > 0 ? ctx.fromTime + persistenceTime : 0,
  }

  // Record this action as the character's last personal action
  ctx.current.charactersLastAction = {
    ...(ctx.prev.charactersLastAction ?? {}),
    [charName]: ctx.action.name,
  }

  // Record the combo chain tags produced by this action
  ctx.current.charactersComboChainTags = {
    ...(ctx.prev.charactersComboChainTags ?? {}),
    [charName]: ctx.action.comboChainTags ?? [],
  }

  // Track whether this character must swap out after this action
  ctx.current.charactersRequiresSwapOut = {
    [charName]: ctx.action.castConditions.requiresSwapOut ?? false,
  }

  // Track follow-up actions for combo system
  // If this action has an attemptFollowUp, set it for the same character
  if (ctx.action.attemptFollowUp) {
    ctx.current.charactersAttemptFollowUp = {
      [charName]: {
        actionName: ctx.action.attemptFollowUp.actionName,
        // Default is false ("if possible") — must: true must be explicitly declared
        must: ctx.action.attemptFollowUp.must ?? false,
      },
    }
  } else {
    // Clear any previous follow-up for this character
    ctx.current.charactersAttemptFollowUp = {}
  }

  // Track restrictNextTo for combo system
  const restrictNextToValue = typeof ctx.action.restrictNextTo === 'function'
    ? ctx.action.restrictNextTo(ctx.prev, charName)
    : ctx.action.restrictNextTo
  if (restrictNextToValue?.length) {
    ctx.current.charactersRestrictNextTo = {
      [charName]: restrictNextToValue,
    }
  } else {
    ctx.current.charactersRestrictNextTo = {}
  }

  // Handle form changes if this action changes the character's form
  if (ctx.action.formChange) {
    ctx.current.charactersForms = {
      ...(ctx.prev.charactersForms ?? {}),
      [charName]: ctx.action.formChange,
    }
    ctx.logs.push({
      resolver: 'resolveCastState',
      message: `Form changed for ${charName}: ${ctx.prev.charactersForms?.[charName] || 'default'} → ${ctx.action.formChange}`,
      details: { formChange: ctx.action.formChange },
    })
  } else {
    // Preserve current form
    ctx.current.charactersForms = {
      ...(ctx.prev.charactersForms ?? {}),
    }
  }

  // Handle swap cooldown: when a different character takes over, the previous character
  // cannot be swapped back in for 1 second (measured from the start of the current action).
  const swapOccurred = !!prevCharName && prevCharName !== charName
  ctx.current.charactersSwapCooldownUntil = {
    ...(ctx.prev.charactersSwapCooldownUntil ?? {}),
    ...(swapOccurred ? { [prevCharName!]: ctx.fromTime + 1 } : {}),
  }

  // Track when each character goes off-field so off-field duration triggers can fire.
  // On swap: the leaving character records the absolute time they went off-field.
  // The arriving character is cleared to null (= currently on-field).
  // null means "on-field / no off-field tracking" — 0 is a valid timestamp (start of rotation).
  ctx.current.charactersOffFieldSince = {
    ...(ctx.prev.charactersOffFieldSince ?? {}),
    ...(swapOccurred ? { [prevCharName!]: ctx.fromTime, [charName]: null } : {}),
  }

  const swapCooldownUntil = swapOccurred && prevCharName ? ctx.current.charactersSwapCooldownUntil[prevCharName] : undefined

  // On swap-out: reset the leaving character's form to default and clear any form-specific energies
  if (swapOccurred && prevCharName) {
    const prevChar = ctx.allies.find(a => a.name === prevCharName)
    if (prevChar?.forms && prevChar.forms.length > 0) {
      const prevCurrentFormName = ctx.current.charactersForms?.[prevCharName] ?? ''
      const defaultFormName = getDefaultFormName(prevChar)

      // Reset energies specified by the form that was active at swap-out time
      const prevForm = prevChar.forms.find(f => f.name === prevCurrentFormName)
      if (prevForm?.resetEnergiesOnSwapOut && prevForm.resetEnergiesOnSwapOut.length > 0) {
        const prevEnergies = { ...(ctx.current.charactersEnergies?.[prevCharName] ?? {}) }
        for (const energyType of prevForm.resetEnergiesOnSwapOut) {
          prevEnergies[energyType] = 0
        }
        ctx.current.charactersEnergies = {
          ...(ctx.current.charactersEnergies ?? {}),
          [prevCharName]: prevEnergies,
        }
      }

      // Reset to default form if the form opts in
      if (prevForm?.resetFormOnSwapOut && prevCurrentFormName !== defaultFormName) {
        ctx.current.charactersForms = {
          ...ctx.current.charactersForms,
          [prevCharName]: defaultFormName,
        }
        ctx.logs.push({
          resolver: 'resolveCastState',
          message: `Form reset for ${prevCharName} on swap-out: ${prevCurrentFormName || 'default'} → ${defaultFormName}`,
          details: { prevForm: prevCurrentFormName, defaultForm: defaultFormName },
        })
      }
    }
  }

  // Handle combo windows: track actions that can start time-based combo chains
  // First, copy over existing combo windows and update their swap/form change flags
  ctx.current.charactersComboWindows = { ...(ctx.prev.charactersComboWindows ?? {}) }

  // Update swap flag for all characters that had an active combo window
  // Mark the outgoing character's combo window as interrupted by a swap
  if (swapOccurred) {
    // When a swap occurs, mark the previous character's combo window as swapped (it's no longer active)
    const updatedWindows: typeof ctx.current.charactersComboWindows = {}
    for (const [char, window] of Object.entries(ctx.current.charactersComboWindows)) {
      updatedWindows[char] = {
        ...window,
        wasSwapped: char === prevCharName ? true : window.wasSwapped,
      }
    }
    ctx.current.charactersComboWindows = updatedWindows
  }

  // Update form change flag if the current character changed form
  const prevForm = ctx.prev.charactersForms?.[charName]
  const newForm = ctx.current.charactersForms?.[charName]
  const didFormChange = !!ctx.action.formChange || prevForm !== newForm
  if (didFormChange && ctx.current.charactersComboWindows[charName]) {
    ctx.current.charactersComboWindows[charName] = {
      ...ctx.current.charactersComboWindows[charName],
      formChanged: true,
    }
  }

  // Record this action for potential combo window usage, but only if it is actually a combo
  // window starter (referenced in another action's comboWindow.previousActions).
  // Non-starter actions (e.g. intermediate mid-air attacks between Skill 1 and Skill 2) must
  // NOT overwrite the existing entry — the window must survive those intermediate actions.
  // The wasSwapped / formChanged flags set above still apply to the preserved entry.
  const isComboWindowStarter = ctx.character.actions.some(a =>
    a.castConditions.comboWindow?.previousActions.some(pa => pa.name === ctx.action.name)
  )
  if (isComboWindowStarter) {
    ctx.current.charactersComboWindows = {
      ...ctx.current.charactersComboWindows,
      [charName]: {
        actionName: ctx.action.name,
        startTime: ctx.fromTime, // Record cast start time
        wasSwapped: false, // Reset when a new combo window is opened
        formChanged: false, // Reset when a new combo window is opened
      },
    }
  }

  ctx.logs.push({
    resolver: 'resolveCastState',
    message: `Cast state resolved for ${charName}: position=${newPosition}, persistentUntil=${ctx.current.charactersPersistentUntil[charName]}`,
    details: { prevPosition, rawEndState, newPosition, persistenceTime, swapOccurred, swapCooldownUntil },
  })
}

// ========== Resolver: Off-Field Triggers ====================================================================================

/**
 * Fires once-per-off-field-stretch when a character's continuous off-field duration crosses
 * the threshold declared on `Character.offFieldTriggers`.
 *
 * Detection mirrors `resolveResourceMilestones`: the trigger fires exactly when
 *   prevOffFieldDuration < threshold ≤ currOffFieldDuration
 * so it fires at most once per continuous off-field stretch regardless of step length.
 *
 * Must run AFTER `resolveResources` (so energies are already written to `ctx.current`)
 * and BEFORE `resolveCastState` (which updates `charactersOffFieldSince` for the NEXT step).
 * The off-field-since timestamps used here come from `ctx.prev`.
 *
 * `null` in `charactersOffFieldSince` means the character is currently on-field or was never
 * swapped out — NOT "went off-field at t=0". Use null as the sentinel, not 0.
 */
export function resolveOffFieldTriggers(ctx: StepContext): void {
  const allCharacters = [ctx.character, ...ctx.allies]

  for (const char of allCharacters) {
    if (!char.offFieldTriggers || char.offFieldTriggers.length === 0) continue

    const offFieldSinceRaw = ctx.prev.charactersOffFieldSince?.[char.name]
    // null  = explicitly on-field (resolveCastState writes null when a character swaps in)
    // absent + active character = always been on-field, never swapped out → skip
    // absent + ally = never came on-field → treat as off-field since t=0
    if (offFieldSinceRaw === null || (offFieldSinceRaw === undefined && char.name === ctx.character.name)) {
      continue
    }
    const offFieldSince = offFieldSinceRaw ?? 0

    const prevOffFieldDuration = ctx.fromTime - offFieldSince
    const currOffFieldDuration = ctx.toTime - offFieldSince

    for (const trigger of char.offFieldTriggers) {
      const threshold = trigger.minOffFieldDuration
      // Fire once: the first step whose window crosses the threshold
      if (prevOffFieldDuration >= threshold) {
        continue
      }
      if (currOffFieldDuration < threshold) {
        continue
      }

      if (trigger.condition && !trigger.condition(ctx.current, char.name, char)) {
        continue
      }

      const charEnergies = { ...(ctx.current.charactersEnergies?.[char.name] ?? {}) }
      const maxEnergies = char.maxEnergies

      const restoredParts: string[] = []
      for (const [energyType, amount] of Object.entries(trigger.energyRestore) as [keyof typeof trigger.energyRestore, number][]) {
        const maxValue = maxEnergies[energyType] ?? Infinity
        const prev = charEnergies[energyType] ?? 0
        const next = Math.min(prev + amount, maxValue)
        charEnergies[energyType] = next
        if (next > prev) {
          restoredParts.push(`${energyType} +${next - prev}`)
        }
      }

      ctx.current.charactersEnergies = {
        ...ctx.current.charactersEnergies,
        [char.name]: charEnergies,
      }

      // Restore a specific number of charges for specified action group names
      if (trigger.chargesRestore && trigger.chargesRestore.length > 0) {
        const charStacks = { ...(ctx.current.charactersActionStacks?.[char.name] ?? {}) }
        const charCooldowns = { ...(ctx.current.charactersCooldowns?.[char.name] ?? {}) }
        const stacksConfig = ctx.current.charactersActionStacksConfig?.[char.name] ?? {}
        for (const { groupName, amount } of trigger.chargesRestore) {
          const maxStacks = stacksConfig[groupName]?.max ?? Infinity
          // Absent entry means already at max; treat as maxStacks for the addition
          const current = charStacks[groupName] ?? maxStacks
          const restored = Math.min(current + amount, maxStacks)
          if (restored >= maxStacks) {
            // At max: absent entry is the canonical representation; also clear the timer
            delete charStacks[groupName]
            delete charCooldowns[groupName]
          } else {
            charStacks[groupName] = restored
          }
          restoredParts.push(`${groupName} charges +${restored - current}`)
        }
        ctx.current.charactersActionStacks = {
          ...ctx.current.charactersActionStacks,
          [char.name]: charStacks,
        }
        ctx.current.charactersCooldowns = {
          ...ctx.current.charactersCooldowns,
          [char.name]: charCooldowns,
        }
      }

      // Record the event so DataOverlay and other readers can surface it with a source label
      const description = trigger.description ?? `Off-field ≥${threshold}s: ${restoredParts.join(', ')}`
      if (!ctx.current.offFieldTriggerEvents) ctx.current.offFieldTriggerEvents = {}
      ctx.current.offFieldTriggerEvents[char.name] = [
        ...(ctx.current.offFieldTriggerEvents[char.name] ?? []),
        description,
      ]

      ctx.logs.push({
        resolver: 'resolveOffFieldTriggers',
        message: `[${char.name}] Off-field trigger fired: off-field for ${currOffFieldDuration.toFixed(2)}s >= ${threshold}s`,
        details: { description, energyRestore: trigger.energyRestore, offFieldSince, fromTime: ctx.fromTime, toTime: ctx.toTime, restoredParts },
      })
    }
  }
}

// ========== Internal Helpers ================================================================================================

function initializeEmptyCharacterStats(): Partial<CharacterStats> {
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

function initializeEmptyEnemyStats(): Partial<EnemyStats> {
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
