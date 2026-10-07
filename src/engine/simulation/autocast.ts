// Follow-up autocasting: after an action, keeps casting the follow-up chain it requests (attemptFollowUp).
import type { Snapshot } from '../../types/snapshot'
import type { ResolvedCharacter } from '../../types/character'
import type { Enemy } from '../../types/enemy'
import type { DamageEvent } from '../../types/events'
import type { NegativeStatusInAction } from '../../types/negativeStatus'
import type { ModifierInAction } from '../../types/modifiers'
import type { CoordinatedAttackInAction } from '../../types/coordinatedAttack'
import type { GlobalColumns } from '../../types/tableDefinitions'
import { getSnapshotIndex, assignCharacterToRow } from '../state/snapshotHelpers'
import { isFollowUpCastableNow, validateMustChain } from '../castRules/mustChainValidator'
import { updateSnapshotsWithAction } from './resolveAction'

// ========== Autocast Follow-Up Chain =========================================================================================

type AutocastParams = {
  snapshots: Snapshot[]
  resolvedSnapshotId: number
  charactersMap: Record<string, ResolvedCharacter>
  characterColumnsMap: Record<string, string[]>
  globalColumns: GlobalColumns
  enemy: Enemy
  negativeStatusesInAction: NegativeStatusInAction[]
  modifiersInAction: ModifierInAction[]
  coordinatedAttacksInAction: CoordinatedAttackInAction[]
  maxDepth?: number
}

type AutocastResult = {
  snapshots: Snapshot[]
  damageEvents: DamageEvent[]
  negativeStatusesInAction: NegativeStatusInAction[]
  modifiersInAction: ModifierInAction[]
  coordinatedAttacksInAction: CoordinatedAttackInAction[]
}

/**
 * Walks the attemptFollowUp chain from the resolved snapshot and automatically
 * casts each follow-up action in sequence, stopping when there is no further
 * follow-up or when a follow-up cannot be resolved.
 *
 * MUST follow-ups are always auto-cast.
 * "If possible" follow-ups (must === false) are auto-cast only when the follow-up
 * is actually castable in the current state; otherwise the chain stops.
 */
export function autocastFollowUpChain(params: AutocastParams): AutocastResult {
  let { snapshots, resolvedSnapshotId } = params
  const { maxDepth, ...rest } = params
  let { negativeStatusesInAction, modifiersInAction, coordinatedAttacksInAction } = rest
  const allDamageEvents: DamageEvent[] = []

  let depth = 0
  while (true) {
    if (maxDepth !== undefined && depth >= maxDepth) break

    const resolvedIndex = getSnapshotIndex(snapshots, resolvedSnapshotId)
    if (resolvedIndex === -1) break

    const resolvedSnapshot = snapshots[resolvedIndex]
    const characterName = resolvedSnapshot.character
    if (!characterName) break

    const followUpEntry = resolvedSnapshot.charactersAttemptFollowUp?.[characterName]
    if (!followUpEntry) break

    const { actionName: followUpActionName, must } = followUpEntry

    const character = rest.charactersMap[characterName]
    const followUpAction = character?.actions.find(
      a => a.name === followUpActionName || a.groupName === followUpActionName,
    )
    if (!character || !followUpAction || !isFollowUpCastableNow(followUpAction, resolvedSnapshot, character)) {
      break
    }

    if (!must) {
      if (!validateMustChain(followUpAction, resolvedSnapshot, character, character.actions)) {
        break
      }
    }

    const nextBlankIndex = resolvedIndex + 1
    if (nextBlankIndex >= snapshots.length) break

    if (!snapshots[nextBlankIndex].character) {
      snapshots = snapshots.map((s, i) => (i === nextBlankIndex ? assignCharacterToRow(s, characterName) : s))
    }

    const nextSnapshotId = Number(snapshots[nextBlankIndex].id)

    const result = updateSnapshotsWithAction({
      ...rest,
      snapshots,
      snapshotId: nextSnapshotId,
      actionName: followUpActionName,
      negativeStatusesInAction,
      modifiersInAction,
      coordinatedAttacksInAction,
    })
    snapshots = result.snapshots
    allDamageEvents.push(...result.damageEvents)
    negativeStatusesInAction = result.negativeStatusesInAction
    modifiersInAction = result.modifiersInAction
    coordinatedAttacksInAction = result.coordinatedAttacksInAction

    const castIdx = snapshots.findIndex(s => Number(s.id) === nextSnapshotId)
    if (castIdx !== -1) snapshots[castIdx] = { ...snapshots[castIdx], isAutocast: true }

    resolvedSnapshotId = nextSnapshotId
    depth++
  }

  return { snapshots, damageEvents: allDamageEvents, negativeStatusesInAction, modifiersInAction, coordinatedAttacksInAction }
}
