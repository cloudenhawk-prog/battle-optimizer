import type { StepContext } from "../../types/stepContext"
import type { CharacterStats, EnemyStats } from "../../types/stats"
import type { DamageModifier } from "../../types/modifiers"
import type { Dispatch, SetStateAction } from "react"
import type { DamageEvent, NegativeStatusDamageEvent } from "../../types/events"
import type { Snapshot } from "../../types/snapshot"
import type { Action } from "../../types/action"
import type { Character } from "../../types/character"
import type { Enemy } from "../../types/enemy"
import type { NegativeStatusInAction } from "../../types/negativeStatus"
import { calculateDamage } from "../../utils/calculators/damageCalculator"
import { getNegativeStatusStacks, processNegativeStatusStacks, updateNegativeStatusStacks, createNegativeStatusDamageEvent } from "./negativeStatusHelpers"
import { getCharacterEnergyState, updateEnergyValue } from "./energyHelpers"

// ========== Resolver 0: Build Step Context ==================================================================================

export function buildStepContext(
  snapshotId: number,
  current: Snapshot,
  prev: Snapshot,
  character: Character,
  action: Action,
  enemy: Enemy,
  negativeStatusesInAction: NegativeStatusInAction[],
  characterMap: Record<string, Character>
): StepContext {
  const fromTime = prev.toTime
  const toTime = fromTime + action.castTime
  current.action = action.name

  const allies = []
  for (const [name, char] of Object.entries(characterMap)) {
    if (name !== character.name) {
      allies.push(char)
    }
  }

  return {
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

    logs: []
  }
}

// ========== Resolver 1: Time ================================================================================================

export function resolveTime(ctx: StepContext): void {
  if (ctx.fromTime == null || ctx.toTime == null || ctx.fromTime > ctx.toTime || ctx.snapshotId !== Number(ctx.current.id)) {
    throw Error(`Resolver: resolveTime failed for snapshot ${ctx.current.id} with snapshotId=${ctx.snapshotId}, fromTime=${ctx.fromTime}, toTime=${ctx.toTime}`)
  }

  ctx.current.fromTime = ctx.prev.toTime
  ctx.current.toTime = ctx.prev.toTime + ctx.action.castTime

  ctx.logs.push({
    resolver: "resolveTime",
    message: `Snapshot with id: ${ctx.snapshotId}: from ${ctx.current.fromTime}s to ${ctx.current.toTime}s`,
    details: { action: ctx.action.name }
  })
}

// ========== Resolver 2: Damage Modifiers ====================================================================================

export function resolveDamageModifiers(ctx: StepContext) {
  // Start with base stats
  const aggregatedCharacterStats: CharacterStats = { ...ctx.character.stats }
  const aggregatedEnemyStats: EnemyStats = { ...ctx.enemy.stats }

  // Collect all damage modifiers from character, action, and negative statuses
  const allModifiers: DamageModifier[] = [
    ...ctx.character.damageModifiers,
    ...ctx.action.damageModifiers,
    ...ctx.negativeStatusesInAction.flatMap(ns => ns.negativeStatus.damageModifiers)
  ]

  // -------- Apply modifiers --------
  const charAdditive: Partial<CharacterStats> = {}
  const charMultiplicative: Partial<CharacterStats> = {}

  const enemyAdditive: Partial<EnemyStats> = {}
  const enemyMultiplicative: Partial<EnemyStats> = {}

  allModifiers.forEach(modifier => {
    const times = modifier.condition?.(ctx) ?? 1
    if (times === 0) return

    // -------- Character Stats --------
    if (modifier.characterStats) {
      // Additive
      if (modifier.characterStats.add) {
        Object.entries(modifier.characterStats.add).forEach(([key, value]) => {
          charAdditive[key as keyof CharacterStats] =
            (charAdditive[key as keyof CharacterStats] ?? 0) + (value as number) * times
        })
      }

      // Multiplicative (linear stacking)
      if (modifier.characterStats.multiply) {
        Object.entries(modifier.characterStats.multiply).forEach(([key, value]) => {
          charMultiplicative[key as keyof CharacterStats] =
            (charMultiplicative[key as keyof CharacterStats] ?? 1) * (1 + ((value as number) - 1) * times)
        })
      }
    }

    // -------- Enemy Stats --------
    if (modifier.enemyStats) {
      if (modifier.enemyStats.add) {
        Object.entries(modifier.enemyStats.add).forEach(([key, value]) => {
          enemyAdditive[key as keyof EnemyStats] =
            (enemyAdditive[key as keyof EnemyStats] ?? 0) + (value as number) * times
        })
      }
      if (modifier.enemyStats.multiply) {
        Object.entries(modifier.enemyStats.multiply).forEach(([key, value]) => {
          enemyMultiplicative[key as keyof EnemyStats] =
            (enemyMultiplicative[key as keyof EnemyStats] ?? 1) * (1 + ((value as number) - 1) * times)
        })
      }
    }

    ctx.logs.push({
      resolver: "resolveDamageModifiers",
      message: `Applied modifier from ${modifier.source} with times ${times}`,
      details: { modifier }
    })
  })

  // -------- Apply aggregated effects --------
  // Character
  Object.entries(charAdditive).forEach(([key, value]) => {
    ;(aggregatedCharacterStats as any)[key] += value
  })
  Object.entries(charMultiplicative).forEach(([key, value]) => {
    ;(aggregatedCharacterStats as any)[key] *= value
  })

  // Enemy
  Object.entries(enemyAdditive).forEach(([key, value]) => {
    ;(aggregatedEnemyStats as any)[key] += value
  })
  Object.entries(enemyMultiplicative).forEach(([key, value]) => {
    ;(aggregatedEnemyStats as any)[key] *= value
  })

  // Attach final stats to context
  ctx.characterStats = aggregatedCharacterStats
  ctx.enemyStats = aggregatedEnemyStats

  ctx.logs.push({
    resolver: "resolveDamageModifiers",
    message: "Final aggregated stats after all modifiers",
    details: {
      characterStats: aggregatedCharacterStats,
      enemyStats: aggregatedEnemyStats
    }
  })
}

// ========== Resolver 3: Damage ==============================================================================================

export function resolveDamage(ctx: StepContext, setDamageEvents: Dispatch<SetStateAction<DamageEvent[]>>): void {
  // TODO - error checking

  const action = ctx.action
  const name = ctx.character.name
  const stats = ctx.characterStats
  const enemy = ctx.enemy
  const snapshotId = ctx.snapshotId
  const prev = ctx.prev
  const current = ctx.current
  const toTime = ctx.toTime

  const { average, damageEvent } = calculateDamage({ action, name, stats, enemy, snapshotId })
  setDamageEvents(prevEvents => [...prevEvents, damageEvent])

  const cumulativeDamage = prev.damage + average
  const dps = cumulativeDamage / toTime

  current.damage = cumulativeDamage
  current.dps = dps

  ctx.logs.push({
    resolver: "resolveDamage",
    message: `Damage resolved for snapshot ${snapshotId}: +${average} dmg, cumulative ${cumulativeDamage}`,
    details: { damageEvent }
  })
}

// ========== Resolver 4: Side Effects Damage =================================================================================

// TODO

// ========== Resolver 5: Side Effects ========================================================================================

// TODO

// ========== Resolver 6: Negative Statuses ===================================================================================

export function resolveNegativeStatuses(ctx: StepContext): void {
  // TODO - error checking

  const prev = ctx.prev
  const current = ctx.current
  const negativeStatusesInAction = ctx.negativeStatusesInAction
  const fromTime = ctx.fromTime
  const toTime = ctx.toTime
  const enemy = ctx.enemy
  const action = ctx.action

  const stacksPrev = getNegativeStatusStacks(prev)
  const {damages, stacksCurr} = processNegativeStatusStacks(negativeStatusesInAction, fromTime, toTime, stacksPrev, enemy)
  updateNegativeStatusStacks(current, stacksCurr, action, negativeStatusesInAction)

  const totalDmgNegativeStatuses = Object.values(damages).flat().reduce((sum, dmg) => sum + dmg, 0)
  current.damage += totalDmgNegativeStatuses


  const nsDamageEvents: NegativeStatusDamageEvent[] = []
  Object.keys(damages).forEach(statusName => {
    const statusEntry = negativeStatusesInAction.find(
      entry => entry.negativeStatus.name === statusName
    )

    if (statusEntry) {
      const element = statusEntry.negativeStatus.element

      damages[statusName].forEach(damage => {
        const event = createNegativeStatusDamageEvent(statusName, element, damage)
        nsDamageEvents.push(event)
      })
    }
  })
}

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
  if (action.name === "Outro" && energiesCurr?.concerto !== undefined) {
    energiesCurr.concerto = 0
  }
}

// ========== Resolver 8: Events ==============================================================================================

// TODO
