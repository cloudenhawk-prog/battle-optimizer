// Turns MCTS results (tree terminals + rollout records) into the top-N SavedRotations for the editor.
import type { SavedRotation } from '../../types/rotation'
import { getScore, getLastResolvedSnapshot } from './score'
import type { Choice } from './choices'
import { getPathChoices, type Node } from './node'

// ========== Type: RolloutRecord ==============================================================================================

/**
 * A complete rotation path discovered during a rollout phase.
 * Combines the tree-prefix choices (from root to the expanded node) with
 * the random choices made during the rollout until the termination goal was reached.
 */
export type RolloutRecord = {
  choices: Choice[]
  score: number
  damage: number
  time: number
}

// ========== Extract Top Rotations ============================================================================================

/**
 * Converts the N highest-scoring complete rotations into SavedRotation objects,
 * directly importable into the rotation editor via runImportSteps.
 *
 * Merges two sources:
 *  - terminalNodes: nodes in the MCTS tree that directly reached the goal during expansion
 *  - rolloutRecords: complete paths discovered during rollout phases
 *
 * In practice, rolloutRecords dominate at low-to-medium iteration counts because
 * the tree must be ~goal-depth deep before expansion itself reaches terminal.
 *
 * Returns fewer than topN results if fewer complete rotations were found.
 */
export function extractTopRotations(terminalNodes: Node[], rolloutRecords: RolloutRecord[], topN: number): SavedRotation[] {
  type Candidate = { choices: Choice[]; score: number; damage: number; time: number }
  const candidates: Candidate[] = [
    ...terminalNodes.map(n => ({
      choices: getPathChoices(n),
      score: getScore(n.snapshots),
      damage: getLastResolvedSnapshot(n.snapshots)?.damage ?? 0,
      time: getLastResolvedSnapshot(n.snapshots)?.toTime ?? 0,
    })),
    ...rolloutRecords,
  ]
  if (candidates.length === 0) return []

  const sorted = [...candidates].sort((a, b) => b.score - a.score)
  const top = sorted.slice(0, topN)

  return top.map((c, rank) => ({
    name: `MCTS #${rank + 1} — DPS ${c.score.toFixed(0)}  |  Total ${c.damage.toLocaleString('en-US', { maximumFractionDigits: 0 })}  |  Time ${c.time.toFixed(1)}s`,

    createdAt: new Date().toISOString(),
    steps: c.choices.map(ch => ({ character: ch.character, action: ch.actionName })),
  }))
}
