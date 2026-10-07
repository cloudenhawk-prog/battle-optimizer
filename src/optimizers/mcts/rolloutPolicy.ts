// MCTS rollout (simulation) policy: plays damage-weighted random choices from a node until the goal is reached.
import type { ResolvedCharacter } from '../../types/character'
import type { Enemy } from '../../types/enemy'
import { getMCTSChoices, type Choice } from './choices'
import { cloneSnapshots, cloneEngineState, type Node } from './node'
import { isTerminal, getScore, getLastResolvedSnapshot, type TerminationGoal } from './score'
import { applyChoice } from './applyChoice'

export type RolloutResult = {
  score: number
  damage: number
  time: number
  /** Choices played during the rollout when it reached the goal; null if it stopped early (stuck, pruned, step cap). */
  terminalChoices: Choice[] | null
}

/**
 * Picks a choice with a gentle bias towards actions that deal damage.
 * Weights are sqrt(multiplier / castTime), which compresses the spread so that
 * high-multiplier actions are preferred but support/buff actions remain competitive.
 * Zero-damage actions receive a floor of 1 (uniform weight) so they are never
 * strongly suppressed — the search is nudged, not steered.
 */
function weightedRandomChoice(choices: Choice[], team: ResolvedCharacter[]): Choice {
  const FLOOR = 1
  const weights = choices.map(ch => {
    const char = team.find(c => c.name === ch.character)
    const action = char?.actions.find(a => a.name === ch.actionName)
    if (!action || action.castTime <= 0 || action.multiplier <= 0) return FLOOR
    return Math.max(Math.sqrt(action.multiplier / action.castTime), FLOOR)
  })
  const total = weights.reduce((s, w) => s + w, 0)
  let r = Math.random() * total
  for (let i = 0; i < choices.length; i++) {
    r -= weights[i]
    if (r <= 0) return choices[i]
  }
  return choices[choices.length - 1]
}

/**
 * Simulates from node (on cloned state) until the goal, a dead end, or maxSteps.
 * For damage goals, worstTopNScore enables early pruning (scored 0) of rollouts that are already too slow.
 */
export function rollout(
  node: Node,
  team: ResolvedCharacter[],
  charactersMap: Record<string, ResolvedCharacter>,
  enemy: Enemy,
  goal: TerminationGoal,
  maxSteps = 500,
  worstTopNScore?: number,
): RolloutResult {
  let snapshots = cloneSnapshots(node.snapshots)
  let engineState = cloneEngineState(node.engineState)
  const rolledChoices: Choice[] = []

  for (let step = 0; step < maxSteps; step++) {
    if (isTerminal(snapshots, goal)) {
      const last = getLastResolvedSnapshot(snapshots)
      return { score: getScore(snapshots), damage: last?.damage ?? 0, time: last?.toTime ?? 0, terminalChoices: rolledChoices }
    }

    // Use last resolved snapshot for choices; fall back to snapshots[0] before any step
    const currentSnapshot = snapshots.length >= 2
      ? snapshots[snapshots.length - 2]
      : snapshots[0]

    // Prune early for damage-goal runs: if current time already exceeds what the worst
    // known top-N solution took, this path cannot produce a better DPS even if it hits
    // the threshold now (score = damage / time, and time is only going to grow).
    if (goal.type === 'damage' && worstTopNScore !== undefined && worstTopNScore > 0) {
      if (currentSnapshot.toTime > goal.amount / worstTopNScore) {
        return { score: 0, damage: currentSnapshot.damage, time: currentSnapshot.toTime, terminalChoices: null }
      }
    }

    const choices = getMCTSChoices(currentSnapshot, team)
    if (choices.length === 0) break

    const choice = weightedRandomChoice(choices, team)
    rolledChoices.push(choice)
    const result = applyChoice(snapshots, engineState, choice, charactersMap, enemy)
    snapshots = result.snapshots
    engineState = result.engineState
  }

  const last = getLastResolvedSnapshot(snapshots)
  return { score: getScore(snapshots), damage: last?.damage ?? 0, time: last?.toTime ?? 0, terminalChoices: null }
}
