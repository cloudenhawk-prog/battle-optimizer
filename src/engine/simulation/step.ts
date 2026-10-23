// One user step: Outro/Intro on swap → the chosen action → its autocast follow-up chain. The engine's main entry point.
import type { Snapshot } from '../../types/snapshot'
import type { ResolvedCharacter } from '../../types/character'
import type { Enemy } from '../../types/enemy'
import type { DamageEvent } from '../../types/events'
import type { GlobalColumns } from '../../types/tableDefinitions'
import type { EngineState } from './engineState'
import { copySnapshots } from '../state/snapshotHelpers'
import { updateSnapshotsWithAction } from './resolveAction'
import { shouldTriggerOutroIntro, handleOutroIntroFlow } from './outroIntro'
import { autocastFollowUpChain } from './autocast'

// ========== Types ============================================================================================================

export type EngineStepParams = {
  snapshots: Snapshot[]
  snapshotId: number
  actionName: string
  engineState: EngineState
  charactersMap: Record<string, ResolvedCharacter>
  characterColumnsMap: Record<string, string[]>
  globalColumns: GlobalColumns
  enemy: Enemy
  autocastFollowUps?: boolean
}

export type EngineStepResult = {
  snapshots: Snapshot[]
  damageEvents: DamageEvent[]
  engineState: EngineState
}

// ========== Engine Step ======================================================================================================

/**
 * Advances the simulation by one user-selected action.
 *
 * Handles the full pipeline:
 *   1. Outro/Intro auto-insertion on character swap with full concerto
 *   2. The selected action itself
 *   3. Autocast follow-up chain (when autocastFollowUps is true, default)
 *
 * Returns the updated snapshot array, all damage events produced this step,
 * and the updated EngineState for use in subsequent steps.
 */
export function engineStep(params: EngineStepParams): EngineStepResult {
  const { snapshots: inputSnapshots, snapshotId: inputSnapshotId, actionName, engineState, charactersMap, characterColumnsMap, globalColumns, enemy, autocastFollowUps = true } = params

  let snapshots = copySnapshots(inputSnapshots)
  const allDamageEvents: DamageEvent[] = []

  // Copy mutable engine state so original is not mutated
  let negativeStatusesInAction = engineState.negativeStatusesInAction
  let modifiersInAction = engineState.modifiersInAction
  let coordinatedAttacksInAction = engineState.coordinatedAttacksInAction

  let snapshotId = inputSnapshotId

  // Handle Outro/Intro flow when swapping with full concerto
  if (shouldTriggerOutroIntro(snapshots, snapshotId)) {
    const outroIntroResult = handleOutroIntroFlow({
      snapshots,
      snapshotId,
      charactersMap,
      characterColumnsMap,
      globalColumns,
      enemy,
      negativeStatusesInAction,
      modifiersInAction,
      coordinatedAttacksInAction,
    })
    snapshots = outroIntroResult.snapshots
    allDamageEvents.push(...outroIntroResult.damageEvents)
    negativeStatusesInAction = outroIntroResult.negativeStatusesInAction
    modifiersInAction = outroIntroResult.modifiersInAction
    coordinatedAttacksInAction = outroIntroResult.coordinatedAttacksInAction
    snapshotId += 2
  }

  // Resolve the selected action
  const actionResult = updateSnapshotsWithAction({
    snapshots,
    snapshotId,
    actionName,
    charactersMap,
    characterColumnsMap,
    globalColumns,
    enemy,
    negativeStatusesInAction,
    modifiersInAction,
    coordinatedAttacksInAction,
  })
  snapshots = actionResult.snapshots
  allDamageEvents.push(...actionResult.damageEvents)
  negativeStatusesInAction = actionResult.negativeStatusesInAction
  modifiersInAction = actionResult.modifiersInAction
  coordinatedAttacksInAction = actionResult.coordinatedAttacksInAction

  // Autocast follow-up chain
  if (autocastFollowUps) {
    const followUpResult = autocastFollowUpChain({
      snapshots,
      resolvedSnapshotId: snapshotId,
      charactersMap,
      characterColumnsMap,
      globalColumns,
      enemy,
      negativeStatusesInAction,
      modifiersInAction,
      coordinatedAttacksInAction,
    })
    snapshots = followUpResult.snapshots
    allDamageEvents.push(...followUpResult.damageEvents)
    negativeStatusesInAction = followUpResult.negativeStatusesInAction
    modifiersInAction = followUpResult.modifiersInAction
    coordinatedAttacksInAction = followUpResult.coordinatedAttacksInAction
  }

  return {
    snapshots,
    damageEvents: allDamageEvents,
    engineState: { negativeStatusesInAction, modifiersInAction, coordinatedAttacksInAction },
  }
}
