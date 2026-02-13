import type { StepContext } from '../../types/stepContext'
import type { CharacterStats, EnemyStats } from '../../types/stats'
import type { DamageModifier } from '../../types/modifiers'
import type { Dispatch, SetStateAction } from 'react'
import type { DamageEvent } from '../../types/events'
import type { Snapshot } from '../../types/snapshot'
import type { Action } from '../../types/action'
import type { Character } from '../../types/character'
import type { Enemy } from '../../types/enemy'
import type { NegativeStatusInAction } from '../../types/negativeStatus'
import { calculateDamage } from '../../utils/calculators/damageCalculator'
import { getNegativeStatusStacks, processNegativeStatusStacks, updateNegativeStatusStacks } from './negativeStatusHelpers'
import { getCharacterEnergyState, updateEnergyValue } from './energyHelpers'

// ========== Resolver 0: Build Step Context ==================================================================================

export function buildStepContext(snapshotId: number, current: Snapshot, prev: Snapshot, character: Character, action: Action, enemy: Enemy, negativeStatusesInAction: NegativeStatusInAction[], characterMap: Record<string, Character>): StepContext {
  const fromTime = prev.toTime
  const toTime = fromTime + action.castTime
  current.action = action.name

  const allies = []
  for (const [name, char] of Object.entries(characterMap)) {
    if (name !== character.name) {
      allies.push(char)
    }
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

    negativeStatusesInAction,

    damageModifiers: [],
    aggregatedCharacterModifiers: {},
    aggregatedEnemyModifiers: {},

    logs: [],
  }

  ctx.logs.push({
    resolver: 'buildStepContext',
    message: `Context built for snapshot ${snapshotId}`,
    details: { character: character.name, action: action.name },
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

  const allModifiers: DamageModifier[] = [...(ctx.character.damageModifiers ?? []), ...(ctx.action.damageModifiers ?? []), ...ctx.negativeStatusesInAction.flatMap(ns => ns.negativeStatus.damageModifiers ?? [])]

  // Store all collected modifiers in context for damage calculator to use
  ctx.damageModifiers = allModifiers

  for (const modifier of allModifiers) {
    const conditionMultiplier = modifier.condition ? modifier.condition(ctx) : 1

    if (modifier.characterStats) {
      for (const [key, value] of Object.entries(modifier.characterStats)) {
        const statKey = key as keyof CharacterStats
        const modValue = (value as number) * conditionMultiplier

        characterModifiers[statKey] = aggregateStat(characterModifiers[statKey] as number | undefined, modValue, statKey) as any
      }
    }

    if (modifier.enemyStats) {
      for (const [key, value] of Object.entries(modifier.enemyStats)) {
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
      characterModifiers: ctx.aggregatedCharacterModifiers,
      enemyModifiers: ctx.aggregatedEnemyModifiers,
    },
  })
}

// ========== Resolver 3: Damage ==============================================================================================

export function resolveDamage(ctx: StepContext, setDamageEvents: Dispatch<SetStateAction<DamageEvent[]>>): void {
  const action = ctx.action
  const name = ctx.character.name
  const baseStats = ctx.character.stats
  const damageModifiers = ctx.damageModifiers
  const modifierCharacterStats = ctx.aggregatedCharacterModifiers
  const modifierEnemyStats = ctx.aggregatedEnemyModifiers
  const enemy = ctx.enemy
  const snapshotId = ctx.snapshotId
  const prev = ctx.prev
  const current = ctx.current
  const toTime = ctx.toTime

  const { average, damageEvent } = calculateDamage({ action, name, stats: baseStats, damageModifiers, modifierCharacterStats, modifierEnemyStats, enemy, snapshotId, timeStamp: ctx.fromTime })
  setDamageEvents(prevEvents => [...prevEvents, damageEvent])

  const cumulativeDamage = prev.damage + average
  const dps = cumulativeDamage / toTime

  current.damage = cumulativeDamage
  current.dps = dps

  ctx.logs.push({
    resolver: 'resolveDamage',
    message: `Damage resolved for snapshot ${snapshotId}: +${average} dmg, cumulative ${cumulativeDamage}`,
    details: { damageEvent },
  })
}

// ========== Resolver 4: Side Effects And Statuses ===========================================================================

export function resolveSideEffectsAndStatuses(ctx: StepContext, setDamageEvents: Dispatch<SetStateAction<DamageEvent[]>>): void {
  // Aggregate all status modifications from both action and side effects
  const statusModifications = aggregateStatusModifications(ctx)

  // Side Effects Damage
  helpSideEffectsDamage(ctx, setDamageEvents)

  // Negative Statuses
  helpNegativeStatuses(ctx, setDamageEvents, statusModifications)

  // TODO: Buffs & Debuffs
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

  console.log('Hej')
  entry.stackChange += stackChange
  entry.durationChange += durationChange
  entry.refreshDuration ||= refreshDuration
}

function helpSideEffectsDamage(ctx: StepContext, setDamageEvents: Dispatch<SetStateAction<DamageEvent[]>>): void {
  const sideEffects = ctx.action.sideEffects

  if (!sideEffects || sideEffects.length === 0) {
    return
  }

  let totalSideEffectDamage = 0
  const damageEvents: DamageEvent[] = []

  for (const sideEffect of sideEffects) {
    const damageEvent = sideEffect.damageDealt(ctx, sideEffect.name, ctx.fromTime)
    if (damageEvent.average > 0) {
      damageEvents.push(damageEvent)
      totalSideEffectDamage += damageEvent.average
    }
  }

  setDamageEvents(prevEvents => [...prevEvents, ...damageEvents])
  ctx.current.damage += totalSideEffectDamage

  ctx.logs.push({
    resolver: 'resolveSideEffectsDamage',
    message: `Side effects damage resolved: +${totalSideEffectDamage} dmg`,
    details: { sideEffectsCount: sideEffects.length, totalDamage: totalSideEffectDamage, damageEvents },
  })
}

export function helpNegativeStatuses(ctx: StepContext, setDamageEvents: Dispatch<SetStateAction<DamageEvent[]>>, statusModifications: any): void {
  const prev = ctx.prev
  const current = ctx.current
  const negativeStatusesInAction = ctx.negativeStatusesInAction
  const fromTime = ctx.fromTime
  const toTime = ctx.toTime
  const enemy = ctx.enemy
  const action = ctx.action

  const stacksPrev = getNegativeStatusStacks(prev)
  const { damageEvents, stacksCurr } = processNegativeStatusStacks(negativeStatusesInAction, fromTime, toTime, stacksPrev, enemy, ctx.character.stats, ctx.snapshotId)
  updateNegativeStatusStacks(current, stacksCurr, action, negativeStatusesInAction, statusModifications.negativeStatus)

  // Collect all damage events and filter out zero-damage events
  const allDamageEvents = Object.values(damageEvents)
    .flat()
    .filter(event => event.average > 0)
  setDamageEvents(prevEvents => [...prevEvents, ...allDamageEvents])

  // Calculate total damage from all events
  const totalDmgNegativeStatuses = allDamageEvents.reduce((sum, event) => sum + event.average, 0)
  current.damage += totalDmgNegativeStatuses

  ctx.logs.push({
    resolver: 'resolveNegativeStatuses',
    message: `Negative statuses resolved: +${totalDmgNegativeStatuses} dmg`,
    details: { damageEventsCount: allDamageEvents.length, totalDamage: totalDmgNegativeStatuses, damageEvents: allDamageEvents },
  })
}

// ========== Resolver 5: Side Effects ========================================================================================

// TODO

// ========== Resolver 7: Resources ===========================================================================================

export function resolveResources(ctx: StepContext): void {
  // TODO - error checking

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
  }

  // Update Character Energy
  for (const generated of action.energyGenerated) {
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

  // Handle Outro
  if (action.name === 'Outro' && energiesCurr?.concerto !== undefined) {
    energiesCurr.concerto = 0
  }
}

// ========== Resolver 8: Events ==============================================================================================

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
