// MCTS tree policy: UCB1 selection, random expansion of one untried choice, and score backpropagation.
import type { ResolvedCharacter } from '../../types/character'
import type { Enemy } from '../../types/enemy'
import { getMCTSChoices } from './choices'
import { createChildNode, type Node } from './node'
import { isTerminal, type TerminationGoal } from './score'
import { applyChoice } from './applyChoice'

// ========== UCB1 =============================================================================================================

/** Mean score + C·sqrt(ln(parent visits) / visits). Unvisited children are always tried first. */
function ucb1(node: Node, C: number): number {
  if (node.visits === 0) return Infinity
  return (node.totalScore / node.visits) + C * Math.sqrt(Math.log(node.parent!.visits) / node.visits)
}

/** Child with the highest UCB1 value; ties keep the earliest child. */
function bestChild(node: Node, C: number): Node {
  return node.children.reduce((best, child) => ucb1(child, C) > ucb1(best, C) ? child : best)
}

// ========== Select / Expand / Backpropagate ==================================================================================

/** Walks down by UCB1 until a terminal node, a node with untried choices, or a leaf. */
export function select(root: Node, C: number, goal: TerminationGoal): Node {
  let node = root
  while (true) {
    if (isTerminal(node.snapshots, goal)) return node
    if (node.untriedChoices.length > 0) return node
    if (node.children.length === 0) return node
    node = bestChild(node, C)
  }
}

/** Removes one random untried choice from node, simulates it, and attaches the result as a new child. */
export function expand(
  node: Node,
  team: ResolvedCharacter[],
  charactersMap: Record<string, ResolvedCharacter>,
  enemy: Enemy,
  goal: TerminationGoal,
): Node {
  // Pop a random untried choice
  const randomIndex = Math.floor(Math.random() * node.untriedChoices.length)
  const [choice] = node.untriedChoices.splice(randomIndex, 1)

  const result = applyChoice(node.snapshots, node.engineState, choice, charactersMap, enemy)

  // Compute next choices from the last resolved snapshot
  const lastResolved = result.snapshots[result.snapshots.length - 2]
  const nextChoices = isTerminal(result.snapshots, goal)
    ? []
    : getMCTSChoices(lastResolved, team)

  return createChildNode(node, choice, result.snapshots, result.engineState, nextChoices)
}

/** Adds one visit and the score to node and every ancestor up to the root. */
export function backpropagate(node: Node, score: number): void {
  let current: Node | null = node
  while (current !== null) {
    current.visits += 1
    current.totalScore += score
    current = current.parent
  }
}
