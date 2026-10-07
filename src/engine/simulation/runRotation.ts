// Replays a list of user steps from scratch (or onto an existing timeline), validating each step like the editor would.
import type { Snapshot } from '../../types/snapshot'
import type { ResolvedCharacter } from '../../types/character'
import type { Enemy } from '../../types/enemy'
import type { GlobalColumns } from '../../types/tableDefinitions'
import type { DamageEvent } from '../../types/events'
import type { NegativeStatusInAction } from '../../types/negativeStatus'
import type { ModifierInAction } from '../../types/modifiers'
import type { CoordinatedAttackInAction } from '../../types/coordinatedAttack'
import type { Settings } from '../../types/settings'
import type { RotationStep, ImportRunResult } from '../../types/rotation'
import { initEngineState, type EngineState } from './engineState'
import { getActionFromCharacter } from '../state/actionHelpers'
import { assignCharacterToRow } from '../state/snapshotHelpers'
import { getActionFailureReason } from '../castRules/actionFailureReason'
import { updateSnapshotsWithAction } from './resolveAction'
import { shouldTriggerOutroIntro, handleOutroIntroFlow } from './outroIntro'
import { autocastFollowUpChain } from './autocast'

// ========== Synchronous Import Runner ========================================================================================

export type ImportRunParams = {
  steps: RotationStep[]
  initialSnapshot?: Snapshot
  startingSnapshots?: Snapshot[]
  initialNegativeStatuses?: NegativeStatusInAction[]
  initialModifiers?: ModifierInAction[]
  initialCoordinatedAttacks?: CoordinatedAttackInAction[]
  charactersMap: Record<string, ResolvedCharacter>
  characterColumnsMap: Record<string, string[]>
  globalColumns: GlobalColumns
  enemy: Enemy
  settings: Settings
  ignoreCastConditions: boolean
  /** When set, caps how many autocast follow-up hops the LAST replayed step may generate.
   *  All earlier steps in the replay are unaffected. Used by deletion to stop the chain
   *  before the deleted row without losing earlier autocasts in the same chain. */
  maxAutocasts?: number
}

export type FullImportRunResult = ImportRunResult & {
  finalNegativeStatuses: NegativeStatusInAction[]
  finalModifiers: ModifierInAction[]
  finalCoordinatedAttacks: CoordinatedAttackInAction[]
}

export function runImportSteps(params: ImportRunParams): FullImportRunResult {
  const { steps, initialSnapshot, startingSnapshots, initialNegativeStatuses, initialModifiers, initialCoordinatedAttacks, charactersMap, characterColumnsMap, globalColumns, enemy, settings, ignoreCastConditions, maxAutocasts } = params

  let snapshots: Snapshot[] = startingSnapshots
    ? [...startingSnapshots]
    : [{ ...initialSnapshot! }]
  let localDamageEvents: DamageEvent[] = []

  // Fresh engine state for this import run — isolated from the living refs
  let engineState: EngineState = {
    negativeStatusesInAction: initialNegativeStatuses
      ? initialNegativeStatuses.map(s => ({ ...s }))
      : initEngineState().negativeStatusesInAction,
    modifiersInAction: initialModifiers ? [...initialModifiers] : [],
    coordinatedAttacksInAction: initialCoordinatedAttacks ? initialCoordinatedAttacks.map(ca => ({ ...ca })) : [],
  }

  const baseEngineParams = {
    charactersMap,
    characterColumnsMap,
    globalColumns,
    enemy,
  }

  let completedSteps = 0

  /** Stops the run at `stepIdx`, returning everything simulated so far plus the reason. */
  const fail = (stepIdx: number, step: RotationStep, reason: string): FullImportRunResult => ({
    snapshots,
    damageEvents: localDamageEvents,
    completedSteps,
    error: { stepIndex: stepIdx, character: step.character, action: step.action, reason },
    finalNegativeStatuses: engineState.negativeStatusesInAction,
    finalModifiers: engineState.modifiersInAction,
    finalCoordinatedAttacks: engineState.coordinatedAttacksInAction,
  })

  for (let stepIdx = 0; stepIdx < steps.length; stepIdx++) {
    const step = steps[stepIdx]

    // Validate character
    const character = charactersMap[step.character]
    if (!character) {
      return fail(stepIdx, step, `Character "${step.character}" is not in the current battle`)
    }

    // Assign character to the last blank row
    const lastIdx = snapshots.length - 1
    snapshots = snapshots.map((s, i) => (i === lastIdx ? assignCharacterToRow(s, step.character) : s))
    let snapshotId = Number(snapshots[lastIdx].id)

    // Handle automatic Outro/Intro if character changed and previous had full concerto
    if (shouldTriggerOutroIntro(snapshots, snapshotId)) {
      try {
        const outroIntroResult = handleOutroIntroFlow({ snapshots, snapshotId, ...engineState, ...baseEngineParams })
        snapshots = outroIntroResult.snapshots
        localDamageEvents = [...localDamageEvents, ...outroIntroResult.damageEvents]
        engineState = {
          negativeStatusesInAction: outroIntroResult.negativeStatusesInAction,
          modifiersInAction: outroIntroResult.modifiersInAction,
          coordinatedAttacksInAction: outroIntroResult.coordinatedAttacksInAction,
        }
      } catch (e) {
        const reason = e instanceof Error ? e.message : String(e)
        return fail(stepIdx, step, reason)
      }
      snapshotId += 2
    }

    // Resolve the action variant (e.g. plunge tier selection)
    const targetIdx = snapshots.findIndex(s => Number(s.id) === snapshotId)
    const prevSnapshot = targetIdx > 0 ? snapshots[targetIdx - 1] : undefined
    const resolvedAction = getActionFromCharacter(charactersMap, step.character, step.action, prevSnapshot)

    if (!resolvedAction) {
      return fail(stepIdx, step, `Action "${step.action}" not found for ${step.character}`)
    }

    // Check if the action is castable in the current state
    const failureReason = getActionFailureReason(resolvedAction, prevSnapshot, character, ignoreCastConditions, settings.sandboxMode)
    if (failureReason) {
      return fail(stepIdx, step, failureReason)
    }

    // Apply the action through the full resolver pipeline
    const actionResult = updateSnapshotsWithAction({ ...baseEngineParams, ...engineState, snapshots, snapshotId, actionName: step.action })
    snapshots = actionResult.snapshots
    localDamageEvents = [...localDamageEvents, ...actionResult.damageEvents]
    engineState = {
      negativeStatusesInAction: actionResult.negativeStatusesInAction,
      modifiersInAction: actionResult.modifiersInAction,
      coordinatedAttacksInAction: actionResult.coordinatedAttacksInAction,
    }

    if (settings.autocastFollowUps) {
      const isLastStep = stepIdx === steps.length - 1
      const autocastResult = autocastFollowUpChain({ ...baseEngineParams, ...engineState, snapshots, resolvedSnapshotId: snapshotId, maxDepth: isLastStep ? maxAutocasts : undefined })
      snapshots = autocastResult.snapshots
      localDamageEvents = [...localDamageEvents, ...autocastResult.damageEvents]
      engineState = {
        negativeStatusesInAction: autocastResult.negativeStatusesInAction,
        modifiersInAction: autocastResult.modifiersInAction,
        coordinatedAttacksInAction: autocastResult.coordinatedAttacksInAction,
      }
    }

    completedSteps++
  }

  return {
    snapshots,
    damageEvents: localDamageEvents,
    completedSteps,
    error: null,
    finalNegativeStatuses: engineState.negativeStatusesInAction,
    finalModifiers: engineState.modifiersInAction,
    finalCoordinatedAttacks: engineState.coordinatedAttacksInAction,
  }
}
