// MCTS rotation search: runMCTS() loops select → expand → rollout → backpropagate over a tree of choices.
//
// Algorithm (one iteration):
//   1. select    – descend from the root by UCB1 until a node with untried choices / a leaf / a terminal (treePolicy.ts)
//   2. expand    – simulate one random untried choice and add it as a child (treePolicy.ts)
//   3. rollout   – play damage-weighted random choices from the child until the goal (rolloutPolicy.ts)
//   4. backprop  – add the resulting DPS score to the child and all its ancestors (treePolicy.ts)
// Complete rotations are collected from tree terminals and goal-reaching rollouts; see output.ts.
import type { ResolvedCharacter } from '../../types/character'
import type { Enemy } from '../../types/enemy'
import { initEngineState } from '../../engine/simulation/engineState'
import { getMCTSChoices } from './choices'
import { createRootNode, getPathChoices, type Node } from './node'
import { isTerminal, getScore, type TerminationGoal } from './score'
import { type RolloutRecord } from './output'
import { createMCTSInitialSnapshot } from './initialSnapshot'
import { select, expand, backpropagate } from './treePolicy'
import { rollout } from './rolloutPolicy'

// ========== Types ============================================================================================================

export type MCTSConfig = {
  team: ResolvedCharacter[]
  enemy: Enemy
  goal: TerminationGoal
  iterations: number
  topN?: number
  /** UCB1 exploration constant. Higher = more exploration. Default: Math.SQRT2 */
  explorationConstant?: number
  /** Called periodically during the search with the current iteration and total. */
  onProgress?: (iteration: number, total: number) => void
  /** How many iterations between onProgress calls. Default: iterations / 10 (10 calls total). */
  progressInterval?: number
}

export type MCTSResult = {
  root: Node
  /** Terminal nodes discovered during expansion (tree depth reached goal). */
  terminalNodes: Node[]
  /** Complete rotation paths recorded when rollouts reached the termination goal. */
  rolloutRecords: RolloutRecord[]
}

// ========== Helpers ==========================================================================================================

/** Inserts a score into a descending sorted list capped at topN entries. */
function updateTopNScores(scores: number[], score: number, topN: number | undefined): void {
  if (!topN) return
  scores.push(score)
  scores.sort((a, b) => b - a)
  if (scores.length > topN) scores.pop()
}

// ========== runMCTS ==========================================================================================================

/**
 * Runs the MCTS search and returns the root node plus all terminal nodes found.
 * Pass the result to extractTopRotations() in output.ts to get SavedRotation[].
 *
 * @param config.team          - Resolved characters; also determines the initial team order
 * @param config.enemy         - Enemy being fought
 * @param config.goal          - When to consider a rollout complete (time or damage threshold)
 * @param config.iterations    - Total MCTS iterations to run
 * @param config.explorationConstant - UCB1 C value (default Math.SQRT2)
 */
export function runMCTS(config: MCTSConfig): MCTSResult {
  const {
    team,
    enemy,
    goal,
    iterations,
    topN,
    explorationConstant = Math.SQRT2,
    onProgress,
    progressInterval: progressIntervalConfig,
  } = config

  const charactersMap = Object.fromEntries(team.map(c => [c.name, c]))
  const initialSnapshot = createMCTSInitialSnapshot(team)
  const initialEngineState = initEngineState()
  const rootChoices = getMCTSChoices(initialSnapshot, team)
  const root = createRootNode([initialSnapshot], initialEngineState, rootChoices)
  const terminalNodes: Node[] = []
  const rolloutRecords: RolloutRecord[] = []
  // Tracks the worst score among the current top-N complete results, used to prune rollouts.
  const topNScores: number[] = []

  const progressInterval = progressIntervalConfig ?? Math.max(1, Math.floor(iterations / 10))

  for (let i = 0; i < iterations; i++) {
    if (onProgress && i > 0 && i % progressInterval === 0) {
      onProgress(i, iterations)
    }
    const node = select(root, explorationConstant, goal)

    if (isTerminal(node.snapshots, goal)) {
      // Terminal node already in tree — just backpropagate its fixed score
      backpropagate(node, getScore(node.snapshots))
      continue
    }

    if (node.untriedChoices.length === 0) {
      // Fully-explored dead end (no children, no untried choices, not terminal); skipped silently.
      // NOTE: nothing is backpropagated, so select() can keep returning this node and burn the remaining iterations.
      continue
    }

    const child = expand(node, team, charactersMap, enemy, goal)

    if (isTerminal(child.snapshots, goal)) {
      terminalNodes.push(child)
      const terminalScore = getScore(child.snapshots)
      backpropagate(child, terminalScore)
      updateTopNScores(topNScores, terminalScore, topN)
    } else {
      const worstTopNScore = (topN && topNScores.length >= topN) ? topNScores[topNScores.length - 1] : undefined
      const rolloutResult = rollout(child, team, charactersMap, enemy, goal, 500, worstTopNScore)
      backpropagate(child, rolloutResult.score)
      if (rolloutResult.terminalChoices !== null) {
        rolloutRecords.push({
          choices: [...getPathChoices(child), ...rolloutResult.terminalChoices],
          score: rolloutResult.score,
          damage: rolloutResult.damage,
          time: rolloutResult.time,
        })
        updateTopNScores(topNScores, rolloutResult.score, topN)
      }
    }
  }

  return { root, terminalNodes, rolloutRecords }
}
