// Resolves one action on one row: validates inputs, runs every resolver in order, appends the next blank row.
import type { Snapshot } from '../../types/snapshot'
import type { ResolvedCharacter } from '../../types/character'
import type { Enemy } from '../../types/enemy'
import type { DamageEvent } from '../../types/events'
import type { NegativeStatusInAction } from '../../types/negativeStatus'
import type { ModifierInAction } from '../../types/modifiers'
import type { CoordinatedAttackInAction } from '../../types/coordinatedAttack'
import type { GlobalColumns } from '../../types/tableDefinitions'
import { getCharacter } from '../state/characterHelpers'
import { getActionFromCharacter } from '../state/actionHelpers'
import { getSnapshotIndex, getPrevSnapshot, copySnapshots, createSnapshot } from '../state/snapshotHelpers'
import { buildStepContext, resolveTime, resolveDamageModifiers, resolveDamage, resolveSideEffectsAndStatuses, resolveModifierState, resolveResources, resolveCooldowns, resolveCoordinatedAttacks, resolveCastState, resolveResourceMilestones, resolveOffFieldTriggers } from '../resolvers'

// ========== Update Snapshots With Action =====================================================================================

type UpdateSnapshotsParams = {
  snapshots: Snapshot[]
  snapshotId: number
  actionName: string
  charactersMap: Record<string, ResolvedCharacter>
  characterColumnsMap: Record<string, string[]>
  globalColumns: GlobalColumns
  enemy: Enemy
  negativeStatusesInAction: NegativeStatusInAction[]
  modifiersInAction: ModifierInAction[]
  coordinatedAttacksInAction: CoordinatedAttackInAction[]
}

type UpdateSnapshotsResult = {
  snapshots: Snapshot[]
  damageEvents: DamageEvent[]
  negativeStatusesInAction: NegativeStatusInAction[]
  modifiersInAction: ModifierInAction[]
  coordinatedAttacksInAction: CoordinatedAttackInAction[]
}

export function updateSnapshotsWithAction(params: UpdateSnapshotsParams): UpdateSnapshotsResult {
  const validated = validateActionInputs(params)
  if (!validated) {
    return {
      snapshots: params.snapshots,
      damageEvents: [],
      negativeStatusesInAction: params.negativeStatusesInAction,
      modifiersInAction: params.modifiersInAction,
      coordinatedAttacksInAction: params.coordinatedAttacksInAction,
    }
  }

  const { index, character, action, snapshots, prev, enemy, negativeStatusesInAction, modifiersInAction, coordinatedAttacksInAction, charactersMap, characterColumnsMap, globalColumns } = validated
  const updatedSnapshots = copySnapshots(snapshots)
  const current = updatedSnapshots[index]

  // -------- Resolvers -------------------------
  const context = buildStepContext(index, current, prev, character, action, enemy, negativeStatusesInAction, modifiersInAction, charactersMap, coordinatedAttacksInAction)

  resolveTime(context)
  resolveDamageModifiers(context)
  resolveDamage(context)
  resolveSideEffectsAndStatuses(context)
  resolveCoordinatedAttacks(context)
  resolveResources(context)
  resolveResourceMilestones(context)
  resolveOffFieldTriggers(context)
  resolveModifierState(context)
  resolveCooldowns(context)
  resolveCastState(context)

  // -------- Update snapshot -------------------
  updatedSnapshots[index] = { ...context.current }

  // -------- Create Next Blank Snapshot --------
  if (index === updatedSnapshots.length - 1) {
    updatedSnapshots.push(createSnapshot(updatedSnapshots[updatedSnapshots.length - 1], charactersMap, characterColumnsMap, globalColumns))
  }

  return {
    snapshots: updatedSnapshots,
    damageEvents: context.damageEvents,
    negativeStatusesInAction: context.negativeStatusesInAction,
    modifiersInAction: context.modifiersInAction,
    coordinatedAttacksInAction: context.coordinatedAttacksInAction,
  }
}

// ========== Internal: Validate Action Inputs =================================================================================

function validateActionInputs(params: UpdateSnapshotsParams) {
  const { snapshots, snapshotId, actionName, enemy, negativeStatusesInAction, modifiersInAction, coordinatedAttacksInAction, charactersMap, characterColumnsMap, globalColumns } = params

  const index = getSnapshotIndex(snapshots, snapshotId)
  if (index === -1) return null

  const current = snapshots[index]
  if (!current.character) return null

  const character = getCharacter(charactersMap, current.character)
  if (!character) return null

  const prev = getPrevSnapshot(snapshots, index)
  const action = getActionFromCharacter(charactersMap, current.character, actionName, prev)
  if (!action) return null

  return { index, character, action, snapshots, current, prev, enemy, negativeStatusesInAction, modifiersInAction, coordinatedAttacksInAction, charactersMap, characterColumnsMap, globalColumns }
}
