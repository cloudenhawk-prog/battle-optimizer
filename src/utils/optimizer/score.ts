import type { ResolvedCharacter } from '../../types/character'
import type { Enemy } from '../../types/enemy'
import type { GlobalColumns } from '../../types/tableDefinitions'
import type { RotationStep } from '../importExport'
import type { CandidateSequence } from './enumerate'
import { replaySteps } from '../engine/replaySteps'

// ========== Types ============================================================================================================

export type ScoredCandidate = CandidateSequence & {
  /**
   * DPS from the last resolved snapshot after replaying post-block steps.
   * If there are no post-block steps, this is the DPS at the end of the block itself.
   */
  score: number
  /**
   * False if the post-block steps could not be replayed on top of this candidate
   * (missing character/action, or an exception during replay). Such candidates are discarded.
   */
  valid: boolean
}

type ScoreParams = {
  candidate: CandidateSequence
  /** Steps that follow the optimization block in the rotation. May be empty. */
  postBlockSteps: RotationStep[]
  charactersMap: Record<string, ResolvedCharacter>
  characterColumnsMap: Record<string, string[]>
  globalColumns: GlobalColumns
  enemy: Enemy
  autocastFollowUps: boolean
}

// ========== scoreCandidate ===================================================================================================

/**
 * Scores a candidate sequence by replaying the post-block steps on top of its terminal state.
 * Returns the final overall DPS as the score.
 *
 * When post-block steps are empty, the score is the DPS at the end of the block.
 * When post-block replay fails (illegal state), `valid` is set to false.
 */
export function scoreCandidate(params: ScoreParams): ScoredCandidate {
  const { candidate, postBlockSteps, charactersMap, characterColumnsMap, globalColumns, enemy, autocastFollowUps } = params

  // With no post-block steps, score by block DPS directly
  if (postBlockSteps.length === 0) {
    const lastResolved = candidate.terminalSnapshots[candidate.terminalSnapshots.length - 2]
    const score = lastResolved?.dps ?? 0
    return { ...candidate, score, valid: true }
  }

  const result = replaySteps({
    steps: postBlockSteps,
    startingSnapshots: candidate.terminalSnapshots,
    startingEngineState: candidate.terminalEngineState,
    charactersMap,
    characterColumnsMap,
    globalColumns,
    enemy,
    autocastFollowUps,
  })

  if (!result.valid) {
    return { ...candidate, score: 0, valid: false }
  }

  const lastResolved = result.snapshots[result.snapshots.length - 2]
  const score = lastResolved?.dps ?? 0

  return { ...candidate, score, valid: true }
}
