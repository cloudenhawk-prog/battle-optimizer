import type { Snapshot } from '../../types/snapshot'
import type { ResolvedCharacter } from '../../types/character'
import type { Enemy } from '../../types/enemy'
import type { DamageEvent } from '../../types/events'
import type { GlobalColumns } from '../../types/tableDefinitions'
import type { RotationStep } from '../importExport'
import type { EngineState } from './step'
import { negativeStatuses as negativeStatusesData } from '../../data/negativeStatuses'
import { getActionFromCharacter } from '../hooks/actionHelpers'
import { assignCharacterToRow } from '../hooks/snapshotHelpers'
import {
  updateSnapshotsWithAction,
  shouldTriggerOutroIntro,
  handleOutroIntroFlow,
  autocastFollowUpChain,
} from './step'

// ========== Types ============================================================================================================

type ReplayStepsParams = {
  steps: RotationStep[]
  startingSnapshots: Snapshot[]
  startingEngineState?: EngineState
  charactersMap: Record<string, ResolvedCharacter>
  characterColumnsMap: Record<string, string[]>
  globalColumns: GlobalColumns
  enemy: Enemy
  autocastFollowUps: boolean
}

export type ReplayStepsResult = {
  snapshots: Snapshot[]
  damageEvents: DamageEvent[]
  engineState: EngineState
  /** False when a step could not be applied (character/action missing, etc.). */
  valid: boolean
}

// ========== replaySteps ======================================================================================================

/**
 * Replays a list of (character, action) steps from a given starting snapshot + engine state.
 * Intentionally lightweight — does not validate cast conditions, just applies steps.
 * Invalid or missing characters/actions mark the result as `valid: false`.
 *
 * Useful for the optimizer: scoring candidates by replaying post-block steps on top of
 * each candidate's terminal state.
 */
export function replaySteps(params: ReplayStepsParams): ReplayStepsResult {
  const { steps, startingSnapshots, startingEngineState, charactersMap, characterColumnsMap, globalColumns, enemy, autocastFollowUps } = params

  let snapshots: Snapshot[] = [...startingSnapshots]
  const allDamageEvents: DamageEvent[] = []

  let engineState: EngineState = startingEngineState ?? {
    negativeStatusesInAction: Object.values(negativeStatusesData).map(status => ({
      negativeStatus: status,
      applicationTime: -1,
      timeLeft: 0,
      currentStacks: 0,
      lastDamageTime: 0,
    })),
    modifiersInAction: [],
    coordinatedAttacksInAction: [],
  }

  const baseParams = { charactersMap, characterColumnsMap, globalColumns, enemy }

  for (const step of steps) {
    if (!charactersMap[step.character]) return { snapshots, damageEvents: allDamageEvents, engineState, valid: false }

    const lastIdx = snapshots.length - 1
    snapshots = snapshots.map((s, i) => i === lastIdx ? assignCharacterToRow(s, step.character) : s)
    let snapshotId = Number(snapshots[lastIdx].id)

    // Handle Outro/Intro auto-swap if triggered
    if (shouldTriggerOutroIntro(snapshots, snapshotId)) {
      try {
        const outroIntroResult = handleOutroIntroFlow({
          snapshots, snapshotId, ...baseParams,
          negativeStatusesInAction: engineState.negativeStatusesInAction,
          modifiersInAction: engineState.modifiersInAction,
          coordinatedAttacksInAction: engineState.coordinatedAttacksInAction,
        })
        snapshots = outroIntroResult.snapshots
        allDamageEvents.push(...outroIntroResult.damageEvents)
        engineState = {
          negativeStatusesInAction: outroIntroResult.negativeStatusesInAction,
          modifiersInAction: outroIntroResult.modifiersInAction,
          coordinatedAttacksInAction: outroIntroResult.coordinatedAttacksInAction,
        }
        snapshotId += 2
      } catch {
        return { snapshots, damageEvents: allDamageEvents, engineState, valid: false }
      }
    }

    const prevSnapshot = snapshots.length > 1 ? snapshots[snapshots.findIndex(s => Number(s.id) === snapshotId) - 1] : undefined
    const resolvedAction = getActionFromCharacter(charactersMap, step.character, step.action, prevSnapshot)
    if (!resolvedAction) return { snapshots, damageEvents: allDamageEvents, engineState, valid: false }

    try {
      const actionResult = updateSnapshotsWithAction({
        ...baseParams, snapshots, snapshotId, actionName: step.action,
        negativeStatusesInAction: engineState.negativeStatusesInAction,
        modifiersInAction: engineState.modifiersInAction,
        coordinatedAttacksInAction: engineState.coordinatedAttacksInAction,
      })
      snapshots = actionResult.snapshots
      allDamageEvents.push(...actionResult.damageEvents)
      engineState = {
        negativeStatusesInAction: actionResult.negativeStatusesInAction,
        modifiersInAction: actionResult.modifiersInAction,
        coordinatedAttacksInAction: actionResult.coordinatedAttacksInAction,
      }
    } catch {
      return { snapshots, damageEvents: allDamageEvents, engineState, valid: false }
    }

    if (autocastFollowUps) {
      const followUpResult = autocastFollowUpChain({
        ...baseParams, snapshots, resolvedSnapshotId: snapshotId,
        negativeStatusesInAction: engineState.negativeStatusesInAction,
        modifiersInAction: engineState.modifiersInAction,
        coordinatedAttacksInAction: engineState.coordinatedAttacksInAction,
      })
      snapshots = followUpResult.snapshots
      allDamageEvents.push(...followUpResult.damageEvents)
      engineState = {
        negativeStatusesInAction: followUpResult.negativeStatusesInAction,
        modifiersInAction: followUpResult.modifiersInAction,
        coordinatedAttacksInAction: followUpResult.coordinatedAttacksInAction,
      }
    }
  }

  return { snapshots, damageEvents: allDamageEvents, engineState, valid: true }
}
