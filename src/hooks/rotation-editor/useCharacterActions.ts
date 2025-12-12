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
import type { NegativeStatus } from "../../types/negativeStatus"

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
  const globalColumns = {
    basic: tableConfig.basic.columns.map(col => col.key),
    buffs: tableConfig.buffs.columns.map(col => col.key),
    debuffs: tableConfig.debuffs.columns.map(col => col.key),
    negativeStatuses: tableConfig.negativeStatuses.columns.map(col => col.key)
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
        updated = handleOutroIntroFlow({ snapshots: updated, snapshotId, charactersMap, characterColumnsMap, globalColumns, enemy, damageEvents, setDamageEvents })
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
  const { index, snapshot, character, action, prev } = validated
  const updated = copySnapshots(params.snapshots)

  // -------- Timeline --------
  const fromTime = prev.toTime
  const toTime = fromTime + action.castTime

  // -------- Energy Updates --------
  const energiesPrev = getCharacterEnergyState(prev, snapshot.character!)
  const energiesCurr = getCharacterEnergyState(snapshot, snapshot.character!)
  const maxEnergies = character.maxEnergies
  for (const [key, generated] of Object.entries(action.energyGenerated)) {
    if (key in energiesCurr) energiesCurr[key] = updateEnergyValue(energiesPrev[key], generated, maxEnergies[key])
  }
  if (action.name === "Outro" && energiesCurr.concerto !== undefined) energiesCurr.concerto = 0

  // -------- Buffs/Debuffs --------
  // TODO





  // -------- Negative Statuses --------

  const stacksPrev = getNegativeStatusStacks(prev)
  const {damages, stacksCurr} = processNegativeStatusStacks(params.negativeStatusesInAction.current, fromTime, toTime, stacksPrev, params.enemy)
  updateNegativeStatusStacks(snapshot, stacksCurr, action, negativeStatusesData)

  // TODO: negativeStatusEvents = createNegativeStatusEvents(damages, params.negativeStatusesInAction)





  // -------- Time & Damage --------
  const { average, damageEvent } = calculateDamage({ snapshot, prev, action, character, enemy: params.enemy, snapshotId: index })
  const cumulativeDamage = prev.damage + average
  const dps = cumulativeDamage / toTime

  // -------- Update snapshot --------
  updated[index] = { ...snapshot, action: action.name, fromTime, toTime, damage: cumulativeDamage, dps }

  // -------- Update global damage events --------
  params.setDamageEvents(prevEvents => [...prevEvents, damageEvent])

  // -------- Create Next Blank Snapshot --------
  if (index === updated.length - 1) {
    updated.push(createSnapshot(updated[updated.length - 1], params.charactersMap, params.characterColumnsMap, params.globalColumns))
  }

  return updated
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
  setDamageEvents: Dispatch<SetStateAction<DamageEvent[]>>
}): Snapshot[] {
  const { snapshots, snapshotId, charactersMap, characterColumnsMap, globalColumns, enemy, damageEvents, setDamageEvents } = params

  let updated = copySnapshots(snapshots)

  const prevChar = getPrevCharacter(updated, snapshotId)!
  const currChar = getSnapshotById(updated, snapshotId)!.character!

  // Force Outro row
  updated[snapshotId] = assignCharacterToRow(updated[snapshotId], prevChar)
  updated = updateSnapshotsWithAction({ snapshots: updated, snapshotId, actionName: "Outro", charactersMap, characterColumnsMap, globalColumns, enemy, damageEvents, setDamageEvents })

  // Insert Intro row
  const introId = snapshotId + 1
  updated[introId] = assignCharacterToRow(updated[introId], currChar)
  updated = updateSnapshotsWithAction({ snapshots: updated, snapshotId: introId, actionName: "Intro", charactersMap, characterColumnsMap, globalColumns, enemy, damageEvents, setDamageEvents })

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

  const snapshot = snapshots[index]
  if (!snapshot.character) return null

  const character = getCharacter(charactersMap, snapshot.character)
  if (!character) return null

  const action = getActionFromCharacter(charactersMap, snapshot.character, actionName)
  if (!action) return null

  const prev = getPrevSnapshot(snapshots, index)

  return { index, snapshot, character, action, prev }
}

// =============================================================================================================================

function getNegativeStatusStacks(snapshot: Snapshot): Record<string, number> {
  return { ...snapshot.negativeStatuses }
}

// =============================================================================================================================

function updateNegativeStatusStacks(snapshot: Snapshot, stacksCurr: Record<string, number>, action: Action, negativeStatusesData: Record<string, NegativeStatus>): void {
  for (const [name, count] of Object.entries(action.negativeStatusesApplied)) {
    const maxStacks = negativeStatusesData[name]?.maxStacksDefault ?? Infinity;

    if (stacksCurr[name] !== undefined) {
      stacksCurr[name] += count;
    } else {
      stacksCurr[name] = count;
    }

    stacksCurr[name] = Math.min(stacksCurr[name], maxStacks);
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
  let damages: Record<string, number[]> = {}
  let stacksCurr: Record<string, number> = {}

  for (const nsa of negativeStatusesInAction) {
    if (nsa.applicationTime === -1) continue

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
        damages[name].push(calculateDamageNegativeStatus(currStacks, element, enemy))
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
      let stackConsume = reducStrat.stackConsumption

      let procs = 0
      while (lastDamageTime + frequency <= toTime && currStacks >= stackConsume) {
        procs += 1
        lastDamageTime += frequency
        timeLeft -= frequency
        damages[name].push(calculateDamageNegativeStatus(currStacks, element, enemy))

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
