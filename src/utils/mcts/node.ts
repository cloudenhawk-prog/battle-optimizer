import type { Snapshot } from '../../types/snapshot'
import type { EngineState } from '../engine/step'
import type { Choice } from './choices'

// ========== Type: Node =======================================================================================================

export type Node = {
  snapshots: Snapshot[]
  engineState: EngineState
  /** Choices not yet turned into child nodes from this node. */
  untriedChoices: Choice[]
  children: Node[]
  visits: number
  totalScore: number
  parent: Node | null
  /** The choice taken from parent to reach this node. Null on the root. */
  incomingChoice: Choice | null
}

// ========== Clone Helpers ====================================================================================================

/**
 * Deep-copies an EngineState so child nodes do not share references with their parent.
 * Each cross-step state item is spread-cloned (they are flat objects).
 */
export function cloneEngineState(state: EngineState): EngineState {
  return {
    negativeStatusesInAction: state.negativeStatusesInAction.map(n => ({ ...n })),
    modifiersInAction: state.modifiersInAction.map(m => ({ ...m })),
    coordinatedAttacksInAction: state.coordinatedAttacksInAction.map(c => ({ ...c })),
  }
}

/**
 * Deep-copies a snapshot array so child nodes do not share Snapshot objects with parent.
 * Each Snapshot is a flat object, so a spread clone is sufficient.
 */
export function cloneSnapshots(snapshots: Snapshot[]): Snapshot[] {
  return snapshots.map(s => ({ ...s }))
}

// ========== Node Constructors ================================================================================================

export function createRootNode(
  snapshots: Snapshot[],
  engineState: EngineState,
  untriedChoices: Choice[],
): Node {
  return {
    snapshots: cloneSnapshots(snapshots),
    engineState: cloneEngineState(engineState),
    untriedChoices: [...untriedChoices],
    children: [],
    visits: 0,
    totalScore: 0,
    parent: null,
    incomingChoice: null,
  }
}

/**
 * Creates a child node from the result of applying a choice to the parent state.
 * Registers itself on parent.children.
 * The caller is responsible for passing already-separated (cloned) snapshots and engineState
 * so this node owns its own state.
 */
export function createChildNode(
  parent: Node,
  choice: Choice,
  snapshots: Snapshot[],
  engineState: EngineState,
  untriedChoices: Choice[],
): Node {
  const child: Node = {
    snapshots,
    engineState,
    untriedChoices,
    children: [],
    visits: 0,
    totalScore: 0,
    parent,
    incomingChoice: choice,
  }
  parent.children.push(child)
  return child
}