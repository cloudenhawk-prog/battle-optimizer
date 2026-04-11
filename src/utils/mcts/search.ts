import type { ResolvedCharacter } from '../../types/character'
import type { Enemy } from '../../types/enemy'
import type { Snapshot } from '../../types/snapshot'
import type { EnergyType } from '../../types/baseTypes'
import type { GlobalColumns } from '../../types/tableDefinitions'
import { initEngineState, engineStep } from '../engine/step'
import { assignCharacterToRow } from '../hooks/snapshotHelpers'
import { getMCTSChoices, type Choice } from './choices'
import { createRootNode, createChildNode, cloneSnapshots, cloneEngineState, type Node } from './node'
import { isTerminal, getScore, type TerminationGoal } from './score'

// ========== Types ============================================================================================================

export type MCTSConfig = {
  team: ResolvedCharacter[]
  enemy: Enemy
  goal: TerminationGoal
  iterations: number
  topN?: number
  /** UCB1 exploration constant. Higher = more exploration. Default: Math.SQRT2 */
  explorationConstant?: number
}

export type MCTSResult = {
  root: Node
  /** All terminal nodes discovered during expansion, in the order they were found. */
  terminalNodes: Node[]
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
    charactersComboWindows: {},
    charactersForteGrants: {},
    charactersComboChainTags: {},
    charactersOffFieldSince: {},
    offFieldTriggerEvents: {},
  }
}

// ========== MCTS: Internal Helpers ===========================================================================================

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

function rollout(
  node: Node,
  team: ResolvedCharacter[],
  charactersMap: Record<string, ResolvedCharacter>,
  enemy: Enemy,
  goal: TerminationGoal,
  maxSteps = 500,
): number {
  let snapshots = cloneSnapshots(node.snapshots)
  let engineState = cloneEngineState(node.engineState)

  for (let step = 0; step < maxSteps; step++) {
    if (isTerminal(snapshots, goal)) break

    // Use last resolved snapshot for choices; fall back to snapshots[0] before any step
    const currentSnapshot = snapshots.length >= 2
      ? snapshots[snapshots.length - 2]
      : snapshots[0]

    const choices = getMCTSChoices(currentSnapshot, team)
    if (choices.length === 0) break

    const choice = choices[Math.floor(Math.random() * choices.length)]
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

  return getScore(snapshots)
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
    explorationConstant = Math.SQRT2,
  } = config

  const charactersMap = Object.fromEntries(team.map(c => [c.name, c]))
  const initialSnapshot = createMCTSInitialSnapshot(team)
  const initialEngineState = initEngineState()
  const rootChoices = getMCTSChoices(initialSnapshot, team)
  const root = createRootNode([initialSnapshot], initialEngineState, rootChoices)
  const terminalNodes: Node[] = []

  for (let i = 0; i < iterations; i++) {
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
      backpropagate(child, getScore(child.snapshots))
    } else {
      const score = rollout(child, team, charactersMap, enemy, goal)
      backpropagate(child, score)
    }
  }

  return { root, terminalNodes }
}