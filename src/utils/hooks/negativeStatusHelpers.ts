import type { NegativeStatusDamageEvent, DamageEvent } from './../../types/events'
import type { Snapshot } from "../../types/snapshot"
import type { Action } from "../../types/action"
import type { Enemy } from "../../types/enemy"
import type { NegativeStatusInAction } from "../../types/negativeStatus"
import type { CharacterStats } from "../../types/stats"
import { calculateDamageNegativeStatus } from "../../utils/calculators/damageCalculator"

// ========== Negative Status Helpers ==========================================================================================

export function getNegativeStatusStacks(snapshot: Snapshot): Record<string, number> {
  return { ...snapshot.negativeStatuses }
}

export function processNegativeStatusStacks(
  negativeStatusesInAction: NegativeStatusInAction[],
  fromTime: number,
  toTime: number,
  stacksPrev: Record<string, number>,
  enemy: Enemy,
  characterStats: CharacterStats,
  snapshotId: number
): {
  damageEvents: Record<string, DamageEvent[]>
  stacksCurr: Record<string, number>
} {
  const damageEvents: Record<string, DamageEvent[]> = {}
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

        if (!damageEvents[name]) {
          damageEvents[name] = []
        }

        damageEvents[name].push(calculateDamageNegativeStatus(currStacks, element, enemy, name, characterStats, name, snapshotId, lastDamageTime))  // DoT: dealer is the status itself
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

        if (!damageEvents[name]) {
          damageEvents[name] = []
        }

        damageEvents[name].push(calculateDamageNegativeStatus(currStacks, element, enemy, name, characterStats, name, snapshotId, lastDamageTime))

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

  return { damageEvents, stacksCurr }
}

// =============================================================================================================================

export function updateNegativeStatusStacks(snapshot: Snapshot, stacksCurr: Record<string, number>, action: Action, negativeStatusesInAction: NegativeStatusInAction[], negativeStatusModifications: Record<string, {
    stackChange: number
    durationChange: number
    refreshDuration: boolean
  }>): void {
  // 1️⃣ Normal updates
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

  // 2️⃣ Aggregated side-effect modifications
  for (const [name, mod] of Object.entries(negativeStatusModifications)) {
    const statusInAction = negativeStatusesInAction.find(
      nsa => nsa.negativeStatus.name === name
    )

    if (!statusInAction) continue

    const maxStacks = statusInAction.negativeStatus.maxStacksDefault

    // Apply stack change
    stacksCurr[name] = (stacksCurr[name] ?? 0) + mod.stackChange
    stacksCurr[name] = Math.max(0, Math.min(stacksCurr[name], maxStacks))
    statusInAction.currentStacks = stacksCurr[name]

    // If stacks drop to 0 → clear status
    if (stacksCurr[name] <= 0) {
      statusInAction.applicationTime = -1
      statusInAction.timeLeft = 0
      statusInAction.lastDamageTime = 0
      continue
    }

    // Duration logic
    if (mod.refreshDuration) {
      // Reset to full duration, ignoring any durationChange
      statusInAction.timeLeft = statusInAction.negativeStatus.duration
      statusInAction.lastDamageTime = snapshot.toTime
    } else if (mod.durationChange) {
      // Increment/decrement current time left
      statusInAction.timeLeft = Math.max(
        0,
        statusInAction.timeLeft + mod.durationChange
      )
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
