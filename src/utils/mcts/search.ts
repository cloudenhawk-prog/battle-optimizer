import type { ResolvedCharacter } from '../../types/character'
import type { Enemy } from '../../types/enemy'
import type { Snapshot } from '../../types/snapshot'
import type { EnergyType } from '../../types/baseTypes'
import type { GlobalColumns } from '../../types/tableDefinitions'
import { initEngineState, engineStep } from '../engine/step'
import { assignCharacterToRow } from '../hooks/snapshotHelpers'
import { getMCTSChoices, type Choice } from './choices'
import { createRootNode, createChildNode, cloneSnapshots, cloneEngineState, type Node } from './node'
import { isTerminal, getScore, getLastResolvedSnapshot, type TerminationGoal } from './score'
import { type RolloutRecord } from './output'

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

// ========== Empty GlobalColumns ==============================================================================================

/**
 * Resolvers rebuild buffs/debuffs/negativeStatuses from scratch each step
 * (updateModifierStacks, helpNegativeStatuses), so globalColumns only needs to
 * be non-null. Empty arrays are safe — no zero-initialisation is needed here.
 */
const EMPTY_GLOBAL_COLUMNS: GlobalColumns = { basic: [], buffs: [], debuffs: [], negativeStatuses: [] }

// ========== Initial Snapshot =================================================================================================

/**
 * Builds the minimal valid initial snapshot for an MCTS simulation.
 * Seeds starting energies from character.startingEnergies; all other fields are empty.
 *
 * Note: permanent-modifier pre-evaluation (as done by createEmptySnapshot in the UI)
 * is intentionally skipped. The first resolver step will write the correct live values,
 * so this only causes a minor inconsistency in row 0 display — not in computed DPS.
 */
function createMCTSInitialSnapshot(team: ResolvedCharacter[]): Snapshot {
  const charactersEnergies: Record<string, Partial<Record<EnergyType, number>>> = {}
  for (const char of team) {
    const energies: Partial<Record<EnergyType, number>> = {}
    const starting = char.startingEnergies?.(char.sequence) ?? {}
    for (const [key, maxVal] of Object.entries(char.maxEnergies) as [EnergyType, number][]) {
      energies[key] = Math.min(starting[key] ?? 0, maxVal)
    }
    charactersEnergies[char.name] = energies
  }

  return {
    id: '0',
    character: '',
    action: '',
    fromTime: 0,
    toTime: 0,
    damage: 0,
    dps: 0,
    charactersEnergies,
    buffs: {},
    buffsTimeLeft: {},
    buffsSwapsLeft: {},
    buffsMaxStacks: {},
    buffsActivationStats: {},
    buffsTargetCharacter: {},
    debuffs: {},
    debuffsTimeLeft: {},
    debuffsSwapsLeft: {},
    debuffsMaxStacks: {},
    negativeStatuses: {},
    negativeStatusesTimeLeft: {},
    negativeStatusesMaxStacks: {},
    coordinatedAttacks: {},
    coordinatedAttacksTimeLeft: {},
    coordinatedAttacksSwapRequired: {},
    charactersCooldowns: {},
    charactersActionStacks: {},
    charactersActionStacksConfig: {},
    charactersPositions: {},
    charactersPersistentUntil: {},
    charactersLastAction: {},
    charactersRequiresSwapOut: {},
    charactersForms: {},
    charactersSwapCooldownUntil: {},
    charactersAttemptFollowUp: {},
    charactersRestrictNextTo: {},
    charactersComboWindows: {},
    charactersForteGrants: {},
    charactersComboChainTags: {},
    charactersOffFieldSince: {},
    offFieldTriggerEvents: {},
  }
}

// ========== MCTS: Internal Helpers ===========================================================================================

/** Reconstructs the ordered choice sequence from root down to (and including) node. */
function getTreePath(node: Node): Choice[] {
  const choices: Choice[] = []
  let current: Node | null = node
  while (current !== null && current.incomingChoice !== null) {
    choices.unshift(current.incomingChoice)
    current = current.parent
  }
  return choices
}

function ucb1(node: Node, C: number): number {
  if (node.visits === 0) return Infinity
  return (node.totalScore / node.visits) + C * Math.sqrt(Math.log(node.parent!.visits) / node.visits)
}

function bestChild(node: Node, C: number): Node {
  return node.children.reduce((best, child) => ucb1(child, C) > ucb1(best, C) ? child : best)
}

function backpropagate(node: Node, score: number): void {
  let current: Node | null = node
  while (current !== null) {
    current.visits += 1
    current.totalScore += score
    current = current.parent
  }
}

// ========== MCTS: Phases =====================================================================================================

function select(root: Node, C: number, goal: TerminationGoal): Node {
  let node = root
  while (true) {
    if (isTerminal(node.snapshots, goal)) return node
    if (node.untriedChoices.length > 0) return node
    if (node.children.length === 0) return node
    node = bestChild(node, C)
  }
}

function expand(
  node: Node,
  team: ResolvedCharacter[],
  charactersMap: Record<string, ResolvedCharacter>,
  enemy: Enemy,
  goal: TerminationGoal,
): Node {
  // Pop a random untried choice
  const randomIndex = Math.floor(Math.random() * node.untriedChoices.length)
  const [choice] = node.untriedChoices.splice(randomIndex, 1)

  const snapshotId = node.snapshots.length - 1
  const snapshotsWithChar = [...node.snapshots]
  snapshotsWithChar[snapshotId] = assignCharacterToRow(snapshotsWithChar[snapshotId], choice.character)

  const result = engineStep({
    snapshots: snapshotsWithChar,
    snapshotId,
    actionName: choice.actionName,
    engineState: node.engineState,
    charactersMap,
    characterColumnsMap: {},
    globalColumns: EMPTY_GLOBAL_COLUMNS,
    enemy,
    autocastFollowUps: false,
  })

  // Compute next choices from the last resolved snapshot
  const lastResolved = result.snapshots[result.snapshots.length - 2]
  const nextChoices = isTerminal(result.snapshots, goal)
    ? []
    : getMCTSChoices(lastResolved, team)

  return createChildNode(node, choice, result.snapshots, result.engineState, nextChoices)
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

/** Inserts a score into a descending sorted list capped at topN entries. */
function updateTopNScores(scores: number[], score: number, topN: number | undefined): void {
  if (!topN) return
  scores.push(score)
  scores.sort((a, b) => b - a)
  if (scores.length > topN) scores.pop()
}

function rollout(
  node: Node,
  team: ResolvedCharacter[],
  charactersMap: Record<string, ResolvedCharacter>,
  enemy: Enemy,
  goal: TerminationGoal,
  maxSteps = 500,
  worstTopNScore?: number,
): { score: number; damage: number; time: number; terminalChoices: Choice[] | null } {
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

    snapshots = result.snapshots
    engineState = result.engineState
  }

  const last = getLastResolvedSnapshot(snapshots)
  return { score: getScore(snapshots), damage: last?.damage ?? 0, time: last?.toTime ?? 0, terminalChoices: null }
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
      // Fully-explored dead end (no children, no untried choices, not terminal)
      // Should not occur in a well-formed game; skip silently
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
          choices: [...getTreePath(child), ...rolloutResult.terminalChoices],
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