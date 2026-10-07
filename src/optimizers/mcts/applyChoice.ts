// Applies one MCTS choice (character + action) to a snapshot array via engineStep, with no table columns.
import type { ResolvedCharacter } from '../../types/character'
import type { Enemy } from '../../types/enemy'
import type { Snapshot } from '../../types/snapshot'
import type { GlobalColumns } from '../../types/tableDefinitions'
import type { EngineState } from '../../engine/simulation/engineState'
import { engineStep } from '../../engine/simulation/step'
import { assignCharacterToRow } from '../../engine/state/snapshotHelpers'
import type { Choice } from './choices'

/**
 * Resolvers rebuild buffs/debuffs/negativeStatuses from scratch each step
 * (updateModifierStacks, helpNegativeStatuses), so globalColumns only needs to
 * be non-null. Empty arrays are safe — no zero-initialisation is needed here.
 */
export const EMPTY_GLOBAL_COLUMNS: GlobalColumns = { basic: [], buffs: [], debuffs: [], negativeStatuses: [] }

/**
 * Assigns the choice's character to the trailing blank row and resolves the action on it.
 * Follow-ups are never autocast: MCTS treats every follow-up as its own explicit choice.
 */
export function applyChoice(
  snapshots: Snapshot[],
  engineState: EngineState,
  choice: Choice,
  charactersMap: Record<string, ResolvedCharacter>,
  enemy: Enemy,
): { snapshots: Snapshot[]; engineState: EngineState } {
  const snapshotId = snapshots.length - 1
  const snapshotsWithChar = [...snapshots]
  snapshotsWithChar[snapshotId] = assignCharacterToRow(snapshotsWithChar[snapshotId], choice.character)

  const result = engineStep({
    snapshots: snapshotsWithChar,
    snapshotId,
    actionName: choice.actionName,
    engineState,
    charactersMap,
    characterColumnsMap: {},
    globalColumns: EMPTY_GLOBAL_COLUMNS,
    enemy,
    autocastFollowUps: false,
  })

  return { snapshots: result.snapshots, engineState: result.engineState }
}
