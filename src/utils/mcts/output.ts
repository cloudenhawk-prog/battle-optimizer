import type { SavedRotation } from '../../utils/importExport'
import { getScore } from './score'
import type { Choice } from './choices'
import type { Node } from './node'

// ========== Extract Top Rotations ============================================================================================

/**
 * Converts the N highest-scoring terminal nodes into SavedRotation objects,
 * directly importable into the rotation editor via runImportSteps.
 *
 * Terminal nodes are those reached during expansion when the simulation state
 * satisfied the termination goal. They store the full path back to root via
 * the parent chain, which is reconstructed here into a RotationStep sequence.
 *
 * Returns fewer than topN results if fewer terminal nodes were found
 * (e.g. the search budget was too small to reach the termination goal).
 */
export function extractTopRotations(terminalNodes: Node[], topN: number): SavedRotation[] {
  if (terminalNodes.length === 0) return []

  const sorted = [...terminalNodes].sort((a, b) => getScore(b.snapshots) - getScore(a.snapshots))
  const top = sorted.slice(0, topN)

  return top.map((node, rank) => {
    const choices = reconstructPath(node)
    const score = getScore(node.snapshots)

    return {
      name: `MCTS #${rank + 1} — DPS ${score.toFixed(0)}`,
      createdAt: new Date().toISOString(),
      steps: choices.map(c => ({ character: c.character, action: c.actionName })),
    }
  })
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