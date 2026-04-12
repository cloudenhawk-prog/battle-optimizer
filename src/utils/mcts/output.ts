import type { SavedRotation } from '../../utils/importExport'
import { getScore } from './score'
import type { Choice } from './choices'
import type { Node } from './node'

// ========== Type: RolloutRecord ==============================================================================================

/**
 * A complete rotation path discovered during a rollout phase.
 * Combines the tree-prefix choices (from root to the expanded node) with
 * the random choices made during the rollout until the termination goal was reached.
 */
export type RolloutRecord = {
  choices: Choice[]
  score: number
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
  type Candidate = { choices: Choice[]; score: number }
  const candidates: Candidate[] = [
    ...terminalNodes.map(n => ({ choices: reconstructPath(n), score: getScore(n.snapshots) })),
    ...rolloutRecords,
  ]
  if (candidates.length === 0) return []

  const sorted = [...candidates].sort((a, b) => b.score - a.score)
  const top = sorted.slice(0, topN)

  return top.map((c, rank) => ({
    name: `MCTS #${rank + 1} — DPS ${c.score.toFixed(0)}`,
    createdAt: new Date().toISOString(),
    steps: c.choices.map(ch => ({ character: ch.character, action: ch.actionName })),
  }))
}

// ========== Internal =========================================================================================================

/** Walks the parent chain from a terminal node back to root and returns the ordered choices. */
function reconstructPath(node: Node): Choice[] {
  const choices: Choice[] = []
  let current: Node | null = node
  while (current !== null && current.incomingChoice !== null) {
    choices.unshift(current.incomingChoice)
    current = current.parent
  }
  return choices
}