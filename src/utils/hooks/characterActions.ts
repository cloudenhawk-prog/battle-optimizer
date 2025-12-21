import type { Snapshot } from "../../types/snapshot"
import type { Action } from "../../types/action"
import type { Character } from "../../types/character"
import type { NegativeStatusInAction } from "../../types/negativeStatus"
import type { Enemy } from "../../types/enemy"
import type { NegativeStatusDamageEvent } from "../../types/events"
import { calculateDamageNegativeStatus } from "../../utils/calculators/damageCalculator"

// ========== Snapshot Helpers ================================================================================================

export function getSnapshotById(snapshots: Snapshot[], id: number): Snapshot | undefined {
  return snapshots.find(s => Number(s.id) === id)
}

export function getSnapshotIndex(snapshots: Snapshot[], id: number): number {
  return snapshots.findIndex(s => Number(s.id) === id)
}

export function getPrevSnapshot(snapshots: Snapshot[], index: number): Snapshot {
  return snapshots[index - 1] ?? snapshots[0]
}

export function isLastSnapshot(snapshots: Snapshot[], index: number): boolean {
  return index === snapshots.length - 1
}

export function copySnapshots(snapshots: Snapshot[]): Snapshot[] {
  return [...snapshots]
}

export function assignCharacterToRow(row: Snapshot, character: string): Snapshot {
  return { ...row, character }
}

// ========== Character Helpers ================================================================================================

export function getCharacter(charactersMap: Record<string, Character>, characterName: string): Character | undefined {
  return charactersMap[characterName]
}

export function getCharacterActions(character: Character) {
  return character.actions
}

export function getCharacterMaxEnergies(character: Character) {
  return character.maxEnergies
}

export function getPrevCharacter(snapshots: Snapshot[], snapshotId: number): string | null {
  return snapshotId > 0 ? snapshots[snapshotId - 1].character ?? null : null
}

// ========== Energy Helpers ===================================================================================================

export function getCharacterEnergyState(snapshot: Snapshot, characterName: string) {
  return snapshot.charactersEnergies[characterName]
}

export function updateEnergyValue(
  prev: number | undefined,
  generated: number,
  max: number
) {
  return Math.min((prev ?? 0) + generated, max)
}

export function getConcertoValue(snapshot: Snapshot, character: string): number {
  return snapshot.charactersEnergies[character]?.concerto ?? 0
}

// ========== Action Helpers ===================================================================================================

export function getActionFromCharacter(
  charactersMap: Record<string, Character>,
  characterName: string,
  actionName: string
) {
  const character = getCharacter(charactersMap, characterName)
  if (!character) return undefined
  return character.actions.find(a => a.name === actionName)
}

// ========== Negative Status Helpers ==========================================================================================

export function getNegativeStatusStacks(snapshot: Snapshot): Record<string, number> {
  return { ...snapshot.negativeStatuses }
}

export function processNegativeStatusStacks(
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

export function updateNegativeStatusStacks(snapshot: Snapshot, stacksCurr: Record<string, number>, action: Action, negativeStatusesInAction: NegativeStatusInAction[]): void {
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

export function createNegativeStatusDamageEvent(
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
















// export function getCharacterColumnKeys(characterColumnsMap: Record<string, string[]>, characterName: string) {
//   return characterColumnsMap[characterName] ?? []
// }

// export function getGlobalColumnKeys(globalColumns: {
//   basic: string[]
//   buffs: string[]
//   debuffs: string[]
//   negativeStatuses: string[]
// }) {
//   return [
//     ...globalColumns.basic,
//     ...globalColumns.buffs,
//     ...globalColumns.debuffs,
//     ...globalColumns.negativeStatuses
//   ]
// }
