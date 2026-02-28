import type { DamageEvent } from './../../types/events'
import type { Snapshot } from '../../types/snapshot'
import type { Action } from '../../types/action'
import type { Enemy } from '../../types/enemy'
import type { NegativeStatusInAction } from '../../types/negativeStatus'
import type { CharacterStats, EnemyStats } from '../../types/stats'
import type { DamageModifier } from '../../types/modifiers'
import type { StepContext } from '../../types/stepContext'
import { calculateDamageNegativeStatus } from '../../utils/calculators/damageCalculator'

// ========== Negative Status Helpers ==========================================================================================

export function getNegativeStatusStacks(snapshot: Snapshot): Record<string, number> {
  return { ...snapshot.negativeStatuses }
}

export function processNegativeStatusStacks(
  negativeStatusesInAction: NegativeStatusInAction[],
  _fromTime: number,
  toTime: number,
  _stacksPrev: Record<string, number>,
  enemy: Enemy,
  characterStats: CharacterStats,
  modifierCharacterStats: Partial<CharacterStats>,
  modifierEnemyStats: Partial<EnemyStats>,
  damageModifiers: DamageModifier[],
  snapshotId: number,
  ctx?: StepContext,
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

    if (reducStrat.resetTimerOnApplication === true) {
      // AERO EROSION FOR NOW
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

        damageEvents[name].push(calculateDamageNegativeStatus(currStacks, element, enemy, name, characterStats, modifierCharacterStats, modifierEnemyStats, damageModifiers, name, snapshotId, lastDamageTime, undefined, ctx)) // DoT: dealer is the status itself
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
    } else if (reducStrat.resetTimerOnApplication === false) {
      // SPECTRO FRAZZLE FOR NOW
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

        damageEvents[name].push(calculateDamageNegativeStatus(currStacks, element, enemy, name, characterStats, modifierCharacterStats, modifierEnemyStats, damageModifiers, name, snapshotId, lastDamageTime, undefined, ctx))

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

export function updateNegativeStatusStacks(
  snapshot: Snapshot,
  stacksCurr: Record<string, number>,
  _action: Action,
  negativeStatusesInAction: NegativeStatusInAction[],
  negativeStatusModifications: Record<
    string,
    {
      stackChange: number
      durationChange: number
      refreshDuration: boolean
    }
  >,
): void {
  // Apply all aggregated status modifications (from both action and side effects)
  for (const [name, mod] of Object.entries(negativeStatusModifications)) {
    const statusInAction = negativeStatusesInAction.find(nsa => nsa.negativeStatus.name === name)

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

    // If this status is being applied for the first time (stacks > 0 but was inactive)
    if (statusInAction.applicationTime === -1 && stacksCurr[name] > 0) {
      statusInAction.applicationTime = snapshot.toTime
      statusInAction.timeLeft = statusInAction.negativeStatus.duration
      statusInAction.lastDamageTime = snapshot.toTime
    }

    // Duration logic
    if (mod.refreshDuration) {
      // Reset to full duration, ignoring any durationChange
      statusInAction.timeLeft = statusInAction.negativeStatus.duration
      statusInAction.lastDamageTime = snapshot.toTime
    } else if (mod.durationChange !== 0) {
      // Increment/decrement current time left
      statusInAction.timeLeft = Math.max(0, statusInAction.timeLeft + mod.durationChange)
    }
  }

  snapshot.negativeStatuses = { ...stacksCurr }

  // Update time left for all negative statuses
  const timeLeftCurr: Record<string, number> = {}
  for (const nsa of negativeStatusesInAction) {
    timeLeftCurr[nsa.negativeStatus.name] = nsa.timeLeft
  }
  snapshot.negativeStatusesTimeLeft = { ...timeLeftCurr }
}
