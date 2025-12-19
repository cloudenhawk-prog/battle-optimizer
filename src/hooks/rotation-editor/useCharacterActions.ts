import { negativeStatuses } from './../../data/negativeStatuses';
import type { Snapshot } from "../../types/snapshot"
import type { Character } from "../../types/character"
import { createSnapshot } from "./useSnapshots"
import type { Dispatch, SetStateAction } from "react"
import type { Enemy } from "../../types/enemy"
import { getSnapshotIndex, getPrevSnapshot, getCharacter, getActionFromCharacter, getCharacterEnergyState, updateEnergyValue, copySnapshots, getPrevCharacter, getSnapshotById, getConcertoValue, assignCharacterToRow } from "../../utils/shared"
import type { DamageEvent } from "../../types/snapshot"
import { calculateDamage, calculateDamageNegativeStatus } from "../../engine/damageCalculator"
import { useRef } from "react"
import type { NegativeStatusInAction } from "../../types/negativeStatus"
import { negativeStatuses as negativeStatusesData } from "../../data/negativeStatuses"
import type { Action } from "../../types/character"
import type { NegativeStatusDamageEvent } from "../../types/negativeStatus"
import type { StepContext, DamageModifier } from "../../types/resolver"
import type { CharacterStats, EnemyStats } from "../../types/stats"

type GlobalColumns = { // TODO: is it necessary to make a subtype like this of TableConfig?
  basic: string[]
  buffs: string[]
  debuffs: string[]
  negativeStatuses: string[]
}

type UseCharacterActionsProps = {
  snapshots: Snapshot[]
  setSnapshots: Dispatch<SetStateAction<Snapshot[]>>
  charactersInBattle: Character[]
  enemy: Enemy
  tableConfig: {
    basic: { columns: { key: string }[] }
    buffs: { columns: { key: string }[] }
    debuffs: { columns: { key: string }[] }
    negativeStatuses: { columns: { key: string }[] }
    characters: { label: string; columns: { key: string }[] }[]
  }
  damageEvents: DamageEvent[]
  setDamageEvents: Dispatch<SetStateAction<DamageEvent[]>>
}

export function useCharacterActions({ snapshots, setSnapshots, charactersInBattle, enemy, tableConfig, damageEvents, setDamageEvents }: UseCharacterActionsProps) {
  const charactersMap: Record<string, Character> = Object.fromEntries(charactersInBattle.map(c => [c.name, c]))
  const characterColumnsMap: Record<string, string[]> = Object.fromEntries(
    tableConfig.characters.map(c => [c.label, c.columns.map(col => col.key.split("_")[1])])
  )
  const globalColumns: GlobalColumns = {
  basic: tableConfig.basic.columns.map(col => col.key),
  buffs: tableConfig.buffs?.columns.map(col => col.key) ?? [],
  debuffs: tableConfig.debuffs?.columns.map(col => col.key) ?? [],
  negativeStatuses: tableConfig.negativeStatuses?.columns.map(col => col.key) ?? [],
}

  const negativeStatusesInAction = useRef<NegativeStatusInAction[]>(
    Object.values(negativeStatusesData).map(status => ({
      negativeStatus: status,
      applicationTime: -1,
      timeLeft: 0,
      currentStacks: 0,
      lastDamageTime: 0,
    }))
  )

  const handleCharacterSelect = (snapshotId: number, characterName: string) => {
    setSnapshots((prev) =>
      prev
        .map(s => (Number(s.id) === snapshotId ? { ...s, character: characterName, action: "" } : s))
        .filter(s => Number(s.id) <= snapshotId)
    )
  }

  const handleActionSelect = (snapshotId: number, actionName: string) => {
    setSnapshots((prevSnapshots) => {
      let updated = copySnapshots(prevSnapshots)

      if (shouldTriggerOutroIntro(updated, snapshotId)) {
        updated = handleOutroIntroFlow({ snapshots: updated, snapshotId, charactersMap, characterColumnsMap, globalColumns, enemy, damageEvents, setDamageEvents, negativeStatusesInAction })
        snapshotId += 2
      }

      updated = updateSnapshotsWithAction({ snapshots: updated, snapshotId, actionName, charactersMap, characterColumnsMap, globalColumns, enemy, damageEvents, setDamageEvents, negativeStatusesInAction })

      return updated
    })
  }

  return { handleCharacterSelect, handleActionSelect }
}


/* =============================================================================================================================
   Internal Helpers
   ========================================================================================================================== */

function updateSnapshotsWithAction(params: {
  snapshots: Snapshot[]
  snapshotId: number
  actionName: string
  charactersMap: Record<string, Character>
  characterColumnsMap: Record<string, string[]>
  globalColumns: { basic: string[]; buffs: string[]; debuffs: string[]; negativeStatuses: string[] }
  enemy: Enemy
  damageEvents: DamageEvent[]
  setDamageEvents: Dispatch<SetStateAction<DamageEvent[]>>
  negativeStatusesInAction: React.MutableRefObject<NegativeStatusInAction[]>
}): Snapshot[] {
  // -------- Validate Input --------
  const validated = validateActionInputs(params)
  if (!validated) return params.snapshots
  const { index, character, action, current, prev } = validated
  const updatedSnapshots = copySnapshots(params.snapshots)



  console.log("updateSnapshotsWithAction called:")
  console.log(" index: ", index)
  console.log(" current: ", current)
  console.log(" prev: ", prev)




  // TODO: Create a step that creates references to all the different effects, so each step doesn't need to go through context?

  // -------- Resolvers -------------------------
  const context = buildStepContext(index, current, prev, character, action, params.enemy, params.negativeStatusesInAction.current, params.charactersMap)

  resolveTime(context)

  resolveDamageModifiers(context)

  resolveDamage(context, params.setDamageEvents)

  // Step 5: resolveSideEffectDamage - damage if action triggers aero erosion proc or anything like that
    // Needs a new type, SideEffectDamage - might need to also tell you which stats it scales with (maybe use types so you dont need to type everything - including a standard type that means 'everything')

  // Step 6: resolveSideEffects - updates buffs, debuffs etc if they are still active or get more stacks
    // Only needs logic, as long as buffs/debuffs have 'duration'

  resolveNegativeStatuses(context)

  resolveResources(context)

  // Step 9: collectEvents - grabs logs/events etc
    // Does anything else needs to be updated?
    // Do we need to store logs anywhere?
    // What about damageEvents and nsDamageEvents?

  // -------- Update snapshot -------------------
  updatedSnapshots[index] = { ...context.current }

  // -------- Create Next Blank Snapshot --------
  if (index === updatedSnapshots.length - 1) {
    updatedSnapshots.push(createSnapshot(updatedSnapshots[updatedSnapshots.length - 1], params.charactersMap, params.characterColumnsMap, params.globalColumns))
  }

  return updatedSnapshots
}

// =============================================================================================================================

function shouldTriggerOutroIntro(snapshots: Snapshot[], snapshotId: number): boolean {
  if (snapshotId === 0) return false

  const prevChar = getPrevCharacter(snapshots, snapshotId)
  const currChar = getSnapshotById(snapshots, snapshotId)?.character ?? null

  if (!prevChar || !currChar || prevChar === currChar) return false

  const prevSnapshot = getPrevSnapshot(snapshots, snapshotId)
  const prevConcerto = getConcertoValue(prevSnapshot, prevChar)

  return prevConcerto === 100
}

function handleOutroIntroFlow(params: {
  snapshots: Snapshot[],
  snapshotId: number,
  charactersMap: Record<string, Character>,
  characterColumnsMap: Record<string, string[]>,
  globalColumns: any,
  enemy: Enemy,
  damageEvents: DamageEvent[],
  setDamageEvents: Dispatch<SetStateAction<DamageEvent[]>>,
  negativeStatusesInAction: React.MutableRefObject<NegativeStatusInAction[]>
}): Snapshot[] {
  const { snapshots, snapshotId, charactersMap, characterColumnsMap, globalColumns, enemy, damageEvents, setDamageEvents, negativeStatusesInAction } = params

  let updated = copySnapshots(snapshots)

  const prevChar = getPrevCharacter(updated, snapshotId)!
  const currChar = getSnapshotById(updated, snapshotId)!.character!

  // Force Outro row
  updated[snapshotId] = assignCharacterToRow(updated[snapshotId], prevChar)
  updated = updateSnapshotsWithAction({ snapshots: updated, snapshotId, actionName: "Outro", charactersMap, characterColumnsMap, globalColumns, enemy, damageEvents, setDamageEvents, negativeStatusesInAction })

  // Insert Intro row
  const introId = snapshotId + 1
  updated[introId] = assignCharacterToRow(updated[introId], currChar)
  updated = updateSnapshotsWithAction({ snapshots: updated, snapshotId: introId, actionName: "Intro", charactersMap, characterColumnsMap, globalColumns, enemy, damageEvents, setDamageEvents, negativeStatusesInAction })

  // Prepare the next blank row for the real action
  const nextId = introId + 1
  updated[nextId] = assignCharacterToRow(updated[nextId], currChar)

  return updated
}

// =============================================================================================================================

function validateActionInputs(params: {
  snapshots: Snapshot[]
  snapshotId: number
  actionName: string
  charactersMap: Record<string, Character>
  characterColumnsMap: Record<string, string[]>
  globalColumns: { basic: string[]; buffs: string[]; debuffs: string[]; negativeStatuses: string[] }
  enemy: Enemy
  damageEvents: DamageEvent[]
  setDamageEvents: Dispatch<SetStateAction<DamageEvent[]>>
}) {
  const { snapshots, snapshotId, actionName, charactersMap } = params

  const index = getSnapshotIndex(snapshots, snapshotId)
  if (index === -1) return null

  const current = snapshots[index]
  if (!current.character) return null

  const character = getCharacter(charactersMap, current.character)
  if (!character) return null

  const action = getActionFromCharacter(charactersMap, current.character, actionName)
  if (!action) return null

  const prev = getPrevSnapshot(snapshots, index)

  return { index, character, action, current, prev }
}

// =============================================================================================================================

function getNegativeStatusStacks(snapshot: Snapshot): Record<string, number> {
  return { ...snapshot.negativeStatuses }
}

// =============================================================================================================================

function updateNegativeStatusStacks(snapshot: Snapshot, stacksCurr: Record<string, number>, action: Action, negativeStatusesInAction: NegativeStatusInAction[]): void {
  for (const [name, count] of Object.entries(action.negativeStatusesApplied)) {
    const nsInQuestion = negativeStatusesInAction.find(nsInAction => nsInAction.negativeStatus.name === name)
    const maxStacks = nsInQuestion.negativeStatus.maxStacksDefault

    // Update stacks in stacksCurr
    stacksCurr[name] += count
    stacksCurr[name] = Math.min(stacksCurr[name], maxStacks)

    // Update stacks in NegativeStatusInAction
    const statusInAction = negativeStatusesInAction.find(nsa => nsa.negativeStatus.name === name)
    if (statusInAction) {
      statusInAction.currentStacks = stacksCurr[name]

      // If this status is being applied for the first time
      if (statusInAction.applicationTime === -1) {
        statusInAction.applicationTime = snapshot.toTime
        statusInAction.timeLeft = statusInAction.negativeStatus.duration
        statusInAction.lastDamageTime = snapshot.toTime
      }
    }
  }

  snapshot.negativeStatuses = { ...stacksCurr }
}

// =============================================================================================================================

function processNegativeStatusStacks(
  negativeStatusesInAction: NegativeStatusInAction[],
  fromTime: number,
  toTime: number,
  stacksPrev: Record<string, number>,
  enemy: Enemy
): {
  damages: Record<string, number[]>;
  stacksCurr: Record<string, number>;
} {
  const damages: Record<string, number[]> = {}
  const stacksCurr: Record<string, number> = {}

  for (const nsa of negativeStatusesInAction) {
    if (nsa.applicationTime === -1) {
      stacksCurr[nsa.negativeStatus.name] = 0
      continue
    }

    const reducStrat = nsa.negativeStatus.reductionStrategy

    if (reducStrat.resetTimerOnApplication === true) { // AERO EROSION FOR NOW
      const name = nsa.negativeStatus.name
      const currStacks = nsa.currentStacks
      const element = nsa.negativeStatus.element

      let lastDamageTime = nsa.lastDamageTime
      const frequency = nsa.negativeStatus.frequency
      let timeLeft = nsa.timeLeft

      while (lastDamageTime + frequency <= toTime && timeLeft - frequency >= 0) {
        lastDamageTime += frequency
        timeLeft -= frequency

        if (!damages[name]) {
          damages[name] = []
        }

        damages[name].push(calculateDamageNegativeStatus(currStacks, element, enemy, name))
      }

      if (timeLeft <= 0) {
        nsa.applicationTime = -1
        nsa.timeLeft = 0
        nsa.currentStacks = 0
        nsa.lastDamageTime = 0
      } else {
        nsa.lastDamageTime = lastDamageTime
        nsa.timeLeft = timeLeft
      }

      stacksCurr[name] = currStacks
    }

    else if (reducStrat.resetTimerOnApplication === false) { // SPECTRO FRAZZLE FOR NOW
      const name = nsa.negativeStatus.name
      const element = nsa.negativeStatus.element

      let lastDamageTime = nsa.lastDamageTime
      const frequency = nsa.negativeStatus.frequency
      let timeLeft = nsa.timeLeft
      let currStacks = nsa.currentStacks
      const stackConsume = reducStrat.stackConsumption

      while (lastDamageTime + frequency <= toTime && currStacks >= stackConsume) {
        lastDamageTime += frequency
        timeLeft -= frequency

        if (!damages[name]) {
          damages[name] = []
        }

        damages[name].push(calculateDamageNegativeStatus(currStacks, element, enemy, name))

        if (timeLeft <= 0) {
          currStacks -= stackConsume
        }
      }

      if (currStacks <= 0) {
        nsa.applicationTime = -1
        nsa.timeLeft = 0
        nsa.currentStacks = 0
        nsa.lastDamageTime = 0
      } else {
        nsa.lastDamageTime = lastDamageTime
        nsa.timeLeft = timeLeft
        nsa.currentStacks = currStacks
      }

      stacksCurr[name] = currStacks
    }
  }

  return { damages, stacksCurr }
}

// =============================================================================================================================

function createNegativeStatusDamageEvent(
  statusName: string,
  element: Action["element"],
  damage: number
): NegativeStatusDamageEvent {
  return {
    name: statusName,
    element: element,
    damage: damage,
  }
}

// =============================================================================================================================

function buildStepContext(
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

// =============================================================================================================================

function resolveTime(ctx: StepContext): void {
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

// =============================================================================================================================

function resolveDamageModifiers(ctx: StepContext) {
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
  // We'll first sum additive effects, then apply multiplicative with linear stacking
  const charAdditive: Partial<CharacterStats> = {}
  const charMultiplicative: Partial<CharacterStats> = {}

  const enemyAdditive: Partial<EnemyStats> = {}
  const enemyMultiplicative: Partial<EnemyStats> = {}

  allModifiers.forEach(modifier => {
    const times = modifier.condition?.(ctx) ?? 1
    console.log("Modifier:", modifier.source, "times:", times)
    if (times === 0) return // skip if condition not met

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

    // Logging
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

// =============================================================================================================================

function resolveDamage(ctx: StepContext, setDamageEvents: Dispatch<SetStateAction<DamageEvent[]>>): void {
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

// =============================================================================================================================

function resolveNegativeStatuses(ctx: StepContext): void {
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

  console.log("nsDamageEvents: ", nsDamageEvents)
  nsDamageEvents.forEach(entry => {
    console.log("     DAMAGE (", entry.name, "): ", entry.damage)
  })

  // TODO create a state and use it to update with the new NegativeStatusDamageEvent - make sure they are defined in a way they dont rerender the DOM (also check the normal Damage Events)
}

// =============================================================================================================================

function resolveResources(ctx: StepContext): void {
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


